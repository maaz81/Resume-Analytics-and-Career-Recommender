// ============================================
// middleware/auth.js - JWT Authentication
// ============================================

import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import { errors, catchAsync } from './errorHandler.js';
import { query } from '../config/db.js';
import { cache, cacheKeys } from '../config/redis.js';

/**
 * Verify JWT and attach user to request
 */
export const protect = catchAsync(async (req, res, next) => {
    // 1. Get token from header
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw errors.unauthorized('You are not logged in. Please log in to access this resource.');
    }

    // 2. Verify token
    let decoded;
    try {
        decoded = jwt.verify(token, config.jwt.secret);
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            throw errors.unauthorized('Invalid token. Please log in again.');
        }
        if (error.name === 'TokenExpiredError') {
            throw errors.unauthorized('Your session has expired. Please log in again.');
        }
        throw error;
    }

    // 3. Check if user still exists (cache first)
    const cacheKey = cacheKeys.user(decoded.id);
    let user = await cache.get(cacheKey);

    if (!user) {
        // Fetch from database
        const result = await query(
            'SELECT id, email, full_name, current_role, target_role, is_active FROM users WHERE id = $1',
            [decoded.id]
        );

        if (result.rows.length === 0) {
            throw errors.unauthorized('User no longer exists. Please log in again.');
        }

        user = result.rows[0];

        // Cache user for 1 hour
        await cache.set(cacheKey, user, 3600);
    }

    // 4. Check if user is active
    if (!user.is_active) {
        throw errors.unauthorized('Your account has been deactivated. Please contact support.');
    }

    // 5. Attach user to request
    req.user = user;
    next();
});

/**
 * Optional authentication (doesn't throw error if no token)
 */
export const optionalAuth = catchAsync(async (req, res, next) => {
    try {
        await protect(req, res, next);
    } catch (error) {
        // Continue without user
        next();
    }
});

/**
 * Restrict access to specific roles/conditions
 */
export const restrictTo = (...conditions) => {
    return (req, res, next) => {
        // You can add role-based checks here
        // For now, just check if user is authenticated
        if (!req.user) {
            throw errors.forbidden('You do not have permission to perform this action.');
        }
        next();
    };
};

/**
 * Check if user owns the resource
 */
export const checkOwnership = (resourceUserIdField = 'user_id') => {
    return catchAsync(async (req, res, next) => {
        const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];

        if (!resourceUserId) {
            throw errors.badRequest('Resource user ID not provided');
        }

        if (resourceUserId !== req.user.id) {
            throw errors.forbidden('You do not have permission to access this resource.');
        }

        next();
    });
};