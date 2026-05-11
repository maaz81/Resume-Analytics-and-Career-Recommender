// ============================================
// services/llm.service.js
// ============================================

import axios from 'axios';
import config from '../config/env.js';
import logger from '../config/logger.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Pull from your existing env pattern — add OPENROUTER_API_KEY to your .env
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Free/cheap model that's great at structured text generation.
// Swap to 'openai/gpt-4o' or 'anthropic/claude-3-haiku' if you prefer.
const DEFAULT_MODEL = 'openai/gpt-oss-120b:free';

// ─────────────────────────────────────────────
// CORE — raw OpenRouter call
// ─────────────────────────────────────────────
export const callOpenRouter = async (messages, model = DEFAULT_MODEL) => {
    if (!OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY is not set in environment variables');
    }

    const response = await axios.post(
        OPENROUTER_URL,
        {
            model,
            messages,
            max_tokens: 1200,
            temperature: 0.7,
        },
        {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                // OpenRouter asks for these for rate-limit attribution
                'HTTP-Referer': process.env.APP_URL ?? 'http://localhost:3000',
                'X-Title': 'Career AI Resume Analyzer',
            },
            timeout: 30_000,
        }
    );

    return response.data.choices[0]?.message?.content ?? '';
};


// ─────────────────────────────────────────────
// PUBLIC — generate a full JD from a role title
//          + resume context
// ─────────────────────────────────────────────

/**
 * Generates a professional, realistic job description tailored to
 * `targetRole`, using the candidate's resume to surface relevant
 * advanced skills and context.
 *
 * @param {string} targetRole  - e.g. "Senior Frontend Engineer"
 * @param {string} resumeText  - raw text extracted from the candidate's PDF
 * @returns {Promise<string>}  - the generated JD (plain text, ~400-800 words)
 */
export const generateAutoJobDescription = async (targetRole, resumeText) => {
    logger.info('[LLM] Generating auto JD', { targetRole });

    // We trim the resume to avoid blowing the context window on large PDFs.
    // 3000 chars ≈ ~750 tokens — enough for skills + experience signal.
    const resumeSnippet = resumeText?.trim().slice(0, 3000) ?? '';

    const systemPrompt = `You are an expert technical recruiter. 
Your job is to write realistic, detailed job descriptions for tech roles.
Always return ONLY the job description text — no preamble, no commentary, no markdown headers.
The JD should be 400-700 words and include: role overview, responsibilities (6-8 bullet points), required skills, and nice-to-have skills.`;

    const userPrompt = `Write a professional job description for the role: "${targetRole}".

Use the following candidate resume as context to identify relevant advanced and modern skills 
that should appear in the JD (do NOT mention the candidate — only use the resume to inform 
which technologies and domain knowledge are relevant to include in the requirements):

--- RESUME CONTEXT ---
${resumeSnippet}
--- END RESUME ---

Generate a realistic job description that a top tech company would post for this role.
Emphasize current industry-standard tools and practices relevant to "${targetRole}".`;

    const generatedJD = await callOpenRouter([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
    ]);

    logger.info('[LLM] Auto JD generated successfully', {
        targetRole,
        outputLength: generatedJD.length,
    });

    return generatedJD.trim();
};