const userService = require('../services/user_service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/api_response');
const { body, param, query } = require('express-validator'); // Thêm query
const handleValidationErrors = require('../middlewares/validation_middleware');

// Validation rules cho tạo người dùng
const createUserValidationRules = () => [
    body('ten_dang_nhap')
        .notEmpty().withMessage('Tên đăng nhập không được để trống.')
        .isLength({ min: 3, max: 50 }).withMessage('Tên đăng nhập phải từ 3 đến 50 ký tự.')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới.'),
    body('email_dang_nhap')
        .notEmpty().withMessage('Email không được để trống.')
        .isEmail().withMessage('Email không hợp lệ.'),
    body('mat_khau')
        .notEmpty().withMessage('Mật khẩu không được để trống.')
        .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự.'),
    body('confirm_mat_khau') // Thêm confirm password
        .notEmpty().withMessage('Xác nhận mật khẩu không được để trống.')
        .custom((value, { req }) => {
            if (value !== req.body.mat_khau) {
                throw new Error('Mật khẩu xác nhận không khớp.');
            }
            return true;
        }),
    body('vai_tro').optional().isIn(['admin', 'user', 'editor']).withMessage('Vai trò không hợp lệ (admin, user, editor).'),
    body('dang_hoat_dong').optional().isBoolean().withMessage('Trạng thái hoạt động phải là true hoặc false (hoặc 0, 1).').toBoolean()
];

// Validation rules cho cập nhật người dùng
const updateUserValidationRules = () => [
    param('id_nguoi_dung').isInt({ min: 1 }).withMessage('ID người dùng không hợp lệ.'),
    body('ten_dang_nhap')
        .optional()
        .isLength({ min: 3, max: 50 }).withMessage('Tên đăng nhập phải từ 3 đến 50 ký tự.')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới.'),
    body('email_dang_nhap').optional().isEmail().withMessage('Email không hợp lệ.'),
    body('mat_khau').optional().isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự.'),
    body('vai_tro').optional().isIn(['admin', 'user', 'editor']).withMessage('Vai trò không hợp lệ.'),
    body('dang_hoat_dong').optional().isBoolean().withMessage('Trạng thái hoạt động phải là true hoặc false (hoặc 0, 1).').toBoolean()
];

// Validation cho query params của getAllUsers
const getAllUsersQueryValidationRules = () => [
    query('page').optional().isInt({ min: 1 }).withMessage('Số trang phải là số nguyên dương.').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Giới hạn số lượng từ 1 đến 100.').toInt(),
    query('sortBy').optional().isIn(['ten_dang_nhap', 'ngay_tao', 'vai_tro', 'email_dang_nhap']).withMessage('Sắp xếp theo trường không hợp lệ.'),
    query('order').optional().isIn(['ASC', 'DESC']).withMessage('Thứ tự sắp xếp không hợp lệ (ASC, DESC).')
];

const createUser = async (req, res, next) => {
    try {
        const newUser = await userService.createUser(req.body, req.file); // req.file từ multer
        return successResponse(res, 'Tạo người dùng thành công.', newUser, 201);
    } catch (error) {
        next(error);
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const { page, limit, searchTerm, sortBy, order } = req.query;
        const filters = { searchTerm, sortBy, order };
        const paginationOptions = { page, limit };
        const result = await userService.getAllUsers(filters, paginationOptions);
        return paginatedResponse(res, 'Lấy danh sách người dùng thành công.', result.users, result.pagination);
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.id_nguoi_dung);
        return successResponse(res, 'Lấy thông tin người dùng thành công.', user);
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const result = await userService.updateUser(req.params.id_nguoi_dung, req.body, req.file);
        return successResponse(res, result.message);
    } catch (error) {
        next(error);
    }
};

const deleteUser = async (req, res, next) => { // Sẽ là soft delete
    try {
        const result = await userService.softDeleteUser(req.params.id_nguoi_dung);
        return successResponse(res, result.message);
    } catch (error) {
        next(error);
    }
};

const changeUserStatus = async (req, res, next) => {
    try {
        const { dang_hoat_dong } = req.body; // Mong đợi true/false hoặc 1/0
        if (dang_hoat_dong === undefined) {
            return errorResponse(res, 'Trạng thái hoạt động là bắt buộc.', 400);
        }
        const result = await userService.changeUserStatus(req.params.id_nguoi_dung, dang_hoat_dong);
        return successResponse(res, result.message);
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { new_password } = req.body;
        if (!new_password || new_password.length < 6) {
             return errorResponse(res, 'Mật khẩu mới phải có ít nhất 6 ký tự.', 400);
        }
        const result = await userService.resetPassword(req.params.id_nguoi_dung, new_password);
        return successResponse(res, result.message);
    } catch (error) {
        next(error);
    }
};


module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    changeUserStatus,
    resetPassword,
    createUserValidationRules,
    updateUserValidationRules,
    getAllUsersQueryValidationRules
};