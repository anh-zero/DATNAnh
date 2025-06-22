const { successResponse, errorResponse, paginatedResponse } = require('../utils/api_response');
const tourScheduleService = require('../services/lichtrinhtour_service');
const sanphamTourService = require('../services/sanphamtour_service'); // Import service để lấy thông tin tour
const BookingModel = require('../models/dattour_model'); // Thêm dòng này
const { body, query, param } = require('express-validator');

// Validation rules
const scheduleValidationRules = () => {
    return [

        body('id_san_pham_tour')
            // Chỉ chạy validation này NẾU trong URL params không có id_san_pham_tour
            .if((value, { req }) => !req.params.id_san_pham_tour)
            .notEmpty().withMessage('ID sản phẩm tour là bắt buộc')
            .isInt().withMessage('ID sản phẩm tour phải là số nguyên'),

        body('ngay_khoi_hanh')
            .notEmpty().withMessage('Ngày khởi hành là bắt buộc')
            .isISO8601().withMessage('Ngày khởi hành phải có định dạng ngày hợp lệ'),
        body('ngay_ket_thuc')
            .notEmpty().withMessage('Ngày kết thúc là bắt buộc')
            .isISO8601().withMessage('Ngày kết thúc phải có định dạng ngày hợp lệ')
            .custom((value, { req }) => {
                if (new Date(value) <= new Date(req.body.ngay_khoi_hanh)) {
                    throw new Error('Ngày kết thúc phải sau ngày khởi hành');
                }
                return true;
            }),
        body('gia_tien')
            .notEmpty().withMessage('Giá tiền là bắt buộc')
            .isFloat({ min: 0 }).withMessage('Giá tiền phải là số lớn hơn hoặc bằng 0'),
        body('so_luong_cho_toi_da')
            .notEmpty().withMessage('Số lượng chỗ tối đa là bắt buộc')
            .isInt({ min: 1 }).withMessage('Số lượng chỗ tối đa phải là số nguyên lớn hơn 0'),
        body('trang_thai_lich_trinh')
            .optional()
            .isIn(['Sắp mở bán', 'Đang mở bán', 'Hết chỗ', 'Đã khởi hành', 'Đã kết thúc', 'Đã hủy'])
            .withMessage('Trạng thái lịch trình không hợp lệ')
    ];
};

const getAllSchedulesQueryValidationRules = () => [
    query('sortBy').optional().isIn([
        'id_lich_trinh_tour',
        'ngay_khoi_hanh',
        'ngay_ket_thuc',
        'gia_tien',
        'trang_thai_lich_trinh',
        'ngay_tao'
    ]),
    query('order').optional().isIn(['ASC', 'DESC'])
];

const updateScheduleValidationRules = () => [
    param('id_lich_trinh_tour').isInt({ min: 1 }).withMessage('ID lịch trình không hợp lệ.'),
    body('ngay_khoi_hanh').optional()
        .isISO8601().toDate().withMessage('Ngày khởi hành không hợp lệ (YYYY-MM-DD).'),
    body('ngay_ket_thuc').optional()
        .isISO8601().toDate().withMessage('Ngày kết thúc không hợp lệ (YYYY-MM-DD).')
        .custom((value, { req }) => {
            const ngayKhoiHanh = req.body.ngay_khoi_hanh ? new Date(req.body.ngay_khoi_hanh) : null;
            // Chỉ validate nếu cả hai ngày đều được cung cấp hoặc ngày kết thúc được cung cấp và ngày khởi hành cũng có
            if (value && ngayKhoiHanh && (new Date(value) <= ngayKhoiHanh)) {
                throw new Error('Ngày kết thúc phải sau ngày khởi hành.');
            }
            // Nếu chỉ có ngày kết thúc mà không có ngày khởi hành (trong req.body) thì không validate custom này
            // Hoặc nếu ngày khởi hành không có trong req.body, thì không thể so sánh
            return true;
        }),
    body('gia_tien').optional()
        .isDecimal({ decimal_digits: '0,2' }).withMessage('Giá tiền không hợp lệ.')
        .toFloat(),
    body('so_luong_cho_toi_da').optional()
        .isInt({ min: 1 }).withMessage('Số lượng chỗ tối đa phải là số nguyên dương.').toInt(),
    body('so_luong_cho_da_dat').optional().isInt({ min: 0 }).withMessage('Số lượng chỗ đã đặt không hợp lệ.').toInt(),
    body('trang_thai_lich_trinh').optional()
        .isIn(['Sắp mở bán', 'Đang mở bán', 'Hết chỗ', 'Đã khởi hành', 'Đã kết thúc', 'Đã hủy'])
        .withMessage('Trạng thái lịch trình không hợp lệ.')
    ];

