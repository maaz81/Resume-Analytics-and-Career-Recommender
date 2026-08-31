// ============================================
// controllers/auth.controller.js
// ============================================

import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.js';
import { successResponse, createdResponse } from '../utils/response.js';
import { errors, catchAsync } from '../middleware/errorHandler.js';
import { cache, cacheKeys } from '../config/redis.js';
import logger from '../config/logger.js';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/email.service.js';

/**
 * Register new user
 * POST /api/v1/auth/register
 */
export const register = catchAsync(async (req, res) => {
    const { email, password, fullName, currentRole, yearsOfExperience, targetRole } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
        throw errors.conflict('User with this email already exists');
    }

    // Create user
    const user = await User.create({
        email,
        password,
        fullName,
        currentRole,
        yearsOfExperience,
        targetRole,
    });

    // Generate tokens
    const tokens = generateTokens(user);

    // Log audit
    await AuditLog.create({
        userId: user.id,
        action: 'user.registered',
        entityType: 'user',
        entityId: user.id,
        metadata: { email: user.email }
    });

    logger.info('User registered', { userId: user.id, email: user.email });

    return createdResponse(res, {
        user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            targetRole: user.target_role,
        },
        ...tokens,
    }, 'Registration successful');
});

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
        throw errors.unauthorized('Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
        throw errors.unauthorized('Your account has been deactivated. Please contact support.');
    }

    // Verify password exists (might be null for OAuth users)
    if (!user.password_hash) {
        throw errors.unauthorized('Please login with the provider you used to sign up (e.g. Google)');
    }

    const isPasswordValid = await User.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
        throw errors.unauthorized('Invalid email or password');
    }

    // Update last login
    await User.updateLastLogin(user.id);

    // Generate tokens
    const tokens = generateTokens(user);

    // Cache user data
    await cache.set(cacheKeys.user(user.id), {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        current_role: user.current_role,
        target_role: user.target_role,
        is_active: user.is_active,
    }, 3600); // 1 hour

    // Log audit
    await AuditLog.create({
        userId: user.id,
        action: 'user.login',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    logger.info('User logged in', { userId: user.id, email: user.email });

    return successResponse(res, {
        user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            currentRole: user.current_role,
            targetRole: user.target_role,
        },
        ...tokens,
    }, 'Login successful');
});

/**
 * Get current user
 * GET /api/v1/auth/me
 */
export const getMe = catchAsync(async (req, res) => {
    const cacheKey = cacheKeys.user(req.user.id);

    let user = await cache.get(cacheKey);

    if (!user) {
        user = await User.findById(req.user.id);

        if (!user) {
            throw errors.notFound('User not found');
        }

        await cache.set(cacheKey, user, 3600);
    }

    return successResponse(
        res,
        { user },
        'User retrieved successfully'
    );
});
/**
 * Update profile
 * PATCH /api/v1/auth/profile
 */
export const updateProfile = catchAsync(async (req, res) => {
    const fieldMap = {
        // camelCase -> snake_case (existing support)
        'fullName': 'full_name',
        'currentRole': 'current_role',
        'yearsOfExperience': 'years_of_experience',
        'targetRole': 'target_role',
        'industry': 'industry',
        'bio': 'bio',
        'location': 'location',
        // snake_case -> snake_case (new direct support)
        'full_name': 'full_name',
        'current_role': 'current_role',
        'years_of_experience': 'years_of_experience',
        'target_role': 'target_role',
    };

    const updates = {};
    Object.keys(req.body).forEach((key) => {
        if (fieldMap[key]) {
            updates[fieldMap[key]] = req.body[key];
        }
    });

    const updatedUser = await User.update(req.user.id, updates);

    if (!updatedUser) {
        throw errors.badRequest('No valid fields to update');
    }

    // Invalidate user cache
    await cache.del(cacheKeys.user(req.user.id));

    logger.info('User profile updated', { userId: req.user.id });

    return successResponse(res, { user: updatedUser }, 'Profile updated successfully');
});

/**
 * Change password
 * POST /api/v1/auth/change-password
 */
export const changePassword = catchAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findByEmail(req.user.email);

    // Verify current password
    const isPasswordValid = await User.verifyPassword(currentPassword, user.password_hash);
    if (!isPasswordValid) {
        throw errors.unauthorized('Current password is incorrect');
    }

    // Update password
    await User.changePassword(user.id, newPassword);

    // Invalidate all sessions (optional - requires session management)
    await cache.delPattern(`session:${user.id}:*`);

    logger.info('Password changed', { userId: user.id });

    return successResponse(res, null, 'Password changed successfully');
});

