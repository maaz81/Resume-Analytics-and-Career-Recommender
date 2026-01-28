import { query, transaction } from '../config/db.js';

export default class AiConversation {
    /**
     * Find or create conversation
     */
    static async findOrCreate(conversationId, userId, contextSnapshot) {
        if (conversationId) {
            return conversationId;
        }

        const result = await query(
            `INSERT INTO ai_conversations (user_id, context_snapshot)
             VALUES ($1, $2) RETURNING id`,
            [userId, JSON.stringify(contextSnapshot)]
        );
        return result.rows[0].id;
    }

    /**
     * Save message pair (user + assistant)
     */
    static async saveMessagePair(conversationId, userId, userMessage, assistantMessage) {
        return await transaction(async (client) => {
            // Insert messages
            await client.query(
                `INSERT INTO ai_messages (conversation_id, user_id, role, content)
                 VALUES ($1, $2, 'user', $3), ($1, $2, 'assistant', $4)`,
                [conversationId, userId, userMessage, assistantMessage]
            );

            // Update conversation stats
            await client.query(
                `UPDATE ai_conversations 
                 SET message_count = message_count + 2, 
                     last_message_at = NOW(),
                     updated_at = NOW()
                 WHERE id = $1`,
                [conversationId]
            );
        });
    }

    static async getHistory(conversationId, limit = 10) {
        const result = await query(
            `SELECT role, content FROM ai_messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT $2`,
            [conversationId, limit]
        );
        return result.rows.reverse();
    }
}