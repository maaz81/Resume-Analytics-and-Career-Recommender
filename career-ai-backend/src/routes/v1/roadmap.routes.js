// ============================================
// routes/roadmap.routes.js
// ============================================

import express from 'express';

import { protect } from '../../middleware/auth.js';

import { successResponse } from '../../utils/response.js';

import { catchAsync } from '../../middleware/errorHandler.js';

const router = express.Router();

router.use(protect);

// ============================================
// Get Roadmaps
// ============================================

/**
 * @swagger
 * /api/v1/roadmaps:
 *   get:
 *     summary: Get career roadmaps
 *     description: Returns career roadmaps for the authenticated user. Currently a placeholder endpoint.
 *     tags:
 *       - Roadmap
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roadmap data retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get(
    '/',
    catchAsync(async (req, res) => {
        return successResponse(
            res,
            { roadmaps: [] },
            'Roadmap endpoint - Coming soon'
        );
    })
);

// ============================================
// Generate Roadmap
// ============================================

/**
 * @swagger
 * /api/v1/roadmaps/generate:
 *   post:
 *     summary: Generate career roadmap
 *     description: Generates a personalized career roadmap. Currently a placeholder endpoint.
 *     tags:
 *       - Roadmap
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roadmap generation request processed
 *       401:
 *         description: Authentication required
 */
router.post(
    '/generate',
    catchAsync(async (req, res) => {
        return successResponse(
            res,
            { roadmap: {} },
            'Roadmap generation - Coming soon'
        );
    })
);

export default router;