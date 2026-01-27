// ============================================
// routes/ats.routes.js
// ============================================
import express from 'express';
import { protect } from '../../middleware/auth.js';
import { successResponse } from '../../utils/response.js';
import { catchAsync, errors } from '../../middleware/errorHandler.js';
import { aiLimiter } from '../../middleware/rateLimiter.js';
import Resume from '../../models/Resume.js';
import { calculateATSScore } from '../../services/ai.service.js';
import { query } from '../../config/db.js';
import { cache, cacheKeys } from '../../config/redis.js';

const router = express.Router();
router.use(protect);

/**
 * Score a resume
 * POST /api/v1/ats/score/:resumeId
 */
router.post('/score/:resumeId', aiLimiter, catchAsync(async (req, res) => {
    const resume = await Resume.findById(req.params.resumeId);

    if (!resume) {
        throw errors.notFound('Resume not found');
    }

    if (resume.user_id !== req.user.id) {
        throw errors.forbidden('Access denied');
    }

    if (!resume.raw_text) {
        throw errors.badRequest('Resume parsing not complete');
    }

    // Call AI service
    const scoreData = await calculateATSScore(
        resume.raw_text,
        req.user.target_role || 'Software Engineer'
    );

    // Save score to database
    const result = await query(
        `INSERT INTO ats_scores (
      resume_id, user_id, overall_score, formatting_score,
      keyword_score, experience_score, issues, missing_keywords,
      weak_action_verbs, target_role, ai_model_version
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
        [
            resume.id,
            req.user.id,
            scoreData.overallScore,
            scoreData.formattingScore,
            scoreData.keywordScore,
            scoreData.experienceScore,
            JSON.stringify(scoreData.issues),
            scoreData.missingKeywords,
            scoreData.weakActionVerbs,
            req.user.target_role,
            scoreData.modelVersion || 'v1.0',
        ]
    );

    // Invalidate caches
    await cache.del(cacheKeys.dashboard(req.user.id));

    return successResponse(res, { score: result.rows[0] }, 'ATS score calculated successfully');
}));

/**
 * Get latest score for resume
 */
router.get('/score/:resumeId', catchAsync(async (req, res) => {
    const result = await query(
        `SELECT * FROM ats_scores 
     WHERE resume_id = $1 AND user_id = $2 
     ORDER BY scored_at DESC LIMIT 1`,
        [req.params.resumeId, req.user.id]
    );

    if (result.rows.length === 0) {
        throw errors.notFound('No score found for this resume');
    }

    return successResponse(res, { score: result.rows[0] }, 'Score retrieved successfully');
}));

export default router;
