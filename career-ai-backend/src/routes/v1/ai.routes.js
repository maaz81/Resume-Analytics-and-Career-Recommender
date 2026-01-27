// ============================================
// routes/ai.routes.js - Career Assistant Chat
// ============================================
import express from 'express';
import { protect } from '../../middleware/auth.js';
import { successResponse } from '../../utils/response.js';
import { catchAsync, errors } from '../../middleware/errorHandler.js';
import { aiLimiter } from '../../middleware/rateLimiter.js';
import { getCareerAdvice } from '../../services/ai.service.js';
import { query } from '../../config/db.js';
import Resume from '../../models/Resume.js';

const router = express.Router();
router.use(protect);

/**
 * Send message to AI career assistant
 * POST /api/v1/ai/chat
 */
router.post('/chat', aiLimiter, catchAsync(async (req, res) => {
    const { message, conversationId } = req.body;

    if (!message) {
        throw errors.badRequest('Message is required');
    }

    // Build user context
    const activeResume = await Resume.findActiveByUserId(req.user.id);

    const userContext = {
        userId: req.user.id,
        targetRole: req.user.target_role,
        currentRole: req.user.current_role,
        yearsOfExperience: req.user.years_of_experience,
        hasResume: !!activeResume,
        resumeParsed: activeResume?.parsing_status === 'completed',
    };

    // Get conversation history if conversationId provided
    let history = [];
    if (conversationId) {
        const historyResult = await query(
            `SELECT role, content FROM ai_messages 
       WHERE conversation_id = $1 
       ORDER BY created_at DESC LIMIT 10`,
            [conversationId]
        );
        history = historyResult.rows.reverse();
    }

    // Get AI response
    const aiResponse = await getCareerAdvice(userContext, message, history);

    // Create or get conversation
    let convId = conversationId;
    if (!convId) {
        const convResult = await query(
            `INSERT INTO ai_conversations (user_id, context_snapshot)
       VALUES ($1, $2) RETURNING id`,
            [req.user.id, JSON.stringify(userContext)]
        );
        convId = convResult.rows[0].id;
    }

    // Save messages
    await query(
        `INSERT INTO ai_messages (conversation_id, user_id, role, content)
     VALUES ($1, $2, 'user', $3), ($1, $2, 'assistant', $4)`,
        [convId, req.user.id, message, aiResponse.reply]
    );

    // Update conversation
    await query(
        `UPDATE ai_conversations 
     SET message_count = message_count + 2, 
         last_message_at = NOW(),
         updated_at = NOW()
     WHERE id = $1`,
        [convId]
    );

    return successResponse(res, {
        conversationId: convId,
        message: aiResponse.reply,
        suggestions: aiResponse.suggestions || [],
    }, 'Response generated successfully');
}));

/**
 * Get conversation history
 */
router.get('/conversations/:id', catchAsync(async (req, res) => {
    const messages = await query(
        `SELECT * FROM ai_messages 
     WHERE conversation_id = $1 AND user_id = $2 
     ORDER BY created_at ASC`,
        [req.params.id, req.user.id]
    );

    return successResponse(res, { messages: messages.rows }, 'Conversation retrieved');
}));

export default router;