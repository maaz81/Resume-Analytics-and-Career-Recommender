// ============================================
// src/server.js - Server Bootstrap (UPDATED)
// ============================================

import app from './app.js';
import config from './config/env.js';
import logger from './config/logger.js';
import { testConnection, closePool } from './config/db.js';
import { connectRedis, closeRedis, getRedisClient } from './config/redis.js';

let server;
let isRedisConnected = false;

// ============================================
// START SERVER
// ============================================

const startServer = async () => {
    try {
        // 1. Test database connection
        logger.info('Testing database connection...');
        await testConnection();
        logger.info('✅ PostgreSQL connected successfully');

        // 2. Connect to Redis (Optional in development)
        logger.info('Connecting to Redis...');
        const redisClient = await connectRedis();
        isRedisConnected = redisClient !== null;

        if (!isRedisConnected) {
            logger.warn('⚠️ Starting server without Redis cache');
        }

        // 3. Start Express server
        server = app.listen(config.port, () => {
            const redisStatus = isRedisConnected ? 'Redis Connected ✅' : 'Redis Disabled ⚠️';

            logger.info(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Career AI Platform Backend                          ║
║                                                           ║
║   Environment:  ${config.env.padEnd(40)}║
║   Port:         ${String(config.port).padEnd(40)}║
║   API Version:  ${config.apiVersion.padEnd(40)}║
║                                                           ║
║   📊 Database:   PostgreSQL Connected ✅                 ║
║   ⚡ Cache:      ${redisStatus.padEnd(40)}║
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
                logger.error(`❌ Port ${config.port} is already in use`);
            } else {
                logger.error('❌ Server error', error);
            }
            process.exit(1);
        });

    } catch (error) {
        logger.error('❌ Failed to start server', error);
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
                logger.info('✅ Database connections closed');

                // Close Redis connection (if connected)
                if (isRedisConnected) {
                    await closeRedis();
                    logger.info('✅ Redis connection closed');
                }

                logger.info('✅ Graceful shutdown completed');
                process.exit(0);
            } catch (error) {
                logger.error('❌ Error during shutdown', error);
                process.exit(1);
            }
        });

        // Force shutdown after 10 seconds
        setTimeout(() => {
            logger.error('⚠️ Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    } else {
        process.exit(0);
    }
};

// Listen for shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('❌ Uncaught Exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('UNHANDLED_REJECTION');
});

// Start the server
startServer();