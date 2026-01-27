// ============================================
// utils/response.js - Standardized API Responses
// ============================================

/**
 * Success response
 */
export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        status: 'success',
        message,
        data,
    });
};

/**
 * Created response (201)
 */
export const createdResponse = (res, data, message = 'Resource created successfully') => {
    return res.status(201).json({
        status: 'success',
        message,
        data,
    });
};

/**
 * No content response (204)
 */
export const noContentResponse = (res) => {
    return res.status(204).send();
};

/**
 * Paginated response
 */
export const paginatedResponse = (res, data, pagination, message = 'Success') => {
    return res.status(200).json({
        status: 'success',
        message,
        data,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            totalPages: pagination.totalPages,
            totalItems: pagination.totalItems,
            hasNext: pagination.hasNext,
            hasPrev: pagination.hasPrev,
        },
    });
};

/**
 * Error response
 */
export const errorResponse = (res, message, statusCode = 500, errors = null) => {
    const response = {
        status: 'error',
        message,
    };

    if (errors) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

/**
 * Validation error response
 */
export const validationErrorResponse = (res, errors) => {
    return res.status(422).json({
        status: 'error',
        message: 'Validation failed',
        errors,
    });
};