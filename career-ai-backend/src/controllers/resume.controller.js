// ============================================
// controllers/resume.controller.js
// ============================================

import fs from 'fs';
import Resume from '../models/Resume.js';
import { query } from '../config/db.js';
import { cache, cacheKeys } from '../config/redis.js';

import {
    getResumeAnalysisService,
    scoreResumeService,
    getResumeHistoryService,
    deleteResumeService,
} from '../services/resume.service.js';

import { successResponse, createdResponse } from '../utils/response.js';
import { errors, catchAsync } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

// ─────────────────────────────────────────────────────────────────────────────
// PROCESSING MODE
//
//   RESUME_PROCESSING_MODE=direct  (production / no separate worker)
//     → parse PDF + call AI synchronously inside the upload request.
//       The upload waits for the full pipeline; the client gets back
//       parsing_status = 'completed' in the 201 response.
//
//   RESUME_PROCESSING_MODE=queue   (default / development)
//     → enqueue a BullMQ job; worker picks it up asynchronously.
//       The client gets back parsing_status = 'pending' and must poll
//       GET /api/v1/resumes/:id/status until status === 'completed'.
// ─────────────────────────────────────────────────────────────────────────────
const DIRECT_MODE = process.env.RESUME_PROCESSING_MODE === 'direct';


// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD RESUME
// ─────────────────────────────────────────────────────────────────────────────
export const uploadResume = catchAsync(async (req, res) => {
    if (!req.file) throw errors.badRequest('No file uploaded');

    const userId = req.user.id;

    try {
        // 1. Deactivate previous resumes
        await query(
            `UPDATE resumes SET is_active = false WHERE user_id = $1`,
            [userId]
        );

        // 2. Calculate next version
        const versionResult = await query(
            `SELECT COALESCE(MAX(version), 0) + 1 AS next_version
             FROM resumes WHERE user_id = $1`,
            [userId]
        );
        const nextVersion = versionResult.rows[0].next_version;

        // 3. Insert resume row (status = pending)
        const resumeResult = await query(
            `INSERT INTO resumes (
                user_id, version, original_filename, file_path,
                file_size, mime_type, parsing_status, is_active
             )
             VALUES ($1,$2,$3,$4,$5,$6,'pending',true)
             RETURNING *`,
            [
                userId, nextVersion,
                req.file.originalname, req.file.path,
                req.file.size, req.file.mimetype,
            ]
        );
        const resume = resumeResult.rows[0];

        // 4. Invalidate caches — dashboard shows "pending" immediately
        await cache.del(cacheKeys.dashboard(userId));
        await cache.del(cacheKeys.userContext(userId));
        await cache.del(cacheKeys.resumeActive(userId));

        if (DIRECT_MODE) {
            // ── DIRECT PATH (production) ─────────────────────────────────
            // Lazy-import to avoid loading pdf-parse in queue mode
            const { processResumeDirect } = await import('../services/resumeProcessing.service.js');

            await processResumeDirect({
                resumeId: resume.id,
                userId,
                filePath: req.file.path,
                jdText: req.body.jdText || null,
            });

            logger.info('Resume processed synchronously (direct mode)', {
                resumeId: resume.id, userId,
            });

            return createdResponse(
                res,
                { resumeId: resume.id, status: 'completed' },
                'Resume uploaded and processed successfully'
            );

        } else {
            // ── QUEUE PATH (development / separate worker) ───────────────
            const { addResumeProcessingJob } = await import('../queues/resume.queue.js');

            const job = await addResumeProcessingJob({
                resumeId: resume.id,
                userId,
                filePath: req.file.path,
                jdText: req.body.jdText || null,
            });

            logger.info('Resume processing job queued', {
                resumeId: resume.id, userId, jobId: job.id,
            });

            return createdResponse(
                res,
                { resumeId: resume.id, jobId: job.id, status: 'pending' },
                'Resume uploaded and processing started'
            );
        }

    } catch (error) {
        // Clean up uploaded file on any failure
        await fs.promises.unlink(req.file.path).catch(() => {});
        throw error;
    }
});


