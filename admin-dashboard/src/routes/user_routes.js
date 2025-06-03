const express = require('express');
const userController = require('../controllers/user_controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth_middleware');
const handleValidationErrors = require('../middlewares/validation_middleware');
const { uploadUserAvatar } = require('../middlewares/upload_middleware');
const { param, body } = require('express-validator'); // Để validate param id

const router = express.Router();

// Tất cả các route trong file này yêu cầu admin
router.use(authenticateToken, isAdmin);

// POST /api/users (Thêm người dùng mới)
router.post('/',
    uploadUserAvatar.single('url_anh_dai_dien'), // Tên field khớp với form-data
    userController.createUserValidationRules(),
    handleValidationErrors,
    userController.createUser
);

// GET /api/users (Xem danh sách người dùng)
router.get('/',
    userController.getAllUsersQueryValidationRules(), // Validate query params
    handleValidationErrors,
    userController.getAllUsers
);

// GET /api/users/:id_nguoi_dung (Xem chi tiết người dùng)
router.get('/:id_nguoi_dung',
    [param('id_nguoi_dung').isInt({ min: 1 }).withMessage('ID người dùng không hợp lệ.')],
    handleValidationErrors,
    userController.getUserById
);

// PUT /api/users/:id_nguoi_dung (Sửa thông tin người dùng)
router.put('/:id_nguoi_dung',
    uploadUserAvatar.single('url_anh_dai_dien'),
    userController.updateUserValidationRules(),
    handleValidationErrors,
    userController.updateUser
);

// DELETE /api/users/:id_nguoi_dung (Xóa người dùng - soft delete)
router.delete('/:id_nguoi_dung',
    [param('id_nguoi_dung').isInt({ min: 1 }).withMessage('ID người dùng không hợp lệ.')],
    handleValidationErrors,
    userController.deleteUser
);

// PATCH /api/users/:id_nguoi_dung/status (Thay đổi trạng thái hoạt động)
router.patch('/:id_nguoi_dung/status',
    [
        param('id_nguoi_dung').isInt({ min: 1 }).withMessage('ID người dùng không hợp lệ.'),
        body('dang_hoat_dong').isBoolean().withMessage('Trạng thái hoạt động phải là true/false.').toBoolean()
    ],
    handleValidationErrors,
    userController.changeUserStatus
);

// POST /api/users/:id_nguoi_dung/reset-password (Đặt lại mật khẩu)
router.post('/:id_nguoi_dung/reset-password',
    [
        param('id_nguoi_dung').isInt({ min: 1 }).withMessage('ID người dùng không hợp lệ.'),
        body('new_password').notEmpty().withMessage('Mật khẩu mới không được để trống.').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự.')
    ],
    handleValidationErrors,
    userController.resetPassword
);

module.exports = router;
