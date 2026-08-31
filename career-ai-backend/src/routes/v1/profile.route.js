// ============================================
// routes/profile.route.js
// ============================================

import express from 'express';

import { personalInformation } from '../../controllers/profile.controller.js';

import { protect } from '../../middleware/auth.js';

const router = express.Router();

// ============================================
// Get Personal Information
// ============================================

/**
 * @swagger
 * /api/v1/profile:
 *   get:
 *     summary: Get personal information
 *     description: Returns personal/profile information for the authenticated user.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personal information retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Profile not found
 */
router.get('/', protect, personalInformation);

export default router;