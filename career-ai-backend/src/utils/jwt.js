// ============================================
// utils/jwt.js - JWT Token Utilities
// ============================================

import jwt from 'jsonwebtoken';
import config from '../config/env.js';

/**
 * Generate access token
 */
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expire,
    });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpire,
    });
};

/**
 * Generate both tokens
 */
export const generateTokens = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
    };

    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, config.jwt.secret);
    } catch (error) {
        return null;
    }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, config.jwt.refreshSecret);
    } catch (error) {
        return null;
    }
};

/**
 * Decode token without verification (for debugging)
 */
export const decodeToken = (token) => {
    return jwt.decode(token);
};