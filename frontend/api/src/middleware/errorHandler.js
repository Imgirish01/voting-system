const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled Server Error:', err.stack || err.message);

  // MySQL duplicate entry error
  if (err.code === 'ER_DUP_ENTRY' || err.message.includes('ER_DUP_ENTRY')) {
    return res.status(409).json({
      success: false,
      message: 'A duplicate record already exists (e.g., duplicate registration number, email, or already cast ballot).',
    });
  }

  // Multer file size / type error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size exceeds permitted maximum limit (5MB).',
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error. Please try again later.',
  });
};

module.exports = errorHandler;

