// File: src/controllers/booking_controller.js
// (Cập nhật validation rule cho ngay_dat_TIMESTAMP thành ngay_dat_tour)
const bookingService = require('../services/dattour_service');
const { successResponse, errorResponse, paginatedResponse, paginatedResponseObj } = require('../utils/api_response');
const { body, param, query } = require('express-validator');
// const handleValidationErrors = require('../middlewares/validation_middleware'); // Đã dùng ở routes

const bookingStatusValues = ['Mới', 'Đã xác nhận', 'Chờ thanh toán', 'Đã hủy', 'Hoàn thành'];
// Thay thế giá trị cũ bằng giá trị ENUM mới
const paymentStatusValues = ['Chờ thanh toán', 'Thanh toán một phần', 'Đã thanh toán', 'Hoàn tiền'];

const createBookingValidationRules = () => [
    body('id_khach_hang').isInt({ min: 1 }).withMessage('ID khách hàng không hợp lệ.'),
    body('id_lich_trinh_tour').isInt({ min: 1 }).withMessage('ID lịch trình tour không hợp lệ.'),
    body('ngay_dat_tour').optional().isISO8601().withMessage('Ngày đặt tour không hợp lệ (YYYY-MM-DD HH:MM:SS hoặc ISO8601).').toDate(), // API nhận 'ngay_dat_tour'
    body('so_luong_khach').isInt({ min: 1 }).withMessage('Số lượng khách phải ít nhất là 1.'),
    body('tong_tien_du_kien').optional({ checkFalsy: true }).isDecimal({ decimal_digits: '0,2' }).withMessage('Tổng tiền dự kiến không hợp lệ.').toFloat(),
    body('tong_tien_thanh_toan').optional({ checkFalsy: true }).isDecimal({ decimal_digits: '0,2' }).withMessage('Tổng tiền thanh toán không hợp lệ.').toFloat(),
    body('trang_thai_thanh_toan')
        .optional()
        .isIn(['Chờ thanh toán', 'Thanh toán một phần', 'Đã thanh toán', 'Hoàn tiền'])
        .withMessage('Trạng thái thanh toán không hợp lệ.'),
    body('trang_thai_dat_tour').optional().isIn(bookingStatusValues).withMessage('Trạng thái đặt tour không hợp lệ.'),
    body('ghi_chu_dat_tour').optional({ checkFalsy: true }).isString().isLength({ max: 1000 }).withMessage('Ghi chú không quá 1000 ký tự.'),
    body('participants').optional().isArray().withMessage('Danh sách người tham gia phải là một mảng.'),
    body('participants.*.ho_ten').if(body('participants').exists().isArray({ min: 1 })).notEmpty().withMessage('Tên người tham gia không được trống.')
        .isLength({ max: 100 }).withMessage('Tên người tham gia không quá 100 ký tự.'),
    body('participants.*.ngay_sinh').if(body('participants').exists().isArray({ min: 1 })).optional({ checkFalsy: true }).isISO8601().toDate().withMessage('Ngày sinh người tham gia không hợp lệ.'),
    body('participants.*.ghi_chu').if(body('participants').exists().isArray({ min: 1 })).optional({ checkFalsy: true }).isString().isLength({ max: 500 }).withMessage('Ghi chú người tham gia không quá 500 ký tự.')
];

const updateBookingValidationRules = () => [
    param('id_dat_tour').isInt({ min: 1 }).withMessage('ID đặt tour không hợp lệ.'),
    body('ngay_dat_tour').optional().isISO8601().withMessage('Ngày đặt tour không hợp lệ.').toDate(), // API nhận 'ngay_dat_tour'
    body('so_luong_khach').optional().isInt({ min: 1 }).withMessage('Số lượng khách phải ít nhất là 1.'),
    body('tong_tien_thanh_toan').optional({ checkFalsy: true }).isDecimal({ decimal_digits: '0,2' }).withMessage('Tổng tiền thanh toán không hợp lệ.').toFloat(),
    body('trang_thai_thanh_toan')
        .optional()
        .isIn(['Chờ thanh toán', 'Thanh toán một phần', 'Đã thanh toán', 'Hoàn tiền'])
        .withMessage('Trạng thái thanh toán không hợp lệ.'),
    body('trang_thai_dat_tour').optional().isIn(bookingStatusValues).withMessage('Trạng thái đặt tour không hợp lệ.'),
    body('ghi_chu_dat_tour').optional({ checkFalsy: true }).isString().isLength({ max: 1000 }).withMessage('Ghi chú không quá 1000 ký tự.'),
    body('participants').optional().isArray().withMessage('Danh sách người tham gia phải là một mảng.'),
    body('participants.*.id_nguoi_tham_gia').if(body('participants').exists().isArray({ min: 1 })).optional().isInt({ min: 1 }).withMessage('ID người tham gia không hợp lệ (nếu cập nhật).'),
    body('participants.*.ho_ten').if(body('participants').exists().isArray({ min: 1 })).notEmpty().withMessage('Tên người tham gia không được trống.')
        .isLength({ max: 100 }).withMessage('Tên người tham gia không quá 100 ký tự.'),
    body('participants.*.ngay_sinh').if(body('participants').exists().isArray({ min: 1 })).optional({ checkFalsy: true }).isISO8601().toDate().withMessage('Ngày sinh người tham gia không hợp lệ.'),
    body('participants.*.ghi_chu').if(body('participants').exists().isArray({ min: 1 })).optional({ checkFalsy: true }).isString().isLength({ max: 500 }).withMessage('Ghi chú người tham gia không quá 500 ký tự.')
];

