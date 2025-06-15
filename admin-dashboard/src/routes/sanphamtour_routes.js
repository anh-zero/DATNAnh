const express = require('express');
const tourController = require('../controllers/sanphamtour_controller');
const authMiddleware = require('../middlewares/auth_middleware');
const handleValidationErrors = require('../middlewares/validation_middleware');
const uploadMiddleware = require('../middlewares/upload_middleware');
const tourScheduleRoutes = require('./lichtrinhtour_standalone_routes'); // Lồng route cho schedules
const tourScheduleController = require('../controllers/lichtrinhtour_controller').TourScheduleController;
const { scheduleValidationRules } = require('../controllers/lichtrinhtour_controller');
const { param } = require('express-validator');
const router = express.Router();

router.use(authMiddleware.authenticateToken);
router.use(authMiddleware.authorizeRole(['admin']));

router.post(
    '/',
    uploadMiddleware.single('url_anh_bia'),
    tourController.tourValidationRules(), // Đảm bảo rules này không còn 'partners'
    handleValidationErrors,
    tourController.createTour
);

router.get(
    '/',
    tourController.getAllToursQueryValidationRules(),
    handleValidationErrors,
    tourController.getAllTours
);

router.get('/statistics', tourController.getTourStatistics); // Route thống kê

router.get(
    '/:id_san_pham_tour',
    // param('id_san_pham_tour').isInt({ min: 1 }).withMessage('ID sản phẩm tour không hợp lệ.'), // Đã có trong updateTourValidationRules
    handleValidationErrors,
    tourController.getTourById
);

router.put(
    '/:id_san_pham_tour',
    uploadMiddleware.single('url_anh_bia'),
    tourController.updateTourValidationRules(), // Đảm bảo rules này không còn 'partners'
    handleValidationErrors,
    tourController.updateTour
);

router.delete(
    '/:id_san_pham_tour',
    // param('id_san_pham_tour').isInt({ min: 1 }).withMessage('ID sản phẩm tour không hợp lệ.'),
    handleValidationErrors,
    tourController.deleteTour
);

// Thêm route GET để lấy tất cả lịch trình của một tour
router.get(
    '/:id_san_pham_tour/lichtrinhtour',
    param('id_san_pham_tour').isInt({ min: 1 }).withMessage('ID tour không hợp lệ'),
    handleValidationErrors,
    tourScheduleController.getAllSchedulesForTour
);

// Thêm route POST để thêm lịch trình mới cho tour
router.post(
    '/:id_san_pham_tour/lichtrinhtour',
    scheduleValidationRules(), // VALIDATION (CHẠY SAU)
    handleValidationErrors,
    tourScheduleController.createTourSchedule
);

module.exports = router;
