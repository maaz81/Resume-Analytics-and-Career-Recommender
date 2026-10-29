// ============================================
// services/resumeProcessing.service.js
//
// DIRECT (synchronous) resume processing path.
// Used in production when RESUME_PROCESSING_MODE=direct.
//
// Replaces the BullMQ resume worker job:
//   1. Parse PDF text with pdf-parse
//   2. Call Python ML /analyze
//   3. Persist everything to PostgreSQL
//   4. Invalidate Redis caches
//
// The BullMQ queue / worker remain active in development
// (RESUME_PROCESSING_MODE=queue, the default).
// ============================================

import fs from 'fs/promises';
import pdf from 'pdf-parse';

import logger from '../config/logger.js';
import { query } from '../config/db.js';
import { cache, cacheKeys } from '../config/redis.js';
import { analyzeResume } from './ai.service.js';

/**
 * Process a resume synchronously — parse PDF, call AI, save results.
 *
 * @param {object} params
 * @param {number} params.resumeId  - resumes.id just inserted
 * @param {number} params.userId
 * @param {string} params.filePath  - absolute path on disk
 * @param {string|null} params.jdText - optional JD (only present during onboarding upload)
 * @returns {Promise<{ rawText: string, aiResult: object|null }>}
 */
export const processResumeDirect = async ({ resumeId, userId, filePath, jdText }) => {
    logger.info('[DIRECT] Starting synchronous resume processing', { resumeId, userId });

    // ── Mark as processing ──────────────────────────────────────────────
    await query(
        `UPDATE resumes
         SET parsing_status = 'processing', parsing_error = NULL
         WHERE id = $1 AND user_id = $2`,
        [resumeId, userId]
    );

    try {
        // ── 1. Read + parse PDF ─────────────────────────────────────────
        const buffer = await fs.readFile(filePath);
        const pdfData = await pdf(buffer);
        const rawText = pdfData.text?.trim();

        if (!rawText) {
            throw new Error('Could not extract text from resume. Please check the file is a readable PDF.');
        }

        // ── 2. Persist raw text ─────────────────────────────────────────
        await query(
            `UPDATE resumes SET raw_text = $1 WHERE id = $2 AND user_id = $3`,
            [rawText, resumeId, userId]
        );

        // ── 3. Optional AI analysis (only when jdText is present) ───────
        let aiResult = null;
        if (jdText?.trim()) {
            logger.info('[DIRECT] jdText provided at upload — calling ML /analyze', { resumeId });
            try {
                aiResult = await analyzeResume(rawText, jdText);
            } catch (aiErr) {
                // Log clearly but don't crash — status still becomes 'completed'
                // so the /score endpoint can be called explicitly by the frontend.
                logger.warn('[DIRECT] AI analysis failed during upload (will retry on /score)', {
                    resumeId,
                    error: aiErr.message,
                });
            }
        }

        // ── 4. Persist AI results if available ──────────────────────────
        if (aiResult) {
            await query(
                `INSERT INTO ats_scores (resume_id, user_id, overall_score, keyword_score, missing_keywords)
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    resumeId, userId,
                    aiResult.ats_score,
                    aiResult.job_match_score,
                    JSON.stringify(aiResult.missing_skills),
                ]
            );

            await query(
                `INSERT INTO skill_gaps (user_id, resume_id, match_percentage, missing_skills, resume_skills)
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    userId, resumeId,
                    aiResult.job_match_score,
                    JSON.stringify(aiResult.missing_skills),
                    JSON.stringify(aiResult.resume_skills),
                ]
            );

            if (aiResult.resume_skills?.length > 0) {
                await query(
                    `INSERT INTO user_skills (user_id, resume_id, name)
                     SELECT $1, $2, unnest($3::text[])
                     ON CONFLICT (user_id, name) DO NOTHING`,
                    [userId, resumeId, aiResult.resume_skills]
                );
            }
        }

        // ── 5. Mark completed ────────────────────────────────────────────
        await query(
            `UPDATE resumes
             SET parsing_status = 'completed', parsed_at = NOW(), parsing_error = NULL
             WHERE id = $1 AND user_id = $2`,
            [resumeId, userId]
        );

        // ── 6. Bust caches ───────────────────────────────────────────────
        await cache.del(cacheKeys.dashboard(userId));
        await cache.del(cacheKeys.userContext(userId));
        await cache.del(cacheKeys.resumeActive(userId));

        logger.info('[DIRECT] Resume processing completed', { resumeId });
        return { rawText, aiResult };

    } catch (error) {
        logger.error('[DIRECT] Resume processing failed', { resumeId, error: error.message });

        // Mark failed in DB
        await query(
            `UPDATE resumes
             SET parsing_status = 'failed', parsing_error = $1
             WHERE id = $2 AND user_id = $3`,
            [error.message, resumeId, userId]
        ).catch(() => {});

        await cache.del(cacheKeys.dashboard(userId));
        await cache.del(cacheKeys.userContext(userId));
        await cache.del(cacheKeys.resumeActive(userId));

        throw error;
    }
};

