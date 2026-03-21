// ============================================
// services/resume.service.js
// ============================================

import crypto from 'crypto';
import fs from 'fs/promises';

import Resume from '../models/Resume.js';
import { errors } from '../middleware/errorHandler.js';
import { query, pool } from '../config/db.js';  // ← import pool for transactions
import { analyzeResume } from './ai.service.js';
import { mapAIToATS, formatAnalysisResponse } from '../utils/resume.mapper.js';




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

    // ── Step 1: Call Python AI (outside transaction — no point holding
    //            a DB connection open while waiting for the AI response)
    let aiResult = null;

    if (jdText) {
        try {
            aiResult = await analyzeResume(rawText, jdText);
        } catch (err) {
            console.error('[AI SERVICE ERROR]', err.message);
            throw errors.internal('AI service unavailable');
        }
    }

    // ── Steps 2–6: All DB writes in a single transaction
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 2. Deactivate old resumes
        await client.query(
            `UPDATE resumes SET is_active = false WHERE user_id = $1`,
            [userId]
        );

        // 3. Insert new resume
        // NOTE: Resume.create should accept a client arg — see note below
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
            [
                userId,
                file.originalname,
                file.path,
                file.size,
                file.mimetype,
                rawText
            ]
        );

        const resume = insertResult.rows[0];
        const resumeId = resume.id;

        // 4, 5, 6 — only if AI returned a result
        if (aiResult) {

            // 4. Insert ATS score
            await client.query(
                `INSERT INTO ats_scores (
                    resume_id, user_id, overall_score,
                    keyword_score, missing_keywords
                 )
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    resumeId,
                    userId,
                    aiResult.ats_score,
                    aiResult.job_match_score,
                    JSON.stringify(aiResult.missing_skills)
                ]
            );

            // 5. Insert skill gap
            await client.query(
                `INSERT INTO skill_gaps (
                    user_id, resume_id, match_percentage,
                    missing_skills, resume_skills
                 )
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    userId,
                    resumeId,
                    aiResult.job_match_score,
                    JSON.stringify(aiResult.missing_skills),
                    JSON.stringify(aiResult.resume_skills)
                ]
            );

            // 6. Bulk insert user skills — single query, no N+1
            if (aiResult.resume_skills?.length > 0) {
                await client.query(
                    `INSERT INTO user_skills (user_id, resume_id, name)
         SELECT $1, $2, unnest($3::text[])
         ON CONFLICT (user_id, resume_id, name) DO NOTHING`,
                    [userId, resumeId, aiResult.resume_skills]
                );
            }
        }

        await client.query('COMMIT');

        // ── Return structured response
        return {
            resume,
            analysis: aiResult
                ? {
                    ats_score: aiResult.ats_score,
                    match_score: aiResult.job_match_score,
                    missing_skills: aiResult.missing_skills,
                    skills: aiResult.resume_skills,
                    courses: aiResult.courses,
                    projects: aiResult.projects
                }
                : null
        };

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;                  // bubble up to catchAsync → global handler
    } finally {
        client.release();           // always return connection to pool
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

    return {
        resume,
        ats: ats.rows[0] ?? null,
        skill_gap: gaps.rows[0] ?? null,
        skills: skills.rows.map(s => s.name)
    };
};


// ─────────────────────────────────────────────
// 3. SCORE (re-score with a new JD)
// ─────────────────────────────────────────────
export const scoreResumeService = async (resumeId, userId, jdText) => {
    const resume = await resolveResume(resumeId, userId);       // ← shared helper
    const resolvedId = resume.id;

    const jdHash = crypto.createHash('sha256').update(jdText.trim()).digest('hex');

    // Return cached score for identical JD
    const existing = await query(
        `SELECT * FROM ats_scores
         WHERE resume_id = $1 AND jd_hash = $2
         ORDER BY scored_at DESC LIMIT 1`,
        [resolvedId, jdHash]
    );
    if (existing.rows.length) return existing.rows[0];

    // Call AI
    let aiResult;
    try {
        aiResult = await analyzeResume(resume.raw_text, jdText);
    } catch (err) {
        console.error('[SCORE AI ERROR]', err.message);
        throw errors.internal('AI service unavailable');
    }

    const mapped = mapAIToATS(aiResult);

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
            aiResult.target_role ?? null,
            jdHash
        ]
    );

    return result.rows[0];
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
        // Serve through a protected endpoint, not a raw disk path
        fileUrl: `/api/resumes/${r.id}/file`
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

    // Delete file from disk (non-fatal if already gone)
    if (resume.file_path) {
        await fs.unlink(resume.file_path).catch(err =>
            console.warn('[FILE DELETE WARN]', err.message)
        );
    }

    // Cascades to ats_scores, skill_gaps, user_skills via FK ON DELETE CASCADE
    await query(`DELETE FROM resumes WHERE id = $1`, [resumeId]);
};