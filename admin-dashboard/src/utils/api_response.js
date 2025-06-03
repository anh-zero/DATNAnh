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

const paginatedResponse = (res, message, data, pagination, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        pagination
    });
};


module.exports = {
    successResponse,
    errorResponse,
    paginatedResponse
};