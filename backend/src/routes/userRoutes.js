const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/authMiddleware');

// Tất cả routes đều cần ADMIN
router.use(auth, requireRole('ADMIN'));

router.get('/staff', userController.getStaffAccounts);
router.post('/staff', userController.createStaffAccount);
router.patch('/staff/:id', userController.updateStaffAccount);
router.delete('/staff/:id', userController.deleteStaffAccount);

module.exports = router;
