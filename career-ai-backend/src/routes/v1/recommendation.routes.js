// ============================================
// routes/v1/recommendation.routes.js
// ============================================
import express from 'express';
import { protect } from '../../middleware/auth.js';
import * as recommendationController from '../../controllers/recommendation.controller.js';

const router = express.Router();

// All recommendation endpoints require authentication
router.use(protect);

// Individual section endpoints
router.get('/courses', recommendationController.getCourses);
router.get('/projects', recommendationController.getProjects);
router.get('/roadmap', recommendationController.getRoadmap);
router.get('/jobs', recommendationController.getJobs);

// All-in-one bundle
router.get('/', recommendationController.getAll);

export default router;
