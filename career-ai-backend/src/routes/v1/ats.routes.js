// ============================================
// routes/ats.routes.js
// ============================================

import express from 'express';
import { protect } from '../../middleware/auth.js';
import * as atsController from '../../controllers/ats.controller.js';
import { aiLimiter } from '../../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect);

// ============================================
// Score Resume
// ============================================

/**
 * @swagger
 * /api/v1/ats/score/{resumeId}:
 *   post:
 *     summary: Analyze resume with ATS
 *     description: Analyzes a resume and generates an ATS compatibility score.
 *     tags:
 *       - ATS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the resume to analyze
 *         example: 123
 *     responses:
 *       200:
 *         description: ATS analysis completed successfully
 *       400:
 *         description: Invalid resume ID or request
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Resume not found
 *       429:
 *         description: Too many ATS analysis requests
 */
router.post(
    '/score/:resumeId',
    aiLimiter,
    atsController.scoreResume
);

// ============================================
// Get Latest ATS Score
// ============================================

/**
 * @swagger
 * /api/v1/ats/score/{resumeId}:
 *   get:
 *     summary: Get latest ATS score
 *     description: Returns the latest ATS score and analysis for a resume.
 *     tags:
 *       - ATS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the resume
 *         example: 123
 *     responses:
 *       200:
 *         description: Latest ATS score retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Resume or ATS score not found
 */
router.get(
    '/score/:resumeId',
    atsController.getLatestScore
);

export default router;