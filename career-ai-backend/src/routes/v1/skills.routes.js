// ============================================
// routes/skills.routes.js - COMPLETE
// ============================================
import express from 'express';
import { body } from 'express-validator';
import * as skillsController from '../controllers/skills.controller.js';
import { protect } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();
router.use(protect);

// Get user's skills
router.get('/', skillsController.getUserSkills);

// Search skills
router.get('/search', skillsController.searchSkills);

// Extract skills from resume
router.post(
  '/extract',
  aiLimiter,
  body('resumeId').isUUID().withMessage('Valid resume ID required'),
  validate,
  skillsController.extractSkills
);

// Perform skill gap analysis
router.post('/analyze', aiLimiter, skillsController.analyzeSkillGap);

// Get latest skill gap
router.get('/gap', skillsController.getLatestSkillGap);

// Get skill gap history
router.get('/gap/history', skillsController.getSkillGapHistory);

// Add skill manually
router.post(
  '/add',
  body('skillName').trim().notEmpty().withMessage('Skill name is required'),
  body('proficiency')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid proficiency level'),
  validate,
  skillsController.addSkill
);

export default router;