const express = require('express');
const router = express.Router();

// Import các modules cần thiết
const customerController = require('../controllers/khachhang_controller');
const authMiddleware = require('../middlewares/auth_middleware');
const validationMiddleware = require('../middlewares/validation_middleware'); // Đổi tên từ handleValidationErrors cho nhất quán nếu cần
const { param } = require('express-validator'); // Import param nếu dùng trực tiếp ở đây

// Import controller dattour
const bookingController = require('../controllers/dattour_controller');

// Áp dụng middleware xác thực và phân quyền (ví dụ: chỉ admin được quản lý khách hàng)
router.use(authMiddleware.authenticateToken);
router.use(authMiddleware.authorizeRole(['admin'])); // Đảm bảo authMiddleware.authorizeRole đã được định nghĩa và export đúng

// Định nghĩa các routes cho khách hàng

// GET /api/customers - Lấy danh sách tất cả khách hàng
router.get(
    '/',
    customerController.getAllCustomersQueryValidationRules(),
    validationMiddleware,
    customerController.getAllCustomers
);

// POST /api/customers - Tạo một khách hàng mới
router.post(
    '/',
    customerController.createCustomerValidationRules(),
    validationMiddleware,
    customerController.createCustomer
);

// GET /api/customers/:id_khach_hang - Lấy thông tin chi tiết một khách hàng
router.get(
    '/:id_khach_hang',
    [param('id_khach_hang').isInt({ min: 1 }).withMessage('ID khách hàng không hợp lệ.')],
    validationMiddleware,
    customerController.getCustomerById
);

// PUT /api/customers/:id_khach_hang - Cập nhật thông tin khách hàng
router.put(
    '/:id_khach_hang',
    customerController.updateCustomerValidationRules(),
    validationMiddleware,
    customerController.updateCustomer
);

// DELETE /api/customers/:id_khach_hang - Xóa một khách hàng
router.delete(
    '/:id_khach_hang',
    [param('id_khach_hang').isInt({ min: 1 }).withMessage('ID khách hàng không hợp lệ.')],
    validationMiddleware,
    customerController.deleteCustomer
);

// Thêm route GET để lấy lịch sử đặt tour của khách hàng
router.get(
    '/:id_khach_hang/dattour',
    param('id_khach_hang').isInt({ min: 1 }).withMessage('ID khách hàng không hợp lệ'),
    validationMiddleware,
    bookingController.getBookingsByCustomerId
);

module.exports = router;