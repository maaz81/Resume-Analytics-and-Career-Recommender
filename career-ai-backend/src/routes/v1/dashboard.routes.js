// ============================================
// routes/dashboard.routes.js
// ============================================

import express from 'express';
import * as dashboardController from '../../controllers/dashboard.controller.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(protect);

// Get complete dashboard
router.get('/', dashboardController.getDashboard);

// Get resume health summary
router.get('/resume-health', dashboardController.getResumeHealth);

// Refresh dashboard
router.post('/refresh', dashboardController.refreshDashboard);

export default router;