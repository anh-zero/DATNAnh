const customerService = require('../services/khachhang_service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/api_response');
const { body, param, query } = require('express-validator');
// const handleValidationErrors = require('../middlewares/validation_middleware'); // Đã được dùng ở routes

// Validation rules cho tạo khách hàng
const createCustomerValidationRules = () => [
    body('ho_ten') // Đổi từ ten_khach_hang sang ho_ten để khớp với model
        .notEmpty().withMessage('Tên khách hàng không được để trống.')
        .isString().withMessage('Tên khách hàng phải là chuỗi.')
        .isLength({ min: 2, max: 100 }).withMessage('Tên khách hàng phải từ 2 đến 100 ký tự.'),
    body('email_lien_he') // Đổi từ email sang email_lien_he để khớp với model
        .notEmpty().withMessage('Email không được để trống.')
        .isEmail().withMessage('Email không hợp lệ.')
        .custom(async (email_lien_he) => { // Kiểm tra email duy nhất
            const existingCustomer = await customerService.findCustomerByEmail(email_lien_he);
            if (existingCustomer) {
                return Promise.reject('Email này đã được sử dụng.');
            }
        }),
    body('so_dien_thoai')
        .notEmpty().withMessage('Số điện thoại không được để trống.')
        .isString().withMessage('Số điện thoại phải là chuỗi.')
        .matches(/^\d{10,11}$/).withMessage('Số điện thoại không hợp lệ (10-11 chữ số).'),
    body('dia_chi_kh').optional().isString().withMessage('Địa chỉ phải là chuỗi.'), // Đổi từ dia_chi sang dia_chi_kh
    body('cccd').optional().isString().withMessage('CCCD phải là chuỗi.'), // Thêm validation cho cccd
    body('ngay_sinh').optional().isISO8601().toDate().withMessage('Ngày sinh không hợp lệ.'),
    body('id_nguoi_dung').optional().isInt().withMessage('ID người dùng phải là số nguyên.') // Thêm validation cho id_nguoi_dung
];

// Validation rules cho cập nhật khách hàng
const updateCustomerValidationRules = () => [
    param('id_khach_hang').isInt({ min: 1 }).withMessage('ID khách hàng không hợp lệ.'),
    body('ho_ten') // Đổi từ ten_khach_hang sang ho_ten
        .optional()
        .isString().withMessage('Tên khách hàng phải là chuỗi.')
        .isLength({ min: 2, max: 100 }).withMessage('Tên khách hàng phải từ 2 đến 100 ký tự.'),
    body('email_lien_he') // Đổi từ email sang email_lien_he
        .optional()
        .isEmail().withMessage('Email không hợp lệ.')
        .custom(async (email_lien_he, { req }) => {
            const customerId = req.params.id_khach_hang;
            const existingCustomer = await customerService.findCustomerByEmail(email_lien_he);
            if (existingCustomer && existingCustomer.id_khach_hang !== parseInt(customerId)) {
                return Promise.reject('Email này đã được sử dụng bởi một khách hàng khác.');
            }
        }),
    body('so_dien_thoai')
        .optional()
        .isString().withMessage('Số điện thoại phải là chuỗi.')
        .matches(/^\d{10,11}$/).withMessage('Số điện thoại không hợp lệ (10-11 chữ số).'),
    body('dia_chi_kh').optional().isString().withMessage('Địa chỉ phải là chuỗi.'), // Đổi từ dia_chi sang dia_chi_kh
    body('cccd').optional().isString().withMessage('CCCD phải là chuỗi.'), // Thêm validation cho cccd
    body('ngay_sinh').optional({ nullable: true }).isISO8601().toDate().withMessage('Ngày sinh không hợp lệ.'),
    body('id_nguoi_dung').optional().isInt().withMessage('ID người dùng phải là số nguyên') // Thêm validation cho id_nguoi_dung
];

// Validation cho query params của getAllCustomers
const getAllCustomersQueryValidationRules = () => [
    query('page').optional().isInt({ min: 1 }).withMessage('Số trang phải là số nguyên dương.').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Giới hạn số lượng từ 1 đến 100.').toInt(),
    query('searchTerm').optional().isString().trim().withMessage('Từ khóa tìm kiếm phải là chuỗi.'),
    query('sortBy').optional().isString().withMessage('Trường sắp xếp phải là chuỗi (ví dụ: ho_ten, ngay_tao).'),
    query('order').optional().isIn(['ASC', 'DESC']).withMessage('Thứ tự sắp xếp phải là ASC hoặc DESC.')
];

const KhachHangController = {
    createCustomer: async (req, res, next) => {
        try {
            const newCustomer = await customerService.createCustomer(req.body);
            return successResponse(res, 'Tạo khách hàng thành công.', newCustomer, 201);
        } catch (error) {
            next(error);
        }
    },

    getAllCustomers: async (req, res, next) => {
        try {
            // Chuyển đổi page và limit thành số nguyên - sử dụng Number thay vì parseInt
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const searchTerm = req.query.searchTerm || '';
            const sortBy = req.query.sortBy || 'kh.ngay_tao'; // Đổi thành kh.ngay_tao để khớp với model
            const order = req.query.order || 'DESC';

            // Kiểm tra tính hợp lệ để tránh NaN
            if (isNaN(page) || isNaN(limit)) {
                return errorResponse(res, 'Tham số phân trang không hợp lệ', null, 400);
            }

            // Kết hợp thành một đối tượng queryParams duy nhất
            const queryParams = {
                page,
                limit,
                searchTerm,
                sortBy,
                order
            };

            console.log("Query params:", queryParams); // Log để debug

            const result = await customerService.getAllCustomers(queryParams);
            return paginatedResponse(res, 'Lấy danh sách khách hàng thành công.', result.data, result.pagination);
        } catch (error) {
            console.error("Error in getAllCustomers:", error); // Log lỗi để debug
            next(error);
        }
    },

    getCustomerById: async (req, res, next) => {
        try {
            const customer = await customerService.getCustomerById(req.params.id_khach_hang);
            return successResponse(res, 'Lấy thông tin khách hàng thành công.', customer);
        } catch (error) {
            next(error);
        }
    },

    updateCustomer: async (req, res, next) => {
        try {
            const result = await customerService.updateCustomer(req.params.id_khach_hang, req.body);

            // Lấy thông tin khách hàng đã cập nhật để trả về
            const updatedCustomer = await customerService.getCustomerById(req.params.id_khach_hang);
            return successResponse(res, 'Cập nhật khách hàng thành công.', updatedCustomer);
        } catch (error) {
            next(error);
        }
    },

    deleteCustomer: async (req, res, next) => {
        try {
            const result = await customerService.deleteCustomer(req.params.id_khach_hang);
            return successResponse(res, 'Xóa khách hàng thành công.');
        } catch (error) {
            next(error);
        }
    }
};

module.exports = {
    ...KhachHangController,
    createCustomerValidationRules,
    updateCustomerValidationRules,
    getAllCustomersQueryValidationRules
};