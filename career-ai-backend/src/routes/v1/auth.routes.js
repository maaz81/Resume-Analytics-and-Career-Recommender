// ============================================
// routes/auth.routes.js
// ============================================

import express from 'express';
import { body } from 'express-validator';
import * as authController from '../../controllers/auth.controller.js';
import { protect } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { validate } from '../../middleware/validator.js';
import passport from 'passport';

const router = express.Router();

// Validation schemas
const registerValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('fullName')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Full name must be between 2 and 255 characters'),
    body('targetRole')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Target role must be less than 255 characters'),
    body('currentRole')
        .optional()
        .trim()
        .isLength({ max: 255 }),
    body('yearsOfExperience')
        .optional()
        .isFloat({ min: 0, max: 50 })
        .withMessage('Years of experience must be between 0 and 50'),
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

const changePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

// Public routes
router.post(
    '/register',
    authLimiter,
    registerValidation,
    validate,
    authController.register
);

router.post(
    '/login',
    authLimiter,
    loginValidation,
    validate,
    authController.login
);

router.post(
    '/refresh',
    authLimiter,
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    validate,
    authController.refreshToken
);

// Protected routes
router.get('/me', protect, authController.getMe);

router.patch('/profile', protect, authController.updateProfile);

router.post(
    '/change-password',
    protect,
    changePasswordValidation,
    validate,
    authController.changePassword
);

router.post('/logout', protect, authController.logout);

// Google
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { session: false }),
    authController.oauthSuccess
);

// GitHub
router.get('/github',
    passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
    passport.authenticate('github', { session: false }),
    authController.oauthSuccess
);

export default router;