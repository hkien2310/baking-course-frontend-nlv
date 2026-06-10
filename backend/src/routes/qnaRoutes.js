const express = require('express');
const router = express.Router();
const { submitQuestion, getMyQuestions, getAdminQuestions, answerQuestion } = require('../controllers/qnaController');
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/authMiddleware');

// User routes
router.post('/', auth, submitQuestion);
router.get('/my', auth, getMyQuestions);

// Admin only routes
router.get('/admin', auth, requireRole('ADMIN'), getAdminQuestions);
router.put('/admin/:id', auth, requireRole('ADMIN'), answerQuestion);

module.exports = router;

