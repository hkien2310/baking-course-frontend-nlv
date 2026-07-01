/**
 * PayOS Controller
 * 
 * Route handlers for PayOS payment endpoints:
 * - POST /api/payos/create-payment-url (authenticated)
 * - POST /api/payos/webhook (public — PayOS server-to-server callback)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const payosService = require('../services/payosService');
const orderService = require('../services/orderService');

/**
 * POST /api/payos/create-payment-url
 * Creates a PayOS payment link for an existing order.
 * Requires authentication.
 */
exports.createPaymentUrl = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required.' });
    }

    // Fetch order and verify ownership, pre-loading program details for items list
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { program: true }
    });

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

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').trim();

    // Create payment link using PayOS
    const { checkoutUrl, orderCodeNum } = await payosService.createPaymentLink(order, frontendUrl);

    // Update order with payment info
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentMethod: 'PAYOS',
        paymentProvider: 'PAYOS',
        paymentUrl: checkoutUrl,
        paymentInitiatedAt: new Date(),
        gatewayTxnRef: String(orderCodeNum),
      },
    });

    res.json({ paymentUrl: checkoutUrl });
  } catch (error) {
    console.error('PayOS createPaymentUrl error:', error);
    res.status(500).json({ error: error.message || 'Failed to create payment URL.' });
  }
};

/**
 * POST /api/payos/webhook
 * PayOS server-to-server callback.
 * This is the SOURCE OF TRUTH for payment confirmation.
 */
exports.handleWebhook = async (req, res) => {
  // PayOS dashboard gửi test ping không có data → trả 200 ngay
  if (!req.body || !req.body.data) {
    console.log('PayOS Webhook: Test ping received, returning 200');
    return res.status(200).json({ message: 'ok' });
  }

  // 1. Verify webhook data signature (async — must await)
  // Always return 200 to PayOS (even on invalid sig / test ping) so the dashboard accepts our URL.
  // Only skip business logic if verification fails.
  let verifiedData;
  try {
    verifiedData = await payosService.verifyWebhook(req.body);
  } catch (verifyErr) {
    console.warn('PayOS Webhook: Signature invalid or test ping, ignoring:', verifyErr.message);
    return res.status(200).json({ message: 'ok' });
  }

  try {
    console.log('PayOS Webhook received & verified:', verifiedData);

    const { orderCode, amount, code, reference, desc } = verifiedData;

    // 2. Convert numeric orderCode back to alphanumeric ORD-YYYYMMDD-HHHH format
    const dbOrderCode = payosService.numberToOrderCode(orderCode);

    // 3. Find order by orderCode
    const order = await prisma.order.findUnique({
      where: { orderCode: dbOrderCode },
    });

    if (!order) {
      console.warn('PayOS Webhook: Order not found for code:', dbOrderCode);
      // Return 200 so PayOS does not retry (could be a test ping or stale data)
      return res.status(200).json({ message: 'Order not found, ignored' });
    }

    // 4. Verify amount
    if (amount !== order.amount) {
      console.warn(`PayOS Webhook: Amount mismatch for ${dbOrderCode}. Expected ${order.amount}, got ${amount}`);
      return res.status(400).json({ error: 'Invalid Amount' });
    }

    // 5. Check idempotency and terminal states
    if (order.status === 'CONFIRMED') {
      return res.status(200).json({ message: 'Order already confirmed' });
    }

    if (order.status === 'CANCELLED' || order.status === 'REJECTED') {
      console.warn(`PayOS Webhook: Order ${dbOrderCode} is in terminal state ${order.status}. Cannot process payment.`);
      return res.status(400).json({ error: 'Order is in invalid state' });
    }

    // 6. Process based on status code
    if (code === '00') {
      // Payment successful — confirm order
      await orderService.completeOrder(order.id, {
        paidAt: new Date(),
        paidViaWebhook: true,
        paymentProvider: 'PAYOS',
        gatewayTransactionNo: reference || null,
        gatewayResponseCode: code,
        gatewayTransactionStatus: desc || null,
        rawGatewayPayload: verifiedData,
        adminNote: 'Auto-confirmed via PayOS Webhook.',
      });
      console.log(`PayOS Webhook: Order ${order.orderCode} CONFIRMED (numeric: ${orderCode})`);
    } else {
      // Payment failed or was cancelled
      await prisma.order.update({
        where: { id: order.id },
        data: {
          gatewayResponseCode: code,
          gatewayTransactionStatus: desc || null,
          gatewayTransactionNo: reference || null,
          rawGatewayPayload: verifiedData,
        },
      });
      console.log(`PayOS Webhook: Order ${order.orderCode} payment FAILED/CANCELLED (code: ${code}, desc: ${desc})`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('PayOS Webhook error:', error.message);
    // Always return 200 — PayOS must get 200 or it rejects the webhook URL.
    // Errors here are either test data (orderCode:123) or unexpected issues — safe to ack.
    res.status(200).json({ success: true });
  }
};
