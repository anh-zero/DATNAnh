const LocationService = require('../services/diadiem_service'); // Import service đã hoàn thiện
const { successResponse, errorResponse, paginatedResponse } = require('../utils/api_response');
const { body, param, query } = require('express-validator');

// Danh sách các loại địa điểm hợp lệ
const validLocationTypes = ['Điểm tham quan', 'Thành phố', 'Khách sạn', 'Nhà hàng', 'Sân bay', 'Khác'];

// Validation rules cho việc tạo và cập nhật địa điểm
const locationValidationRules = () => [
    body('ten_dia_diem')
        .notEmpty().withMessage('Tên địa điểm không được để trống.')
        .isString().withMessage('Tên địa điểm phải là chuỗi.')
        .isLength({ min: 2, max: 255 }).withMessage('Tên địa điểm phải từ 2 đến 255 ký tự.'),
    body('mo_ta')
        .optional({ nullable: true })
        .isString().withMessage('Mô tả phải là chuỗi.'),
    body('dia_chi')
        .optional({ nullable: true })
        .isString().withMessage('Địa chỉ phải là chuỗi.')
        .isLength({ max: 255 }).withMessage('Địa chỉ không quá 255 ký tự.'),
    body('thanh_pho')
        .optional({ nullable: true })
        .isString().withMessage('Thành phố phải là chuỗi.')
        .isLength({ max: 100 }).withMessage('Thành phố không quá 100 ký tự.'),
    body('quoc_gia')
        .optional({ nullable: true })
        .isString().withMessage('Quốc gia phải là chuỗi.')
        .isLength({ max: 100 }).withMessage('Quốc gia không quá 100 ký tự.'),
    body('kinh_do')
        .optional({ nullable: true })
        .isDecimal().withMessage('Kinh độ phải là số thập phân.')
        .toFloat(),
    body('vi_do')
        .optional({ nullable: true })
        .isDecimal().withMessage('Vĩ độ phải là số thập phân.')
        .toFloat(),
    body('loai_dia_diem')
        .optional()
        .isIn(validLocationTypes)
        .withMessage('Loại địa điểm không hợp lệ. Giá trị cho phép: ' + validLocationTypes.join(', '))
];

const updateLocationValidationRules = () => [
    param('id_dia_diem').isInt({ min: 1 }).withMessage('ID địa điểm không hợp lệ.'),
    body('ten_dia_diem')
        .optional()
        .notEmpty().withMessage('Tên địa điểm không được để trống.')
        .isString().withMessage('Tên địa điểm phải là chuỗi.')
        .isLength({ min: 2, max: 255 }).withMessage('Tên địa điểm phải từ 2 đến 255 ký tự.'),
    body('mo_ta')
        .optional({ nullable: true })
        .isString().withMessage('Mô tả phải là chuỗi.'),
    body('dia_chi')
        .optional({ nullable: true })
        .isString().withMessage('Địa chỉ phải là chuỗi.')
        .isLength({ max: 255 }).withMessage('Địa chỉ không quá 255 ký tự.'),
    body('thanh_pho')
        .optional({ nullable: true })
        .isString().withMessage('Thành phố phải là chuỗi.')
        .isLength({ max: 100 }).withMessage('Thành phố không quá 100 ký tự.'),
    body('quoc_gia')
        .optional({ nullable: true })
        .isString().withMessage('Quốc gia phải là chuỗi.')
        .isLength({ max: 100 }).withMessage('Quốc gia không quá 100 ký tự.'),
    body('kinh_do')
        .optional({ nullable: true })
        .isDecimal().withMessage('Kinh độ phải là số thập phân.')
        .toFloat(),
    body('vi_do')
        .optional({ nullable: true })
        .isDecimal().withMessage('Vĩ độ phải là số thập phân.')
        .toFloat(),
    body('loai_dia_diem')
        .optional()
        .isIn(validLocationTypes)
        .withMessage('Loại địa điểm không hợp lệ. Giá trị cho phép: ' + validLocationTypes.join(', '))
];

const getAllLocationsQueryValidationRules = () => [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('searchTerm').optional().isString().trim(),
    query('loaiDiaDiem')
        .optional()
        .isIn(validLocationTypes),
    query('sortBy').optional().isIn(['id_dia_diem', 'ten_dia_diem', 'thanh_pho', 'quoc_gia', 'loai_dia_diem', 'ngay_tao']),
    query('order').optional().isIn(['ASC', 'DESC'])
];

const LocationController = {
    createLocation: async (req, res, next) => {
        try {
            const newLocation = await LocationService.createLocation(req.body);
            return successResponse(res, 'Tạo địa điểm thành công.', newLocation, 201);
        } catch (error) {
            next(error);
        }
    },

    getAllLocations: async (req, res, next) => {
        try {
            // Đảm bảo giá trị hợp lệ khi lấy từ request
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const searchTerm = req.query.search || '';
            const sortBy = req.query.sortBy || 'ten_dia_diem';
            const order = req.query.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

            const filters = { searchTerm, sortBy, order };
            const paginationOptions = { page, limit };

            const result = await LocationService.getAllLocations(filters, paginationOptions);
            return paginatedResponse(res, 'Lấy danh sách địa điểm thành công.', result.locations, result.pagination);
        } catch (error) {
            next(error);
        }
    },

    getLocationById: async (req, res, next) => {
        try {
            const { id_dia_diem } = req.params;
            const location = await LocationService.getLocationById(id_dia_diem);
            return successResponse(res, 'Lấy thông tin địa điểm thành công.', location);
        } catch (error) {
            next(error);
        }
    },

    updateLocation: async (req, res, next) => {
        try {
            const { id_dia_diem } = req.params;
            const result = await LocationService.updateLocation(id_dia_diem, req.body);
            return successResponse(res, result.message, result.location);
        } catch (error) {
            next(error);
        }
    },

    deleteLocation: async (req, res, next) => {
        try {
            const { id_dia_diem } = req.params;
            const result = await LocationService.deleteLocation(id_dia_diem);
            return successResponse(res, result.message);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = {
    ...LocationController,
    locationValidationRules,
    updateLocationValidationRules,
    getAllLocationsQueryValidationRules
};