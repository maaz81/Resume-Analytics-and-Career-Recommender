import axios from 'axios';
import config from '../config/env.js';
import logger from '../config/logger.js';
import { errors } from '../middleware/errorHandler.js';

// ML service runs as a single FastAPI service on Render.
// Use ML_SERVICE_URL env var (set in Render dashboard), fallback to localhost for local dev.
const AI_BASE_URL = process.env.ML_SERVICE_URL || config.ai.parserUrl || 'http://localhost:8000';

logger.info(`[AI SERVICE] Using ML backend: ${AI_BASE_URL}`);

/**
 * Generic AI call
 */
export const callAIService = async (endpoint, payload) => {
    try {
        const urlPart = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const response = await axios.post(
            `${AI_BASE_URL}${urlPart}`,
            payload,
            { timeout: config.ai.timeout || 30000 }
        );

        return response.data;
    } catch (error) {
        logger.error('AI call failed', {
            endpoint,
            url: `${AI_BASE_URL}${endpoint}`,
            error: error.message,
            code: error.code,
        });

        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            throw errors.serviceUnavailable('AI service unavailable');
        }

        throw errors.internalServer('AI processing failed');
    }
};

/**
 * Resume + JD analysis (CORE MVP FEATURE)
 */
export const analyzeResume = async (resumeText, jdText) => {
    return callAIService('/analyze', {
        resume_text: resumeText,
        jd_text: jdText,
    });
};

/**
 * Calculate ATS score for a resume
 */
export const calculateATSScore = async (text, role = 'Software Engineer') => {
    return callAIService('/analyze', {
        resume_text: text,
        jd_text: role
    });
};

/**
 * Perform skill gap analysis
 */
export const analyzeSkillGap = async (userData, targetRole) => {
    return callAIService('/analyze', {
        resume_text: JSON.stringify(userData.skills),
        jd_text: targetRole,
    });
};

/**
 * Career chatbot
 */
export const getCareerAdvice = async (context, message, history = []) => {
    return callAIService('/chat', {
        context,
        message,
        history,
    });
};

/**
 * Health check
 */
export const checkAIHealth = async () => {
    return axios.get(`${AI_BASE_URL}/health`);
};
