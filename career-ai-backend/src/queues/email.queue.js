import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import config from '../config/env.js';
import logger from '../config/logger.js';

let connection = null;
let emailQueueInstance = null;

/**
 * Lazy connection initializer for BullMQ Email Queue.
 * Avoids opening IORedis connection automatically upon module import.
 */
const getEmailQueue = () => {
    if (emailQueueInstance) return emailQueueInstance;

    connection = config.redis.url
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

    connection.on('connect', () => {
        logger.info('BullMQ Email Queue Redis connection established');
    });

    connection.on('ready', () => {
        logger.info('BullMQ Email Queue Redis connection ready');
    });

    connection.on('error', (error) => {
        logger.error('BullMQ Email Queue Redis connection error', {
            error: error.message,
        });
    });

    emailQueueInstance = new Queue('email', {
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

    return emailQueueInstance;
};

export { getEmailQueue };

/**
 * Add Password Reset Email Job
 *
 * If EMAIL_PROCESSING_MODE=direct or Redis is disabled,
 * sends the email immediately via Resend without queueing.
 */
export const addPasswordResetEmailJob = async ({
    userId,
    email,
    resetToken,
}) => {
    const isDirect = process.env.EMAIL_PROCESSING_MODE === 'direct' ||
                     config.redis.enabled === false ||
                     config.redis.enabled === 'false';

    if (isDirect) {
        logger.info('Dispatching password reset email directly (direct mode)', {
            userId,
            email,
        });
        const { sendPasswordResetEmail } = await import('../services/email.service.js');
        await sendPasswordResetEmail(email, resetToken);
        return { id: `direct-email-${Date.now()}` };
    }

    const queue = getEmailQueue();
    const job = await queue.add(
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
