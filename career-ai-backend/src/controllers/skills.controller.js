import SkillsService from '../services/skill.service.js';
import Skill from '../models/Skill.js';
import { successResponse } from '../utils/response.js';
import { catchAsync } from '../middleware/errorHandler.js';

export const getUserSkills = catchAsync(async (req, res) => {
    const skills = await Skill.getUserSkills(req.user.id);
    return successResponse(res, { skills }, 'User skills retrieved');
});

export const searchSkills = catchAsync(async (req, res) => {
    const { q } = req.query;
    // Placeholder for search logic
    return successResponse(res, { skills: [] }, 'Search results');
});

export const extractSkills = catchAsync(async (req, res) => {
    const { resumeId } = req.body;
    const skills = await SkillsService.extractSkillsFromResume(resumeId, req.user.id);
    return successResponse(res, { skills }, 'Skills extracted successfully');
});

export const analyzeSkillGap = catchAsync(async (req, res) => {
    const gapAnalysis = await SkillsService.performSkillGapAnalysis(req.user.id);
    return successResponse(res, { gapAnalysis }, 'Skill gap analysis completed');
});

export const getLatestSkillGap = catchAsync(async (req, res) => {
    const gap = await Skill.getLatestGap(req.user.id);
    return successResponse(res, { gap }, 'Latest skill gap retrieved');
});

export const getSkillGapHistory = catchAsync(async (req, res) => {
    // Placeholder
    return successResponse(res, { history: [] }, 'Gap history retrieved');
});

export const addSkill = catchAsync(async (req, res) => {
    // Placeholder
    return successResponse(res, { skill: {} }, 'Skill added');
});