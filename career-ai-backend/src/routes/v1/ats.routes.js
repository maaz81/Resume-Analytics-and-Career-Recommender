// ============================================
// routes/ats.routes.js
// ============================================
import express from 'express';
import { protect } from '../../middleware/auth.js';
import * as atsController from '../../controllers/ats.controller.js';
import { aiLimiter } from '../../middleware/rateLimiter.js';

const router = express.Router();
router.use(protect);

/**
 * Score a resume
 * POST /api/v1/ats/score/:resumeId
 */
router.post('/score/:resumeId', aiLimiter, atsController.scoreResume);

/**
 * Get latest score for resume
 */
router.get('/score/:resumeId', atsController.getLatestScore);

export default router;
