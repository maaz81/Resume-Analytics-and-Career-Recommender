// ============================================
// services/resume.service.js
// ============================================

import crypto from 'crypto';
import fs from 'fs/promises';

import Resume from '../models/Resume.js';
import { errors } from '../middleware/errorHandler.js';
import { query, pool } from '../config/db.js';
import { analyzeResume } from './ai.service.js';
import { generateAutoJobDescription } from './llm.service.js';       // ← NEW
import { mapAIToATS, formatAnalysisResponse } from '../utils/resume.mapper.js';
import logger from '../config/logger.js';


// ─────────────────────────────────────────────
// HELPER — resolve "latest" or numeric resumeId
// ─────────────────────────────────────────────
const resolveResume = async (resumeId, userId) => {
    let resume;

    if (resumeId === 'latest') {
        resume = await Resume.findActiveByUserId(userId);
        if (!resume) {
            const all = await Resume.findAllByUserId(userId);
            resume = all[0] ?? null;
        }
    } else {
        resume = await Resume.findById(resumeId);
    }

    if (!resume) throw errors.notFound('Resume not found');
    if (resume.user_id !== userId) throw errors.forbidden('Unauthorized');

    return resume;
};


// ─────────────────────────────────────────────
// 1. UPLOAD + ANALYZE
// ─────────────────────────────────────────────
export const uploadResumeService = async ({ userId, file, rawText, jdText }) => {

    let aiResult = null;

    if (jdText) {
        try {
            aiResult = await analyzeResume(rawText, jdText);
        } catch (err) {
            console.error('[AI SERVICE ERROR]', err.message);
            throw errors.internal('AI service unavailable');
        }
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(
            `UPDATE resumes SET is_active = false WHERE user_id = $1`,
            [userId]
        );

        const insertResult = await client.query(
            `INSERT INTO resumes (
                user_id, version, original_filename, file_path,
                file_size, mime_type, raw_text, is_active, parsing_status
             )
             VALUES (
                $1,
                COALESCE((SELECT MAX(version) FROM resumes WHERE user_id = $1), 0) + 1,
                $2, $3, $4, $5, $6, true, 'parsed'
             )
             RETURNING *`,
            [userId, file.originalname, file.path, file.size, file.mimetype, rawText]
        );

        const resume = insertResult.rows[0];
        const resumeId = resume.id;

        if (aiResult) {
            await client.query(
                `INSERT INTO ats_scores (
                    resume_id, user_id, overall_score,
                    keyword_score, missing_keywords
                 )
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    resumeId, userId,
                    aiResult.ats_score,
                    aiResult.job_match_score,
                    JSON.stringify(aiResult.missing_skills)
                ]
            );

            await client.query(
                `INSERT INTO skill_gaps (
                    user_id, resume_id, match_percentage,
                    missing_skills, resume_skills
                 )
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    userId, resumeId,
                    aiResult.job_match_score,
                    JSON.stringify(aiResult.missing_skills),
                    JSON.stringify(aiResult.resume_skills)
                ]
            );

            if (aiResult.resume_skills?.length > 0) {
                await client.query(
                    `INSERT INTO user_skills (user_id, resume_id, name)
                     SELECT $1, $2, unnest($3::text[])
                     ON CONFLICT (user_id, name) DO NOTHING`,
                    [userId, resumeId, aiResult.resume_skills]
                );
            }
        }

        await client.query('COMMIT');

        return {
            resume,
            analysis: aiResult
                ? {
                    ats_score: aiResult.ats_score,
                    match_score: aiResult.job_match_score,
                    missing_skills: aiResult.missing_skills,
                    skills: aiResult.resume_skills,
                    strengths: aiResult.resume_skills,
                    courses: aiResult.courses,
                    projects: aiResult.projects
                }
                : null
        };

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};


// ─────────────────────────────────────────────
// 2. GET ANALYSIS
// ─────────────────────────────────────────────
export const getResumeAnalysisService = async (resumeId, userId) => {
    const resume = await resolveResume(resumeId, userId);

    const [ats, gaps, skills] = await Promise.all([
        query(
            `SELECT * FROM ats_scores
             WHERE resume_id = $1
             ORDER BY scored_at DESC LIMIT 1`,
            [resume.id]
        ),
        query(
            `SELECT * FROM skill_gaps
             WHERE resume_id = $1
             ORDER BY analyzed_at DESC LIMIT 1`,
            [resume.id]
        ),
        query(
            `SELECT name FROM user_skills WHERE resume_id = $1`,
            [resume.id]
        )
    ]);

    const atsRow = ats.rows[0] ?? null;
    const gapRow = gaps.rows[0] ?? null;
    const skillList = skills.rows.map(s => s.name);

    const formatted = formatAnalysisResponse(resume, atsRow, gapRow);

    return {
        ...formatted,
        skills: skillList,
        skillGap: gapRow
            ? {
                matchPercentage: gapRow.match_percentage,
                missingSkills: gapRow.missing_skills ?? [],
                resumeSkills: gapRow.resume_skills ?? []
            }
            : null
    };
};


