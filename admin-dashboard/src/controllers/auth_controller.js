const authService = require('../services/auth_service');
const { successResponse, errorResponse } = require('../utils/api_response');
const { body } = require('express-validator');
// const handleValidationErrors = require('../middlewares/validation_middleware'); // Đã dùng ở routes

const loginValidationRules = () => [
    body('loginIdentifier').notEmpty().withMessage('Tên đăng nhập hoặc email không được để trống.'),
    body('mat_khau').notEmpty().withMessage('Mật khẩu không được để trống.')
];

const AuthController = {
    login: async (req, res, next) => {
        try {
            const { loginIdentifier, mat_khau } = req.body;
            const result = await authService.login(loginIdentifier, mat_khau);
            return successResponse(res, 'Đăng nhập thành công.', result);
        } catch (error) {
            next(error);
        }
    }
    // Thêm các phương thức khác của AuthController nếu có, ví dụ: register, logout, refreshToken...
};

module.exports = {
    ...AuthController,
    loginValidationRules
};