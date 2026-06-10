const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/authMiddleware');

// All order routes require authentication
router.use(auth);

// User routes
router.post('/preview', orderController.previewOrder);
router.post('/', orderController.createOrder);
router.get('/my', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/proof', orderController.submitProof);
router.patch('/:id/cancel', orderController.cancelOrder);

// Admin only routes
router.get('/', requireRole('ADMIN'), orderController.getAllOrders);
router.patch('/:id/confirm', requireRole('ADMIN'), orderController.confirmOrder);
router.patch('/:id/reject', requireRole('ADMIN'), orderController.rejectOrder);

module.exports = router;