const getAllBookingsQueryValidationRules = () => [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('trangThaiDatTour').optional().isIn(bookingStatusValues),
    // Cập nhật để sử dụng giá trị ENUM mới
    query('trangThaiThanhToan').optional().isIn(paymentStatusValues),
    query('tuNgay').optional().isISO8601().toDate().withMessage('Từ ngày không hợp lệ (YYYY-MM-DD).'),
    query('denNgay').optional().isISO8601().toDate().withMessage('Đến ngày không hợp lệ (YYYY-MM-DD).')
        .custom((value, { req }) => {
            if (req.query.tuNgay && new Date(value) < new Date(req.query.tuNgay)) {
                throw new Error('Đến ngày phải sau hoặc bằng Từ ngày.');
            }
            return true;
        }),
    // Cập nhật danh sách các cột được phép sắp xếp
    query('sortBy').optional().isIn([
        'dt.id_dat_tour', 'dt.ngay_dat', 'dt.ngay_tao', 'dt.trang_thai_dat_tour', 'dt.trang_thai_thanh_toan',
        'kh.ho_ten', 'spt.ten_tour', 'dt.so_luong_khach', 'dt.tong_tien_thanh_toan',
        // Thêm các phiên bản không có tiền tố để tương thích với frontend
        'id_dat_tour', 'ngay_dat', 'ngay_tao', 'trang_thai_dat_tour', 'trang_thai_thanh_toan',
        'ho_ten', 'ten_tour', 'so_luong_khach', 'tong_tien_thanh_toan'
    ]),
    query('order').optional().isIn(['ASC', 'DESC'])
];

