// ============================================
// services/ai.service.js
// ============================================

import OpenAI from 'openai'; // or your preferred AI SDK
import logger from '../config/logger.js';
import { query } from '../config/db.js';
import fs from 'fs';

// Initialize OpenAI client
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Send a message to AI and return the response
 * Supports optional streaming callback
 */
export const sendMessageToAI = async ({ conversationId, userMessage, userId, onChunk }) => {
    try {
        // Optional: retrieve context from previous messages
        const contextResult = await query(
            `SELECT id, role, content FROM ai_messages WHERE conversation_id=$1 ORDER BY created_at ASC`,
            [conversationId]
        );
        const contextMessages = contextResult.rows.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        // Include the latest user message
        contextMessages.push({ role: 'user', content: userMessage });

        // Call OpenAI API (chat completion)
        const response = await client.chat.completions.create({
            model: 'gpt-4',
            messages: contextMessages,
            stream: Boolean(onChunk) // enable streaming if callback provided
        });

        if (onChunk) {
            for await (const event of response) {
                if (event.type === 'delta') {
                    onChunk(event.delta.content);
                }
            }
            return; // streaming handled via callback
        }

        const aiText = response.choices[0].message.content;
        return aiText;

    } catch (error) {
        logger.error('AI service error', { conversationId, error });
        throw new Error('Failed to generate AI response');
    }
};

/**
 * Analyze resume against JD
 */
export const analyzeResume = async (resumeText, jdText) => {
    try {
        // Example AI prompt for scoring
        const prompt = `
        Evaluate the following resume against this job description.
        Resume:
        ${resumeText}
        Job Description:
        ${jdText}

        Provide:
        - Overall match score (0-100)
        - Keyword score (0-100)
        - Missing skills (list)
        - Weak action verbs
        - Recommendations
        Return JSON only.
        `;

        const response = await client.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }]
        });

        const resultText = response.choices[0].message.content;
        return JSON.parse(resultText); // Expect AI to return JSON

    } catch (err) {
        logger.error('Resume analysis failed', { error: err });
        throw new Error('Resume analysis failed');
    }
};

/**
 * Export conversation to PDF
 */
export const exportConversationToPDF = async (conversationId) => {
    try {
        const messagesResult = await query(
            `SELECT role, content, created_at FROM ai_messages WHERE conversation_id=$1 ORDER BY created_at ASC`,
            [conversationId]
        );

        const messages = messagesResult.rows;

        const pdfContent = messages.map(m => `[${m.role}] ${m.created_at.toISOString()}: ${m.content}`).join('\n\n');

        return new Blob([pdfContent], { type: 'application/pdf' });

    } catch (err) {
        logger.error('PDF export failed', { conversationId, error: err });
        throw new Error('Failed to export conversation to PDF');
    }
};