// ============================================
// routes/chatMain.routes.js
// ============================================

import express from 'express';

import { protect } from '../../middleware/auth.js';

import {
    newConversation,
    listConversations,
    getHistory,
    chat,
    chatStream,
} from '../../controllers/chatMain.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ============================================
// Create Conversation
// ============================================

/**
 * @swagger
 * /api/v1/chat/conversations:
 *   post:
 *     summary: Create a new AI conversation
 *     description: Creates a new authenticated user's AI career conversation.
 *     tags:
 *       - AI
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Conversation created successfully
 *       401:
 *         description: Authentication required
 */
router.post('/conversations', newConversation);

// ============================================
// List Conversations
// ============================================

/**
 * @swagger
 * /api/v1/chat/conversations:
 *   get:
 *     summary: List conversations
 *     description: Returns the authenticated user's AI conversations.
 *     tags:
 *       - AI
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/conversations', listConversations);

// ============================================
// Conversation History
// ============================================

/**
 * @swagger
 * /api/v1/chat/conversations/{id}/history:
 *   get:
 *     summary: Get conversation history
 *     description: Returns messages from a specific AI conversation.
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
 *         description: Conversation history retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Conversation not found
 */
router.get('/conversations/:id/history', getHistory);

// ============================================
// Send Chat Message
// ============================================

/**
 * @swagger
 * /api/v1/chat/conversations/{id}/chat:
 *   post:
 *     summary: Send message to AI conversation
 *     description: Sends a message to an existing AI career conversation.
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
 *                 example: How can I improve my backend development skills?
 *     responses:
 *       200:
 *         description: AI response generated successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Conversation not found
 */
router.post('/conversations/:id/chat', chat);

// ============================================
// SSE Streaming Chat
// ============================================

/**
 * @swagger
 * /api/v1/chat/conversations/{id}/stream:
 *   post:
 *     summary: Stream AI conversation response
 *     description: Sends a message and streams the AI response using Server-Sent Events.
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
 *                 example: What should I learn to become a senior backend developer?
 *     responses:
 *       200:
 *         description: AI response streamed using Server-Sent Events
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Conversation not found
 */
router.post('/conversations/:id/stream', chatStream);

export default router;