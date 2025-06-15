const express = require('express');
const locationController = require('../controllers/diadiem_controller'); // Bạn cần tạo controller này
const authMiddleware = require('../middlewares/auth_middleware');
const validationMiddleware = require('../middlewares/validation_middleware');
const { param } = require('express-validator'); // Import nếu dùng trực tiếp ở đây

// Import controllers
const hoatDongTourController = require('../controllers/hoatdongtour_controller').TourActivityController;
const partnerController = require('../controllers/doitac_controller');

const router = express.Router();

router.use(authMiddleware.authenticateToken);
router.use(authMiddleware.authorizeRole(['admin']));

router.post(
    '/',
    locationController.locationValidationRules(),
    validationMiddleware,
    locationController.createLocation
);

router.get(
    '/',
    locationController.getAllLocationsQueryValidationRules(),
    validationMiddleware,
    locationController.getAllLocations
);

router.get(
    '/:id_dia_diem',
    // param('id_dia_diem').isInt({ min: 1 }).withMessage('ID địa điểm không hợp lệ.'),
    validationMiddleware,
    locationController.getLocationById
);

router.put(
    '/:id_dia_diem',
    locationController.locationValidationRules(), // Có thể cần rule riêng cho update
    validationMiddleware,
    locationController.updateLocation
);

router.delete(
    '/:id_dia_diem',
    // param('id_dia_diem').isInt({ min: 1 }).withMessage('ID địa điểm không hợp lệ.'),
    validationMiddleware,
    locationController.deleteLocation
);

// Thêm route GET để lấy hoạt động tại địa điểm
router.get(
    '/:id_dia_diem/hoatdongtour',
    param('id_dia_diem').isInt({ min: 1 }).withMessage('ID địa điểm không hợp lệ'),
    validationMiddleware,
    hoatDongTourController.getActivitiesByLocationId
);

// Thêm route GET để lấy đối tác tại địa điểm
router.get(
    '/:id_dia_diem/doitac',
    param('id_dia_diem').isInt({ min: 1 }).withMessage('ID địa điểm không hợp lệ'),
    validationMiddleware,
    partnerController.getPartnersByLocationId
);

module.exports = router;