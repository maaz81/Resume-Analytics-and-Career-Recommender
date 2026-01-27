// ============================================
// controllers/dashboard.controller.js
// ============================================

import DashboardService from '../services/dashboard.service.js';
import { successResponse } from '../utils/response.js';
import { catchAsync } from '../middleware/errorHandler.js';
import { cache, cacheKeys } from '../config/redis.js';
import logger from '../config/logger.js';

/**
 * Get complete dashboard
 * GET /api/v1/dashboard
 */
export const getDashboard = catchAsync(async (req, res) => {
  const userId = req.user.id;

  // Check cache first
  const cacheKey = cacheKeys.dashboard(userId);
  let dashboard = await cache.get(cacheKey);

  if (!dashboard) {
    // Build dashboard from database
    dashboard = await DashboardService.getDashboardData(userId);

    // Cache for 5 minutes
    await cache.set(cacheKey, dashboard, 300);

    logger.info('Dashboard data generated', { userId });
  } else {
    logger.debug('Dashboard served from cache', { userId });
  }

  return successResponse(res, dashboard, 'Dashboard data retrieved successfully');
});

/**
 * Get resume health summary
 * GET /api/v1/dashboard/resume-health
 */
export const getResumeHealth = catchAsync(async (req, res) => {
  const health = await DashboardService.getResumeHealth(req.user.id);

  return successResponse(res, health, 'Resume health retrieved successfully');
});

/**
 * Refresh dashboard (invalidate cache)
 * POST /api/v1/dashboard/refresh
 */
export const refreshDashboard = catchAsync(async (req, res) => {
  const userId = req.user.id;

  // Invalidate all user caches
  await cache.del(cacheKeys.dashboard(userId));
  await cache.del(cacheKeys.userContext(userId));

  // Rebuild dashboard
  const dashboard = await DashboardService.getDashboardData(userId);

  // Cache fresh data
  await cache.set(cacheKeys.dashboard(userId), dashboard, 300);

  logger.info('Dashboard refreshed', { userId });

  return successResponse(res, dashboard, 'Dashboard refreshed successfully');
});