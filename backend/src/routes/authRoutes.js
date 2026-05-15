const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST api/auth/login
// @desc    Xác thực (Authenticate) admin user & Lấy token
// @access  Public
router.post('/login', authController.login);

// @route   POST api/auth/register
// @desc    Đăng ký user mới
// @access  Public
router.post('/register', authController.register);

// @route   GET api/auth/me
// @desc    Lấy thông tin User hiện tại và khóa học
// @access  Private
router.get('/me', authMiddleware, authController.getMe);

// @route   POST api/auth/refresh
// @desc    Làm mới access token bằng refresh token
// @access  Public
router.post('/refresh', authController.refreshToken);

// @route   POST api/auth/logout
// @desc    Đăng xuất và xóa refresh token
// @access  Public
router.post('/logout', authController.logout);

// @route   PUT api/auth/change-password
// @desc    Thay đổi mật khẩu user
// @access  Private
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
