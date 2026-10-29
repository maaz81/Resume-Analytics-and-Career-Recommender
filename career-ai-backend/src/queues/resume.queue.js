import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import config from '../config/env.js';
import logger from '../config/logger.js';

let connection = null;
let resumeQueue = null;

/**
 * Lazy connection initializer for Resume BullMQ Queue.
 * Prevents opening an IORedis connection on module import when in direct mode
 * or when background workers are not needed.
 */
const getResumeQueue = () => {
    if (resumeQueue) return resumeQueue;

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
        logger.info('Resume Queue Redis connection established');
    });

    connection.on('ready', () => {
        logger.info('Resume Queue Redis connection ready');
    });

    connection.on('error', (error) => {
        logger.error('Resume Queue Redis connection error', {
            error: error.message,
        });
    });

    resumeQueue = new Queue('resume-processing', {
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

    return resumeQueue;
};

export { getResumeQueue, connection };

export const addResumeProcessingJob = async ({
    resumeId,
    userId,
    filePath,
    jdText = null,
}) => {
    const queue = getResumeQueue();

    const job = await queue.add(
        'process-resume',
        {
            resumeId,
            userId,
            filePath,
            jdText,
        },
        {
            jobId: `resume-${resumeId}`,
        }
    );

    logger.info('Resume processing job queued', {
        resumeId,
        userId,
        jobId: job.id,
    });

    return job;
};
