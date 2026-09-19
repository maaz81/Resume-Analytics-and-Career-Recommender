import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import fs from 'fs/promises';
import pdf from 'pdf-parse';

import config from '../config/env.js';
import logger from '../config/logger.js';

import Resume from '../models/Resume.js';
import { analyzeResume } from '../services/ai.service.js';
import { query, pool } from '../config/db.js';

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
    logger.info('Resume Worker Redis connection established');
});

connection.on('ready', () => {
    logger.info('Resume Worker Redis connection ready');
});

connection.on('error', (error) => {
    logger.error('Resume Worker Redis connection error', {
        error: error.message,
    });
});

const resumeWorker = new Worker(
    'resume-processing',

    async (job) => {
        const {
            resumeId,
            userId,
            filePath,
            jdText,
        } = job.data;

        logger.info('Processing resume job', {
            jobId: job.id,
            resumeId,
            userId,
        });

        try {
            await query(
                `UPDATE resumes
                 SET parsing_status = 'processing',
                     parsing_error = NULL
                 WHERE id = $1
                   AND user_id = $2`,
                [resumeId, userId]
            );

            // 1. Read uploaded file
            const buffer = await fs.readFile(filePath);

            // 2. Extract text from PDF
            const pdfData = await pdf(buffer);
            const rawText = pdfData.text;

            if (!rawText?.trim()) {
                throw new Error('Could not extract text from resume');
            }

            // 3. Save extracted text
            await query(
                `UPDATE resumes
                 SET raw_text = $1
                 WHERE id = $2
                   AND user_id = $3`,
                [rawText, resumeId, userId]
            );

            let aiResult = null;

            // 4. AI/ML analysis
            if (jdText?.trim()) {
                aiResult = await analyzeResume(
                    rawText,
                    jdText
                );
            }

            // 5. Save AI results
            if (aiResult) {
                await query(
                    `INSERT INTO ats_scores (
                        resume_id,
                        user_id,
                        overall_score,
                        keyword_score,
                        missing_keywords
                    )
                    VALUES ($1, $2, $3, $4, $5)`,
                    [
                        resumeId,
                        userId,
                        aiResult.ats_score,
                        aiResult.job_match_score,
                        JSON.stringify(
                            aiResult.missing_skills
                        ),
                    ]
                );

                await query(
                    `INSERT INTO skill_gaps (
                        user_id,
                        resume_id,
                        match_percentage,
                        missing_skills,
                        resume_skills
                    )
                    VALUES ($1, $2, $3, $4, $5)`,
                    [
                        userId,
                        resumeId,
                        aiResult.job_match_score,
                        JSON.stringify(
                            aiResult.missing_skills
                        ),
                        JSON.stringify(
                            aiResult.resume_skills
                        ),
                    ]
                );

                if (aiResult.resume_skills?.length > 0) {
                    await query(
                        `INSERT INTO user_skills (
                            user_id,
                            resume_id,
                            name
                        )
                        SELECT $1, $2, unnest($3::text[])
                        ON CONFLICT (user_id, name)
                        DO NOTHING`,
                        [
                            userId,
                            resumeId,
                            aiResult.resume_skills,
                        ]
                    );
                }
            }

            // 6. Mark processing complete
            await query(
                `UPDATE resumes
                 SET parsing_status = 'completed',
                     parsed_at = NOW(),
                     parsing_error = NULL
                 WHERE id = $1
                   AND user_id = $2`,
                [resumeId, userId]
            );

            logger.info('Resume processing completed', {
                jobId: job.id,
                resumeId,
            });

            return {
                success: true,
                resumeId,
            };

        } catch (error) {

            logger.error('Resume processing failed', {
                jobId: job.id,
                resumeId,
                error: error.message,
            });

            await Resume.setParsingError(
                resumeId,
                error.message
            );

            throw error;
        }
    },

    {
        connection,
        prefix: 'career-ai:bull',
        concurrency: 2,
    }
);

resumeWorker.on('ready', () => {
    logger.info(
        'Resume worker ready and listening for jobs'
    );
});

resumeWorker.on('active', (job) => {
    logger.info('Resume job became active', {
        jobId: job.id,
        resumeId: job.data.resumeId,
    });
});

resumeWorker.on('completed', (job) => {
    logger.info('Resume job completed', {
        jobId: job.id,
        resumeId: job.data.resumeId,
    });
});

resumeWorker.on('failed', (job, error) => {
    logger.error('Resume job failed', {
        jobId: job?.id,
        resumeId: job?.data?.resumeId,
        attemptsMade: job?.attemptsMade,
        error: error.message,
    });
});

resumeWorker.on('error', (error) => {
    logger.error('Resume worker error', {
        error: error.message,
    });
});

const startWorker = async () => {
    try {
        await resumeWorker.waitUntilReady();

        logger.info(
            'Resume worker is ready and listening for jobs'
        );
    } catch (error) {
        logger.error(
            'Failed to start resume worker',
            {
                error: error.message,
            }
        );

        process.exit(1);
    }
};

const shutdown = async (signal) => {
    logger.info(
        `Received ${signal}. Shutting down resume worker...`
    );

    try {
        await resumeWorker.close();
        await connection.quit();

        logger.info(
            'Resume worker shut down successfully'
        );

        process.exit(0);
    } catch (error) {
        logger.error(
            'Error while shutting down resume worker',
            {
                error: error.message,
            }
        );

        process.exit(1);
    }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startWorker();