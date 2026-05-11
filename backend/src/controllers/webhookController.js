const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const orderService = require('../services/orderService');

/**
 * POST /api/webhook/payment
 * 
 * Generic webhook endpoint for payment notifications from bank/provider.
 * Accepts a provider-agnostic payload:
 * {
 *   amount: number,       // Amount in smallest unit (cents)
 *   content: string,      // Transfer memo/content (should contain orderCode)
 *   transactionId: string // Bank transaction reference
 *   secret: string        // Webhook secret for validation
 * }
 * 
 * Can be adapted later for specific providers (VietQR, Casso, SePay, etc.)
 * by adding a thin adapter layer.
 */
exports.handlePaymentWebhook = async (req, res) => {
  try {
    const { amount, content, transactionId, secret } = req.body;

    // 1. Validate webhook secret
    const config = await prisma.paymentConfig.findFirst({ where: { isActive: true } });
    
    if (!config || !config.webhookSecret) {
      console.error('Webhook: No active payment config or webhook secret found');
      return res.status(500).json({ error: 'Webhook not configured.' });
    }

    if (secret !== config.webhookSecret) {
      console.error('Webhook: Invalid secret');
      return res.status(401).json({ error: 'Invalid webhook secret.' });
    }

    // 2. Extract order code from transfer content
    // Look for pattern like "ORD-XXXXXXXX-XXXX" in the content
    const orderCodeMatch = content?.match(/ORD-\d{8}-[A-F0-9]{4}/i);
    
    if (!orderCodeMatch) {
      console.warn('Webhook: Could not extract order code from content:', content);
      return res.status(200).json({ 
        success: false, 
        message: 'Could not match order code from transfer content. Requires manual review.',
        received: { amount, content, transactionId }
      });
    }

    const orderCode = orderCodeMatch[0].toUpperCase();

    // 3. Find the order
    const order = await prisma.order.findUnique({ 
      where: { orderCode },
      include: { 
        program: { select: { title: true } },
        user: { select: { fullName: true, email: true } }
      }
    });

    if (!order) {
      console.warn('Webhook: Order not found for code:', orderCode);
      return res.status(200).json({ 
        success: false, 
        message: `Order ${orderCode} not found.` 
      });
    }

    // 4. Check if already confirmed
    if (order.status === 'CONFIRMED') {
      return res.status(200).json({ 
        success: true, 
        message: `Order ${orderCode} already confirmed.` 
      });
    }

    // 5. Verify amount matches
    if (amount && amount !== order.amount) {
      console.warn(`Webhook: Amount mismatch for ${orderCode}. Expected ${order.amount}, got ${amount}`);
      
      // Still mark as awaiting confirm for manual review
      await prisma.order.update({
        where: { orderCode },
        data: {
          status: 'AWAITING_CONFIRM',
          transactionRef: transactionId || null,
          adminNote: `Webhook: Amount mismatch. Expected ${order.amount}, received ${amount}.`
        }
      });

      return res.status(200).json({ 
        success: false, 
        message: `Amount mismatch for ${orderCode}. Flagged for manual review.`
      });
    }

    // 6. Auto-confirm the order via centralized OrderService
    const updated = await orderService.completeOrder(order.id, {
      paidViaWebhook: true,
      transactionRef: transactionId || null,
      adminNote: 'Auto-confirmed via payment webhook.'
    });

    console.log(`Webhook: Order ${orderCode} auto-confirmed | User: ${order.user.fullName} | Course: ${order.program.title}`);

    res.status(200).json({ 
      success: true, 
      message: `Order ${orderCode} confirmed successfully.`,
      orderId: updated.id
    });
  } catch (error) {
    console.error('Webhook error:', error);
    // Always return 200 to prevent retries from the provider
    res.status(200).json({ success: false, error: 'Internal processing error.' });
  }
};
