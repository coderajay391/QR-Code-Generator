import { createApp } from './app';
import { env } from './config/env';
import { connectDB, disconnectDB } from './config/database';
import { logger } from './config/logger';
import http from 'http';

async function startServer() {
  try {
    // Initialize Database
    await connectDB();

    const app = createApp();
    const server = http.createServer(app);

    const port = env.PORT || 5000;
    server.listen(port, () => {
      logger.info(`================================================`);
      logger.info(`🚀 QR Code Generator API is running on port ${port}`);
      logger.info(`📍 Environment: ${env.NODE_ENV}`);
      logger.info(`📖 OpenAPI Docs: http://localhost:${port}/api/docs/openapi.json`);
      logger.info(`================================================`);
    });

    // Graceful Shutdown Handling
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDB();
        logger.info('Database connection closed. Process terminated.');
        process.exit(0);
      });

      // Force close if graceful shutdown takes too long
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Process Level Error Catching
    process.on('unhandledRejection', (reason: any) => {
      logger.error(`Unhandled Rejection: ${reason?.stack || reason}`);
    });

    process.on('uncaughtException', (err: Error) => {
      logger.error(`Uncaught Exception: ${err.stack || err.message}`);
      shutdown('uncaughtException');
    });
  } catch (error: any) {
    logger.error(`Server failed to start: ${error.message}`);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test' && require.main === module) {
  startServer();
}

export { startServer };
