import OpenAI from 'openai';
import logger from '../config/logger.js';
import { query } from '../config/db.js';
import PDFDocument from 'pdfkit';

const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
        'HTTP-Referer': process.env.APP_URL ?? 'http://localhost:3000',
        'X-Title': process.env.APP_NAME ?? 'CareerApp',
    },
});

const MODEL = 'openai/gpt-oss-120b:free'; // ✅ valid free-tier model on OpenRouter

export const getCareerAdvice = async (systemPrompt, userMessage, history = []) => {
    try {
        const messages = [
            { role: 'system', content: systemPrompt },
            ...history.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: userMessage },
        ];

        const response = await client.chat.completions.create({ model: MODEL, messages }); // ✅ correct method

        return response.choices[0].message.content;
    } catch (error) {
        logger.error('getCareerAdvice failed', { error });
        throw new Error('Failed to generate career advice');
    }
};

export const sendMessageToAI = async ({ conversationId, userMessage, onChunk }) => {
    try {
        const contextResult = await query(
            `SELECT role, content FROM ai_messages
             WHERE conversation_id=$1 ORDER BY created_at ASC`,
            [conversationId]
        );

        const messages = [
            { role: 'system', content: 'You are an expert career advisor. Help the user optimize their career path.' },
            ...contextResult.rows.map(msg => ({ role: msg.role, content: msg.content })),
        ];

        if (onChunk) {
            const stream = await client.chat.completions.create({ model: MODEL, messages, stream: true });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content; // ✅ this was already correct
                if (content) onChunk(content);
            }
            return;
        }

        const response = await client.chat.completions.create({ model: MODEL, messages });
        return response.choices[0].message.content;
    } catch (error) {
        logger.error('AI service error', { conversationId, error });
        throw new Error('Failed to generate AI response');
    }
};

export const analyzeResume = async (resumeText, jdText) => {
    try {
        const prompt = `Evaluate the following resume against this job description.
        Resume: ${resumeText}
        Job Description: ${jdText}

        Provide:
        - Overall match score (0-100)
        - Keyword score (0-100)
        - Missing skills (list)
        - Weak action verbs
        - Recommendations
        Return JSON only.`;

        const response = await client.chat.completions.create({
            model: MODEL,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' }, // ✅ forces JSON output cleanly
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (err) {
        logger.error('Resume analysis failed', { error: err });
        throw new Error('Resume analysis failed');
    }
};

export const exportConversationToPDF = async (conversationId, userId) => { // ✅ added userId param
    try {
        // ✅ auth check: verify this conversation belongs to the requesting user
        const convResult = await query(
            `SELECT user_id FROM ai_conversations WHERE id=$1`,
            [conversationId]
        );
        if (!convResult.rows[0] || convResult.rows[0].user_id !== userId) {
            throw new Error('Forbidden');
        }

        const messagesResult = await query(
            `SELECT role, content, created_at FROM ai_messages
             WHERE conversation_id=$1 ORDER BY created_at ASC`,
            [conversationId]
        );

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const buffers = [];

            doc.on('data', chunk => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            doc.fontSize(16).text('Conversation Export', { underline: true }).moveDown();

            messagesResult.rows.forEach(msg => {
                doc.fontSize(10)
                    .text(`[${msg.role.toUpperCase()}] ${new Date(msg.created_at).toLocaleString()}`)
                    .fontSize(12)
                    .text(msg.content)
                    .moveDown();
            });

            doc.end();
        });
    } catch (err) {
        logger.error('PDF export failed', { conversationId, error: err });
        throw err; // ✅ re-throw original so 'Forbidden' propagates correctly
    }
};