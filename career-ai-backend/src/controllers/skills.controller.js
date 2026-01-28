// ============================================
// controllers/skills.controller.js
// ============================================

import Skill from '../models/Skill.js';
import SkillsService from '../services/skill.service.js';
import { successResponse, createdResponse } from '../utils/response.js';
import { catchAsync, errors } from '../middleware/errorHandler.js';
import { cache, cacheKeys } from '../config/redis.js';
import logger from '../config/logger.js';

/**
 * Get user's skills
 * GET /api/v1/skills
 */
export const getUserSkills = catchAsync(async (req, res) => {
  const skills = await Skill.getUserSkills(req.user.id);

  return successResponse(
    res,
    {
      skills,
      count: skills.length,
    },
    'Skills retrieved successfully'
  );
});

/**
 * Extract skills from active resume
 * POST /api/v1/skills/extract
 */
export const extractSkills = catchAsync(async (req, res) => {
  const { resumeId } = req.body;

  if (!resumeId) {
    throw errors.badRequest('Resume ID is required');
  }

  const skills = await SkillsService.extractSkillsFromResume(resumeId, req.user.id);

  // Invalidate caches
  await cache.del(cacheKeys.userContext(req.user.id));
  await cache.del(cacheKeys.dashboard(req.user.id));

  return createdResponse(
    res,
    {
      skills,
      count: skills.length,
    },
    'Skills extracted successfully'
  );
});

/**
 * Perform skill gap analysis
 * POST /api/v1/skills/analyze
 */
export const analyzeSkillGap = catchAsync(async (req, res) => {
  const skillGap = await SkillsService.performSkillGapAnalysis(req.user.id);

  // Invalidate caches
  await cache.del(cacheKeys.skillGap(req.user.id));
  await cache.del(cacheKeys.dashboard(req.user.id));

  logger.info('Skill gap analysis completed', {
    userId: req.user.id,
    gapScore: skillGap.gap_score,
  });

  return createdResponse(res, { analysis: skillGap }, 'Skill gap analysis completed');
});

/**
 * Get latest skill gap analysis
 * GET /api/v1/skills/gap
 */
export const getLatestSkillGap = catchAsync(async (req, res) => {
  const skillGap = await Skill.getLatestSkillGap(req.user.id);

  if (!skillGap) {
    throw errors.notFound('No skill gap analysis found. Run analysis first.');
  }

  return successResponse(res, { analysis: skillGap }, 'Skill gap retrieved successfully');
});

/**
 * Get skill gap history
 * GET /api/v1/skills/gap/history
 */
export const getSkillGapHistory = catchAsync(async (req, res) => {
  const history = await Skill.getUserSkillGaps(req.user.id);

  return successResponse(
    res,
    {
      history,
      count: history.length,
    },
    'Skill gap history retrieved successfully'
  );
});

/**
 * Search skills
 * GET /api/v1/skills/search?q=react
 */
export const searchSkills = catchAsync(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    throw errors.badRequest('Search query must be at least 2 characters');
  }

  const skills = await Skill.search(q.trim(), 20);

  return successResponse(
    res,
    {
      skills,
      count: skills.length,
    },
    'Skills search completed'
  );
});

/**
 * Add skill manually
 * POST /api/v1/skills/add
 */
export const addSkill = catchAsync(async (req, res) => {
  const { skillName, proficiency, yearsOfExperience } = req.body;

  if (!skillName) {
    throw errors.badRequest('Skill name is required');
  }

  // Find or create skill
  let skill = await Skill.findByName(skillName);

  if (!skill) {
    skill = await Skill.create({
      name: skillName,
      category: 'technical', // Default category
    });
  }

  // Add to user skills
  const userSkill = await Skill.addUserSkill({
    userId: req.user.id,
    skillId: skill.id,
    proficiencyLevel: proficiency || 'intermediate',
    yearsOfExperience: yearsOfExperience || null,
    source: 'manual',
  });

  // Invalidate cache
  await cache.del(cacheKeys.userContext(req.user.id));

  logger.info('Skill added manually', { userId: req.user.id, skillName });

  return createdResponse(res, { userSkill }, 'Skill added successfully');
});