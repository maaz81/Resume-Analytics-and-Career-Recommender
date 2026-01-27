// ============================================
// services/ai.service.js - AI Microservices Integration Layer
// ============================================

import axios from 'axios';
import config from '../config/env.js';
import logger, { logAICall } from '../config/logger.js';
import { errors } from '../middleware/errorHandler.js';

// AI service URLs
const AI_SERVICES = {
    parser: config.ai.parserUrl,
    ats: config.ai.atsUrl,
    skills: config.ai.skillsUrl,
    chat: config.ai.chatUrl,
};

/**
 * Call AI microservice with retry logic
 */
export const callAIService = async (service, payload, options = {}) => {
    const serviceUrl = AI_SERVICES[service];

    if (!serviceUrl) {
        throw errors.badRequest(`Unknown AI service: ${service}`);
    }

    const startTime = Date.now();
    const maxRetries = options.retries || 2;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            logger.debug('Calling AI service', {
                service,
                attempt,
                url: serviceUrl,
            });

            const response = await axios.post(
                `${serviceUrl}/process`,
                payload,
                {
                    timeout: config.ai.timeout,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const duration = Date.now() - startTime;
            logAICall(service, duration, true);

            return response.data;

        } catch (error) {
            lastError = error;
            const duration = Date.now() - startTime;

            logger.warn('AI service call failed', {
                service,
                attempt,
                maxRetries,
                duration,
                error: error.message,
            });

            // Don't retry on client errors (4xx)
            if (error.response && error.response.status >= 400 && error.response.status < 500) {
                break;
            }

            // Wait before retry (exponential backoff)
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    // All retries failed
    const duration = Date.now() - startTime;
    logAICall(service, duration, false);

    if (lastError.code === 'ECONNREFUSED') {
        throw errors.serviceUnavailable(`${service} AI service`);
    }

    if (lastError.response) {
        throw errors.internalServer(
            `AI service error: ${lastError.response.data?.message || lastError.message}`
        );
    }

    throw errors.internalServer(`AI service call failed: ${lastError.message}`);
};

/**
 * Parse resume using AI parser service
 */
export const parseResume = async (resumeId, filePath) => {
    return await callAIService('parser', {
        resumeId,
        filePath,
        extractFields: [
            'contact',
            'education',
            'experience',
            'skills',
            'certifications',
            'projects',
        ],
    });
};

/**
 * Calculate ATS score using AI service
 */
export const calculateATSScore = async (resumeText, targetRole) => {
    return await callAIService('ats', {
        resumeText,
        targetRole,
        checkPoints: [
            'formatting',
            'keywords',
            'experience',
            'actionVerbs',
        ],
    });
};

/**
 * Perform skill gap analysis
 */
export const analyzeSkillGap = async (userSkills, targetRole) => {
    return await callAIService('skills', {
        userSkills,
        targetRole,
        analysisType: 'gap',
    });
};

/**
 * Generate learning roadmap
 */
export const generateRoadmap = async (skillGaps, userProfile, durationWeeks = 12) => {
    return await callAIService('skills', {
        skillGaps,
        userProfile,
        durationWeeks,
        type: 'roadmap',
    });
};

/**
 * Get AI career assistant response
 */
export const getCareerAdvice = async (userContext, userMessage, conversationHistory = []) => {
    return await callAIService('chat', {
        context: userContext,
        message: userMessage,
        history: conversationHistory.slice(-10), // Last 10 messages for context
    });
};

/**
 * Health check for AI services
 */
export const checkAIServicesHealth = async () => {
    const healthStatus = {};

    for (const [service, url] of Object.entries(AI_SERVICES)) {
        try {
            const response = await axios.get(`${url}/health`, { timeout: 5000 });
            healthStatus[service] = {
                status: 'healthy',
                latency: response.headers['x-response-time'] || 'N/A',
            };
        } catch (error) {
            healthStatus[service] = {
                status: 'unhealthy',
                error: error.message,
            };
        }
    }

    return healthStatus;
};