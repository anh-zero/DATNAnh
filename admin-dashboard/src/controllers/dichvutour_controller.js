const TourProvidedServiceService = require('../services/dichvutour_service'); // Import service đã hoàn thiện
const { successResponse, errorResponse, paginatedResponse } = require('../utils/api_response');
const { body, param } = require('express-validator');

// Validation rules cho việc thêm/cập nhật dịch vụ vào lịch trình
const providedServiceValidationRules = () => [
    // Validation cho id_lich_trinh_tour - chỉ chạy khi không có trong params
    body('id_lich_trinh_tour')
        .if((value, { req }) => !req.params.id_lich_trinh_tour)
        .notEmpty().withMessage('ID lịch trình tour là bắt buộc trong body cho route không lồng.')
        .isInt({ min: 1 }).withMessage('ID lịch trình tour phải là số nguyên dương.'),

    // Validation cho các trường còn lại
    body('id_doi_tac')
        .notEmpty().withMessage('ID đối tác là bắt buộc.')
        .isInt({ min: 1 }).withMessage('ID đối tác phải là số nguyên dương.'),
    body('ten_dich_vu')
        .notEmpty().withMessage('Tên dịch vụ không được để trống.')
        .isString().withMessage('Tên dịch vụ phải là chuỗi.')
        .isLength({ min: 2, max: 255 }).withMessage('Tên dịch vụ phải từ 2 đến 255 ký tự.'),
    body('loai_dich_vu')
        .optional()
        .isString().withMessage('Loại dịch vụ phải là chuỗi.')
        .isLength({ max: 100 }).withMessage('Loại dịch vụ không quá 100 ký tự.'),
    body('gia_nhap')
        .optional()
        .isDecimal({ decimal_digits: '0,2' }).withMessage('Giá nhập không hợp lệ.')
        .toFloat(),
    body('so_luong')
        .optional()
        .isInt({ min: 0 }).withMessage('Số lượng phải là số nguyên không âm.')
        .toInt(),
    body('don_vi_tinh')
        .optional({ checkFalsy: true })
        .isString().withMessage('Đơn vị tính phải là chuỗi.')
        .isLength({ max: 50 }).withMessage('Đơn vị tính không quá 50 ký tự.'),
    body('thoi_gian_bat_dau')
        .optional({ checkFalsy: true })
        .isISO8601().withMessage('Thời gian bắt đầu phải có định dạng ISO8601.'),
    body('thoi_gian_ket_thuc')
        .optional({ checkFalsy: true })
        .isISO8601().withMessage('Thời gian kết thúc phải có định dạng ISO8601.'),
    body('ghi_chu')
        .optional({ checkFalsy: true })
        .isString().withMessage('Ghi chú phải là chuỗi.')
];

