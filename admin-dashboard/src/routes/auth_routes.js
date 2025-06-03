const express = require('express');
const authController = require('../controllers/auth_controller');
const handleValidationErrors = require('../middlewares/validation_middleware');
const router = express.Router();

// POST /api/auth/login
router.post(
    '/login',
    authController.loginValidationRules(),
    handleValidationErrors,
    authController.login
);

module.exports = router;