const BookingController = {
    createBooking: async (req, res, next) => {
        try {
            console.log("Request body:", req.body); // Log request để debug

            // Kiểm tra nếu id_khach_hang không tồn tại
            if (!req.body.id_khach_hang) {
                return errorResponse(res, 'id_khach_hang is required', null, 400);
            }

            const { participants, ...bookingDetailsFromController } = req.body;

            // Log dữ liệu trước khi gửi đến service
            console.log("Booking details:", bookingDetailsFromController);

            const newBooking = await bookingService.createBooking(bookingDetailsFromController, participants);
            return successResponse(res, 'Tạo đơn đặt tour thành công.', newBooking, 201);
        } catch (error) {
            console.error("Error in createBooking:", error); // Log lỗi để debug
            next(error);
        }
    },

    getAllBookings: async (req, res, next) => {
        try {
            // Chuyển đổi tham số phân trang thành số và đảm bảo các giá trị mặc định
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            // Kiểm tra tính hợp lệ để tránh NaN
            if (isNaN(page) || isNaN(limit)) {
                return errorResponse(res, 'Tham số phân trang không hợp lệ', null, 400);
            }

            // Tính offset từ page và limit
            const offset = (page - 1) * limit;

            // Các tham số khác
            const searchTerm = req.query.searchTerm || '';
            const trangThaiDatTour = req.query.trangThaiDatTour || '';
            const trangThaiThanhToan = req.query.trangThaiThanhToan || ''; // Thêm filter này
            const tuNgay = req.query.tuNgay || null;
            const denNgay = req.query.denNgay || null;
            const sortBy = req.query.sortBy || 'dt.ngay_tao';
            const order = req.query.order || 'DESC';

            // Truyền tham số đúng định dạng vào service
            const queryParams = {
                page,
                limit,
                offset,
                searchTerm,
                trangThaiDatTour,
                trangThaiThanhToan, // Thêm vào queryParams
                tuNgay,
                denNgay,
                sortBy,
                order
            };

            console.log("Query params:", queryParams); // Log để debug

            const result = await bookingService.getAllBookings(queryParams);
            return paginatedResponse(res, 'Lấy danh sách đơn đặt tour thành công.', result.data, result.pagination);
        } catch (error) {
            console.error("Error in getAllBookings:", error); // Log lỗi để debug
            next(error);
        }
    },

    getBookingById: async (req, res, next) => {
        try {
            const booking = await bookingService.getBookingById(req.params.id_dat_tour);
            return successResponse(res, 'Lấy thông tin đơn đặt tour thành công.', booking);
        } catch (error) {
            next(error);
        }
    },

    updateBooking: async (req, res, next) => {
        try {
            const { participants, ...bookingDetailsFromController } = req.body;
            const result = await bookingService.updateBooking(req.params.id_dat_tour, bookingDetailsFromController, participants);
            return successResponse(res, result.message, result.booking);
        } catch (error) {
            next(error);
        }
    },

    cancelBooking: async (req, res, next) => {
        try {
            const { reason } = req.body; // Giả sử lý do hủy được gửi trong body
            const result = await bookingService.cancelBooking(req.params.id_dat_tour, reason);
            return successResponse(res, result.message, result.booking);
        } catch (error) {
            next(error);
        }
    },

    getBookingStatistics: async (req, res, next) => {
        try {
            const stats = await bookingService.getBookingStatistics();
            return successResponse(res, 'Lấy thống kê đặt tour thành công.', stats);
        } catch (error) {
            next(error);
        }
    },

    // Thêm phương thức hardDeleteBooking
    hardDeleteBooking: async (req, res, next) => {
        try {
            // Kiểm tra quyền của người dùng (đã được xử lý trong middleware isAdmin)

            // Log thông tin xóa để theo dõi
            console.log(`Attempting to hard delete booking ID: ${req.params.id_dat_tour}`);

            // Gọi service để xóa cứng đơn đặt tour
            const result = await bookingService.deleteBooking(req.params.id_dat_tour);

            return successResponse(
                res,
                'Xóa vĩnh viễn đơn đặt tour thành công.',
                { id_dat_tour: req.params.id_dat_tour }
            );
        } catch (error) {
            console.error(`Error in hardDeleteBooking: ${error.message}`, error);
            next(error);
        }
    },

    // Thêm method getBookingsByScheduleId
    getBookingsByScheduleId: async (req, res, next) => {
        try {
            const { id_lich_trinh_tour } = req.params;
            const { page = 1, limit = 10 } = req.query;

            // Thêm JOIN với bảng khachhang và lấy thêm email
            const result = await bookingService.getBookingsByScheduleId(
                id_lich_trinh_tour,
                parseInt(page),
                parseInt(limit)
            );

            // Đảm bảo trả về email trong mỗi booking object
            const bookingsWithEmail = result.bookings.map(booking => ({
                ...booking,
                email: booking.khachhang?.email_lien_he || null
            }));

            return paginatedResponseObj({
                res: res,
                message: `Lấy danh sách đặt tour cho lịch trình ${id_lich_trinh_tour} thành công`,
                data: bookingsWithEmail,
                // Truyền các thuộc tính phân trang trực tiếp
                currentPage: parseInt(page),
                totalCount: result.totalItems,
                limit: parseInt(limit)
            });
        } catch (error) {
            next(error);
        }
    },

    // Thêm method getBookingsByCustomerId
    getBookingsByCustomerId: async (req, res, next) => {
        try {
            const { id_khach_hang } = req.params;
            const { page = 1, limit = 10, trangThaiDatTour, tuNgay, denNgay, sortBy, order } = req.query;

            const queryParams = {
                id_khach_hang: parseInt(id_khach_hang),
                page: parseInt(page),
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit),
                trangThaiDatTour,
                tuNgay,
                denNgay,
                sortBy: sortBy || 'ngay_tao',
                order: order || 'DESC'
            };

            const result = await bookingService.getBookingsByCustomerId(queryParams);

            return paginatedResponseObj({
                res,
                message: `Lấy lịch sử đặt tour của khách hàng ID ${id_khach_hang} thành công`,
                data: result.bookings,
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
    ...BookingController,
    createBookingValidationRules,
    updateBookingValidationRules,
    getAllBookingsQueryValidationRules
};