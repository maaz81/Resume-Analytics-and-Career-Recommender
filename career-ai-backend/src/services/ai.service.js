import axios from 'axios';
import config from '../config/env.js';
import logger from '../config/logger.js';
import { errors } from '../middleware/errorHandler.js';

// ML service runs as a single FastAPI service on Render.
// ML_SERVICE_URL env var (set in Render dashboard), fallback to localhost for local dev.
const AI_BASE_URL = process.env.ML_SERVICE_URL || config.ai.parserUrl || 'http://localhost:8000';

// Timeout: respect ML_SERVICE_TIMEOUT_MS env var, then config, then 60 s default.
// Render free tier cold-starts can take 30-50 s.
const AI_TIMEOUT = parseInt(process.env.ML_SERVICE_TIMEOUT_MS, 10)
    || config.ai.timeout
    || 60000;

logger.info(`[AI SERVICE] Using ML backend: ${AI_BASE_URL} (timeout: ${AI_TIMEOUT}ms)`);

/**
 * Generic AI call — wraps every ML endpoint uniformly.
 *
 * Error strategy:
 *   - 422 Unprocessable Entity → log the Python detail + field errors, throw badRequest
 *   - 4xx (other)              → throw badRequest with ML message
 *   - 5xx                      → throw serviceUnavailable
 *   - ECONNREFUSED / ENOTFOUND → throw serviceUnavailable (ML service down)
 *   - timeout                  → throw serviceUnavailable
 */
export const callAIService = async (endpoint, payload) => {
    const urlPart = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = `${AI_BASE_URL}${urlPart}`;

    try {
        const response = await axios.post(fullUrl, payload, {
            timeout: AI_TIMEOUT,
            headers: { 'Content-Type': 'application/json' },
        });

        return response.data;

    } catch (error) {
        // ── Capture ML error body before discarding ──────────────────────
        const status   = error.response?.status;
        const mlBody   = error.response?.data;
        const mlDetail = typeof mlBody === 'object'
            ? JSON.stringify(mlBody)
            : String(mlBody ?? '');

        logger.error('AI call failed', {
            endpoint,
            url:      fullUrl,
            status,
            error:    error.message,
            code:     error.code,
            mlDetail: mlDetail.substring(0, 500),  // truncate to avoid log bloat
        });

        // ── 422: Pydantic validation error — surface the actual problem ───
        if (status === 422) {
            const detail = mlBody?.detail;
            let humanMsg = 'ML service rejected the request (422).';

            if (Array.isArray(detail) && detail.length > 0) {
                // Pydantic V2 format: [{ loc, msg, type }]
                const first = detail[0];
                humanMsg = `ML validation error at ${first.loc?.join('.')}: ${first.msg}`;
            } else if (typeof detail === 'string') {
                humanMsg = `ML validation error: ${detail}`;
            }

            logger.error('[AI 422] ' + humanMsg, { payload: JSON.stringify(payload).substring(0, 300) });
            throw errors.badRequest(humanMsg);
        }

        // ── 4xx ───────────────────────────────────────────────────────────
        if (status && status >= 400 && status < 500) {
            throw errors.badRequest(mlDetail || 'AI service returned a client error');
        }

        // ── Network / timeout ─────────────────────────────────────────────
        if (
            error.code === 'ECONNREFUSED' ||
            error.code === 'ENOTFOUND'    ||
            error.code === 'ECONNABORTED' ||
            error.code === 'ETIMEDOUT'
        ) {
            throw errors.serviceUnavailable('AI service');
        }

        // ── 5xx or unknown ────────────────────────────────────────────────
        throw errors.internalServer('AI processing failed');
    }
};

/**
 * Resume + JD analysis  (core MVP feature)
 *
 * Payload contract with Python /analyze:
 *   { resume_text: string, jd_text: string }
 *
 * Guards both fields here so we never send null/undefined to FastAPI
 * (which would cause a 422 Pydantic validation error).
 */
export const analyzeResume = async (resumeText, jdText) => {
    if (!resumeText?.trim()) {
        throw new Error('analyzeResume called with empty resume_text — refusing to call ML service');
    }
    if (!jdText?.trim()) {
        throw new Error('analyzeResume called with empty jd_text — refusing to call ML service');
    }

    return callAIService('/analyze', {
        resume_text: resumeText,
        jd_text:     jdText,
    });
};

/**
 * Calculate ATS score for a resume
 */
export const calculateATSScore = async (text, role = 'Software Engineer') => {
    return callAIService('/analyze', {
        resume_text: text,
        jd_text:     role,
    });
};

/**
 * Perform skill gap analysis
 */
export const analyzeSkillGap = async (userData, targetRole) => {
    return callAIService('/analyze', {
        resume_text: JSON.stringify(userData.skills),
        jd_text:     targetRole,
    });
};

/**
 * Career chatbot
 */
export const getCareerAdvice = async (context, message, history = []) => {
    return callAIService('/chat', { context, message, history });
};

/**
 * Health check
 */
export const checkAIHealth = async () => {
    return axios.get(`${AI_BASE_URL}/health`, { timeout: 10000 });
};
