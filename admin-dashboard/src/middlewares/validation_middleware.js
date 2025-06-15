const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/api_response');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 422, errors.array());
    }
    next();
};


module.exports = handleValidationErrors;