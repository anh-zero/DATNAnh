const express = require('express');
const tourController = require('../controllers/tour_controller');
const tourScheduleController = require('../controllers/tour_schedule_controller'); // Thêm
const { authenticateToken, isAdmin } = require('../middlewares/auth_middleware');
const handleValidationErrors = require('../middlewares/validation_middleware');
const { uploadTourImage } = require('../middlewares/upload_middleware');
const { param } = require('express-validator');

const router = express.Router();

router.use(authenticateToken, isAdmin);

// Routes cho Sản phẩm Tour (sanphamtour)
router.post('/',
    uploadTourImage.single('url_anh_bia'),
    tourController.tourValidationRules(),
    handleValidationErrors,
    tourController.createTour
);
router.get('/',
    tourController.getAllToursQueryValidationRules(),
    handleValidationErrors,
    tourController.getAllTours
);
router.get('/statistics', tourController.getTourStatistics);

router.get('/:id_san_pham_tour',
    [param('id_san_pham_tour').isInt({ min: 1 }).withMessage('ID sản phẩm tour không hợp lệ.')],
    handleValidationErrors,
    tourController.getTourById
);
router.put('/:id_san_pham_tour',
    uploadTourImage.single('url_anh_bia'),
    tourController.updateTourValidationRules(),
    handleValidationErrors,
    tourController.updateTour
);
router.delete('/:id_san_pham_tour',
    [param('id_san_pham_tour').isInt({ min: 1 }).withMessage('ID sản phẩm tour không hợp lệ.')],
    handleValidationErrors,
    tourController.deleteTour
);

// --- Sub-routes cho Lịch trình khởi hành (lichtrinhtour) của một Tour ---
const scheduleRouter = express.Router({ mergeParams: true }); // mergeParams để truy cập id_san_pham_tour
router.use('/:id_san_pham_tour/schedules',
    [param('id_san_pham_tour').isInt({ min: 1 }).withMessage('ID sản phẩm tour không hợp lệ cho lịch trình.')], // Validate id_san_pham_tour ở đây
    handleValidationErrors,
    scheduleRouter
);

// POST /api/tours/:id_san_pham_tour/schedules
scheduleRouter.post('/',
    tourScheduleController.scheduleValidationRules(),
    handleValidationErrors,
    tourScheduleController.createTourSchedule
);

// GET /api/tours/:id_san_pham_tour/schedules
scheduleRouter.get('/',
    tourScheduleController.getAllSchedulesQueryValidationRules(),
    handleValidationErrors,
    tourScheduleController.getAllSchedulesForTour
);

// GET /api/tours/:id_san_pham_tour/schedules/:id_lich_trinh_tour
scheduleRouter.get('/:id_lich_trinh_tour',
    [param('id_lich_trinh_tour').isInt({ min: 1 }).withMessage('ID lịch trình không hợp lệ.')],
    handleValidationErrors,
    tourScheduleController.getTourScheduleById
);

// PUT /api/tours/:id_san_pham_tour/schedules/:id_lich_trinh_tour
scheduleRouter.put('/:id_lich_trinh_tour',
    [param('id_lich_trinh_tour').isInt({ min: 1 }).withMessage('ID lịch trình không hợp lệ.')], // Giữ param validation
    tourScheduleController.updateScheduleValidationRules(), // Sử dụng rules mới
    handleValidationErrors,
    tourScheduleController.updateTourSchedule
);

// DELETE /api/tours/:id_san_pham_tour/schedules/:id_lich_trinh_tour
scheduleRouter.delete('/:id_lich_trinh_tour',
    [param('id_lich_trinh_tour').isInt({ min: 1 }).withMessage('ID lịch trình không hợp lệ.')],
    handleValidationErrors,
    tourScheduleController.deleteTourSchedule
);

// PATCH /api/tours/:id_san_pham_tour/schedules/:id_lich_trinh_tour/cancel
scheduleRouter.patch('/:id_lich_trinh_tour/cancel',
    [param('id_lich_trinh_tour').isInt({ min: 1 }).withMessage('ID lịch trình không hợp lệ.')],
    handleValidationErrors,
    tourScheduleController.cancelTourSchedule
);


// TODO: Routes cho quản lý đối tác của một tour (nếu cần API riêng thay vì cập nhật qua PUT /api/tours/:id)
// Ví dụ:
// POST /api/tours/:id_san_pham_tour/partners
// DELETE /api/tours/:id_san_pham_tour/partners/:id_doi_tac

module.exports = router;
