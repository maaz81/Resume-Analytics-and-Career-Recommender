import OpenAI from 'openai';
import { query } from '../config/db.js';
import logger from '../config/logger.js';

const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
        'HTTP-Referer': 'http://localhost:5000',
        'X-Title': 'Career Advisor Chatbot',
    },
});

const MODEL = 'openai/gpt-oss-120b:free';

const SYSTEM_PROMPT = `You are an expert career advisor with 15+ years of experience.
You help users with:
- Resume writing and optimization
- Career path planning  
- Interview preparation
- Skill gap analysis
- Job search strategies
Be concise, practical, and encouraging.`;

// ─── Create conversation ─────────────────────────────────────────────────────
export const createConversation = async (userId) => {
    // ✅ uses ai_conversations — no title column in your schema
    const result = await query(
        `INSERT INTO ai_conversations (user_id, message_count, last_message_at, created_at, updated_at)
         VALUES ($1, 0, NOW(), NOW(), NOW()) RETURNING *`,
        [userId]
    );
    return result.rows[0];
};

// ─── Get all conversations ───────────────────────────────────────────────────
export const getUserConversations = async (userId) => {
    // ✅ uses ai_conversations + ai_messages
    const result = await query(
        `SELECT c.*, COUNT(m.id) AS message_count
         FROM ai_conversations c
         LEFT JOIN ai_messages m ON m.conversation_id = c.id
         WHERE c.user_id = $1
         GROUP BY c.id
         ORDER BY c.created_at DESC`,
        [userId]
    );
    return result.rows;
};

// ─── Get conversation history ────────────────────────────────────────────────
export const getConversationHistory = async (conversationId) => {
    // ✅ uses ai_messages
    const result = await query(
        `SELECT role, content FROM ai_messages
         WHERE conversation_id = $1
         ORDER BY created_at ASC`,
        [conversationId]
    );
    return result.rows;
};

// ─── Verify conversation belongs to user ─────────────────────────────────────
export const verifyConversationOwner = async (conversationId, userId) => {
    // ✅ security check using ai_conversations
    const result = await query(
        `SELECT id FROM ai_conversations WHERE id = $1 AND user_id = $2`,
        [conversationId, userId]
    );
    return result.rows.length > 0;
};

// ─── Save message ────────────────────────────────────────────────────────────
export const saveMessage = async (conversationId, userId, role, content) => {
    // ✅ ai_messages has user_id column unlike the simple schema
    const result = await query(
        `INSERT INTO ai_messages (conversation_id, user_id, role, content, created_at)
         VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
        [conversationId, userId, role, content]
    );

    // ✅ also update ai_conversations counters
    await query(
        `UPDATE ai_conversations 
         SET message_count = message_count + 1,
             last_message_at = NOW(),
             updated_at = NOW()
         WHERE id = $1`,
        [conversationId]
    );

    return result.rows[0];
};

// ─── Send message (normal) ───────────────────────────────────────────────────
export const sendMessage = async (conversationId, userId, userMessage) => {
    const history = await getConversationHistory(conversationId);

    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: userMessage },
    ];

    // save user message first
    await saveMessage(conversationId, userId, 'user', userMessage);

    // call AI
    const response = await client.chat.completions.create({ model: MODEL, messages });
    const aiReply = response.choices[0].message.content;

    // save AI reply
    const saved = await saveMessage(conversationId, userId, 'assistant', aiReply);

    logger.info(`AI replied to conversation ${conversationId}`);
    return saved;
};

// ─── Send message (streaming) ────────────────────────────────────────────────
export const sendMessageStream = async (conversationId, userId, userMessage, onChunk) => {
    const history = await getConversationHistory(conversationId);

    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: userMessage },
    ];

    await saveMessage(conversationId, userId, 'user', userMessage);

    const stream = await client.chat.completions.create({
        model: MODEL,
        messages,
        stream: true,
    });

    let fullReply = '';

    for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? '';
        if (text) {
            fullReply += text;
            onChunk(text);
        }
    }

    await saveMessage(conversationId, userId, 'assistant', fullReply);

    logger.info(`Streamed reply to conversation ${conversationId}`);
    return fullReply;
};