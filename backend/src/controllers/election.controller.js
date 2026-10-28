const db = require('../config/database');
const { updateElectionStatus } = require('../services/election.service');
const { calculateResults, publishResults } = require('../services/results.service');
const logger = require('../utils/logger');

/**
 * Create a New Election
 */
const createElection = async (req, res, next) => {
  try {
    const {
      title,
      description,
      election_type,
      academic_year,
      scope = 'COLLEGE_WIDE',
      department_id,
      start_at,
      end_at,
      application_deadline,
      status = 'DRAFT',
      eligibility_criteria,
      max_winners = 1,
      positions = [],
    } = req.body;

    // 1. Validation
    if (!title || !election_type || !academic_year || !start_at || !end_at || !application_deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory election scheduling parameters.',
      });
    }

    const startDate = new Date(start_at);
    const endDate = new Date(end_at);
    const deadlineDate = new Date(application_deadline);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || isNaN(deadlineDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date/time format provided.',
      });
    }

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: 'Election end date and time must be strictly after the start date and time.',
      });
    }

    if (deadlineDate > startDate) {
      return res.status(400).json({
        success: false,
        message: 'Candidate application deadline must close on or before the voting start time.',
      });
    }

    // 2. Insert Election
    const [result] = await db.query(
      `INSERT INTO elections 
       (title, description, election_type, academic_year, scope, department_id, 
        start_at, end_at, application_deadline, status, eligibility_criteria, max_winners, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description || null,
        election_type.trim(),
        academic_year.trim(),
        scope,
        department_id ? Number(department_id) : null,
        startDate.toISOString(),
        endDate.toISOString(),
        deadlineDate.toISOString(),
        status,
        eligibility_criteria || null,
        Number(max_winners) || 1,
        req.user.id,
      ]
    );

    const electionId = result.insertId;

    // 3. Insert Positions
    const insertedPositions = [];
    if (positions && positions.length > 0) {
      for (const pos of positions) {
        if (pos.position_name && pos.position_name.trim() !== '') {
          const [posResult] = await db.query(
            `INSERT INTO election_positions 
             (election_id, position_name, description, winners_allowed, tie_policy)
             VALUES (?, ?, ?, ?, ?)`,
            [
              electionId,
              pos.position_name.trim(),
              pos.description || null,
              Number(pos.winners_allowed) || 1,
              pos.tie_policy || 'ADMIN_DECISION',
            ]
          );
          insertedPositions.push({ id: posResult.insertId, ...pos });
        }
      }
    } else {
      // Default position based on election_type
      const [posResult] = await db.query(
        `INSERT INTO election_positions (election_id, position_name, description, winners_allowed, tie_policy)
         VALUES (?, ?, ?, ?, ?)`,
        [electionId, election_type.trim(), 'Primary Executive Office', 1, 'ADMIN_DECISION']
      );
      insertedPositions.push({ id: posResult.insertId, position_name: election_type });
    }

    // Audit log
    await db.query(
      'INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'ELECTION_CREATED', 'ELECTIONS', electionId, `Election created: "${title}" (${election_type})`]
    );

    return res.status(201).json({
      success: true,
      message: 'New election successfully created and registered on the portal.',
      electionId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Elections (with summary counts)
 */
const getElections = async (req, res, next) => {
  try {
    const { status, scope } = req.query;

    const [elections] = await db.query('SELECT * FROM elections ORDER BY created_at DESC');

    let filtered = elections;
    if (status && status !== 'ALL') {
      filtered = filtered.filter(e => e.status === status);
    }
    if (scope && scope !== 'ALL') {
      filtered = filtered.filter(e => e.scope === scope);
    }

    // Attach positions & candidate counts
    const enriched = await Promise.all(
      filtered.map(async el => {
        const [positions] = await db.query(
          'SELECT * FROM election_positions WHERE election_id = ?',
          [el.id]
        );
        const [candApps] = await db.query(
          "SELECT * FROM candidate_applications WHERE election_id = ? AND application_status = 'APPROVED'",
          [el.id]
        );
        const [voteCount] = await db.query(
          'SELECT COUNT(*) as total FROM votes WHERE election_id = ?',
          [el.id]
        );

        return {
          ...el,
          positions,
          approved_candidates_count: candApps.length,
          total_votes: voteCount[0]?.total || 0,
        };
      })
    );

    return res.json({
      success: true,
      count: enriched.length,
      elections: enriched,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Specific Election By ID
 */
const getElectionById = async (req, res, next) => {
  try {
    const electionId = req.params.id;

    const [elections] = await db.query('SELECT * FROM elections WHERE id = ?', [electionId]);
    if (!elections || elections.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Election not found.',
      });
    }

    const election = elections[0];

    // Get positions
    const [positions] = await db.query(
      'SELECT * FROM election_positions WHERE election_id = ?',
      [electionId]
    );

    // Get approved candidates for ballot / preview
    const [candidates] = await db.query(
      `SELECT ca.*, u.full_name as candidate_name, u.email as candidate_email,
              u.college_registration_number, u.course, u.academic_year,
              d.name as department_name
       FROM candidate_applications ca
       JOIN users u ON ca.user_id = u.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE ca.election_id = ? AND ca.application_status = 'APPROVED'`,
      [electionId]
    );

    // If caller is authenticated user, check participation
    let hasVotedMap = {};
    if (req.user) {
      const [participations] = await db.query(
        'SELECT position_id FROM voter_participations WHERE election_id = ? AND user_id = ?',
        [electionId, req.user.id]
      );
      participations.forEach(p => {
        hasVotedMap[p.position_id] = true;
      });
    }

    return res.json({
      success: true,
      election,
      positions,
      candidates,
      userParticipations: hasVotedMap,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lifecycle Handlers
 */
const openApplications = async (req, res, next) => {
  try {
    const updated = await updateElectionStatus(req.params.id, 'APPLICATION_OPEN', req.user.id);
    res.json({ success: true, message: 'Candidate applications are now OPEN.', election: updated });
  } catch (error) {
    next(error);
  }
};

const closeApplications = async (req, res, next) => {
  try {
    const updated = await updateElectionStatus(req.params.id, 'APPLICATION_CLOSED', req.user.id);
    res.json({ success: true, message: 'Candidate applications are now CLOSED.', election: updated });
  } catch (error) {
    next(error);
  }
};

const startElection = async (req, res, next) => {
  try {
    const updated = await updateElectionStatus(req.params.id, 'ACTIVE', req.user.id);
    res.json({ success: true, message: 'Voting poll is now ACTIVE.', election: updated });
  } catch (error) {
    next(error);
  }
};

const pauseElection = async (req, res, next) => {
  try {
    const updated = await updateElectionStatus(req.params.id, 'PAUSED', req.user.id);
    res.json({ success: true, message: 'Voting has been PAUSED temporarily.', election: updated });
  } catch (error) {
    next(error);
  }
};

const resumeElection = async (req, res, next) => {
  try {
    const updated = await updateElectionStatus(req.params.id, 'ACTIVE', req.user.id);
    res.json({ success: true, message: 'Voting has RESUMED.', election: updated });
  } catch (error) {
    next(error);
  }
};

const stopElection = async (req, res, next) => {
  try {
    const updated = await updateElectionStatus(req.params.id, 'COMPLETED', req.user.id);
    res.json({ success: true, message: 'Voting poll has been STOPPED and marked COMPLETED.', election: updated });
  } catch (error) {
    next(error);
  }
};

const handlePublishResults = async (req, res, next) => {
  try {
    const results = await publishResults(req.params.id, req.user.id);
    res.json({
      success: true,
      message: 'Official results declared and published successfully!',
      results,
    });
  } catch (error) {
    next(error);
  }
};

const getElectionResults = async (req, res, next) => {
  try {
    const electionId = req.params.id;
    const [elections] = await db.query('SELECT * FROM elections WHERE id = ?', [electionId]);
    if (!elections || elections.length === 0) {
      return res.status(404).json({ success: false, message: 'Election not found.' });
    }

    const election = elections[0];
    const isAdmin = req.user && req.user.role === 'ADMIN';

    // If results are NOT published and requester is not Admin, refuse access!
    if (!election.is_results_published && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Results are not yet available. The administrator will publish the official results after voting closes.',
      });
    }

    const results = await calculateResults(electionId);
    return res.json({
      success: true,
      results,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createElection,
  getElections,
  getElectionById,
  openApplications,
  closeApplications,
  startElection,
  pauseElection,
  resumeElection,
  stopElection,
  handlePublishResults,
  getElectionResults,
};

