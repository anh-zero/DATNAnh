const express = require('express');
const userController = require('../controllers/nguoidung_controller');
const authMiddleware = require('../middlewares/auth_middleware');
const validationMiddleware = require('../middlewares/validation_middleware');
const uploadMiddleware = require('../middlewares/upload_middleware'); // Middleware xử lý avatar
const path = require('path');

const router = express.Router();

// Phục vụ file tĩnh từ thư mục 'public'
// Hoặc nếu muốn truy cập trực tiếp /uploads/avatars/file.jpg
// app.use(express.static(path.join(__dirname, 'public')));

// Áp dụng authMiddleware cho tất cả các route người dùng
router.use(authMiddleware.authenticateToken);
router.use(authMiddleware.authorizeRole(['admin'])); // Chỉ admin có quyền quản lý người dùng

router.post(
    '/',
    uploadMiddleware.single('avatar'), // Xử lý upload avatar trước validation
    userController.createUserValidationRules(),
    validationMiddleware,
    userController.createUser
);

router.get(
    '/',
    userController.getAllUsersQueryValidationRules(),
    validationMiddleware,
    userController.getAllUsers
);

router.get(
    '/:id_nguoi_dung',
    // param('id_nguoi_dung').isInt({ min: 1 }).withMessage('ID người dùng không hợp lệ.'), // Validation này đã có trong updateUserValidationRules và có thể dùng chung
    validationMiddleware, // Cần nếu có validation riêng cho param ở đây
    userController.getUserById
);

router.put(
    '/:id_nguoi_dung',
    uploadMiddleware.single('avatar'),
    userController.updateUserValidationRules(),
    validationMiddleware,
    userController.updateUser
);

// Route thay đổi trạng thái người dùng
router.patch(
    '/:id_nguoi_dung/status',
    // param('id_nguoi_dung').isInt({ min: 1 }).withMessage('ID người dùng không hợp lệ.'), // Đã có trong updateUserValidationRules
    // body('dang_hoat_dong').isBoolean().withMessage('Trạng thái hoạt động không hợp lệ.'), // Đã có trong updateUserValidationRules
    validationMiddleware, // Cần nếu có validation riêng ở đây
    userController.changeUserStatus
);

router.delete(
    '/:id_nguoi_dung',
    // param('id_nguoi_dung').isInt({ min: 1 }).withMessage('ID người dùng không hợp lệ.'),
    validationMiddleware, // Cần nếu có validation riêng ở đây
    userController.deleteUser
);

router.post(
    '/:id_nguoi_dung/reset-password',
    // param('id_nguoi_dung').isInt({ min: 1 }).withMessage('ID người dùng không hợp lệ.'),
    // body('new_password').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự.'),
    validationMiddleware, // Cần nếu có validation riêng ở đây
    userController.resetPassword
);

module.exports = router;
