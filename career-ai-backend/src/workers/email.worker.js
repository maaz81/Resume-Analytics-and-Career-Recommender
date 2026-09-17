import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import config from '../config/env.js';
import logger from '../config/logger.js';
import { sendPasswordResetEmail } from '../services/email.service.js';

/**
 * Redis connection for BullMQ Worker
 */
const connection = config.redis.url
    ? new IORedis(config.redis.url, {
        maxRetriesPerRequest: null,
    })
    : new IORedis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password || undefined,
        db: config.redis.db ?? 0,
        maxRetriesPerRequest: null,
    });

/**
 * Redis connection events
 */
connection.on('connect', () => {
    logger.info('BullMQ Redis connection established');
});

connection.on('ready', () => {
    logger.info('BullMQ Redis connection ready');
});

connection.on('error', (error) => {
    logger.error('BullMQ Redis connection error', {
        error: error.message,
    });
});

/**
 * Email Worker
 */
const emailWorker = new Worker(
    'email',
    async (job) => {
        logger.info('Processing email job', {
            jobId: job.id,
            jobName: job.name,
        });

        switch (job.name) {
            case 'password-reset': {
                const {
                    userId,
                    email,
                    resetToken,
                } = job.data;

                await sendPasswordResetEmail(
                    email,
                    resetToken
                );

                logger.info('Password reset email sent', {
                    userId,
                    jobId: job.id,
                });

                return {
                    success: true,
                };
            }

            default:
                throw new Error(
                    `Unknown email job: ${job.name}`
                );
        }
    },
    {
        connection,
        prefix: 'career-ai:bull',
        concurrency: 5,
    }
);

/**
 * Worker events
 */
emailWorker.on('ready', () => {
    logger.info('Email worker ready');
});

emailWorker.on('active', (job) => {
    logger.info('Email job became active', {
        jobId: job.id,
        jobName: job.name,
    });
});

emailWorker.on('completed', (job) => {
    logger.info('Email job completed', {
        jobId: job.id,
        jobName: job.name,
    });
});

emailWorker.on('failed', (job, error) => {
    logger.error('Email job failed', {
        jobId: job?.id,
        jobName: job?.name,
        attemptsMade: job?.attemptsMade,
        error: error.message,
    });
});

emailWorker.on('error', (error) => {
    logger.error('Email worker error', {
        error: error.message,
    });
});

/**
 * Start worker
 */
const startWorker = async () => {
    try {
        await emailWorker.waitUntilReady();

        logger.info(
            'Email worker is ready and listening for jobs'
        );
    } catch (error) {
        logger.error('Failed to start email worker', {
            error: error.message,
        });

        process.exit(1);
    }
};

/**
 * Graceful shutdown
 */
const shutdown = async (signal) => {
    logger.info(`Received ${signal}. Shutting down email worker...`);

    try {
        await emailWorker.close();
        await connection.quit();

        logger.info('Email worker shut down successfully');

        process.exit(0);
    } catch (error) {
        logger.error('Error while shutting down email worker', {
            error: error.message,
        });

        process.exit(1);
    }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startWorker();