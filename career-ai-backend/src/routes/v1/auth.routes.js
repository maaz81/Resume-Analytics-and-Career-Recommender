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

// ============================================
// Validation schemas
// ============================================

const registerValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage(
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),

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
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage(
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
];

const passwordValidation = body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    );

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maaz@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password@123
 *               fullName:
 *                 type: string
 *                 example: Maaz Ahmad Khan
 *               targetRole:
 *                 type: string
 *                 example: Full Stack Developer
 *               currentRole:
 *                 type: string
 *                 example: Software Developer
 *               yearsOfExperience:
 *                 type: number
 *                 example: 2
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid request data or validation error
 *       409:
 *         description: User already exists
 *       429:
 *         description: Too many requests
 */
router.post(
    '/register',
    authLimiter,
    registerValidation,
    validate,
    authController.register
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticates a user using email and password.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maaz@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Invalid email or password
 *       429:
 *         description: Too many requests
 */
router.post(
    '/login',
    authLimiter,
    loginValidation,
    validate,
    authController.login
);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Generates a new access token using a valid refresh token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIs...
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *       400:
 *         description: Refresh token is required
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
    '/refresh',
    authLimiter,
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    validate,
    authController.refreshToken
);

// ============================================
// PROTECTED ROUTES
// ============================================

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user
 *     description: Returns the currently authenticated user's information.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *       401:
 *         description: Authentication required
 */
router.get('/me', protect, authController.getMe);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   patch:
 *     summary: Update current user profile
 *     description: Updates profile information for the authenticated user.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Maaz Ahmad Khan
 *               targetRole:
 *                 type: string
 *                 example: Backend Developer
 *               currentRole:
 *                 type: string
 *                 example: Software Developer
 *               yearsOfExperience:
 *                 type: number
 *                 example: 2
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Authentication required
 */
router.patch('/profile', protect, authController.updateProfile);

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   post:
 *     summary: Change password
 *     description: Changes the password of the authenticated user.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: OldPassword@123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPassword@123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid password data
 *       401:
 *         description: Authentication required or incorrect current password
 */
router.post(
    '/change-password',
    protect,
    changePasswordValidation,
    validate,
    authController.changePassword
);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Logs out the currently authenticated user.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Authentication required
 */
router.post('/logout', protect, authController.logout);

// ============================================
// GOOGLE OAUTH
// ============================================

/**
 * @swagger
 * /api/v1/auth/google:
 *   get:
 *     summary: Google OAuth login
 *     description: Redirects the user to Google authentication.
 *     tags:
 *       - Authentication
 *     responses:
 *       302:
 *         description: Redirect to Google authentication
 */
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
    '/google/callback',
    passport.authenticate('google', { session: false }),
    authController.oauthSuccess
);

// ============================================
// GITHUB OAUTH
// ============================================

/**
 * @swagger
 * /api/v1/auth/github:
 *   get:
 *     summary: GitHub OAuth login
 *     description: Redirects the user to GitHub authentication.
 *     tags:
 *       - Authentication
 *     responses:
 *       302:
 *         description: Redirect to GitHub authentication
 */
router.get(
    '/github',
    passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
    '/github/callback',
    passport.authenticate('github', { session: false }),
    authController.oauthSuccess
);

// ============================================
// PASSWORD RESET
// ============================================

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Sends a password reset request to the user's email.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maaz@example.com
 *     responses:
 *       200:
 *         description: Password reset request processed
 *       400:
 *         description: Invalid email address
 */
router.post(
    '/forgot-password',
    authLimiter,
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    validate,
    authController.forgotPassword
);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     description: Resets the user's password using a valid reset token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123resetToken
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPassword@123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired reset token
 */
router.post(
    '/reset-password',
    authLimiter,
    body('token')
        .notEmpty()
        .withMessage('Token is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage(
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
    validate,
    authController.resetPassword
);

export default router;