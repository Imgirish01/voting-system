/**
 * Unified Logger Utility
 */
const logger = {
  info: (msg, meta = '') => console.log(`[INFO]  [${new Date().toISOString()}] ${msg}`, meta ? meta : ''),
  warn: (msg, meta = '') => console.warn(`[WARN]  [${new Date().toISOString()}] ${msg}`, meta ? meta : ''),
  error: (msg, meta = '') => console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, meta ? meta : ''),
  audit: (actor, action, details) => {
    console.log(`[AUDIT] [${new Date().toISOString()}] Actor: ${actor} | Action: ${action} | Details:`, details);
  }
};

module.exports = logger;

