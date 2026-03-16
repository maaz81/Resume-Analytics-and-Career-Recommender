import logger from '../config/logger.js';
import {
    createConversation,
    getUserConversations,
    getConversationHistory,
    verifyConversationOwner,
    sendMessage,
    sendMessageStream,
} from '../services/chatMain.service.js';

// ─── Create Conversation ──────────────────────────────────────────────────────
export const newConversation = async (req, res) => {
    try {
        // ✅ no title param — ai_conversations doesn't have a title column
        const conversation = await createConversation(req.user.id);
        return res.status(201).json({ message: 'Conversation created', conversation });
    } catch (err) {
        logger.error(`Create conversation error: ${err.message}`);
        return res.status(500).json({ message: 'Server error' });
    }
};

// ─── List Conversations ───────────────────────────────────────────────────────
export const listConversations = async (req, res) => {
    try {
        const conversations = await getUserConversations(req.user.id);
        return res.json({ conversations });
    } catch (err) {
        logger.error(`List conversations error: ${err.message}`);
        return res.status(500).json({ message: 'Server error' });
    }
};

// ─── Get History ─────────────────────────────────────────────────────────────
export const getHistory = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ verify ownership before returning messages
        const isOwner = await verifyConversationOwner(id, req.user.id);
        if (!isOwner)
            return res.status(403).json({ message: 'Forbidden' });

        const messages = await getConversationHistory(id);
        return res.json({ messages });
    } catch (err) {
        logger.error(`Get history error: ${err.message}`);
        return res.status(500).json({ message: 'Server error' });
    }
};

// ─── Chat (normal) ────────────────────────────────────────────────────────────
export const chat = async (req, res) => {
    try {
        const { message } = req.body;
        const { id } = req.params;

        if (!message?.trim())
            return res.status(400).json({ message: 'Message is required' });

        // ✅ verify ownership
        const isOwner = await verifyConversationOwner(id, req.user.id);
        if (!isOwner)
            return res.status(403).json({ message: 'Forbidden' });

        // ✅ pass userId — ai_messages needs it
        const aiMessage = await sendMessage(id, req.user.id, message);
        return res.json({ message: 'Success', aiMessage });
    } catch (err) {
        logger.error(`Chat error: ${err.message}`);
        return res.status(500).json({ message: 'Server error' });
    }
};

// ─── Chat (streaming) ─────────────────────────────────────────────────────────
export const chatStream = async (req, res) => {
    try {
        const { message } = req.body;
        const { id } = req.params;

        if (!message?.trim())
            return res.status(400).json({ message: 'Message is required' });

        // ✅ verify ownership
        const isOwner = await verifyConversationOwner(id, req.user.id);
        if (!isOwner)
            return res.status(403).json({ message: 'Forbidden' });

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        // ✅ pass userId — ai_messages needs it
        await sendMessageStream(id, req.user.id, message, (chunk) => {
            res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
            // Flush each chunk immediately — prevents compression middleware from buffering SSE
            if (typeof res.flush === 'function') res.flush();
        });

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        if (typeof res.flush === 'function') res.flush();
        res.end();
    } catch (err) {
        logger.error(`Stream error: ${err.message}`);
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
    }
};