const updateServiceValidationRules = () => [
    param('id_dich_vu_tour').isInt({ min: 1 }).withMessage('ID dịch vụ tour không hợp lệ.'),
    body('id_doi_tac')
        .optional()
        .isInt({ min: 1 }).withMessage('ID đối tác phải là một số nguyên dương.'),
    body('ten_dich_vu')
        .optional()
        .notEmpty().withMessage('Tên dịch vụ không được để trống.')
        .isString().withMessage('Tên dịch vụ phải là chuỗi.')
        .isLength({ min: 2, max: 255 }).withMessage('Tên dịch vụ phải từ 2 đến 255 ký tự.'),
    body('loai_dich_vu')
        .optional()
        .isString().withMessage('Loại dịch vụ phải là chuỗi.')
        .isLength({ max: 100 }).withMessage('Loại dịch vụ không quá 100 ký tự.'),
    body('gia_nhap')
        .optional()
        .isDecimal({ decimal_digits: '0,2' }).withMessage('Giá nhập không hợp lệ.')
        .toFloat(),
    body('so_luong')
        .optional()
        .isInt({ min: 0 }).withMessage('Số lượng phải là số nguyên không âm.')
        .toInt(),
    body('don_vi_tinh')
        .optional({ checkFalsy: true })
        .isString().withMessage('Đơn vị tính phải là chuỗi.')
        .isLength({ max: 50 }).withMessage('Đơn vị tính không quá 50 ký tự.'),
    body('thoi_gian_bat_dau')
        .optional({ checkFalsy: true })
        .custom(value => {
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
            const dateTimeRegex = /^\d{4}-\d{2}-\d{2} ([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

            if (timeRegex.test(value) || dateTimeRegex.test(value) || dateRegex.test(value)) {
                return true;
            }

            return false;
        })
        .withMessage('Thời gian bắt đầu không hợp lệ. Định dạng: HH:MM:SS hoặc YYYY-MM-DD hoặc YYYY-MM-DD HH:MM:SS'),
    body('thoi_gian_ket_thuc')
        .optional({ checkFalsy: true })
        .custom(value => {
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
            const dateTimeRegex = /^\d{4}-\d{2}-\d{2} ([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

            if (timeRegex.test(value) || dateTimeRegex.test(value) || dateRegex.test(value)) {
                return true;
            }

            return false;
        })
        .withMessage('Thời gian kết thúc không hợp lệ. Định dạng: HH:MM:SS hoặc YYYY-MM-DD hoặc YYYY-MM-DD HH:MM:SS'),
    body('ghi_chu')
        .optional({ checkFalsy: true })
        .isString().withMessage('Ghi chú phải là chuỗi.')
];

const TourProvidedServiceController = {
    addServiceToSchedule: async (req, res, next) => {
        try {
            // Thêm log để debug
            console.log("Request body:", req.body);
            console.log("ID lịch trình từ params:", req.params.id_lich_trinh_tour);
            console.log("ID lịch trình từ body:", req.body.id_lich_trinh_tour);

            // ID lịch trình từ route params hoặc từ body
            const id_lich_trinh_tour = req.params.id_lich_trinh_tour || req.body.id_lich_trinh_tour;

            console.log("Final ID lịch trình:", id_lich_trinh_tour);

            if (!id_lich_trinh_tour) {
                return errorResponse(res, 'ID lịch trình tour không được cung cấp.', 400);
            }

            const newService = await TourProvidedServiceService.addServiceToSchedule({
                ...req.body,
                id_lich_trinh_tour: parseInt(id_lich_trinh_tour)
            });

            return successResponse(res, 'Thêm dịch vụ vào lịch trình thành công.', newService, 201);
        } catch (error) {
            next(error);
        }
    },

    getServicesByScheduleId: async (req, res, next) => {
        try {
            const { id_lich_trinh_tour } = req.params;
            const services = await TourProvidedServiceService.getServicesByScheduleId(id_lich_trinh_tour);
            return successResponse(res, `Lấy danh sách dịch vụ cho lịch trình ID ${id_lich_trinh_tour} thành công.`, services);
        } catch (error) {
            next(error);
        }
    },

    getServiceById: async (req, res, next) => {
        try {
            const { id_dich_vu_tour } = req.params;
            const service = await TourProvidedServiceService.getServiceById(id_dich_vu_tour);
            return successResponse(res, 'Lấy thông tin dịch vụ tour thành công.', service);
        } catch (error) {
            next(error);
        }
    },

    updateServiceInSchedule: async (req, res, next) => {
        try {
            const { id_dich_vu_tour } = req.params;
            const result = await TourProvidedServiceService.updateServiceInSchedule(id_dich_vu_tour, req.body);
            return successResponse(res, result.message, result.service);
        } catch (error) {
            next(error);
        }
    },

    removeServiceFromSchedule: async (req, res, next) => {
        try {
            const { id_dich_vu_tour } = req.params;
            const result = await TourProvidedServiceService.removeServiceFromSchedule(id_dich_vu_tour);
            return successResponse(res, result.message);
        } catch (error) {
            next(error);
        }
    },

    getAllServices: async (req, res, next) => {
        try {
            const result = await TourProvidedServiceService.getAllServices(req.query);
            return successResponse(res, 'Lấy danh sách dịch vụ tour thành công.', result.services);
        } catch (error) {
            next(error);
        }
    },

    // Thêm method getServicesByPartnerId
    getServicesByPartnerId: async (req, res, next) => {
        try {
            const { id_doi_tac } = req.params;
            const { page = 1, limit = 10, sortBy, order } = req.query;

            const queryParams = {
                id_doi_tac: parseInt(id_doi_tac),
                page: parseInt(page),
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit),
                sortBy: sortBy || 'ngay_tao',
                order: order || 'DESC'
            };

            const result = await TourProvidedServiceService.getServicesByPartnerId(queryParams);

return paginatedResponse({
    res: res,
    message: `Lấy danh sách dịch vụ của đối tác ID ${id_doi_tac} thành công`,
    data: result.services,
    currentPage: parseInt(page),
    totalCount: result.totalItems,
    limit: parseInt(limit)
});
        } catch (error) {
            next(error);
        }
    }
};

module.exports = {
    ...TourProvidedServiceController,
    providedServiceValidationRules,
    updateServiceValidationRules
};