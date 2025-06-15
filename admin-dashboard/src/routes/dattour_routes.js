const express = require('express');
const bookingController = require('../controllers/dattour_controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth_middleware');
const handleValidationErrors = require('../middlewares/validation_middleware');
const { param } = require('express-validator');

// Import controllers
const participantController = require('../controllers/nguoithamgiatrongdattour_controller').BookingParticipantController;
const { participantValidationRules } = require('../controllers/nguoithamgiatrongdattour_controller');
const reviewController = require('../controllers/danhgiatour_controller');

const router = express.Router();

// Tất cả các route trong file này yêu cầu admin (hoặc quyền phù hợp)
router.use(authenticateToken, isAdmin);

// POST /api/bookings (Thêm đơn đặt tour mới)
router.post('/',
    bookingController.createBookingValidationRules(),
    handleValidationErrors,
    bookingController.createBooking
);

// GET /api/bookings (Xem danh sách đơn đặt tour)
router.get('/',
    bookingController.getAllBookingsQueryValidationRules(),
    handleValidationErrors,
    bookingController.getAllBookings
);

// GET /api/bookings/statistics (Thống kê đơn đặt tour)
router.get('/statistics', bookingController.getBookingStatistics);


// GET /api/bookings/:id_dat_tour (Xem chi tiết đơn đặt tour)
router.get('/:id_dat_tour',
    [param('id_dat_tour').isInt({ min: 1 }).withMessage('ID đặt tour không hợp lệ.')],
    handleValidationErrors,
    bookingController.getBookingById
);

// PUT /api/bookings/:id_dat_tour (Sửa thông tin đơn đặt tour)
router.put('/:id_dat_tour',
    bookingController.updateBookingValidationRules(),
    handleValidationErrors,
    bookingController.updateBooking
);

// PATCH /api/bookings/:id_dat_tour/cancel (Hủy đơn đặt tour)
router.patch('/:id_dat_tour/cancel',
    [param('id_dat_tour').isInt({ min: 1 }).withMessage('ID đặt tour không hợp lệ.')],
    // Có thể thêm validation cho body nếu có lý do hủy
    handleValidationErrors,
    bookingController.cancelBooking
);

// DELETE /api/bookings/:id_dat_tour (Xóa cứng đơn đặt tour - CÂN NHẮC KỸ)
// Thường thì không nên xóa cứng booking, chỉ nên hủy. Nếu vẫn muốn, service cần xử lý transaction.
router.delete('/:id_dat_tour',
    [param('id_dat_tour').isInt({ min: 1 }).withMessage('ID đặt tour không hợp lệ.')],
    handleValidationErrors,
    bookingController.hardDeleteBooking // Cần tạo hàm này nếu muốn
);

// Thêm route GET để lấy người tham gia của đơn đặt tour
router.get(
    '/:id_dat_tour/nguoithamgia',
    param('id_dat_tour').isInt({ min: 1 }).withMessage('ID đặt tour không hợp lệ'),
    handleValidationErrors,
    participantController.getParticipantsByBookingId
);

// Thêm route POST để thêm người tham gia vào đơn đặt tour
router.post(
    '/:id_dat_tour/nguoithamgia',
    param('id_dat_tour').isInt({ min: 1 }).withMessage('ID đặt tour không hợp lệ'),
    participantValidationRules(),
    handleValidationErrors,
    participantController.createParticipantForBooking
);

// Thêm route GET để lấy đánh giá của đơn đặt tour
router.get(
    '/:id_dat_tour/danhgia',
    param('id_dat_tour').isInt({ min: 1 }).withMessage('ID đặt tour không hợp lệ'),
    handleValidationErrors,
    reviewController.getReviewByBookingId
);

// TODO: Thêm các routes để quản lý người tham gia (participants) của một booking cụ thể nếu cần
// Ví dụ:
// POST /api/bookings/:id_dat_tour/participants
// PUT /api/bookings/:id_dat_tour/participants/:id_nguoi_tham_gia
// DELETE /api/bookings/:id_dat_tour/participants/:id_nguoi_tham_gia

module.exports = router;