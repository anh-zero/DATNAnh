const express = require('express');
const tourReviewController = require('../controllers/danhgiatour_controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth_middleware');
const handleValidationErrors = require('../middlewares/validation_middleware');
const { param } = require('express-validator');

const router = express.Router();

// Tất cả các route trong file này yêu cầu admin
router.use(authenticateToken, isAdmin);

// GET /api/reviews (Xem danh sách tất cả đánh giá)
router.get('/',
    tourReviewController.getAllReviewsQueryValidationRules(),
    handleValidationErrors,
    tourReviewController.getAllReviews
);

// GET /api/reviews/:id_danh_gia (Xem chi tiết một đánh giá)
router.get('/:id_danh_gia',
    [param('id_danh_gia').isInt({ min: 1 }).withMessage('ID đánh giá không hợp lệ.')],
    handleValidationErrors,
    tourReviewController.getReviewById
);

// PUT /api/reviews/:id_danh_gia (Admin cập nhật đánh giá: duyệt, phản hồi)
router.put('/:id_danh_gia',
    tourReviewController.updateReviewValidationRules(),
    handleValidationErrors,
    tourReviewController.updateReviewByAdmin
);

// DELETE /api/reviews/:id_danh_gia (Admin xóa đánh giá)
router.delete('/:id_danh_gia',
    [param('id_danh_gia').isInt({ min: 1 }).withMessage('ID đánh giá không hợp lệ.')],
    handleValidationErrors,
    tourReviewController.deleteReview
);

module.exports = router;