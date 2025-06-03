const express = require('express');
const customerController = require('../controllers/customer_controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth_middleware');
const handleValidationErrors = require('../middlewares/validation_middleware');
const { param } = require('express-validator');

const router = express.Router();

// Tất cả các route trong file này yêu cầu admin
router.use(authenticateToken, isAdmin);

// POST /api/customers (Thêm khách hàng mới)
router.post('/',
    customerController.createCustomerValidationRules(),
    handleValidationErrors,
    customerController.createCustomer
);

// GET /api/customers (Xem danh sách khách hàng)
router.get('/',
    customerController.getAllCustomersQueryValidationRules(),
    handleValidationErrors,
    customerController.getAllCustomers
);

// GET /api/customers/:id_khach_hang (Xem chi tiết khách hàng)
router.get('/:id_khach_hang',
    [param('id_khach_hang').isInt({ min: 1 }).withMessage('ID khách hàng không hợp lệ.')],
    handleValidationErrors,
    customerController.getCustomerById
);

// PUT /api/customers/:id_khach_hang (Sửa thông tin khách hàng)
router.put('/:id_khach_hang',
    customerController.updateCustomerValidationRules(),
    handleValidationErrors,
    customerController.updateCustomer
);

// DELETE /api/customers/:id_khach_hang (Xóa khách hàng)
router.delete('/:id_khach_hang',
    [param('id_khach_hang').isInt({ min: 1 }).withMessage('ID khách hàng không hợp lệ.')],
    handleValidationErrors,
    customerController.deleteCustomer
);

module.exports = router;