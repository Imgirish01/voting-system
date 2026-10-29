const crypto = require('crypto');
const db = require('../config/database');
const logger = require('../utils/logger');

const BALLOT_SECRET_SALT = process.env.BALLOT_SECRET_SALT || 'eci_campus_ballot_salt_2026_secured';

/**
 * Generate pseudonymous, election-specific token
 */
const generateVoterToken = (userId, electionId, positionId) => {
  return crypto
    .createHmac('sha256', BALLOT_SECRET_SALT)
    .update(`${userId}:${electionId}:${positionId}`)
    .digest('hex');
};

/**
 * Cast Vote with Strict Ballot Secrecy and Transactional Integrity
 */
const castVote = async ({ userId, electionId, positionId, candidateApplicationId, ipAddress }) => {
  // 1. Verify Voter Profile
  const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  if (!users || users.length === 0) {
    const error = new Error('Voter profile not found.');
    error.statusCode = 404;
    throw error;
  }

  const voter = users[0];
  if (voter.account_status !== 'APPROVED') {
    const error = new Error(`Voting restricted. Your voter verification status is '${voter.account_status}'. Only APPROVED voters can participate.`);
    error.statusCode = 403;
    throw error;
  }

  // 2. Verify Election and Time Window
  const [elections] = await db.query('SELECT * FROM elections WHERE id = ?', [electionId]);
  if (!elections || elections.length === 0) {
    const error = new Error('Election not found.');
    error.statusCode = 404;
    throw error;
  }

  const election = elections[0];
  if (election.status !== 'ACTIVE') {
    const error = new Error(`Polls are currently closed for this election. Status: ${election.status}.`);
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();
  const startTime = new Date(election.start_at);
  const endTime = new Date(election.end_at);

  if (now < startTime) {
    const error = new Error(`Voting has not started yet. Poll opens at ${startTime.toLocaleString()}.`);
    error.statusCode = 400;
    throw error;
  }

  if (now > endTime) {
    const error = new Error(`Voting window has concluded. Poll closed at ${endTime.toLocaleString()}.`);
    error.statusCode = 400;
    throw error;
  }

  // Check departmental scope eligibility if applicable
  if (election.scope === 'DEPARTMENTAL' && election.department_id) {
    if (voter.department_id !== election.department_id) {
      const error = new Error('You are not eligible to vote in this departmental election.');
      error.statusCode = 403;
      throw error;
    }
  }

  // 3. Verify Position belongs to Election
  const [positions] = await db.query(
    'SELECT * FROM election_positions WHERE id = ? AND election_id = ?',
    [positionId, electionId]
  );
  if (!positions || positions.length === 0) {
    const error = new Error('Invalid position specified for this election.');
    error.statusCode = 400;
    throw error;
  }

  // 4. Verify Candidate belongs to Position and is APPROVED
  const [candidates] = await db.query(
    'SELECT * FROM candidate_applications WHERE id = ? AND election_id = ? AND position_id = ?',
    [candidateApplicationId, electionId, positionId]
  );
  if (!candidates || candidates.length === 0) {
    const error = new Error('Candidate not found for this position.');
    error.statusCode = 404;
    throw error;
  }

  const candidate = candidates[0];
  if (candidate.application_status !== 'APPROVED') {
    const error = new Error('Votes can only be cast for official APPROVED candidates.');
    error.statusCode = 400;
    throw error;
  }

  // 5. Generate Pseudonymous Ballot Token
  const voterToken = generateVoterToken(userId, electionId, positionId);

  // 6. Execute Atomic Transaction
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Check duplicate participation
    const [existingParticipation] = await conn.query(
      'SELECT id FROM voter_participations WHERE election_id = ? AND position_id = ? AND user_id = ?',
      [electionId, positionId, userId]
    );

    if (existingParticipation && existingParticipation.length > 0) {
      const error = new Error('You have already cast your vote for this position in this election.');
      error.statusCode = 409;
      throw error;
    }

    // A. Record participation for voter audit (who voted, without candidate selection)
    await conn.query(
      'INSERT INTO voter_participations (election_id, position_id, user_id) VALUES (?, ?, ?)',
      [electionId, positionId, userId]
    );

    // B. Record secret ballot (candidate choice, without voter ID, using anonymous token)
    await conn.query(
      'INSERT INTO votes (election_id, position_id, candidate_application_id, voter_token) VALUES (?, ?, ?, ?)',
      [electionId, positionId, candidateApplicationId, voterToken]
    );

    // C. Record Audit Log (Actor identity recorded, candidate choice omitted for ballot secrecy)
    await conn.query(
      'INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
      [
        userId,
        'BALLOT_CAST',
        'ELECTIONS',
        electionId,
        `Ballot cast for position ID ${positionId} under secret token protocol.`,
        ipAddress || '127.0.0.1',
      ]
    );

    await conn.commit();
    logger.info(`Vote successfully cast by User ID ${userId} in Election ${electionId}, Position ${positionId}`);

    return {
      success: true,
      message: 'Your vote has been successfully recorded.',
      votedAt: new Date().toISOString(),
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = {
  castVote,
  generateVoterToken,
};

