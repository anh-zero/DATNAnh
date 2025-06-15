const express = require('express');
const { TourActivityController, updateActivityValidationRules, activityValidationRules } = require('../controllers/hoatdongtour_controller');
const authMiddleware = require('../middlewares/auth_middleware');
const validationMiddleware = require('../middlewares/validation_middleware');
const { param } = require('express-validator');

const router = express.Router();

router.use(authMiddleware.authenticateToken);
router.use(authMiddleware.authorizeRole(['admin']));

// GET /api/activities/:id_hoat_dong
router.get(
    '/:id_hoat_dong',
    param('id_hoat_dong').isInt({ min: 1 }).withMessage('ID hoạt động không hợp lệ.'),
    validationMiddleware,
    TourActivityController.getActivityById // Gọi method từ object
);

// PUT /api/activities/:id_hoat_dong
router.put(
    '/:id_hoat_dong',
    // param('id_hoat_dong').isInt({ min: 1 }).withMessage('ID hoạt động không hợp lệ.'), // Đã có trong updateActivityValidationRules
    updateActivityValidationRules(),
    validationMiddleware,
    TourActivityController.updateActivityInSchedule
);

// DELETE /api/activities/:id_hoat_dong
router.delete(
    '/:id_hoat_dong',
    param('id_hoat_dong').isInt({ min: 1 }).withMessage('ID hoạt động không hợp lệ.'),
    validationMiddleware,
    TourActivityController.removeActivityFromSchedule
);

// Thêm route để lấy tất cả hoạt động tour nếu chưa có
router.get(
    '/',
    TourActivityController.getAllActivities  // Đảm bảo đã có method này trong controller
);

// Thêm route POST để tạo hoạt động tour mới
router.post(
    '/',
    activityValidationRules(),  // Đảm bảo có validation rules phù hợp
    validationMiddleware,
    TourActivityController.addActivityToSchedule  // Đảm bảo controller này đã tồn tại
);

module.exports = router;