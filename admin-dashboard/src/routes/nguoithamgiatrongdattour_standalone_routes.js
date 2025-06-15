const express = require('express');
const router = express.Router();
const { 
    BookingParticipantController, 
    participantValidationRules 
} = require('../controllers/nguoithamgiatrongdattour_controller');
const handleValidationErrors = require('../middlewares/validation_middleware');
const { param } = require('express-validator');
const authMiddleware = require('../middlewares/auth_middleware');

// Middleware xác thực (tùy vào yêu cầu của bạn)
router.use(authMiddleware.authenticateToken);
// Chỉ đặt middleware quyền admin nếu cần
// router.use(authMiddleware.authorizeRole(['admin']));

// GET /nguoithamgiatrongdattour/booking/:id_dat_tour
router.get(
    '/booking/:id_dat_tour',
    param('id_dat_tour').isInt({ min: 1 }).withMessage('ID đơn đặt tour không hợp lệ.'),
    handleValidationErrors,
    BookingParticipantController.getParticipantsByBookingId
);

// POST /nguoithamgiatrongdattour - Thêm một người tham gia
router.post(
    '/',
    participantValidationRules(),
    handleValidationErrors,
    BookingParticipantController.createParticipant
);

// POST /nguoithamgiatrongdattour/booking/:id_dat_tour/multiple - Thêm nhiều người tham gia
router.post(
    '/booking/:id_dat_tour/multiple',
    param('id_dat_tour').isInt({ min: 1 }).withMessage('ID đơn đặt tour không hợp lệ.'),
    handleValidationErrors,
    BookingParticipantController.createMultipleParticipants
);

// PUT /nguoithamgiatrongdattour/:id_nguoi_tham_gia - Cập nhật người tham gia
router.put(
    '/:id_nguoi_tham_gia',
    param('id_nguoi_tham_gia').isInt({ min: 1 }).withMessage('ID người tham gia không hợp lệ.'),
    handleValidationErrors,
    BookingParticipantController.updateParticipant
);

// DELETE /nguoithamgiatrongdattour/:id_nguoi_tham_gia - Xóa một người tham gia
router.delete(
    '/:id_nguoi_tham_gia',
    param('id_nguoi_tham_gia').isInt({ min: 1 }).withMessage('ID người tham gia không hợp lệ.'),
    handleValidationErrors,
    BookingParticipantController.deleteParticipant
);

// DELETE /nguoithamgiatrongdattour/booking/:id_dat_tour - Xóa tất cả người tham gia của một đơn đặt tour
router.delete(
    '/booking/:id_dat_tour',
    param('id_dat_tour').isInt({ min: 1 }).withMessage('ID đơn đặt tour không hợp lệ.'),
    handleValidationErrors,
    BookingParticipantController.deleteAllParticipantsByBookingId
);

// GET /nguoithamgiatrongdattour - Route test cơ bản
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: "API người tham gia trong đặt tour hoạt động bình thường"
    });
});

module.exports = router;