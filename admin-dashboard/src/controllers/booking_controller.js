// File: src/controllers/booking_controller.js
// (Cập nhật validation rule cho ngay_dat_TIMESTAMP thành ngay_dat_tour)
const bookingService = require('../services/booking_service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/api_response');
const { body, param, query } = require('express-validator');
const handleValidationErrors = require('../middlewares/validation_middleware');

const bookingStatusValues = ['Chờ xác nhận', 'Đã xác nhận', 'Đã hủy bởi khách', 'Đã hủy bởi admin', 'Đang diễn ra', 'Đã hoàn thành', 'Yêu cầu hủy'];
const paymentStatusValues = ['Chưa thanh toán', 'Đã thanh toán', 'Đã cọc', 'Đã hủy', 'Đã hoàn tiền', 'Chờ hoàn tiền', 'Thanh toán thất bại'];

const createBookingValidationRules = () => [
    body('id_khach_hang').isInt({ min: 1 }).withMessage('ID khách hàng không hợp lệ.'),
    body('id_lich_trinh_tour').isInt({ min: 1 }).withMessage('ID lịch trình tour không hợp lệ.'),
    body('ngay_dat_tour').optional().isISO8601().withMessage('Ngày đặt tour không hợp lệ (YYYY-MM-DD HH:MM:SS hoặc ISO8601).').toDate(), // API nhận 'ngay_dat_tour'
    body('so_luong_khach').isInt({ min: 1 }).withMessage('Số lượng khách phải ít nhất là 1.'),
    body('tong_tien_du_kien').optional({checkFalsy:true}).isDecimal({ decimal_digits: '0,2' }).withMessage('Tổng tiền dự kiến không hợp lệ.').toFloat(),
    body('tong_tien_thanh_toan').optional({checkFalsy:true}).isDecimal({ decimal_digits: '0,2' }).withMessage('Tổng tiền thanh toán không hợp lệ.').toFloat(),
    body('trang_thai_thanh_toan').optional().isIn(paymentStatusValues).withMessage('Trạng thái thanh toán không hợp lệ.'),
    body('trang_thai_dat_tour').optional().isIn(bookingStatusValues).withMessage('Trạng thái đặt tour không hợp lệ.'),
    body('ghi_chu_dat_tour').optional({ checkFalsy: true }).isString().isLength({max: 1000}).withMessage('Ghi chú không quá 1000 ký tự.'),
    body('participants').optional().isArray().withMessage('Danh sách người tham gia phải là một mảng.'),
    body('participants.*.ho_ten').if(body('participants').exists().isArray({min:1})).notEmpty().withMessage('Tên người tham gia không được trống.')
        .isLength({max: 100}).withMessage('Tên người tham gia không quá 100 ký tự.'),
    body('participants.*.ngay_sinh').if(body('participants').exists().isArray({min:1})).optional({checkFalsy: true}).isISO8601().toDate().withMessage('Ngày sinh người tham gia không hợp lệ.'),
    body('participants.*.ghi_chu').if(body('participants').exists().isArray({min:1})).optional({checkFalsy: true}).isString().isLength({max: 500}).withMessage('Ghi chú người tham gia không quá 500 ký tự.')
];

const updateBookingValidationRules = () => [
    param('id_dat_tour').isInt({ min: 1 }).withMessage('ID đặt tour không hợp lệ.'),
    body('ngay_dat_tour').optional().isISO8601().withMessage('Ngày đặt tour không hợp lệ.').toDate(), // API nhận 'ngay_dat_tour'
    body('so_luong_khach').optional().isInt({ min: 1 }).withMessage('Số lượng khách phải ít nhất là 1.'),
    body('tong_tien_thanh_toan').optional({checkFalsy:true}).isDecimal({ decimal_digits: '0,2' }).withMessage('Tổng tiền thanh toán không hợp lệ.').toFloat(),
    body('trang_thai_thanh_toan').optional().isIn(paymentStatusValues).withMessage('Trạng thái thanh toán không hợp lệ.'),
    body('trang_thai_dat_tour').optional().isIn(bookingStatusValues).withMessage('Trạng thái đặt tour không hợp lệ.'),
    body('ghi_chu_dat_tour').optional({ checkFalsy: true }).isString().isLength({max: 1000}).withMessage('Ghi chú không quá 1000 ký tự.'),
    body('participants').optional().isArray().withMessage('Danh sách người tham gia phải là một mảng.'),
    body('participants.*.id_nguoi_tham_gia').if(body('participants').exists().isArray({min:1})).optional().isInt({min:1}).withMessage('ID người tham gia không hợp lệ (nếu cập nhật).'),
    body('participants.*.ho_ten').if(body('participants').exists().isArray({min:1})).notEmpty().withMessage('Tên người tham gia không được trống.')
         .isLength({max: 100}).withMessage('Tên người tham gia không quá 100 ký tự.'),
    body('participants.*.ngay_sinh').if(body('participants').exists().isArray({min:1})).optional({checkFalsy: true}).isISO8601().toDate().withMessage('Ngày sinh người tham gia không hợp lệ.'),
    body('participants.*.ghi_chu').if(body('participants').exists().isArray({min:1})).optional({checkFalsy: true}).isString().isLength({max: 500}).withMessage('Ghi chú người tham gia không quá 500 ký tự.')
];