// ─────────────────────────────────────────────
// 3. SCORE (re-score with a new JD)
//    isAuto: true  → LLM generates the real JD from the role title
//    isAuto: false → jdText is used as-is (manual paste)
// ─────────────────────────────────────────────
export const scoreResumeService = async (resumeId, userId, jdText, isAuto = false) => {
    const resume = await resolveResume(resumeId, userId);
    const resolvedId = resume.id;

    // ── Step 1: Resolve the actual JD text ──────────────────────────────
    let resolvedJD = jdText;          // default: use what the user provided
    let generatedJD = null;           // only set when isAuto === true

    if (isAuto) {
        // jdText here is just the target role title (e.g. "Senior React Developer")
        logger.info('[SCORE] isAuto=true — calling LLM to generate JD', { targetRole: jdText });

        try {
            generatedJD = await generateAutoJobDescription(jdText, resume.raw_text);
            resolvedJD = generatedJD;
            logger.info('[SCORE] LLM JD generated', { chars: resolvedJD.length });
        } catch (llmErr) {
            // ── Graceful fallback: if OpenRouter is down, score against the
            //    role title as plain text rather than crashing the request.
            logger.warn('[SCORE] LLM failed — falling back to raw jdText', {
                error: llmErr.message,
            });
            // resolvedJD already equals jdText, so no change needed
        }
    }

    // ── Step 2: Hash the *resolved* JD for cache lookup ─────────────────
    //    Auto JDs are never cached (different resume context each time),
    //    but manual JDs can still hit the cache.
    const jdHash = isAuto
        ? null   // skip cache for auto mode — LLM output is always unique
        : crypto.createHash('sha256').update(resolvedJD.trim()).digest('hex');

    if (jdHash) {
        const existing = await query(
            `SELECT * FROM ats_scores
             WHERE resume_id = $1 AND jd_hash = $2
             ORDER BY scored_at DESC LIMIT 1`,
            [resolvedId, jdHash]
        );
        if (existing.rows.length) {
            logger.info('[SCORE] Cache hit — returning existing score');
            return { score: existing.rows[0], generatedJD: null };
        }
    }

    // ── Step 3: Call Python ML scorer ────────────────────────────────────
    let aiResult;
    try {
        aiResult = await analyzeResume(resume.raw_text, resolvedJD);
    } catch (err) {
        logger.error('[SCORE AI ERROR]', { error: err.message });
        throw errors.internal('AI service unavailable');
    }

    const mapped = mapAIToATS(aiResult);

    // ── Step 4: Persist the score row ────────────────────────────────────
    
    // Ensure target_role doesn't exceed the database varchar(255) limit.
    // When isAuto=false, jdText is the FULL pasted job description, so taking jdText directly crashes the DB.
    let finalTargetRole = aiResult.target_role;
    if (!finalTargetRole) {
        finalTargetRole = isAuto ? jdText : 'Custom Job Description';
    }
    if (finalTargetRole.length > 255) {
        finalTargetRole = finalTargetRole.substring(0, 252) + '...';
    }

    const result = await query(
        `INSERT INTO ats_scores (
            resume_id, user_id, overall_score, keyword_score,
            formatting_score, experience_score, missing_keywords,
            target_role, jd_hash
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING *`,
        [
            resolvedId,
            userId,
            mapped.overall_score,
            mapped.keyword_score,
            mapped.formatting_score,
            mapped.experience_score,
            JSON.stringify(mapped.missing_keywords),
            finalTargetRole,
            jdHash
        ]
    );

    // ── Step 5: Return score + optionally the generated JD text ──────────
    return {
        score: result.rows[0],
        generatedJD,   // null for manual mode; full text for auto mode
    };
};


// ─────────────────────────────────────────────
// 4. HISTORY
// ─────────────────────────────────────────────
export const getResumeHistoryService = async (userId) => {
    const result = await query(
        `SELECT r.id, r.version, r.original_filename, r.file_path,
                r.uploaded_at, r.is_active,
                a.overall_score
         FROM resumes r
         LEFT JOIN LATERAL (
             SELECT overall_score FROM ats_scores
             WHERE resume_id = r.id
             ORDER BY scored_at DESC LIMIT 1
         ) a ON TRUE
         WHERE r.user_id = $1
         ORDER BY r.version DESC`,
        [userId]
    );

    return result.rows.map(r => ({
        id: r.id,
        version: r.version,
        fileName: r.original_filename,
        uploadedAt: r.uploaded_at,
        atsScore: r.overall_score ?? null,
        status: r.is_active ? 'current' : 'archived',
        fileUrl: `/api/v1/resumes/${r.id}/file`
    }));
};


// ─────────────────────────────────────────────
// 5. DELETE
// ─────────────────────────────────────────────
export const deleteResumeService = async (resumeId, userId) => {
    const resume = await Resume.findById(resumeId);

    if (!resume) throw errors.notFound('Resume not found');
    if (resume.user_id !== userId) throw errors.forbidden('Unauthorized');
    if (resume.is_active) throw errors.badRequest('Cannot delete active resume. Upload a new resume first to archive this one.');

    if (resume.file_path) {
        await fs.unlink(resume.file_path).catch(err =>
            console.warn('[FILE DELETE WARN]', err.message)
        );
    }

    await query(`DELETE FROM resumes WHERE id = $1`, [resumeId]);
};