const TourScheduleController = {
    getAllSchedulesForTour: async (req, res, next) => {
        try {
            const { id_san_pham_tour } = req.params;
            const { sortBy, order } = req.query;

            // Gọi service để lấy danh sách lịch trình
            const schedules = await tourScheduleService.getSchedulesByTourId(id_san_pham_tour, { sortBy, order });

            return successResponse(res, `Lấy danh sách lịch khởi hành cho tour ID ${id_san_pham_tour} thành công.`, schedules);
        } catch (error) {
            next(error);
        }
    },

    createTourSchedule: async (req, res, next) => {
        try {
            // SỬA ĐỔI Ở ĐÂY
            // Dữ liệu trong body có thể không có id_san_pham_tour
            const scheduleDataFromRequest = req.body;

            // Lấy id_san_pham_tour từ URL params (nếu là route lồng)
            // hoặc từ body (nếu là route phẳng)
            const id_san_pham_tour = req.params.id_san_pham_tour || scheduleDataFromRequest.id_san_pham_tour;

            // Tạo dữ liệu cuối cùng để truyền vào service
            const finalScheduleData = {
                ...scheduleDataFromRequest,
                id_san_pham_tour: id_san_pham_tour
            };

            const result = await tourScheduleService.createTourSchedule(finalScheduleData);

            return successResponse(
                res,
                'Tạo lịch trình tour thành công',
                result,
                201
            );
        } catch (error) {
            next(error);
        }
    },

    // Sửa phương thức getTourScheduleById để đảm bảo bao gồm thông tin tour
    getTourScheduleById: async (req, res, next) => {
        try {
            const { id_lich_trinh_tour } = req.params;
            const schedule = await tourScheduleService.getScheduleDetailsById(id_lich_trinh_tour);

            // Đảm bảo schedule.sanphamtour có giá trị
            if (schedule && !schedule.sanphamtour) {
                // Nếu không có thông tin tour, thử lấy bổ sung
                const tourInfo = await sanphamTourService.getTourById(schedule.id_san_pham_tour);
                if (tourInfo) {
                    schedule.sanphamtour = tourInfo;
                }
            }

            return successResponse(res, 'Lấy thông tin lịch khởi hành thành công.', schedule);
        } catch (error) {
            next(error);
        }
    },

    updateTourSchedule: async (req, res, next) => {
        try {
            const { id_lich_trinh_tour } = req.params;
            const result = await tourScheduleService.updateSchedule(id_lich_trinh_tour, req.body);
            return successResponse(res, result.message, result.schedule);
        } catch (error) {
            next(error);
        }
    },

    deleteTourSchedule: async (req, res, next) => {
        try {
            const { id_lich_trinh_tour } = req.params;
            const result = await tourScheduleService.deleteSchedule(id_lich_trinh_tour);
            return successResponse(res, result.message);
        } catch (error) {
            next(error);
        }
    },

    cancelTourSchedule: async (req, res, next) => {
        try {
            const { id_lich_trinh_tour } = req.params;

            // Cập nhật trạng thái lịch trình
            const result = await tourScheduleService.updateScheduleStatus(id_lich_trinh_tour, 'Đã hủy');

            // Cập nhật trạng thái đặt tour liên quan
            await BookingModel.updateBookingStatusByScheduleId(id_lich_trinh_tour, 'Đã hủy');

            return successResponse(res, 'Hủy lịch trình tour thành công', result);
        } catch (error) {
            console.error('Error in cancelTourSchedule:', error);
            next(error);
        }
    },

    // Thêm method để lấy tất cả lịch trình tour
    getAllTourSchedules: async (req, res, next) => {
        try {
            // Lấy các tham số query từ request
            const { page = 1, limit = 10, searchTerm, sortBy, order } = req.query;

            // Xử lý các tham số phân trang
            const queryParams = {
                limit: parseInt(limit) || 10,
                offset: ((parseInt(page) || 1) - 1) * (parseInt(limit) || 10),
                searchTerm,
                sortBy,
                order
            };

            const result = await tourScheduleService.getAllSchedules(queryParams);

            // Sử dụng paginatedResponse để trả về dữ liệu phân trang
            return paginatedResponse(
                res,
                'Lấy danh sách lịch trình tour thành công.',
                result.schedules || [],
                {
                    currentPage: parseInt(page) || 1,
                    totalPages: Math.ceil(result.totalItems / queryParams.limit),
                    totalItems: result.totalItems || 0,
                    limit: parseInt(limit) || 10
                }
            );
        } catch (error) {
            next(error);
        }
    },

    // Thêm phương thức này vào controller
    getTourScheduleStatistics: async (req, res, next) => {
        try {
            const stats = await tourScheduleService.getTourScheduleStatistics();
            return successResponse(res, 'Lấy thống kê lịch trình tour thành công', stats);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = {
    TourScheduleController,
    scheduleValidationRules,
    getAllSchedulesQueryValidationRules,
    updateScheduleValidationRules
};