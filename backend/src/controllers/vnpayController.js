/**
 * VNPay Controller
 * 
 * Route handlers for VNPay payment endpoints:
 * - POST /api/vnpay/create-payment-url (authenticated)
 * - GET  /api/vnpay/return (public — VNPay redirects user here)
 * - GET  /api/vnpay/ipn (public — VNPay server-to-server callback)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const vnpayService = require('../services/vnpayService');

/**
 * POST /api/vnpay/create-payment-url
 * Creates a VNPay payment URL for an existing order.
 * Requires authentication.
 */
exports.createPaymentUrl = async (req, res) => {
  try {
    const { orderId, bankCode } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required.' });
    }

    // Fetch order and verify ownership
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Only allow payment URL creation for PENDING or REJECTED orders
    if (!['PENDING', 'REJECTED'].includes(order.status)) {
      return res.status(400).json({
        error: `Cannot create payment URL for order with status: ${order.status}`,
      });
    }

    // Get client IP
    const ipAddress = req.headers['x-forwarded-for']
      || req.connection?.remoteAddress
      || req.socket?.remoteAddress
      || '127.0.0.1';
    // Take first IP if multiple (x-forwarded-for can be comma-separated)
    const clientIp = ipAddress.split(',')[0].trim();

    // Create payment URL
    const { paymentUrl, txnRef, expireDate } = vnpayService.createPaymentUrl(
      order,
      clientIp,
      bankCode
    );

    // Update order with payment info
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentMethod: 'VNPAY',
        paymentProvider: 'VNPAY',
        paymentUrl,
        paymentInitiatedAt: new Date(),
        paymentExpiresAt: expireDate,
        gatewayTxnRef: txnRef,
      },
    });

    res.json({ paymentUrl });
  } catch (error) {
    console.error('VNPay createPaymentUrl error:', error);
    res.status(500).json({ error: error.message || 'Failed to create payment URL.' });
  }
};

/**
 * GET /api/vnpay/return
 * VNPay redirects the user here after payment.
 * Verifies hash and redirects to frontend result page.
 */
exports.handleReturn = async (req, res) => {
  try {
    const result = await vnpayService.processReturnCallback(req.query);

    // [LOCAL DEV TRICK] 
    // Since VNPay cannot reach localhost IPN, we manually trigger IPN logic
    // right here in the return handler. In production, IPN handles this.
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('Local Dev: Triggering IPN fallback from Return URL...');
        await vnpayService.processIpnCallback(req.query);
      } catch (ipnError) {
        console.error('Local Dev IPN fallback error:', ipnError);
      }
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/payment/vnpay-return?orderId=${result.orderId || ''}&status=${result.status}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('VNPay return error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/payment/vnpay-return?status=failed`);
  }
};

/**
 * GET /api/vnpay/ipn
 * VNPay server-to-server callback.
 * This is the SOURCE OF TRUTH for payment confirmation.
 * Always returns HTTP 200 with VNPay-compatible response codes.
 */
exports.handleIpn = async (req, res) => {
  try {
    const result = await vnpayService.processIpnCallback(req.query);
    res.status(200).json(result);
  } catch (error) {
    console.error('VNPay IPN error:', error);
    // Always return 200 to prevent VNPay from retrying
    res.status(200).json({ RspCode: '99', Message: 'Internal error' });
  }
};
