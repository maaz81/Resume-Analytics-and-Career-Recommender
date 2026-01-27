// ============================================
// middleware/validator.js
// ============================================

import { validationResult } from 'express-validator';
import { validationErrorResponse } from '../utils/response.js';

/**
 * Validation middleware - checks express-validator results
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((err) => ({
            field: err.path || err.param,
            message: err.msg,
            value: err.value,
        }));

        return validationErrorResponse(res, formattedErrors);
    }

    next();
};