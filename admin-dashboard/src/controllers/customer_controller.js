const customerService = require('../services/customer_service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/api_response');
const { body, param, query } = require('express-validator');
const handleValidationErrors = require('../middlewares/validation_middleware');

// Validation rules cho tạo khách hàng
const createCustomerValidationRules = () => [
    body('ho_ten').notEmpty().withMessage('Họ tên khách hàng không được để trống.')
        .isLength({ max: 100 }).withMessage('Họ tên không được vượt quá 100 ký tự.'),
    body('email_lien_he').notEmpty().withMessage('Email liên hệ không được để trống.')
        .isEmail().withMessage('Email liên hệ không hợp lệ.')
        .isLength({ max: 100 }).withMessage('Email không được vượt quá 100 ký tự.'),
    body('so_dien_thoai').notEmpty().withMessage('Số điện thoại không được để trống.')
        .isLength({ min: 10, max: 20 }).withMessage('Số điện thoại phải từ 10 đến 20 ký tự.')
        .matches(/^[0-9+()-.\s]+$/).withMessage('Số điện thoại không hợp lệ.'), // Cho phép số, +, -, (, ), ., dấu cách
    body('cccd').optional({ checkFalsy: true }) // Cho phép null hoặc chuỗi rỗng
        .isLength({ min: 9, max: 20 }).withMessage('CCCD phải từ 9 đến 20 ký tự.')
        .matches(/^[0-9]+$/).withMessage('CCCD chỉ được chứa số.'),
    body('ngay_sinh').optional({ checkFalsy: true })
        .isISO8601().withMessage('Ngày sinh không hợp lệ (YYYY-MM-DD).')
        .toDate(), // Chuyển thành đối tượng Date
    body('dia_chi_kh').optional({ checkFalsy: true })
        .isLength({ max: 255 }).withMessage('Địa chỉ không được vượt quá 255 ký tự.'),
    body('id_nguoi_dung').optional({ checkFalsy: true })
        .isInt({ min: 1 }).withMessage('ID người dùng liên kết không hợp lệ.')
];

// Validation rules cho cập nhật khách hàng
const updateCustomerValidationRules = () => [
    param('id_khach_hang').isInt({ min: 1 }).withMessage('ID khách hàng không hợp lệ.'),
    body('ho_ten').optional().notEmpty().withMessage('Họ tên khách hàng không được để trống.')
        .isLength({ max: 100 }).withMessage('Họ tên không được vượt quá 100 ký tự.'),
    body('email_lien_he').optional().isEmail().withMessage('Email liên hệ không hợp lệ.')
        .isLength({ max: 100 }).withMessage('Email không được vượt quá 100 ký tự.'),
    body('so_dien_thoai').optional().notEmpty().withMessage('Số điện thoại không được để trống.')
        .isLength({ min: 10, max: 20 }).withMessage('Số điện thoại phải từ 10 đến 20 ký tự.')
        .matches(/^[0-9+()-.\s]+$/).withMessage('Số điện thoại không hợp lệ.'),
    body('cccd').optional({ checkFalsy: true })
        .isLength({ min: 9, max: 20 }).withMessage('CCCD phải từ 9 đến 20 ký tự.')
        .matches(/^[0-9]+$/).withMessage('CCCD chỉ được chứa số.'),
    body('ngay_sinh').optional({ checkFalsy: true })
        .isISO8601().withMessage('Ngày sinh không hợp lệ (YYYY-MM-DD).')
        .toDate(),
    body('dia_chi_kh').optional({ checkFalsy: true })
        .isLength({ max: 255 }).withMessage('Địa chỉ không được vượt quá 255 ký tự.'),
    body('id_nguoi_dung').optional({ checkFalsy: true }) // Cho phép gửi chuỗi rỗng để xóa liên kết
        .custom((value) => {
            if (value === '' || value === null || (typeof value === 'number' && value >= 1)) {
                return true;
            }
            throw new Error('ID người dùng liên kết không hợp lệ.');
        }).toInt({ optional: true }) // Chuyển thành int nếu là số
];

const getAllCustomersQueryValidationRules = () => [
    query('page').optional().isInt({ min: 1 }).withMessage('Số trang phải là số nguyên dương.').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Giới hạn số lượng từ 1 đến 100.').toInt(),
    query('sortBy').optional().isIn(['ho_ten', 'ngay_tao', 'email_lien_he', 'so_dien_thoai']).withMessage('Sắp xếp theo trường không hợp lệ.'),
    query('order').optional().isIn(['ASC', 'DESC']).withMessage('Thứ tự sắp xếp không hợp lệ (ASC, DESC).')
];


const createCustomer = async (req, res, next) => {
    try {
        const newCustomer = await customerService.createCustomer(req.body);
        return successResponse(res, 'Tạo khách hàng thành công.', newCustomer, 201);
    } catch (error) {
        next(error);
    }
};

const getAllCustomers = async (req, res, next) => {
    try {
        const { page, limit, searchTerm, sortBy, order } = req.query;
        const filters = { searchTerm, sortBy, order };
        const paginationOptions = { page, limit };
        const result = await customerService.getAllCustomers(filters, paginationOptions);
        return paginatedResponse(res, 'Lấy danh sách khách hàng thành công.', result.customers, result.pagination);
    } catch (error) {
        next(error);
    }
};

const getCustomerById = async (req, res, next) => {
    try {
        const customer = await customerService.getCustomerById(req.params.id_khach_hang);
        return successResponse(res, 'Lấy thông tin khách hàng thành công.', customer);
    } catch (error) {
        next(error);
    }
};

const updateCustomer = async (req, res, next) => {
    try {
        const result = await customerService.updateCustomer(req.params.id_khach_hang, req.body);
        return successResponse(res, result.message);
    } catch (error) {
        next(error);
    }
};

const deleteCustomer = async (req, res, next) => {
    try {
        const result = await customerService.deleteCustomer(req.params.id_khach_hang);
        return successResponse(res, result.message);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    createCustomerValidationRules,
    updateCustomerValidationRules,
    getAllCustomersQueryValidationRules
};