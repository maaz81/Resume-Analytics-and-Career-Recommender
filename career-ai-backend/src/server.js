// ============================================
// src/server.js - Server Bootstrap
// ============================================

import app from './app.js';
import config from './config/env.js';
import logger from './config/logger.js';
import { testConnection, closePool } from './config/db.js';
import { connectRedis, closeRedis } from './config/redis.js';

let server;

// ============================================
// START SERVER
// ============================================

const startServer = async () => {
    try {
        // 1. Test database connection
        logger.info('Testing database connection...');
        await testConnection();

        // 2. Connect to Redis
        logger.info('Connecting to Redis...');
        await connectRedis();

        // 3. Start Express server
        server = app.listen(config.port, () => {
            logger.info(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Career AI Platform Backend                          ║
║                                                           ║
║   Environment:  ${config.env.padEnd(40)}║
║   Port:         ${String(config.port).padEnd(40)}║
║   API Version:  ${config.apiVersion.padEnd(40)}║
║                                                           ║
║   📊 Database:   PostgreSQL Connected                    ║
║   ⚡ Cache:      Redis Connected                         ║
║                                                           ║
║   🔗 Health:     http://localhost:${config.port}/health${' '.repeat(16)}║
║   📚 API:        http://localhost:${config.port}/api/${config.apiVersion}${' '.repeat(17)}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
        });

        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                logger.error(`Port ${config.port} is already in use`);
            } else {
                logger.error('Server error', error);
            }
            process.exit(1);
        });

    } catch (error) {
        logger.error('Failed to start server', error);
        process.exit(1);
    }
};

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

const gracefulShutdown = async (signal) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);

    if (server) {
        server.close(async () => {
            logger.info('HTTP server closed');

            try {
                // Close database pool
                await closePool();
                logger.info('Database connections closed');

                // Close Redis connection
                await closeRedis();
                logger.info('Redis connection closed');

                logger.info('Graceful shutdown completed');
                process.exit(0);
            } catch (error) {
                logger.error('Error during shutdown', error);
                process.exit(1);
            }
        });

        // Force shutdown after 10 seconds
        setTimeout(() => {
            logger.error('Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    } else {
        process.exit(0);
    }
};

// Listen for shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
startServer();