const TourActivityService = require('../services/hoatdongtour_service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/api_response');
const { body, param } = require('express-validator');
const handleValidationErrors = require('../middlewares/validation_middleware');
const { formatTimeForDb } = require('../utils/date_utils'); // Import utility

// Validation rules cho tạo và cập nhật hoạt động
const activityValidationRules = () => [
    body('id_lich_trinh_tour')
        .notEmpty().withMessage('ID lịch trình tour không được để trống')
        .isInt({ min: 1 }).withMessage('ID lịch trình tour phải là số nguyên dương'),

    body('ten_hoat_dong')
        .notEmpty().withMessage('Tên hoạt động không được để trống')
        .isLength({ min: 3, max: 255 }).withMessage('Tên hoạt động phải từ 3-255 ký tự'),

    body('mo_ta_chi_tiet')
        .optional()
        .isLength({ max: 1000 }).withMessage('Mô tả chi tiết không quá 1000 ký tự'),

    body('thoi_gian_bat_dau')
        .notEmpty().withMessage('Thời gian bắt đầu không được để trống')
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).withMessage('Thời gian bắt đầu phải đúng định dạng HH:MM:SS'),

    body('thoi_gian_ket_thuc')
        .notEmpty().withMessage('Thời gian kết thúc không được để trống')
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).withMessage('Thời gian kết thúc phải đúng định dạng HH:MM:SS'),

    body('id_dia_diem')
        .optional()
        .isInt({ min: 1 }).withMessage('ID địa điểm phải là số nguyên dương'),

    body('id_dich_vu_tour')
        .optional()
        .isInt({ min: 1 }).withMessage('ID dịch vụ tour phải là số nguyên dương')
];

const updateActivityValidationRules = () => [
    param('id_hoat_dong').isInt({ min: 1 }).withMessage('ID hoạt động không hợp lệ.'),
    // id_lich_trinh_tour không nên cho phép cập nhật qua endpoint này, nếu cần thì phải có logic phức tạp hơn
    body('id_dia_diem')
        .optional()
        .isInt({ min: 1 }).withMessage('ID địa điểm phải là một số nguyên dương.'),
    body('ten_hoat_dong')
        .optional()
        .isString().withMessage('Tên hoạt động phải là chuỗi.')
        .isLength({ min: 3, max: 255 }).withMessage('Tên hoạt động phải từ 3 đến 255 ký tự.'),
    body('mo_ta_hoat_dong')
        .optional()
        .isString().withMessage('Mô tả hoạt động phải là chuỗi.'),
    body('thoi_gian_bat_dau')
        .optional()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
        .withMessage('Thời gian bắt đầu không hợp lệ (HH:MM hoặc HH:MM:SS).')
        .customSanitizer(value => formatTimeForDb(value)),
    body('thoi_gian_ket_thuc')
        .optional({ nullable: true })
        .matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
        .withMessage('Thời gian kết thúc không hợp lệ (HH:MM hoặc HH:MM:SS).')
        .custom((value, { req }) => {
            const startTime = req.body.thoi_gian_bat_dau || null; // Cần lấy giá trị hiện tại nếu không được cung cấp
            if (value && startTime) {
                if (value <= startTime) {
                    throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu.');
                }
            }
            return true;
        })
        .customSanitizer(value => formatTimeForDb(value)),
    body('id_dich_vu_tour')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('ID dịch vụ tour phải là một số nguyên dương nếu được cung cấp.')
];


