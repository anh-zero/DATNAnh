const tourScheduleService = require('../services/tour_schedule_service');
const { successResponse, errorResponse } = require('../utils/api_response');
const { body, param, query } = require('express-validator');
const handleValidationErrors = require('../middlewares/validation_middleware');

const scheduleValidationRules = () => [
    body('ngay_khoi_hanh').notEmpty().withMessage('Ngày khởi hành không được để trống.')
        .isISO8601().toDate().withMessage('Ngày khởi hành không hợp lệ (YYYY-MM-DD).'),
    body('ngay_ket_thuc').notEmpty().withMessage('Ngày kết thúc không được để trống.')
        .isISO8601().toDate().withMessage('Ngày kết thúc không hợp lệ (YYYY-MM-DD).')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.ngay_khoi_hanh)) {
                throw new Error('Ngày kết thúc phải sau ngày khởi hành.');
            }
            return true;
        }),
    body('gia_tien').notEmpty().withMessage('Giá tiền không được để trống.')
        .isDecimal({ decimal_digits: '0,2' }).withMessage('Giá tiền không hợp lệ.')
        .toFloat(),
    body('so_luong_cho_toi_da').notEmpty().withMessage('Số lượng chỗ tối đa không được để trống.')
        .isInt({ min: 1 }).withMessage('Số lượng chỗ tối đa phải là số nguyên dương.').toInt(),
    body('so_luong_cho_da_dat').optional().isInt({ min: 0 }).withMessage('Số lượng chỗ đã đặt không hợp lệ.').toInt(),
    body('trang_thai_lich_trinh').optional()
        .isIn(['Sắp mở bán', 'Đang bán', 'Hết chỗ', 'Đã hủy', 'Đang diễn ra', 'Đã kết thúc'])
        .withMessage('Trạng thái lịch trình không hợp lệ.')
];

const getAllSchedulesQueryValidationRules = () => [
    query('sortBy').optional().isIn(['ngay_khoi_hanh', 'gia_tien', 'trang_thai_lich_trinh', 'ngay_tao']),
    query('order').optional().isIn(['ASC', 'DESC'])
];

const createTourSchedule = async (req, res, next) => {
    try {
        const { id_san_pham_tour } = req.params;
        const newSchedule = await tourScheduleService.createTourSchedule(id_san_pham_tour, req.body);
        return successResponse(res, 'Tạo lịch khởi hành thành công.', newSchedule, 201);
    } catch (error) {
        next(error);
    }
};

const getAllSchedulesForTour = async (req, res, next) => {
    try {
        const { id_san_pham_tour } = req.params;
        const { sortBy, order } = req.query;
        const schedules = await tourScheduleService.getAllSchedulesForTour(id_san_pham_tour, { sortBy, order });
        return successResponse(res, `Lấy danh sách lịch khởi hành cho tour ID ${id_san_pham_tour} thành công.`, schedules);
    } catch (error) {
        next(error);
    }
};

const getTourScheduleById = async (req, res, next) => {
    try {
        const { id_lich_trinh_tour } = req.params;
        const schedule = await tourScheduleService.getTourScheduleById(id_lich_trinh_tour);
        return successResponse(res, 'Lấy thông tin lịch khởi hành thành công.', schedule);
    } catch (error) {
        next(error);
    }
};

const updateTourSchedule = async (req, res, next) => {
    try {
        const { id_lich_trinh_tour } = req.params;
        const result = await tourScheduleService.updateTourSchedule(id_lich_trinh_tour, req.body);
        return successResponse(res, result.message, result.schedule);
    } catch (error) {
        next(error);
    }
};

const deleteTourSchedule = async (req, res, next) => {
    try {
        const { id_lich_trinh_tour } = req.params;
        const result = await tourScheduleService.deleteTourSchedule(id_lich_trinh_tour);
        return successResponse(res, result.message);
    } catch (error) {
        next(error);
    }
};

const cancelTourSchedule = async (req, res, next) => {
    try {
        const { id_lich_trinh_tour } = req.params;
        const result = await tourScheduleService.cancelTourSchedule(id_lich_trinh_tour);
        return successResponse(res, result.message, result.schedule);
    } catch (error) {
        next(error);
    }
};
const updateScheduleValidationRules = () => [
    param('id_lich_trinh_tour').isInt({ min: 1 }).withMessage('ID lịch trình không hợp lệ.'), // Đã có ở route
    body('ngay_khoi_hanh').optional() // Thêm .optional()
        .isISO8601().toDate().withMessage('Ngày khởi hành không hợp lệ (YYYY-MM-DD).'),
    body('ngay_ket_thuc').optional() // Thêm .optional()
        .isISO8601().toDate().withMessage('Ngày kết thúc không hợp lệ (YYYY-MM-DD).')
        .custom((value, { req }) => {
            const ngayKhoiHanh = req.body.ngay_khoi_hanh ? new Date(req.body.ngay_khoi_hanh) : null;
            // Chỉ validate nếu cả hai ngày đều được cung cấp hoặc ngày kết thúc được cung cấp
            if (value && ngayKhoiHanh && (new Date(value) <= ngayKhoiHanh)) {
                throw new Error('Ngày kết thúc phải sau ngày khởi hành.');
            }
            return true;
        }),
    body('gia_tien').optional() // Thêm .optional()
        .isDecimal({ decimal_digits: '0,2' }).withMessage('Giá tiền không hợp lệ.')
        .toFloat(),
    body('so_luong_cho_toi_da').optional() // Thêm .optional()
        .isInt({ min: 1 }).withMessage('Số lượng chỗ tối đa phải là số nguyên dương.').toInt(),
    body('so_luong_cho_da_dat').optional().isInt({ min: 0 }).withMessage('Số lượng chỗ đã đặt không hợp lệ.').toInt(),
    body('trang_thai_lich_trinh').optional()
        .isIn(['Sắp mở bán', 'Đang bán', 'Hết chỗ', 'Đã hủy', 'Đang diễn ra', 'Đã kết thúc'])
        .withMessage('Trạng thái lịch trình không hợp lệ.')
];
module.exports = {
    createTourSchedule,
    getAllSchedulesForTour,
    getTourScheduleById,
    updateTourSchedule,
    deleteTourSchedule,
    cancelTourSchedule,
    scheduleValidationRules,
    getAllSchedulesQueryValidationRules,
    updateScheduleValidationRules // Xuất rules mới
};