const db = require('../config/database');
const logger = require('../utils/logger');
const { createNotification } = require('./notification.service');

/**
 * Valid Status Transitions Map
 */
const VALID_TRANSITIONS = {
  DRAFT: ['UPCOMING', 'APPLICATION_OPEN', 'CANCELLED'],
  UPCOMING: ['APPLICATION_OPEN', 'ACTIVE', 'CANCELLED'],
  APPLICATION_OPEN: ['APPLICATION_CLOSED', 'CANCELLED'],
  APPLICATION_CLOSED: ['ACTIVE', 'UPCOMING', 'CANCELLED'],
  ACTIVE: ['PAUSED', 'COMPLETED', 'CANCELLED'],
  PAUSED: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

const updateElectionStatus = async (electionId, newStatus, adminUserId, reason = '') => {
  const [elections] = await db.query('SELECT * FROM elections WHERE id = ?', [electionId]);
  if (!elections || elections.length === 0) {
    const error = new Error('Election not found.');
    error.statusCode = 404;
    throw error;
  }

  const election = elections[0];
  const currentStatus = election.status;

  if (currentStatus === newStatus) {
    return election;
  }

  const allowedNext = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(newStatus)) {
    const error = new Error(
      `Invalid election status transition from '${currentStatus}' to '${newStatus}'. Allowed: [${allowedNext.join(', ')}]`
    );
    error.statusCode = 400;
    throw error;
  }

  // Update in database
  await db.query('UPDATE elections SET status = ? WHERE id = ?', [newStatus, electionId]);

  // Log in Audit Trail
  await db.query(
    'INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
    [
      adminUserId,
      `ELECTION_STATUS_${newStatus}`,
      'ELECTIONS',
      electionId,
      `Election status transitioned from ${currentStatus} to ${newStatus}. ${reason ? 'Reason: ' + reason : ''}`,
    ]
  );

  logger.info(`Election ${electionId} transitioned from ${currentStatus} to ${newStatus}`);

  // Broadcast notification when election is ACTIVE or COMPLETED
  if (newStatus === 'ACTIVE') {
    const [voters] = await db.query("SELECT id FROM users WHERE role = 'VOTER' AND account_status = 'APPROVED'");
    for (const v of voters) {
      await createNotification(
        v.id,
        `POLLS OPEN: ${election.title}`,
        `Voting is now active for ${election.title}. Please cast your secret ballot before the scheduled deadline.`,
        'ELECTION_ALERT'
      );
    }
  } else if (newStatus === 'COMPLETED') {
    const [voters] = await db.query("SELECT id FROM users WHERE account_status = 'APPROVED'");
    for (const v of voters) {
      await createNotification(
        v.id,
        `POLLS CLOSED: ${election.title}`,
        `Voting for ${election.title} has officially closed. Results will be declared following the formal tally by the Election Commission.`,
        'ELECTION_ALERT'
      );
    }
  }

  return { ...election, status: newStatus };
};

module.exports = {
  updateElectionStatus,
  VALID_TRANSITIONS,
};

