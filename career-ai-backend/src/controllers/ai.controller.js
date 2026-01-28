import Resume from '../models/Resume.js';
import AiConversation from '../models/AiConversation.js';
import { getCareerAdvice } from '../services/ai.service.js';
import { successResponse } from '../utils/response.js';
import { errors, catchAsync } from '../middleware/errorHandler.js';
import { query } from '../config/db.js';

/**
 * Send message to AI career assistant
 * POST /api/v1/ai/chat
 */
export const chat = catchAsync(async (req, res) => {
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

    // Get conversation history
    let history = [];
    if (conversationId) {
        history = await AiConversation.getHistory(conversationId);
    }

    // Get AI response
    const aiResponse = await getCareerAdvice(userContext, message, history);

    // Save conversation
    const finalConvId = await AiConversation.findOrCreate(conversationId, req.user.id, userContext);
    await AiConversation.saveMessagePair(finalConvId, req.user.id, message, aiResponse.reply);

    return successResponse(res, {
        conversationId: finalConvId,
        message: aiResponse.reply,
        suggestions: aiResponse.suggestions || [],
    }, 'Response generated successfully');
});

export const getConversation = catchAsync(async (req, res) => {
    const messages = await AiConversation.getHistory(req.params.id, 50);
    return successResponse(res, { messages }, 'Conversation retrieved');
});