// ============================================
// routes/dashboard.routes.js
// ============================================

import express from 'express';

import * as dashboardController from '../../controllers/dashboard.controller.js';

import { protect } from '../../middleware/auth.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(protect);

// ============================================
// Complete Dashboard
// ============================================

/**
 * @swagger
 * /api/v1/dashboard:
 *   get:
 *     summary: Get complete dashboard
 *     description: Returns the complete dashboard data for the authenticated user.
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/', dashboardController.getDashboard);

// ============================================
// Resume Health
// ============================================

/**
 * @swagger
 * /api/v1/dashboard/resume-health:
 *   get:
 *     summary: Get resume health summary
 *     description: Returns a summary of the user's resume health and related metrics.
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resume health retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get(
    '/resume-health',
    dashboardController.getResumeHealth
);

// ============================================
// Refresh Dashboard
// ============================================

/**
 * @swagger
 * /api/v1/dashboard/refresh:
 *   post:
 *     summary: Refresh dashboard
 *     description: Refreshes or recalculates the authenticated user's dashboard data.
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard refreshed successfully
 *       401:
 *         description: Authentication required
 */
router.post(
    '/refresh',
    dashboardController.refreshDashboard
);

export default router;