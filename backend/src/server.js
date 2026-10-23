import { app } from './app.js';
import { ENV } from './config/env.js';
import { testConnection, pool } from './config/database.js';
import { logger } from './utils/logger.util.js';

const PORT = ENV.PORT;

const server = app.listen(PORT, async () => {
  logger.info(`================================================`);
  logger.info(` Event Equipment Management API Server Started `);
  logger.info(` Port:        http://localhost:${PORT}`);
  logger.info(` Environment: ${ENV.NODE_ENV}`);
  logger.info(` Client URL:  ${ENV.CLIENT_URL}`);
  logger.info(`================================================`);

  const dbStatus = await testConnection();
  if (dbStatus.connected) {
    logger.info(`[DATABASE] Connected to MySQL database "${dbStatus.database}" on ${dbStatus.host}:${dbStatus.port}`);
  } else {
    logger.warn(`[DATABASE] MySQL connection check: ${dbStatus.error || 'Cannot reach database'}`);
    logger.warn(`[DATABASE] Ensure MySQL server is running and credentials in .env are correct.`);
  }
});

// Graceful shutdown
async function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await pool.end();
      logger.info('Database pool closed.');
      process.exit(0);
    } catch (err) {
      logger.error('Error closing database pool:', err);
      process.exit(1);
    }
  });
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
