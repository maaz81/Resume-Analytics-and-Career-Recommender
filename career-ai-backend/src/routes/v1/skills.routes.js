// ============================================
// routes/skills.routes.js - COMPLETE
// ============================================

import express from 'express';

import { body } from 'express-validator';

import * as skillsController from '../../controllers/skills.controller.js';

import { protect } from '../../middleware/auth.js';

import { aiLimiter } from '../../middleware/rateLimiter.js';

import { validate } from '../../middleware/validator.js';

const router = express.Router();

router.use(protect);

// ============================================
// Get User Skills
// ============================================

/**
 * @swagger
 * /api/v1/skills:
 *   get:
 *     summary: Get user's skills
 *     description: Returns all skills associated with the authenticated user.
 *     tags:
 *       - Skills
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User skills retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/', skillsController.getUserSkills);

// ============================================
// Search Skills
// ============================================

/**
 * @swagger
 * /api/v1/skills/search:
 *   get:
 *     summary: Search skills
 *     description: Searches available skills.
 *     tags:
 *       - Skills
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Skill search query
 *         example: JavaScript
 *     responses:
 *       200:
 *         description: Skills retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/search', skillsController.searchSkills);

// ============================================
// Extract Skills From Resume
// ============================================

/**
 * @swagger
 * /api/v1/skills/extract:
 *   post:
 *     summary: Extract skills from resume
 *     description: Uses AI to extract skills from a user's resume.
 *     tags:
 *       - Skills
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resumeId
 *             properties:
 *               resumeId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: Skills extracted successfully
 *       400:
 *         description: Invalid resume ID
 *       401:
 *         description: Authentication required
 *       429:
 *         description: AI rate limit exceeded
 */
router.post(
  '/extract',
  aiLimiter,
  body('resumeId')
    .isUUID()
    .withMessage('Valid resume ID required'),
  validate,
  skillsController.extractSkills
);

// ============================================
// Skill Gap Analysis
// ============================================

/**
 * @swagger
 * /api/v1/skills/analyze:
 *   post:
 *     summary: Analyze skill gap
 *     description: Performs an AI-powered skill gap analysis.
 *     tags:
 *       - Skills
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Skill gap analysis completed successfully
 *       401:
 *         description: Authentication required
 *       429:
 *         description: AI rate limit exceeded
 */
router.post(
  '/analyze',
  aiLimiter,
  skillsController.analyzeSkillGap
);

// ============================================
// Latest Skill Gap
// ============================================

/**
 * @swagger
 * /api/v1/skills/gap:
 *   get:
 *     summary: Get latest skill gap analysis
 *     description: Returns the user's latest skill gap analysis.
 *     tags:
 *       - Skills
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Latest skill gap retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Skill gap analysis not found
 */
router.get('/gap', skillsController.getLatestSkillGap);

// ============================================
// Skill Gap History
// ============================================

/**
 * @swagger
 * /api/v1/skills/gap/history:
 *   get:
 *     summary: Get skill gap history
 *     description: Returns previous skill gap analyses for the authenticated user.
 *     tags:
 *       - Skills
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Skill gap history retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get(
  '/gap/history',
  skillsController.getSkillGapHistory
);

// ============================================
// Add Skill
// ============================================

/**
 * @swagger
 * /api/v1/skills/add:
 *   post:
 *     summary: Add a skill manually
 *     description: Adds a skill to the authenticated user's skill profile.
 *     tags:
 *       - Skills
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - skillName
 *             properties:
 *               skillName:
 *                 type: string
 *                 example: Node.js
 *               proficiency:
 *                 type: string
 *                 enum:
 *                   - beginner
 *                   - intermediate
 *                   - advanced
 *                   - expert
 *                 example: advanced
 *     responses:
 *       201:
 *         description: Skill added successfully
 *       400:
 *         description: Invalid skill data
 *       401:
 *         description: Authentication required
 */
router.post(
  '/add',
  body('skillName')
    .trim()
    .notEmpty()
    .withMessage('Skill name is required'),
  body('proficiency')
    .optional()
    .isIn([
      'beginner',
      'intermediate',
      'advanced',
      'expert',
    ])
    .withMessage('Invalid proficiency level'),
  validate,
  skillsController.addSkill
);

export default router;