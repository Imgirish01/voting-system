require('dotenv').config();
const app = require('./app');
const { initDatabase } = require('./config/database');
const { startScheduler } = require('./jobs/electionScheduler');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Initialize Database (MySQL or robust zero-config fallback)
    await initDatabase();

    // 2. Start Automatic Election Scheduler Job
    startScheduler(30000); // Polls every 30 seconds

    // 3. Start HTTP Server
    app.listen(PORT, () => {
      logger.info('================================================================');
      logger.info(`🏛️  E-VOTERS COMMISSION REST API SERVER RUNNING ON PORT ${PORT}`);
      logger.info(`🌐 Health Endpoint: http://localhost:${PORT}/api/health`);
      logger.info(`🗳️  Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info('================================================================');
    });
  } catch (error) {
    logger.error('Fatal Server Boot Error:', error.message);
    process.exit(1);
  }
};

startServer();