/**
 * Refresh token
 * POST /api/v1/auth/refresh
 */
export const refreshToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw errors.badRequest('Refresh token is required');
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
        throw errors.unauthorized('Invalid or expired refresh token');
    }

    // Get user
    const user = await User.findById(decoded.id);
    if (!user || !user.is_active) {
        throw errors.unauthorized('User not found or inactive');
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    return successResponse(res, tokens, 'Token refreshed successfully');
});

/**
 * Logout
 * POST /api/v1/auth/logout
 */
export const logout = catchAsync(async (req, res) => {
    // Clear user cache
    await cache.del(cacheKeys.user(req.user.id));

    // Clear user context cache
    await cache.del(cacheKeys.userContext(req.user.id));

    // Log audit
    await AuditLog.create({
        userId: req.user.id,
        action: 'user.logout'
    });

    logger.info('User logged out', { userId: req.user.id });

    return successResponse(res, null, 'Logged out successfully');
});

export const oauthSuccess = catchAsync(async (req, res) => {
    const user = req.user;

    const tokens = generateTokens(user);

    await User.updateLastLogin(user.id);

    // Redirect to frontend with token — JSON won't work here since
    // the browser navigated away from the SPA during the OAuth flow.
    // Priority: VERCEL_FRONTEND_URL (prod) → FRONTEND_URL → localhost fallback
    const isProduction = process.env.NODE_ENV === 'production';
    let frontendUrl;

    if (isProduction) {
        frontendUrl = process.env.VERCEL_FRONTEND_URL || process.env.FRONTEND_URL;
    } else {
        frontendUrl = process.env.FRONTEND_URL || process.env.VERCEL_FRONTEND_URL;
    }

    frontendUrl = frontendUrl || 'http://localhost:5173';

    logger.info('OAuth success — redirecting to frontend', { userId: user.id, frontendUrl });

    res.redirect(`${frontendUrl}/oauth-success?token=${tokens.accessToken}`);
});

/**
 * Forgot password
 * POST /api/v1/auth/forgot-password
 */
export const forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.body;

    const user = await User.findByEmail(email);

    const resetToken = crypto
        .randomBytes(32)
        .toString('hex');

    const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    const expiresAt = new Date(
        Date.now() + 15 * 60 * 1000
    );

    await User.setPasswordResetToken(
        user.id,
        hashedToken,
        expiresAt
    );

    await sendPasswordResetEmail(
        user.email,
        resetToken
    );

    const successMessage =
        'If an account exists with this email, a password reset link has been sent.';

    // Do not reveal whether the user exists
    if (!user) {
        return successResponse(
            res,
            null,
            successMessage
        );
    }

    // OAuth users do not have a local password
    if (!user.password_hash) {
        return successResponse(
            res,
            null,
            successMessage
        );
    }

    // Save hashed token to database
    await User.setPasswordResetToken(
        user.id,
        hashedToken,
        expiresAt
    );

    // Send email containing RAW token
    await sendPasswordResetEmail(
        user.email,
        resetToken
    );

    // Audit log
    await AuditLog.create({
        userId: user.id,
        action: 'user.password_reset_requested',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
    });

    logger.info('Password reset requested', {
        userId: user.id,
    });

    return successResponse(
        res,
        null,
        successMessage
    );
});


/**
 * Reset password
 * POST /api/v1/auth/reset-password
 */
export const resetPassword = catchAsync(async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        throw errors.badRequest(
            'Token and new password are required'
        );
    }

    // Hash received token
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    // Find user with valid token
    const user = await User.findByPasswordResetToken(
        hashedToken
    );

    if (!user) {
        throw errors.badRequest(
            'Invalid or expired password reset token'
        );
    }

    // Change password
    await User.changePassword(
        user.id,
        newPassword
    );

    // Optional: invalidate sessions
    await cache.delPattern(`session:${user.id}:*`);

    // Clear user cache
    await cache.del(cacheKeys.user(user.id));

    // Audit log
    await AuditLog.create({
        userId: user.id,
        action: 'user.password_reset'
    });

    logger.info('Password reset successfully', {
        userId: user.id
    });

    return successResponse(
        res,
        null,
        'Password reset successfully'
    );
});
