const db = require('../config/database');
const logger = require('../utils/logger');
const { createNotification } = require('./notification.service');

/**
 * Calculate Official Results for an Election
 */
const calculateResults = async (electionId) => {
  // 1. Get Election Details
  const [elections] = await db.query('SELECT * FROM elections WHERE id = ?', [electionId]);
  if (!elections || elections.length === 0) {
    const error = new Error('Election not found.');
    error.statusCode = 404;
    throw error;
  }
  const election = elections[0];

  // 2. Get All Positions
  const [positions] = await db.query(
    'SELECT * FROM election_positions WHERE election_id = ?',
    [electionId]
  );

  // 3. Get Eligible Voter Count for Turnout Calculation
  let voterFilterQuery = "SELECT COUNT(*) as total_eligible FROM users WHERE role = 'VOTER' AND account_status = 'APPROVED'";
  const filterParams = [];
  if (election.scope === 'DEPARTMENTAL' && election.department_id) {
    voterFilterQuery += ' AND department_id = ?';
    filterParams.push(election.department_id);
  }
  const [eligibleRows] = await db.query(voterFilterQuery, filterParams);
  const totalEligibleVoters = eligibleRows[0]?.total_eligible || 0;

  // 4. Calculate for each position
  const positionResults = [];
  let totalVotesInElection = 0;

  for (const position of positions) {
    // Get all approved candidates for this position
    const [candidates] = await db.query(
      `SELECT ca.*, u.full_name as candidate_name, u.email as candidate_email, 
              u.college_registration_number, u.course, u.academic_year,
              d.name as department_name
       FROM candidate_applications ca
       JOIN users u ON ca.user_id = u.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE ca.election_id = ? AND ca.position_id = ? AND ca.application_status = 'APPROVED'`,
      [electionId, position.id]
    );

    // Get all votes cast for this position
    const [votes] = await db.query(
      'SELECT candidate_application_id, COUNT(*) as vote_count FROM votes WHERE election_id = ? AND position_id = ? GROUP BY candidate_application_id',
      [electionId, position.id]
    );

    const voteCountMap = new Map();
    let totalPositionVotes = 0;
    votes.forEach(v => {
      if (v.vote_count !== undefined) {
        const count = Number(v.vote_count) || 0;
        voteCountMap.set(v.candidate_application_id, count);
        totalPositionVotes += count;
      } else {
        const current = voteCountMap.get(v.candidate_application_id) || 0;
        voteCountMap.set(v.candidate_application_id, current + 1);
        totalPositionVotes += 1;
      }
    });

    totalVotesInElection += totalPositionVotes;

    // Build candidate breakdown
    const candidateBreakdown = candidates.map(cand => {
      const voteCount = voteCountMap.get(cand.id) || 0;
      const percentage = totalPositionVotes > 0
        ? Number(((voteCount / totalPositionVotes) * 100).toFixed(2))
        : 0;

      return {
        candidate_application_id: cand.id,
        user_id: cand.user_id,
        candidate_name: cand.candidate_name,
        college_registration_number: cand.college_registration_number,
        department_name: cand.department_name,
        symbol_name: cand.symbol_name,
        symbol_icon: cand.symbol_icon,
        photo_path: cand.photo_path,
        vote_count: voteCount,
        vote_percentage: percentage,
        outcome: 'LOST', // Will be calculated below
      };
    });

    // Sort descending by vote count
    candidateBreakdown.sort((a, b) => b.vote_count - a.vote_count);

    // Determine Winners & Ties based on winners_allowed
    const winnersAllowed = position.winners_allowed || 1;
    if (candidateBreakdown.length > 0 && totalPositionVotes > 0) {
      const topVotes = candidateBreakdown[0].vote_count;
      
      // Check if top candidate is tied with others
      const candidatesWithTopVotes = candidateBreakdown.filter(c => c.vote_count === topVotes);

      if (candidatesWithTopVotes.length > winnersAllowed) {
        // Tie detected among top candidates!
        candidateBreakdown.forEach(c => {
          if (c.vote_count === topVotes) {
            c.outcome = 'TIED';
          } else {
            c.outcome = 'LOST';
          }
        });
      } else {
        // Assign WON to the top candidates up to winnersAllowed
        candidateBreakdown.forEach((c, idx) => {
          if (idx < winnersAllowed && c.vote_count > 0) {
            c.outcome = 'WON';
          } else {
            c.outcome = 'LOST';
          }
        });
      }
    }

    const turnoutPercentage = totalEligibleVoters > 0
      ? Number(((totalPositionVotes / totalEligibleVoters) * 100).toFixed(2))
      : 0;

    positionResults.push({
      position_id: position.id,
      position_name: position.position_name,
      description: position.description,
      winners_allowed: winnersAllowed,
      tie_policy: position.tie_policy,
      total_votes: totalPositionVotes,
      turnout_percentage: turnoutPercentage,
      candidates: candidateBreakdown,
    });
  }

  const overallTurnout = totalEligibleVoters > 0
    ? Number(((totalVotesInElection / totalEligibleVoters) * 100).toFixed(2))
    : 0;

  return {
    election: {
      id: election.id,
      title: election.title,
      description: election.description,
      status: election.status,
      academic_year: election.academic_year,
      start_at: election.start_at,
      end_at: election.end_at,
      is_results_published: Boolean(election.is_results_published),
      results_published_at: election.results_published_at,
    },
    total_eligible_voters: totalEligibleVoters,
    total_votes_cast: totalVotesInElection,
    overall_turnout_percentage: overallTurnout,
    positions: positionResults,
  };
};

