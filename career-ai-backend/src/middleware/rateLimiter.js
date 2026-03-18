// ============================================
// middleware/rateLimiter.js
// ============================================

import rateLimit from 'express-rate-limit';
import config from '../config/env.js';

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
        status: 'error',
        message: 'Too many requests from this IP. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict limiter for authentication routes
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: config.env === 'development' ? 50 : 5, // 50 in dev, 5 in prod
    skipSuccessfulRequests: true, // Don't count successful requests
    message: {
        status: 'error',
        message: 'Too many authentication attempts. Please try again after 15 minutes.',
    },
});

// AI service limiter (expensive operations)
export const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 AI calls per hour
    message: {
        status: 'error',
        message: 'AI service limit reached. Please try again later.',
    },
    keyGenerator: (req) => {
        // Rate limit per user, not per IP
        return req.user?.id || req.ip;
    },
});

// File upload limiter
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 uploads per hour
    message: {
        status: 'error',
        message: 'Upload limit reached. Please try again later.',
    },
    keyGenerator: (req) => {
        return req.user?.id || req.ip;
    },
});