import Resume from '../models/Resume.js';
import AtsScore from '../models/AtsScore.js';
import { calculateATSScore } from '../services/ai.service.js';
import { successResponse } from '../utils/response.js';
import { errors, catchAsync } from '../middleware/errorHandler.js';
import { cache, cacheKeys } from '../config/redis.js';

/**
 * Score a resume
 * POST /api/v1/ats/score/:resumeId
 */
export const scoreResume = catchAsync(async (req, res) => {
    const resume = await Resume.findById(req.params.resumeId);

    if (!resume) {
        throw errors.notFound('Resume not found');
    }

    if (resume.user_id !== req.user.id) {
        throw errors.forbidden('Access denied');
    }

    // Ensure we have text to analyze
    const textToAnalyze = resume.raw_text || (resume.parsed_data ? JSON.stringify(resume.parsed_data) : null);
    
    if (!textToAnalyze) {
        throw errors.badRequest('Resume parsing not complete. Please wait for parsing to finish.');
    }

    // Call AI service
    const scoreData = await calculateATSScore(
        textToAnalyze,
        req.user.target_role || 'Software Engineer'
    );

    // Save score using Model
    const score = await AtsScore.create({
        resumeId: resume.id,
        userId: req.user.id,
        ...scoreData,
        targetRole: req.user.target_role,
        modelVersion: scoreData.modelVersion || 'v1.0'
    });

    // Invalidate caches
    await cache.del(cacheKeys.dashboard(req.user.id));

    return successResponse(res, { score }, 'ATS score calculated successfully');
});

/**
 * Get latest score for resume
 * GET /api/v1/ats/score/:resumeId
 */
export const getLatestScore = catchAsync(async (req, res) => {
    const score = await AtsScore.findLatestByResumeId(req.params.resumeId, req.user.id);

    if (!score) {
        throw errors.notFound('No score found for this resume');
    }

    return successResponse(res, { score }, 'Score retrieved successfully');
});