/**
 * Publish Official Results by Administrator
 */
const publishResults = async (electionId, adminUserId) => {
  const [elections] = await db.query('SELECT * FROM elections WHERE id = ?', [electionId]);
  if (!elections || elections.length === 0) {
    const error = new Error('Election not found.');
    error.statusCode = 404;
    throw error;
  }

  const election = elections[0];
  if (election.status !== 'COMPLETED') {
    const error = new Error(`Cannot publish results. Election must be in COMPLETED status (Current status: ${election.status}).`);
    error.statusCode = 400;
    throw error;
  }

  // Calculate results snapshot
  const calculated = await calculateResults(electionId);

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Remove any previous draft result snapshot
    await conn.query('DELETE FROM election_results WHERE election_id = ?', [electionId]);

    const now = new Date().toISOString();

    // Insert calculated official records
    for (const pos of calculated.positions) {
      for (const cand of pos.candidates) {
        await conn.query(
          `INSERT INTO election_results 
           (election_id, position_id, candidate_application_id, vote_count, vote_percentage, outcome, published_at, published_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            electionId,
            pos.position_id,
            cand.candidate_application_id,
            cand.vote_count,
            cand.vote_percentage,
            cand.outcome,
            now,
            adminUserId,
          ]
        );
      }
    }

    // Update election table
    await conn.query(
      'UPDATE elections SET is_results_published = 1, results_published_by = ?, results_published_at = ? WHERE id = ?',
      [adminUserId, now, electionId]
    );

    // Audit log
    await conn.query(
      'INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [
        adminUserId,
        'RESULTS_PUBLISHED',
        'ELECTIONS',
        electionId,
        `Official election results officially published for "${election.title}".`,
      ]
    );

    await conn.commit();
    logger.info(`Results published successfully for Election ${electionId} by Admin ${adminUserId}`);

    // Notify all approved voters and candidates
    const [allUsers] = await db.query("SELECT id FROM users WHERE account_status = 'APPROVED'");
    for (const u of allUsers) {
      await createNotification(
        u.id,
        `Official Results Declared: ${election.title}`,
        `The Chief Election Officer has published the official certified results for "${election.title}". You can now review candidate vote shares and declarations on your Results tab.`,
        'RESULT_PUBLISHED'
      );
    }

    return calculated;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = {
  calculateResults,
  publishResults,
};