// ─────────────────────────────────────────────────────────────────────────────
// GET RESUME STATUS  — lightweight polling used by the frontend onboarding
// ─────────────────────────────────────────────────────────────────────────────
export const getResumeStatus = catchAsync(async (req, res) => {
    const resumeId = req.params.id;
    const userId   = req.user.id;

    let row;
    if (resumeId === 'latest') {
        const result = await query(
            `SELECT id, parsing_status, parsing_error
             FROM resumes
             WHERE user_id = $1 AND is_active = true
             ORDER BY uploaded_at DESC LIMIT 1`,
            [userId]
        );
        row = result.rows[0];
    } else {
        const result = await query(
            `SELECT id, parsing_status, parsing_error
             FROM resumes
             WHERE id = $1 AND user_id = $2`,
            [resumeId, userId]
        );
        row = result.rows[0];
    }

    if (!row) throw errors.notFound('Resume not found');

    return successResponse(res, {
        resumeId:     row.id,
        status:       row.parsing_status,    // pending | processing | completed | failed
        parsingError: row.parsing_error ?? null,
        // Tell the frontend whether it needs to poll or can proceed immediately
        mode:         DIRECT_MODE ? 'direct' : 'queue',
    });
});


// ─────────────────────────────────────────────────────────────────────────────
// GET RESUME ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────
export const getResumeAnalysis = catchAsync(async (req, res) => {
    const data = await getResumeAnalysisService(req.params.id, req.user.id);
    return successResponse(res, data);
});


// ─────────────────────────────────────────────────────────────────────────────
// SCORE RESUME
// Body: { jdText: string, isAuto?: boolean }
//   isAuto = false → jdText is a full job description pasted by the user
//   isAuto = true  → jdText is a role title; backend calls LLM to generate JD
// ─────────────────────────────────────────────────────────────────────────────
export const scoreResume = catchAsync(async (req, res) => {
    const { jdText, isAuto = false } = req.body;

    if (!jdText?.trim()) {
        throw errors.badRequest('Job description (or target role title) required');
    }

    const data = await scoreResumeService(
        req.params.id,
        req.user.id,
        jdText,
        Boolean(isAuto)
    );

    return successResponse(res, {
        score:        data.score,
        generatedJD:  data.generatedJD ?? undefined,
    });
});


// ─────────────────────────────────────────────────────────────────────────────
// GET RESUME HISTORY
// ─────────────────────────────────────────────────────────────────────────────
export const getResumeHistory = catchAsync(async (req, res) => {
    const data = await getResumeHistoryService(req.user.id);
    return successResponse(res, { resumes: data });
});


// ─────────────────────────────────────────────────────────────────────────────
// SERVE RESUME FILE
// ─────────────────────────────────────────────────────────────────────────────
export const serveResumeFile = catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId  = req.user.id;

    const { default: ResumeModel } = await import('../models/Resume.js');
    const resume = await ResumeModel.findById(id);

    if (!resume)                  throw errors.notFound('Resume not found');
    if (resume.user_id !== userId) throw errors.forbidden('Unauthorized');
    if (!resume.file_path)        throw errors.notFound('File not available');

    try {
        await fs.promises.access(resume.file_path, fs.constants.R_OK);
    } catch {
        throw errors.notFound('File no longer exists on disk');
    }

    const isDownload = req.query.download === 'true';
    res.setHeader('Content-Type', resume.mime_type || 'application/pdf');
    res.setHeader(
        'Content-Disposition',
        isDownload
            ? `attachment; filename="${resume.original_filename}"`
            : `inline; filename="${resume.original_filename}"`
    );

    fs.createReadStream(resume.file_path).pipe(res);
});


// ─────────────────────────────────────────────────────────────────────────────
// DELETE RESUME
// ─────────────────────────────────────────────────────────────────────────────
export const deleteResumeController = catchAsync(async (req, res) => {
    await deleteResumeService(req.params.id, req.user.id);
    return successResponse(res, null, 'Resume deleted successfully');
});
