// ============================================
// routes/v1/recommendation.routes.js
// ============================================

import express from 'express';

import { protect } from '../../middleware/auth.js';

import * as recommendationController from '../../controllers/recommendation.controller.js';

const router = express.Router();

// All recommendation endpoints require authentication
router.use(protect);

// ============================================
// Course Recommendations
// ============================================

/**
 * @swagger
 * /api/v1/recommendations/courses:
 *   get:
 *     summary: Get course recommendations
 *     description: Returns personalized course recommendations for the authenticated user.
 *     tags:
 *       - Recommendations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Course recommendations retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/courses', recommendationController.getCourses);

// ============================================
// Project Recommendations
// ============================================

/**
 * @swagger
 * /api/v1/recommendations/projects:
 *   get:
 *     summary: Get project recommendations
 *     description: Returns personalized project recommendations for the authenticated user.
 *     tags:
 *       - Recommendations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Project recommendations retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/projects', recommendationController.getProjects);

// ============================================
// Roadmap Recommendations
// ============================================

/**
 * @swagger
 * /api/v1/recommendations/roadmap:
 *   get:
 *     summary: Get roadmap recommendations
 *     description: Returns personalized roadmap recommendations for the authenticated user.
 *     tags:
 *       - Recommendations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roadmap recommendations retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/roadmap', recommendationController.getRoadmap);

// ============================================
// Job Recommendations
// ============================================

/**
 * @swagger
 * /api/v1/recommendations/jobs:
 *   get:
 *     summary: Get job recommendations
 *     description: Returns personalized job recommendations for the authenticated user.
 *     tags:
 *       - Recommendations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Job recommendations retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/jobs', recommendationController.getJobs);

// ============================================
// All Recommendations
// ============================================

/**
 * @swagger
 * /api/v1/recommendations:
 *   get:
 *     summary: Get all recommendations
 *     description: Returns a bundle of personalized recommendations including courses, projects, roadmap and jobs.
 *     tags:
 *       - Recommendations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All recommendations retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/', recommendationController.getAll);

export default router;