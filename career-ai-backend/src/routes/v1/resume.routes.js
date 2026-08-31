// ============================================
// routes/resume.routes.js
// ============================================

import express from 'express';

import * as controller from '../../controllers/resume.controller.js';

import { protect } from '../../middleware/auth.js';

import { upload } from '../../utils/fileUpload.js';

const router = express.Router();

router.use(protect);

// ============================================
// Upload Resume
// ============================================

/**
 * @swagger
 * /api/v1/resumes/upload:
 *   post:
 *     summary: Upload a resume
 *     description: Uploads a resume file for the authenticated user.
 *     tags:
 *       - Resume
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - resume
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: Resume file to upload
 *     responses:
 *       201:
 *         description: Resume uploaded successfully
 *       400:
 *         description: Invalid file or request
 *       401:
 *         description: Authentication required
 */
router.post(
    '/upload',
    upload.single('resume'),
    controller.uploadResume
);

// ============================================
// Resume History
// ============================================

/**
 * @swagger
 * /api/v1/resumes/history:
 *   get:
 *     summary: Get resume history
 *     description: Returns the authenticated user's uploaded resume history.
 *     tags:
 *       - Resume
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resume history retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/history', controller.getResumeHistory);

// ============================================
// Resume Analysis
// ============================================

/**
 * @swagger
 * /api/v1/resumes/{id}/analysis:
 *   get:
 *     summary: Get resume analysis
 *     description: Returns analysis results for a specific resume.
 *     tags:
 *       - Resume
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resume ID
 *         example: 123
 *     responses:
 *       200:
 *         description: Resume analysis retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Resume or analysis not found
 */
router.get('/:id/analysis', controller.getResumeAnalysis);

// ============================================
// Resume Score
// ============================================

/**
 * @swagger
 * /api/v1/resumes/{id}/score:
 *   post:
 *     summary: Score a resume
 *     description: Calculates or generates a score for a specific resume.
 *     tags:
 *       - Resume
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resume ID
 *         example: 123
 *     responses:
 *       200:
 *         description: Resume scored successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Resume not found
 */
router.post('/:id/score', controller.scoreResume);

// ============================================
// Serve Resume File
// ============================================

/**
 * @swagger
 * /api/v1/resumes/{id}/file:
 *   get:
 *     summary: View or download resume file
 *     description: Serves the uploaded resume file for the authenticated user.
 *     tags:
 *       - Resume
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resume ID
 *         example: 123
 *     responses:
 *       200:
 *         description: Resume file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Resume file not found
 */
router.get('/:id/file', controller.serveResumeFile);

// ============================================
// Delete Resume
// ============================================

/**
 * @swagger
 * /api/v1/resumes/{id}:
 *   delete:
 *     summary: Delete a resume
 *     description: Deletes a specific resume belonging to the authenticated user.
 *     tags:
 *       - Resume
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resume ID
 *         example: 123
 *     responses:
 *       200:
 *         description: Resume deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Resume not found
 */
router.delete('/:id', controller.deleteResumeController);

export default router;