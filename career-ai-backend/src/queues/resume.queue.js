import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import config from '../config/env.js';
import logger from '../config/logger.js';

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

export const resumeQueue = new Queue('resume-processing', {
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

export const addResumeProcessingJob = async ({
    resumeId,
    userId,
    filePath,
    jdText = null,
}) => {
    const job = await resumeQueue.add(
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