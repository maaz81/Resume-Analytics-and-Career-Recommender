// ============================================
// config/logger.js - Centralized Logging
// ============================================

import winston from 'winston';
import config from './env.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Console format (for development)
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`;
        }
        return msg;
    })
);

// Create logger
const logger = winston.createLogger({
    level: config.logging.level,
    format: logFormat,
    defaultMeta: { service: 'career-ai-backend' },
    transports: [
        // Write all logs to file
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
});

// Add console transport (always, so we can see logs in Render)
logger.add(
    new winston.transports.Console({
        format: consoleFormat,
    })
);

// Create logs directory if it doesn't exist
import fs from 'fs';
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Helper functions for structured logging
export const logRequest = (req) => {
    logger.info('HTTP Request', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.user?.id,
    });
};

export const logResponse = (req, res, duration) => {
    logger.info('HTTP Response', {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userId: req.user?.id,
    });
};

export const logError = (error, req = null) => {
    const errorLog = {
        message: error.message,
        stack: error.stack,
        code: error.code,
    };

    if (req) {
        errorLog.method = req.method;
        errorLog.url = req.originalUrl;
        errorLog.userId = req.user?.id;
    }

    logger.error('Application Error', errorLog);
};

export const logAICall = (service, duration, success = true) => {
    logger.info('AI Service Call', {
        service,
        duration: `${duration}ms`,
        success,
    });
};

export const logDatabaseQuery = (query, duration, rowCount) => {
    logger.debug('Database Query', {
        query: query.substring(0, 100),
        duration: `${duration}ms`,
        rowCount,
    });
};

export default logger;