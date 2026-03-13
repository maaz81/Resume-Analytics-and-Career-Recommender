import { OpenRouter } from '@openrouter/sdk';
import logger from '../config/logger.js';
import { query } from '../config/db.js';
import PDFDocument from 'pdfkit';

// ✅ OpenRouter client, not OpenAI
const client = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

export const getCareerAdvice = async (systemPrompt, userMessage, history = []) => {
    try {
        const messages = [
            { role: 'system', content: systemPrompt },
            ...history.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: userMessage },
        ];

        const response = await client.chat.send({
            model: 'openai/gpt-oss-120b:free', // ✅ free model
            messages,
        });

        return response.choices[0].message.content;

    } catch (error) {
        logger.error('getCareerAdvice failed', { error });
        throw new Error('Failed to generate career advice');
    }
};

export const sendMessageToAI = async ({ conversationId, userMessage, userId, onChunk }) => {
    try {
        const contextResult = await query(
            `SELECT role, content FROM ai_messages 
             WHERE conversation_id=$1 ORDER BY created_at ASC`,
            [conversationId]
        );

        const messages = [
            ...contextResult.rows.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: userMessage },
        ];

        if (onChunk) {
            // ✅ Streaming
            const stream = await client.chat.send({
                model: 'openai/gpt-oss-120b:free',
                messages,
                stream: true,
            });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) onChunk(content);
            }
            return;
        }

        // ✅ Non-streaming
        const response = await client.chat.send({
            model: 'openai/gpt-oss-120b:free',
            messages,
        });

        return response.choices[0].message.content;

    } catch (error) {
        logger.error('AI service error', { conversationId, error });
        throw new Error('Failed to generate AI response');
    }
};

export const analyzeResume = async (resumeText, jdText) => {
    try {
        const prompt = `
        Evaluate the following resume against this job description.
        Resume: ${resumeText}
        Job Description: ${jdText}

        Provide:
        - Overall match score (0-100)
        - Keyword score (0-100)
        - Missing skills (list)
        - Weak action verbs
        - Recommendations
        Return JSON only.`;

        const response = await client.chat.send({
            model: 'openai/gpt-oss-120b:free',
            messages: [{ role: 'user', content: prompt }],
        });

        const cleaned = response.choices[0].message.content
            .replace(/```json|```/g, '')
            .trim();

        return JSON.parse(cleaned);

    } catch (err) {
        logger.error('Resume analysis failed', { error: err });
        throw new Error('Resume analysis failed');
    }
};

export const exportConversationToPDF = async (conversationId) => {
    try {
        const messagesResult = await query(
            `SELECT role, content, created_at FROM ai_messages 
             WHERE conversation_id=$1 ORDER BY created_at ASC`,
            [conversationId]
        );

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const buffers = [];

            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            doc.fontSize(16).text('Conversation Export', { underline: true }).moveDown();

            messagesResult.rows.forEach((msg) => {
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
        throw new Error('Failed to export conversation to PDF');
    }
};