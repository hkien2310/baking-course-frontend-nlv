const express = require('express');
const router = express.Router();
const payosController = require('../controllers/payosController');
const auth = require('../middleware/authMiddleware');

// POST /api/payos/create-payment-url — Create PayOS payment URL (authenticated)
router.post('/create-payment-url', auth, payosController.createPaymentUrl);

// POST /api/payos/webhook — PayOS webhook callback (public)
router.post('/webhook', payosController.handleWebhook);

module.exports = router;
