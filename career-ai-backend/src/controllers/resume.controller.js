// ============================================
// controllers/resume.controller.js
// ============================================

import Resume from '../models/Resume.js';
import { successResponse, createdResponse } from '../utils/response.js';
import { errors, catchAsync } from '../middleware/errorHandler.js';
import { cache, cacheKeys } from '../config/redis.js';
import { callAIService } from '../services/ai.service.js';
import logger from '../config/logger.js';
import { query } from '../config/db.js';
import { deleteFile } from '../utils/fileUpload.js';
import { analyzeResume } from '../services/chatbot.service.js';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

/**
 * Upload new resume
 * POST /api/v1/resumes/upload
 */
export const uploadResume = catchAsync(async (req, res) => {
    if (!req.file) {
        throw errors.badRequest('No file uploaded');
    }

    // Extract PDF text
    const buffer = fs.readFileSync(req.file.path);
    const pdfData = await pdf(buffer);
    const rawText = pdfData.text;

    // Create resume record (make sure Resume.create supports rawText)
    const resume = await Resume.create({
        userId: req.user.id,
        originalFilename: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        rawText
    });

    // Log audit
    await query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        [
            req.user.id,
            'resume.uploaded',
            'resume',
            resume.id,
            JSON.stringify({ filename: req.file.originalname })
        ]
    );

    logger.info('Resume uploaded', {
        userId: req.user.id,
        resumeId: resume.id
    });

    return createdResponse(
        res,
        { resume },
        'Resume uploaded successfully'
    );
});

/**
 * Get all resumes for current user
 * GET /api/v1/resumes
 */
export const getMyResumes = catchAsync(async (req, res) => {
    const resumes = await Resume.findAllByUserId(req.user.id);

    return successResponse(res, { resumes, count: resumes.length }, 'Resumes retrieved successfully');
});

/**
 * Get active resume
 * GET /api/v1/resumes/active
 */
export const getActiveResume = catchAsync(async (req, res) => {
    // Check cache first
    const cacheKey = cacheKeys.resumeActive(req.user.id);
    let resume = await cache.get(cacheKey);

    if (!resume) {
        resume = await Resume.findActiveByUserId(req.user.id);

        if (resume) {
            // Cache for 1 hour
            await cache.set(cacheKey, resume, 3600);
        }
    }

    if (!resume) {
        throw errors.notFound('No active resume found. Please upload a resume.');
    }

    return successResponse(res, { resume }, 'Active resume retrieved successfully');
});

/**
 * Get resume by ID
 * GET /api/v1/resumes/:id
 */
export const getResumeById = catchAsync(async (req, res) => {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
        throw errors.notFound('Resume not found');
    }

    // Check ownership
    if (resume.user_id !== req.user.id) {
        throw errors.forbidden('You do not have permission to access this resume');
    }

    // Get with latest ATS score
    const resumeWithScore = await Resume.findWithLatestScore(resume.id);

    return successResponse(res, { resume: resumeWithScore }, 'Resume retrieved successfully');
});

/**
 * Set resume as active
 * PATCH /api/v1/resumes/:id/activate
 */
export const setActiveResume = catchAsync(async (req, res) => {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
        throw errors.notFound('Resume not found');
    }

    // Check ownership
    if (resume.user_id !== req.user.id) {
        throw errors.forbidden('You do not have permission to modify this resume');
    }

    // Check if parsing is complete
    if (resume.parsing_status !== 'completed') {
        throw errors.badRequest('Cannot activate resume. Parsing is not complete.');
    }

    // Set as active
    const updatedResume = await Resume.setActive(resume.id, req.user.id);

    // Invalidate cache
    await cache.del(cacheKeys.resumeActive(req.user.id));
    await cache.del(cacheKeys.userContext(req.user.id));
    await cache.del(cacheKeys.dashboard(req.user.id));

    logger.info('Resume activated', { userId: req.user.id, resumeId: resume.id });

    return successResponse(res, { resume: updatedResume }, 'Resume set as active successfully');
});

/**
 * Delete resume
 * DELETE /api/v1/resumes/:id
 */
export const deleteResume = catchAsync(async (req, res) => {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
        throw errors.notFound('Resume not found');
    }

    // Check ownership
    if (resume.user_id !== req.user.id) {
        throw errors.forbidden('You do not have permission to delete this resume');
    }

    // Don't allow deleting active resume if it's the only one
    if (resume.is_active) {
        const allResumes = await Resume.findAllByUserId(req.user.id);
        if (allResumes.length === 1) {
            throw errors.badRequest('Cannot delete your only resume. Upload a new one first.');
        }
    }

    // Delete file from disk
    deleteFile(resume.file_path);

    // Delete from database (cascade will handle related records)
    await Resume.delete(resume.id);

    // Invalidate caches
    await cache.del(cacheKeys.resumeActive(req.user.id));
    await cache.del(cacheKeys.userContext(req.user.id));

    logger.info('Resume deleted', { userId: req.user.id, resumeId: resume.id });

    return successResponse(res, null, 'Resume deleted successfully');
});

/**
 * Get resume parsing status
 * GET /api/v1/resumes/:id/status
 */
export const getParsingStatus = catchAsync(async (req, res) => {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
        throw errors.notFound('Resume not found');
    }

    // Check ownership
    if (resume.user_id !== req.user.id) {
        throw errors.forbidden('You do not have permission to access this resume');
    }

    return successResponse(res, {
        status: resume.parsing_status,
        parsedAt: resume.parsed_at,
        error: resume.parsing_error,
    }, 'Parsing status retrieved successfully');
});




export const scoreResume = catchAsync(async (req, res) => {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
        throw errors.notFound('Resume not found');
    }

    if (resume.user_id !== req.user.id) {
        throw errors.forbidden('Unauthorized');
    }

    const jdText = req.body.jdText;

    if (!jdText) {
        throw errors.badRequest('Job description required');
    }

    const aiResult = await analyzeResume(resume.raw_text, jdText);

    await query(
        `INSERT INTO ats_scores 
         (resume_id, user_id, overall_score, keyword_score, missing_keywords)
         VALUES ($1,$2,$3,$4,$5)`,
        [
            resume.id,
            req.user.id,
            aiResult.job_match_score,
            aiResult.ats_score,
            JSON.stringify(aiResult.missing_skills)
        ]
    );

    return successResponse(res, { analysis: aiResult }, 'Resume analyzed successfully');
});