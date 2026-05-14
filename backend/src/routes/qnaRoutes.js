const express = require('express');
const router = express.Router();
const { submitQuestion, getMyQuestions, getAdminQuestions, answerQuestion } = require('../controllers/qnaController');
const auth = require('../middleware/authMiddleware');

// User routes
router.post('/', auth, submitQuestion);
router.get('/my', auth, getMyQuestions);

// Admin routes
router.get('/admin', auth, getAdminQuestions);
router.put('/admin/:id', auth, answerQuestion);

module.exports = router;
