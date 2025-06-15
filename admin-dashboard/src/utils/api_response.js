// File: src/utils/api_response.js

const successResponse = (res, message, data = null, statusCode = 200) => {
    const response = {
        success: true,
        message: message,
    };
    if (data) {
        response.data = data;
    }
    return res.status(statusCode).json(response);
};

const errorResponse = (res, message, statusCode = 500, errors = null) => {
    const response = {
        success: false,
        message: message,
    };
    if (errors) {
        response.errors = errors;
    }
    return res.status(statusCode).json(response);
};

// The original paginatedResponse for backward compatibility
const paginatedResponse = (res, message, data, pagination, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data: data || [],
        pagination
    });
};

// A new function for the object-style parameters
const paginatedResponseObj = (options) => {
    const {
        res,
        message,
        data,
        currentPage,
        totalCount,
        limit,
        statusCode = 200
    } = options;

    return res.status(statusCode).json({
        success: true,
        message,
        data: data || [],
        pagination: {
            currentPage,
            totalPages: Math.ceil(totalCount / limit),
            totalItems: totalCount,
            limit
        }
    });
};

module.exports = {
    successResponse,
    errorResponse,
    paginatedResponse,
    paginatedResponseObj,
    // Other exports...
};