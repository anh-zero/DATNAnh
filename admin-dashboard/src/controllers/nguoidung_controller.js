const userService = require('../services/nguoidung_service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/api_response');
const { body, param, query } = require('express-validator');
// const handleValidationErrors = require('../middlewares/validation_middleware'); // Đã được dùng ở routes

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
    body('confirm_mat_khau')
        .notEmpty().withMessage('Xác nhận mật khẩu không được để trống.')
        .custom((value, { req }) => {
            if (value !== req.body.mat_khau) {
                throw new Error('Mật khẩu xác nhận không khớp.');
            }
            return true;
        }),
    body('vai_tro').optional().isIn(['admin', 'user'/*, 'editor'*/]).withMessage('Vai trò không hợp lệ (admin, user).'), // Cập nhật lại vai trò
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
    body('vai_tro').optional().isIn(['admin', 'user'/*, 'editor'*/]).withMessage('Vai trò không hợp lệ.'), // Cập nhật lại vai trò
    body('dang_hoat_dong').optional().isBoolean().withMessage('Trạng thái hoạt động phải là true hoặc false (hoặc 0, 1).').toBoolean()
];

// Validation cho query params của getAllUsers
const getAllUsersQueryValidationRules = () => [
    query('page').optional().isInt({ min: 1 }).withMessage('Số trang phải là số nguyên dương.').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Giới hạn số lượng từ 1 đến 100.').toInt(),
    query('searchTerm').optional().isString().trim().withMessage('Từ khóa tìm kiếm phải là chuỗi.'),
    query('role').optional().isIn(['admin', 'user']).withMessage('Vai trò tìm kiếm không hợp lệ.'),
    query('status').optional().isIn(['active', 'inactive', 'any']).withMessage('Trạng thái tìm kiếm không hợp lệ (active, inactive, any).')
];

const NguoiDungController = {
    createUser: async (req, res, next) => {
        try {
            const newUser = await userService.createUser(req.body, req.file); // req.file từ uploadMiddleware
            return successResponse(res, 'Tạo người dùng thành công.', newUser, 201);
        } catch (error) {
            next(error);
        }
    },

    getAllUsers: async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const filters = {
                searchTerm: req.query.search || '',
                sortBy: req.query.sortBy || 'ngay_tao',
                order: req.query.order || 'DESC'
            };

            const pagination = {
                page,
                limit
            };

            // Đảm bảo trả về đúng cấu trúc JSON cho client
            const result = await userService.getAllUsers(filters, pagination);

            res.status(200).json({
                success: true,
                message: "Lấy danh sách người dùng thành công.",
                data: result.data,
                pagination: {
                    currentPage: pagination.page,
                    totalPages: Math.ceil(result.pagination.totalItems / pagination.limit),
                    totalItems: result.pagination.totalItems,
                    limit: pagination.limit
                }
            });

        } catch (error) {
            next(error);
        }
    },

    getUserById: async (req, res, next) => {
        try {
            const user = await userService.getUserById(req.params.id_nguoi_dung);
            return successResponse(res, 'Lấy thông tin người dùng thành công.', user);
        } catch (error) {
            next(error);
        }
    },

    updateUser: async (req, res, next) => {
        try {
            const result = await userService.updateUser(req.params.id_nguoi_dung, req.body, req.file);
            return successResponse(res, result.message, result.user);  // Thêm dữ liệu người dùng vào response
        } catch (error) {
            next(error);
        }
    },

    deleteUser: async (req, res, next) => {
        try {
            const result = await userService.deleteUser(req.params.id_nguoi_dung); // Service sẽ quyết định soft hay hard delete
            return successResponse(res, result.message);
        } catch (error) {
            next(error);
        }
    },

    changeUserStatus: async (req, res, next) => {
        try {
            const { dang_hoat_dong } = req.body;
            if (dang_hoat_dong === undefined) {
                return errorResponse(res, 'Trạng thái hoạt động là bắt buộc.', 400);
            }
            const result = await userService.updateUserStatus(req.params.id_nguoi_dung, dang_hoat_dong);
            return successResponse(res, result.message);
        } catch (error) {
            next(error);
        }
    },

    resetPassword: async (req, res, next) => {
        try {
            const { new_password } = req.body;
            if (!new_password) {
                return errorResponse(res, 'Mật khẩu mới là bắt buộc.', 400);
            }
            const result = await userService.resetPassword(req.params.id_nguoi_dung, new_password);
            return successResponse(res, result.message);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = {
    ...NguoiDungController,
    createUserValidationRules,
    updateUserValidationRules,
    getAllUsersQueryValidationRules
};