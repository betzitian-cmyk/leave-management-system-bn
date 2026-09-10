import app from './app';
import dotenv from 'dotenv';
import http from 'http';
import { initializeDatabase } from './config/database';
import { initializeSocketService } from './config/socketio';
import { logger, logStartup } from './utils/logger';

dotenv.config();

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    logger.info('🚀 Starting Leave Management System...');

    // Initialize database first
    await initializeDatabase();

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize socket service
    const socketService = initializeSocketService(server);
    logger.info('🔌 Socket.IO service initialized');

    // Start server only after database is connected
    server.listen(PORT, () => {
      logStartup(Number(PORT), process.env.NODE_ENV || 'development');
      logger.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
      logger.info(`🔌 Socket.IO service is active`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server', {
      error: error.message,
      stack: error.stack,
    });
    logger.error('💡 Please check your database connection and environment variables');
    logger.error('🔧 Make sure PostgreSQL is running and DATABASE_URL is set correctly');
    process.exit(1);
  }
}

// Start the server
startServer();
