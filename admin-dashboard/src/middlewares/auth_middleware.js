const { verifyToken } = require('../utils/jwt_utils');
const { errorResponse } = require('../utils/api_response');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return errorResponse(res, 'Access token is missing', 401);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return errorResponse(res, 'Invalid or expired token', 403);
    }

    req.user = decoded;
    next();
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.vai_tro === 'admin') {
        next();
    } else {
        return errorResponse(res, 'Forbidden: Admin access required', 403);
    }
};

module.exports = {
    authenticateToken,
    isAdmin
};