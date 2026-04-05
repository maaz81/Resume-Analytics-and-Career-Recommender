/**
 * Application Route Constants
 * Centralized route definitions for maintainability
 */

import { Routes } from "react-router-dom";

export const ROUTES = {
  // Public Routes
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',

  // Onboarding Flow
  ONBOARDING_CAREER_GOAL: '/onboarding/career-goal',
  ONBOARDING_RESUME_UPLOAD: '/onboarding/resume-upload',
  ONBOARDING_JOB_DESCRIPTION: '/onboarding/job-description',

  // Dashboard
  DASHBOARD: '/dashboard',

  // Resume Routes
  RESUME_ANALYSIS: '/resume/analysis',
  RESUME_ISSUES: '/resume/issues',
  RESUME_HISTORY: '/resume/history',

  // Skills Routes
  SKILL_GAP: '/skills/gap-analysis',
  SKILL_PRIORITY: '/skills/priority',

  // Recomandations Routes
  RECOMMENDATIONS: '/recommendation',

  // Chat Bot Routes
  CHAT_BOT: '/chat-bot',

  // Profile Routes
  PROFILE: '/profile',

  // Error Routes
  NOT_FOUND: '*',
};

/**
 * Helper function to generate dynamic routes
 * @param {string} route - Route path with params
 * @param {object} params - Parameters to replace
 * @returns {string} - Generated route
 */
export const generatePath = (route, params = {}) => {
  let path = route;
  Object.keys(params).forEach((key) => {
    path = path.replace(`:${key}`, params[key]);
  });
  return path;
};

/**
 * Route groups for navigation
 */
export const ROUTE_GROUPS = {
  PUBLIC: [ROUTES.HOME, ROUTES.LOGIN, ROUTES.SIGNUP],
  ONBOARDING: [ROUTES.ONBOARDING_CAREER_GOAL, ROUTES.ONBOARDING_RESUME_UPLOAD],
  PROTECTED: [
    ROUTES.DASHBOARD,
    ROUTES.RESUME_ANALYSIS,
    ROUTES.RESUME_ISSUES,
    ROUTES.RESUME_HISTORY,
    ROUTES.SKILL_GAP,
    ROUTES.SKILL_PRIORITY,
    ROUTES.RECOMMENDATIONS,
    ROUTES.CHAT_BOT,
    ROUTES.PROFILE,
  ],
};