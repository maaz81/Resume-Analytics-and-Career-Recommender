// ============================================
// controllers/chatbot.controller.js
// ============================================

import { query } from '../config/db.js';
import { catchAsync } from '../middleware/errorHandler.js';
import { successResponse, createdResponse } from '../utils/response.js';
import logger from '../config/logger.js';
import { cache, cacheKeys } from '../config/redis.js';
import { getCareerAdvice } from '../services/chatbot.service.js';

/**
 * Create a new conversation
 * POST /api/v1/conversations
 */
export const createConversation = catchAsync(async (req, res) => {
    const userId = req.user.id;

    const result = await query(
        `INSERT INTO ai_conversations (user_id, message_count, created_at, updated_at)
         VALUES ($1, 0, NOW(), NOW()) RETURNING *`,
        [userId]
    );

    const conversation = result.rows[0];

    // Log audit
    await query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
         VALUES ($1, 'conversation.created', 'ai_conversation', $2)`,
        [userId, conversation.id]
    );

    logger.info('New AI conversation created', { userId, conversationId: conversation.id });

    return createdResponse(res, { conversation }, 'Conversation created successfully');
});

/**
 * Get all conversations for the user
 * GET /api/v1/conversations
 */
export const getAllConversations = catchAsync(async (req, res) => {
    const userId = req.user.id;

    const cacheKey = cacheKeys.conversations(userId);
    let conversations = await cache.get(cacheKey);

    if (!conversations) {
        const result = await query(
            `SELECT * FROM ai_conversations WHERE user_id=$1 ORDER BY updated_at DESC`,
            [userId]
        );
        conversations = result.rows;

        await cache.set(cacheKey, conversations, 3600);
    }

    return successResponse(res, { conversations }, 'Conversations retrieved successfully');
});

/**
 * Get conversation by ID with messages
 * GET /api/v1/conversations/:id
 */
export const getConversationById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const convResult = await query(
        `SELECT * FROM ai_conversations WHERE id=$1`,
        [id]
    );
    const conversation = convResult.rows[0];

    if (!conversation) {
        return successResponse(res, null, 'Conversation not found', 404);
    }

    if (conversation.user_id !== userId) {
        throw new Error('Forbidden');
    }

    const messagesResult = await query(
        `SELECT * FROM ai_messages WHERE conversation_id=$1 ORDER BY created_at ASC`,
        [id]
    );

    return successResponse(res, { conversation, messages: messagesResult.rows }, 'Conversation retrieved successfully');
});

/**
 * Send message to AI (streaming support)
 * POST /api/v1/conversations/:id/message
 */
export const sendMessage = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
        throw new Error('Message content required');
    }

    // Check conversation exists
    const convResult = await query(
        `SELECT * FROM ai_conversations WHERE id=$1`,
        [id]
    );
    const conversation = convResult.rows[0];

    if (!conversation) {
        throw new Error('Conversation not found');
    }

    if (conversation.user_id !== userId) {
        throw new Error('Forbidden');
    }

    // Insert user message
    const userMsgResult = await query(
        `INSERT INTO ai_messages (conversation_id, user_id, role, content, created_at)
         VALUES ($1, $2, 'user', $3, NOW()) RETURNING *`,
        [id, userId, content]
    );

    const userMessage = userMsgResult.rows[0];

    // Update conversation message count and last_message_at
    await query(
        `UPDATE ai_conversations
         SET message_count = message_count + 1, last_message_at = NOW(), updated_at = NOW()
         WHERE id=$1`,
        [id]
    );

    // Get conversation history for context
    const historyResult = await query(
        `SELECT role, content FROM ai_messages WHERE conversation_id=$1 ORDER BY created_at ASC`,
        [id]
    );

    // Call AI service to generate response (streaming handled in service)
    const aiResponse = await getCareerAdvice(
        "You are an expert career advisor and resume analyst. Help the user optimize their career path.",
        content,
        historyResult.rows
    );

    // Insert AI message
    const aiMsgResult = await query(
        `INSERT INTO ai_messages (conversation_id, user_id, role, content, created_at)
         VALUES ($1, $2, 'assistant', $3, NOW()) RETURNING *`,
        [id, userId, aiResponse]
    );

    return successResponse(res, { userMessage, aiMessage: aiMsgResult.rows[0] }, 'Message sent successfully');
});

/**
 * Delete a conversation
 * DELETE /api/v1/conversations/:id
 */
export const deleteConversation = catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const convResult = await query(`SELECT * FROM ai_conversations WHERE id=$1`, [id]);
    const conversation = convResult.rows[0];

    if (!conversation) {
        return successResponse(res, null, 'Conversation not found', 404);
    }

    if (conversation.user_id !== userId) {
        throw new Error('Forbidden');
    }

    // Delete conversation (cascade will delete messages)
    await query(`DELETE FROM ai_conversations WHERE id=$1`, [id]);

    logger.info('Conversation deleted', { userId, conversationId: id });

    return successResponse(res, null, 'Conversation deleted successfully');
});