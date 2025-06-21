const express = require('express');
const router = express.Router();
// Import the whole module instead of destructuring
const dichvuController = require('../controllers/dichvutour_controller');
const handleValidationErrors = require('../middlewares/validation_middleware');
const authMiddleware = require('../middlewares/auth_middleware');
const { param, body } = require('express-validator');

router.use(authMiddleware.authenticateToken);
router.use(authMiddleware.authorizeRole(['admin']));

// GET /api/provided-services
router.get('/', dichvuController.getAllServices);

// POST /api/provided-services - NEW ROUTE
router.post(
    '/',
    dichvuController.providedServiceValidationRules(),
    handleValidationErrors,
    dichvuController.addServiceToSchedule
);

// GET /api/provided-services/:id_dich_vu_tour
router.get(
    '/:id_dich_vu_tour',
    param('id_dich_vu_tour').isInt({ min: 1 }).withMessage('ID dịch vụ không hợp lệ.'),
    handleValidationErrors,
    dichvuController.getServiceById
);

// PUT /api/provided-services/:id_dich_vu_tour
router.put(
    '/:id_dich_vu_tour',
    param('id_dich_vu_tour').isInt({ min: 1 }).withMessage('ID dịch vụ không hợp lệ.'),
    dichvuController.updateServiceValidationRules(),
    handleValidationErrors,
    dichvuController.updateServiceInSchedule
);

// DELETE /api/provided-services/:id_dich_vu_tour
router.delete(
    '/:id_dich_vu_tour',
    param('id_dich_vu_tour').isInt({ min: 1 }).withMessage('ID dịch vụ không hợp lệ.'),
    handleValidationErrors,
    dichvuController.removeServiceFromSchedule
);

// Thêm route mới
router.get(
    '/statistics',
    dichvuController.getServiceTypeStatistics
);

module.exports = router;