const TourActivityController = {
    addActivityToSchedule: async (req, res, next) => {
        try {
            // Gộp ID lịch trình từ URL với dữ liệu thân yêu cầu
            const activityData = {
                ...req.body,
                id_lich_trinh_tour: parseInt(req.params.id_lich_trinh_tour)
            };

            const result = await TourActivityService.addActivityToSchedule(activityData);
            return successResponse(res, 'Thêm hoạt động vào lịch trình thành công', result.activity, 201);
        } catch (error) {
            next(error);
        }
    },

    getActivitiesByScheduleId: async (req, res, next) => {
        try {
            const { id_lich_trinh_tour } = req.params;
            const activities = await TourActivityService.getActivitiesByScheduleId(id_lich_trinh_tour);
            return successResponse(res, `Lấy danh sách hoạt động cho lịch trình ID ${id_lich_trinh_tour} thành công.`, activities);
        } catch (error) {
            next(error);
        }
    },

    getActivityById: async (req, res, next) => {
        try {
            const { id_hoat_dong } = req.params;
            const activity = await TourActivityService.getActivityById(id_hoat_dong);
            return successResponse(res, 'Lấy thông tin hoạt động thành công.', activity);
        } catch (error) {
            next(error);
        }
    },

    updateActivityInSchedule: async (req, res, next) => {
        try {
            const { id_hoat_dong } = req.params;

            // Đảm bảo id_hoat_dong là số hợp lệ
            if (!id_hoat_dong || isNaN(parseInt(id_hoat_dong))) {
                return errorResponse(res, "ID hoạt động không hợp lệ", 400);
            }

            const result = await TourActivityService.updateActivityInSchedule(
                parseInt(id_hoat_dong),
                req.body
            );

            return successResponse(
                res,
                result.message,
                result.activity
            );
        } catch (error) {
            next(error);
        }
    },

    removeActivityFromSchedule: async (req, res, next) => {
        try {
            const { id_hoat_dong } = req.params;
            const result = await TourActivityService.removeActivityFromSchedule(id_hoat_dong);
            return successResponse(res, result.message);
        } catch (error) {
            next(error);
        }
    },

    getAllActivities: async (req, res, next) => {
        try {
            // Lấy các tham số từ query
            const { id_lich_trinh_tour, page = 1, limit = 10, sortBy, order } = req.query;

            // Xử lý tham số để tránh lỗi
            const queryParams = {
                id_lich_trinh_tour: id_lich_trinh_tour ? parseInt(id_lich_trinh_tour) : undefined,
                limit: parseInt(limit) || 10,
                offset: ((parseInt(page) || 1) - 1) * (parseInt(limit) || 10),
                sortBy: sortBy || 'thoi_gian_bat_dau',
                order: order || 'ASC'
            };

            const result = await TourActivityService.getAllActivities(queryParams);

            return paginatedResponse(
                res,
                'Lấy danh sách hoạt động tour thành công.',
                result.activities || [],
                {
                    currentPage: parseInt(page) || 1,
                    totalPages: Math.ceil(result.totalItems / queryParams.limit),
                    totalItems: result.totalItems || 0,
                    limit: queryParams.limit
                }
            );
        } catch (error) {
            next(error);
        }
    },

    // Thêm method getActivitiesByLocationId
    getActivitiesByLocationId: async (req, res, next) => {
        try {
            const { id_dia_diem } = req.params;
            const { page = 1, limit = 10, sortBy, order } = req.query;

            const queryParams = {
                id_dia_diem: parseInt(id_dia_diem),
                page: parseInt(page),
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit),
                sortBy: sortBy || 'thoi_gian_bat_dau',
                order: order || 'ASC'
            };

            const result = await TourActivityService.getActivitiesByLocationId(queryParams);

           return paginatedResponse({
    res: res,
    message: `Lấy danh sách hoạt động tại địa điểm ID ${id_dia_diem} thành công`,
    data: result.activities,
    pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(result.totalItems / parseInt(limit)),
        totalItems: result.totalItems,
        limit: parseInt(limit)
    }});
        } catch (error) {
            next(error);
        }
    }
};

module.exports = {
    TourActivityController, // Export object chứa các methods
    activityValidationRules,
    updateActivityValidationRules,
    // Middleware và các hàm khác có thể được export riêng nếu cần
    // Ví dụ: handleValidationErrors đã được import, không cần export lại từ đây
};