const getAllBookingsQueryValidationRules = () => [ // Giữ nguyên
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('trangThaiDatTour').optional().isIn(bookingStatusValues),
    query('trangThaiThanhToan').optional().isIn(paymentStatusValues),
    query('tuNgay').optional().isISO8601().toDate().withMessage('Từ ngày không hợp lệ (YYYY-MM-DD).'),
    query('denNgay').optional().isISO8601().toDate().withMessage('Đến ngày không hợp lệ (YYYY-MM-DD).')
        .custom((value, { req }) => {
            if (req.query.tuNgay && new Date(value) < new Date(req.query.tuNgay)) {
                throw new Error('Đến ngày phải sau hoặc bằng Từ ngày.');
            }
            return true;
        }),
    query('sortBy').optional().isIn(['dt.ngay_dat', 'dt.ngay_tao', 'kh.ho_ten', 'spt.ten_tour', 'dt.tong_tien_thanh_toan', 'dt.trang_thai_dat_tour', 'dt.trang_thai_thanh_toan']), // Sửa dt.ngay_dat_TIMESTAMP và dt.ngay_tao_TIMESTAMP
    query('order').optional().isIn(['ASC', 'DESC'])
];

// ... (các hàm controller createBooking, getAllBookings, getBookingById, updateBooking, cancelBooking, getBookingStatistics giữ nguyên)
// Đảm bảo rằng trong các hàm này, khi bạn lấy dữ liệu từ req.body để truyền cho service,
// bạn dùng tên trường mà API client gửi lên (ví dụ: req.body.ngay_dat_tour).
// Service sẽ lo việc ánh xạ sang tên trường mà model mong đợi (ví dụ: ngay_dat).
const createBooking = async (req, res, next) => {
    try {
        const { participants, ...bookingDetailsFromController } = req.body;
        // Service createBooking sẽ nhận bookingDetailsFromController
        // và tự xử lý ánh xạ ngay_dat_tour -> ngay_dat nếu cần
        const newBooking = await bookingService.createBooking(bookingDetailsFromController, participants);
        return successResponse(res, 'Tạo đơn đặt tour thành công.', newBooking, 201);
    } catch (error) {
        next(error);
    }
};
const getAllBookings = async (req, res, next) => {
    try {
        const { page, limit, searchTerm, trangThaiDatTour, trangThaiThanhToan, tuNgay, denNgay, sortBy, order } = req.query;
        const filters = { searchTerm, trangThaiDatTour, trangThaiThanhToan, tuNgay, denNgay, sortBy, order };
        const paginationOptions = { page, limit };
        const result = await bookingService.getAllBookings(filters, paginationOptions);
        return paginatedResponse(res, 'Lấy danh sách đơn đặt tour thành công.', result.bookings, result.pagination);
    } catch (error) {
        next(error);
    }
};
const getBookingById = async (req, res, next) => {
    try {
        const booking = await bookingService.getBookingById(req.params.id_dat_tour);
        return successResponse(res, 'Lấy thông tin đơn đặt tour thành công.', booking);
    } catch (error) {
        next(error);
    }
};
const updateBooking = async (req, res, next) => {
    try {
        const { participants, ...bookingDetailsFromController } = req.body;
        const result = await bookingService.updateBooking(req.params.id_dat_tour, bookingDetailsFromController, participants);
        return successResponse(res, result.message, result.booking);
    } catch (error) {
        next(error);
    }
};
const cancelBooking = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const result = await bookingService.cancelBooking(req.params.id_dat_tour, reason);
        return successResponse(res, result.message, result.booking);
    } catch (error) {
        next(error);
    }
};
const getBookingStatistics = async (req, res, next) => {
    try {
        const stats = await bookingService.getBookingStatistics();
        return successResponse(res, 'Lấy thống kê đặt tour thành công.', stats);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createBooking, getAllBookings, getBookingById, updateBooking, cancelBooking, getBookingStatistics,
    createBookingValidationRules, updateBookingValidationRules, getAllBookingsQueryValidationRules
};