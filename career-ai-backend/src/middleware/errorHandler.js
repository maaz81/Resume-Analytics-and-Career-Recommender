// ============================================
// middleware/errorHandler.js
// ============================================

import logger from '../config/logger.js';
import config from '../config/env.js';

// Custom error class
export class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        Error.captureStackTrace(this, this.constructor);
    }
}

// Not found handler
export const notFound = (req, res, next) => {
    const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
    next(error);
};

// Global error handler
export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error
    logger.error('Error Handler', {
        message: err.message,
        statusCode: err.statusCode,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        userId: req.user?.id,
    });

    // Development error response (detailed)
    if (config.env === 'development') {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }

    // Production error response (sanitized)

    // Operational errors (trusted errors)
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }

    // Programming or unknown errors (don't leak details)
    logger.error('CRITICAL ERROR', err);

    return res.status(500).json({
        status: 'error',
        message: 'Something went wrong. Please try again later.',
    });
};

// Async error wrapper
export const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Common error generators
export const errors = {
    notFound: (resource = 'Resource') => {
        return new AppError(`${resource} not found`, 404);
    },

    badRequest: (message = 'Bad request') => {
        return new AppError(message, 400);
    },

    unauthorized: (message = 'Unauthorized access') => {
        return new AppError(message, 401);
    },

    forbidden: (message = 'Access forbidden') => {
        return new AppError(message, 403);
    },

    conflict: (message = 'Resource already exists') => {
        return new AppError(message, 409);
    },

    unprocessable: (message = 'Unprocessable entity') => {
        return new AppError(message, 422);
    },

    tooManyRequests: (message = 'Too many requests') => {
        return new AppError(message, 429);
    },

    internalServer: (message = 'Internal server error') => {
        return new AppError(message, 500, false);
    },

    serviceUnavailable: (service = 'Service') => {
        return new AppError(`${service} is currently unavailable`, 503, false);
    },
};