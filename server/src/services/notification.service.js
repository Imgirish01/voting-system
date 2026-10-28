const db = require('../config/database');
const logger = require('../utils/logger');

const createNotification = async (userId, title, message, type = 'INFO') => {
  try {
    await db.query(
      'INSERT INTO notifications (user_id, title, message, notification_type) VALUES (?, ?, ?, ?)',
      [userId, title, message, type]
    );
  } catch (err) {
    logger.error(`Failed to create notification for user ${userId}:`, err.message);
  }
};

const notifyAllVoters = async (title, message, type = 'ELECTION_ALERT') => {
  try {
    const [voters] = await db.query("SELECT id FROM users WHERE role = 'VOTER' AND account_status = 'APPROVED'");
    for (const voter of voters) {
      await createNotification(voter.id, title, message, type);
    }
  } catch (err) {
    logger.error('Failed to notify all voters:', err.message);
  }
};

module.exports = {
  createNotification,
  notifyAllVoters,
};

