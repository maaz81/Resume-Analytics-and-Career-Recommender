// ============================================
// controllers/recommendation.controller.js
// ============================================

import {
    fetchYouTubeCourses,
    defaultProjects,
    defaultRoadmapSteps,
    defaultJobs,
} from '../services/recommendation.service.js';
import { generateProjectsFromResume } from '../services/project.service.js';
import Resume from '../models/Resume.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { catchAsync } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

/**
 * GET /recommendations/courses?q=react+course&max=12
 * Fetches YouTube courses matching the query
 */
export const getCourses = catchAsync(async (req, res) => {
    const query = req.query.q || 'programming course';
    const maxResults = parseInt(req.query.max, 10);

    try {
        const courses = await fetchYouTubeCourses(query, maxResults);
        return successResponse(res, { courses }, 'Courses fetched from YouTube');
    } catch (err) {
        logger.error('[Recommendation] YouTube fetch failed', err);
        return errorResponse(res, 'Failed to fetch courses from YouTube', 502);
    }
});

/**
 * GET /recommendations/projects
 */
export const getProjects = catchAsync(async (req, res) => {
    let projects = defaultProjects;

    try {
        const resume = await Resume.findOne({ user_id: req.user.id }).sort({ createdAt: -1 });

        if (!resume || !resume.raw_text) {
            return successResponse(res, { projects: defaultProjects }, 'No resume found, showing default projects');
        }

        const aiProjects = await generateProjectsFromResume(resume.raw_text);

        if (Array.isArray(aiProjects) && aiProjects.length > 0) {
            projects = aiProjects.map((p, index) => ({
                id: index + 1,
                title: p.title,
                description: p.description,
                stack: p.stack || [],
                difficulty: p.difficulty || 'Intermediate',
                color: 'border-l-brand-primary',
                accent: '#3F76FF',
            }));
        }

    } catch (err) {
        logger.error('[Recommendation] AI project generation failed', err);
    }

    return successResponse(res, { projects }, 'Projects retrieved');
});

/**
 * GET /recommendations/roadmap
 */
export const getRoadmap = catchAsync(async (req, res) => {
    return successResponse(res, { roadmapSteps: defaultRoadmapSteps }, 'Roadmap retrieved');
});

/**
 * GET /recommendations/jobs
 */
export const getJobs = catchAsync(async (req, res) => {
    return successResponse(res, { jobs: defaultJobs }, 'Jobs retrieved');
});

/**
 * GET /recommendations   — all-in-one bundle
 */
export const getAll = catchAsync(async (req, res) => {
    const query = req.query.q || 'programming course';

    let courses = [];
    try {
        courses = await fetchYouTubeCourses(query, 12);
    } catch (err) {
        logger.error('[Recommendation] YouTube fetch failed in getAll', err);
    }

    let projects = defaultProjects;

    try {
        const resume = await Resume.findOne({ user_id: req.user.id }).sort({ createdAt: -1 });

        if (resume && resume.raw_text) {
            const aiProjects = await generateProjectsFromResume(resume.raw_text);

            if (Array.isArray(aiProjects) && aiProjects.length > 0) {
                projects = aiProjects.map((p, index) => ({
                    id: index + 1,
                    title: p.title,
                    description: p.description,
                    stack: p.stack || [],
                    difficulty: p.difficulty || 'Intermediate',
                    color: 'border-l-brand-primary',
                    accent: '#3F76FF',
                }));
            }
        }
    } catch (err) {
        logger.error('[Recommendation] AI project generation failed in getAll', err);
    }

    return successResponse(
        res,
        {
            courses,
            projects,
            roadmapSteps: defaultRoadmapSteps,
            jobs: defaultJobs,
        },
        'All recommendations retrieved'
    );
});