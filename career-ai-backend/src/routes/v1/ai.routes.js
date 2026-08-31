// ============================================
// routes/ai.routes.js - Career Assistant Chat
// ============================================

import express from 'express';
import { protect } from '../../middleware/auth.js';
import { aiLimiter } from '../../middleware/rateLimiter.js';
import * as aiController from '../../controllers/ai.controller.js';

const router = express.Router();

router.use(protect);

// ============================================
// AI Career Assistant Chat
// ============================================

/**
 * @swagger
 * /api/v1/ai/chat:
 *   post:
 *     summary: Chat with AI career assistant
 *     description: Sends a message to the AI-powered career assistant.
 *     tags:
 *       - AI
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: Message or question for the career assistant
 *                 example: How can I improve my backend development skills?
 *               conversationId:
 *                 type: string
 *                 description: Existing conversation ID, if continuing a conversation
 *                 example: 123
 *     responses:
 *       200:
 *         description: AI response generated successfully
 *       400:
 *         description: Invalid message or request
 *       401:
 *         description: Authentication required
 *       429:
 *         description: AI rate limit exceeded
 *       500:
 *         description: AI service error
 */
router.post(
    '/chat',
    aiLimiter,
    aiController.chat
);

// ============================================
// Get Conversation
// ============================================

/**
 * @swagger
 * /api/v1/ai/conversations/{id}:
 *   get:
 *     summary: Get AI conversation
 *     description: Returns a specific AI career assistant conversation.
 *     tags:
 *       - AI
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *         example: 123
 *     responses:
 *       200:
 *         description: Conversation retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Conversation not found
 */
router.get(
    '/conversations/:id',
    aiController.getConversation
);

export default router;