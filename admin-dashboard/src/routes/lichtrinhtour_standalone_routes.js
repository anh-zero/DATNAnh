const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const {
    TourScheduleController,
    scheduleValidationRules,
    updateScheduleValidationRules
} = require('../controllers/lichtrinhtour_controller');
const validationMiddleware = require('../middlewares/validation_middleware');
const authMiddleware = require('../middlewares/auth_middleware');
const bookingController = require('../controllers/dattour_controller');
const dichvuTourController = require('../controllers/dichvutour_controller');
const hoatDongTourController = require('../controllers/hoatdongtour_controller').TourActivityController;
const { activityValidationRules } = require('../controllers/hoatdongtour_controller');

// Áp dụng middleware xác thực
router.use(authMiddleware.authenticateToken);
router.use(authMiddleware.authorizeRole(['admin'])); // hoặc các role phù hợp

// GET /lichtrinhtour - Lấy danh sách lịch trình
router.get('/', TourScheduleController.getAllTourSchedules);

// THÊM ROUTE STATISTICS (phải đặt trước các routes có param)
// GET /lichtrinhtour/statistics - Lấy thống kê về lịch trình tour
router.get('/statistics', TourScheduleController.getTourScheduleStatistics);

// POST /lichtrinhtour - Tạo mới lịch trình tour
router.post(
    '/',
    scheduleValidationRules(),
    validationMiddleware,
    TourScheduleController.createTourSchedule
);

// GET /api/schedules/:id_lich_trinh_tour
router.get(
    '/:id_lich_trinh_tour',
    param('id_lich_trinh_tour').isInt({ min: 1 }).withMessage('ID lịch trình không hợp lệ.'),
    validationMiddleware,
    TourScheduleController.getTourScheduleById  // Thay tourScheduleController thành TourScheduleController
);

// PUT /api/schedules/:id_lich_trinh_tour
router.put(
    '/:id_lich_trinh_tour',
    updateScheduleValidationRules(), // Thay tourScheduleController.updateScheduleValidationRules()
    validationMiddleware,
    TourScheduleController.updateTourSchedule  // Thay tourScheduleController thành TourScheduleController
);

// DELETE /api/schedules/:id_lich_trinh_tour
router.delete(
    '/:id_lich_trinh_tour',
    param('id_lich_trinh_tour').isInt({ min: 1 }).withMessage('ID lịch trình không hợp lệ.'),
    validationMiddleware,
    TourScheduleController.deleteTourSchedule  // Thay tourScheduleController thành TourScheduleController
);

// PATCH /api/schedules/:id_lich_trinh_tour/cancel
router.patch(
    '/:id_lich_trinh_tour/cancel',
    param('id_lich_trinh_tour').isInt({ min: 1 }).withMessage('ID lịch trình không hợp lệ.'),
    // Thêm validation cho 'reason' nếu cần
    validationMiddleware,
    TourScheduleController.cancelTourSchedule  // Thay tourScheduleController thành TourScheduleController
);

// Nested routes for services and activities related to this schedule
const tourProvidedServiceRoutes = require('./dichvutour_standalone_routes');
const tourActivityRoutes = require('./hoatdongtour_standalone_routes');

router.use('/:id_lich_trinh_tour/provided-services', tourProvidedServiceRoutes);
router.use('/:id_lich_trinh_tour/activities', tourActivityRoutes);

// Thêm route GET để lấy đơn đặt tour của lịch trình
router.get(
    '/:id_lich_trinh_tour/dattour',
    param('id_lich_trinh_tour').isInt({ min: 1 }).withMessage('ID lịch trình không hợp lệ'),
    validationMiddleware,
    bookingController.getBookingsByScheduleId
);

// Thêm route GET để lấy dịch vụ của lịch trình
router.get(
    '/:id_lich_trinh_tour/dichvutour',
    param('id_lich_trinh_tour').isInt({ min: 1 }).withMessage('ID lịch trình không hợp lệ'),
    validationMiddleware,
    dichvuTourController.getServicesByScheduleId
);

// Thêm route POST để thêm dịch vụ cho lịch trình
router.post(
    '/:id_lich_trinh_tour/dichvutour',
    param('id_lich_trinh_tour').isInt({ min: 1 }).withMessage('ID lịch trình không hợp lệ'),
    dichvuTourController.providedServiceValidationRules(),
    validationMiddleware,
    dichvuTourController.addServiceToSchedule
);

// Thêm route GET để lấy hoạt động của lịch trình
router.get(
    '/:id_lich_trinh_tour/hoatdongtour',
    param('id_lich_trinh_tour').isInt({ min: 1 }).withMessage('ID lịch trình không hợp lệ'),
    validationMiddleware,
    hoatDongTourController.getActivitiesByScheduleId
);

// Thêm route POST để thêm hoạt động cho lịch trình
router.post(
    '/:id_lich_trinh_tour/hoatdongtour',
    param('id_lich_trinh_tour').isInt({ min: 1 }).withMessage('ID lịch trình không hợp lệ'),
    activityValidationRules(),
    validationMiddleware,
    hoatDongTourController.addActivityToSchedule
);

module.exports = router;