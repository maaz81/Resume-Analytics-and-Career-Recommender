// ============================================
// routes/resume.routes.js
// ============================================

import express from 'express';
import * as controller from '../../controllers/resume.controller.js';
import { protect } from '../../middleware/auth.js';
import { upload } from '../../utils/fileUpload.js';

const router = express.Router();

router.use(protect);

// upload
router.post('/upload', upload.single('resume'), controller.uploadResume);

// history
router.get('/history', controller.getResumeHistory);

// analysis
router.get('/:id/analysis', controller.getResumeAnalysis);

// score
router.post('/:id/score', controller.scoreResume);

// delete
router.delete('/:id', controller.deleteResumeController);

export default router;