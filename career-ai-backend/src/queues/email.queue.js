import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import config from '../config/env.js';
import logger from '../config/logger.js';

/**
 * Redis connection for BullMQ
 *
 * BullMQ uses ioredis.
 * This is separate from the Redis client used by our application cache.
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
 * Email Queue
 *
 * All email-related background jobs will go through this queue.
 */
export const emailQueue = new Queue('email', {
    connection,

    prefix: 'career-ai:bull',

    defaultJobOptions: {
        attempts: 3,

        backoff: {
            type: 'exponential',
            delay: 5000,
        },

        removeOnComplete: {
            age: 3600,
            count: 1000,
        },

        removeOnFail: {
            age: 86400,
            count: 5000,
        },
    },
});

/**
 * Add Password Reset Email Job
 */
export const addPasswordResetEmailJob = async ({
    userId,
    email,
    resetToken,
}) => {
    const job = await emailQueue.add(
        'password-reset',
        {
            userId,
            email,
            resetToken,
        }
    );

    logger.info('Password reset email job queued', {
        userId,
        jobId: job.id,
    });

    return job;
};