const db = require('../config/database');
const logger = require('../utils/logger');
const { createNotification } = require('../services/notification.service');

let intervalHandle = null;

const checkElectionSchedules = async () => {
  try {
    const now = new Date().toISOString();

    // 1. Automatically close candidate applications if deadline has passed
    const [openAppElections] = await db.query(
      "SELECT * FROM elections WHERE status = 'APPLICATION_OPEN' AND application_deadline <= ?",
      [now]
    );

    for (const el of openAppElections) {
      await db.query("UPDATE elections SET status = 'APPLICATION_CLOSED' WHERE id = ?", [el.id]);
      await db.query(
        "INSERT INTO audit_logs (action, entity_type, entity_id, details) VALUES (?, ?, ?, ?)",
        ['AUTO_APPLICATION_CLOSED', 'ELECTIONS', el.id, `Candidate application deadline passed at ${el.application_deadline}. Status set to APPLICATION_CLOSED.`]
      );
      logger.info(`Scheduler: Candidate applications closed automatically for Election ${el.id} (${el.title})`);
    }

    // 2. Automatically activate scheduled UPCOMING elections if start_at has passed and now <= end_at
    const [upcomingElections] = await db.query(
      "SELECT * FROM elections WHERE status = 'UPCOMING' AND start_at <= ? AND end_at > ?",
      [now, now]
    );

    for (const el of upcomingElections) {
      await db.query("UPDATE elections SET status = 'ACTIVE' WHERE id = ?", [el.id]);
      await db.query(
        "INSERT INTO audit_logs (action, entity_type, entity_id, details) VALUES (?, ?, ?, ?)",
        ['AUTO_ELECTION_ACTIVATED', 'ELECTIONS', el.id, `Voting poll opened automatically at start time ${el.start_at}.`]
      );
      logger.info(`Scheduler: Election ${el.id} (${el.title}) automatically transitioned to ACTIVE.`);
    }

    // 3. Automatically complete ACTIVE or PAUSED elections if end_at has passed
    const [expiredElections] = await db.query(
      "SELECT * FROM elections WHERE (status = 'ACTIVE' OR status = 'PAUSED') AND end_at <= ?",
      [now]
    );

    for (const el of expiredElections) {
      await db.query("UPDATE elections SET status = 'COMPLETED' WHERE id = ?", [el.id]);
      await db.query(
        "INSERT INTO audit_logs (action, entity_type, entity_id, details) VALUES (?, ?, ?, ?)",
        ['AUTO_ELECTION_COMPLETED', 'ELECTIONS', el.id, `Voting poll closed automatically as end time ${el.end_at} was reached.`]
      );
      logger.info(`Scheduler: Election ${el.id} (${el.title}) automatically completed (Poll Closed).`);

      // Notify users
      const [voters] = await db.query("SELECT id FROM users WHERE account_status = 'APPROVED'");
      for (const v of voters) {
        await createNotification(
          v.id,
          `Voting Concluded: ${el.title}`,
          `Polls have closed for "${el.title}". The Election Commission will announce the certified results following verification.`,
          'ELECTION_ALERT'
        );
      }
    }
  } catch (err) {
    logger.error('Election Scheduler Error:', err.message);
  }
};

const startScheduler = (intervalMs = 30000) => { // Check every 30 seconds
  if (intervalHandle) clearInterval(intervalHandle);
  logger.info('Election lifecycle background scheduler started (Interval: 30s)');
  // Run once immediately
  checkElectionSchedules();
  intervalHandle = setInterval(checkElectionSchedules, intervalMs);
};

const stopScheduler = () => {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
};

module.exports = {
  startScheduler,
  stopScheduler,
  checkElectionSchedules,
};

