// import axios from 'axios';
// import config from '../config/env.js';
// import logger from '../config/logger.js';
// import { errors } from '../middleware/errorHandler.js';

// const AI_BASE_URL = config.ai.baseUrl || 'http://localhost:8000';

// /**
//  * Generic AI call
//  */
// const callAI = async (endpoint, payload) => {
//     try {
//         const response = await axios.post(
//             `${AI_BASE_URL}${endpoint}`,
//             payload,
//             { timeout: config.ai.timeout || 8000 }
//         );

//         return response.data;
//     } catch (error) {
//         logger.error('AI call failed', {
//             endpoint,
//             error: error.message,
//         });

//         if (error.code === 'ECONNREFUSED') {
//             throw errors.serviceUnavailable('AI service unavailable');
//         }

//         throw errors.internalServer('AI processing failed');
//     }
// };

// /**
//  * Resume + JD analysis
//  */
// export const analyzeResume = async (resumeText, jdText) => {
//     return callAI('/analyze', {
//         resume_text: resumeText,
//         jd_text: jdText,
//     });
// };

// /**
//  * Career chatbot
//  */
// export const getCareerAdvice = async (context, message, history = []) => {
//     return callAI('/chat', {
//         context,
//         message,
//         history,
//     });
// };

// /**
//  * Health check
//  */
// export const checkAIHealth = async () => {
//     return axios.get(`${AI_BASE_URL}/health`);
// };


import axios from 'axios';
import config from '../config/env.js';
import logger from '../config/logger.js';
import { errors } from '../middleware/errorHandler.js';

const AI_BASE_URL = config.ai.baseUrl || 'http://localhost:8000';

/**
 * Generic AI call
 */
const callAI = async (endpoint, payload) => {
    try {
        const response = await axios.post(
            `${AI_BASE_URL}${endpoint}`,
            payload,
            { timeout: config.ai.timeout || 8000 }
        );

        return response.data;
    } catch (error) {
        logger.error('AI call failed', {
            endpoint,
            error: error.message,
        });

        if (error.code === 'ECONNREFUSED') {
            throw errors.serviceUnavailable('AI service unavailable');
        }

        throw errors.internalServer('AI processing failed');
    }
};

/**
 * Resume + JD analysis (CORE MVP FEATURE)
 */
export const analyzeResume = async (resumeText, jdText) => {
    return callAI('/analyze', {
        resume_text: resumeText,
        jd_text: jdText,
    });
};

/**
 * Career chatbot
 */
export const getCareerAdvice = async (context, message, history = []) => {
    return callAI('/chat', {
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
