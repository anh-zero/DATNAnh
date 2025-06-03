const { errorResponse } = require('../utils/api_response');

const errorHandler = (err, req, res, next) => {
    console.error("Global Error Handler:", err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'An unexpected error occurred on the server.';

    return errorResponse(res, message, statusCode, err.errors || null);
};

module.exports = errorHandler;