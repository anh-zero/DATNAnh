const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/api_response');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        return res.status(401).json({ message: 'Không có quyền truy cập (không có token).' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token đã hết hạn.' });
            }
            return res.status(403).json({ message: 'Token không hợp lệ.' });
        }
        req.user = decoded; // Gắn thông tin người dùng đã giải mã vào request
        next();
    });
};

const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.vai_tro) {
            return res.status(403).json({ message: 'Không có quyền truy cập (không tìm thấy vai trò người dùng).' });
        }

        const hasRole = allowedRoles.includes(req.user.vai_tro);
        if (hasRole) {
            next(); // Người dùng có vai trò phù hợp, cho phép tiếp tục
        } else {
            res.status(403).json({ message: `Không có quyền truy cập. Vai trò '${req.user.vai_tro}' không được phép.` });
        }
    };
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.vai_tro === 'admin') {
        next();
    } else {
        if (!req.user || !req.user.vai_tro) {
            return res.status(403).json({ message: 'Không có quyền truy cập (không tìm thấy vai trò người dùng cho kiểm tra admin).' });
        }
        res.status(403).json({ message: 'Không có quyền truy cập (yêu cầu quyền admin).' });
    }
};

module.exports = {
    authenticateToken,
    authorizeRole,
    isAdmin
};