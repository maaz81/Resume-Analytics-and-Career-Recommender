// ============================================
// routes/resume.routes.js
// ============================================

import express from 'express';
import * as resumeController from '../../controllers/resume.controller.js';
import { protect } from '../../middleware/auth.js';
import { uploadLimiter } from '../../middleware/rateLimiter.js';
import { upload } from '../../utils/fileUpload.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Upload resume
router.post(
    '/upload',
    uploadLimiter,
    upload.single('resume'),
    resumeController.uploadResume
);

// Get all user resumes
router.get('/', resumeController.getMyResumes);

// Get active resume
router.get('/active', resumeController.getActiveResume);

// Get current resume
router.get('/current', resumeController.getCurrentResume);

// Get resume history
router.get("/history", resumeController.getResumeHistory);

// Get specific resume
router.get('/:id', resumeController.getResumeById);

// Set resume as active
router.patch('/:id/activate', resumeController.setActiveResume);

// Get parsing status
router.get('/:id/status', resumeController.getParsingStatus);

// Delete resume
router.delete('/:id', resumeController.deleteResume);

router.post('/:id/score', resumeController.scoreResume);

export default router;