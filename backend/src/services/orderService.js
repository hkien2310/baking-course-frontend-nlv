const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const enrollmentService = require('./enrollmentService');
const { determineTier, DEFAULT_LOYALTY_CONFIG } = require('./loyaltyService');

/**
 * Order Service
 * 
 * Centralized business logic for processing and completing orders.
 * Ensures consistency across different payment methods (Manual, VNPay, Webhook).
 */

/**
 * Completes an order by:
 * 1. Updating order status to CONFIRMED
 * 2. Creating an enrollment for the user
 * 3. Updating user's loyalty status (totalSpent, points, memberTier)
 * 
 * @param {string} orderId - The ID of the order to complete
 * @param {object} [completionData] - Optional additional data for the order update (e.g. gateway info)
 * @param {object} [tx] - Optional Prisma transaction client
 */
async function completeOrder(orderId, completionData = {}, tx = null) {
  const performCompletion = async (innerTx) => {
    // 1. Fetch order and user INSIDE the transaction to ensure consistency
    const order = await innerTx.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, totalSpent: true, points: true } }
      }
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found.`);
    }

    // 2. Atomic status check
    if (order.status === 'CONFIRMED') {
      console.warn(`Order ${orderId} is already confirmed. Skipping duplicate completion logic.`);
      return order;
    }

    // A. Update Order Status
    const updatedOrder = await innerTx.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        ...completionData
      }
    });

    // B. Create Enrollment
    await enrollmentService.createEnrollmentForOrder(orderId, innerTx);

    // C. Update User Loyalty
    let loyaltyConfig = DEFAULT_LOYALTY_CONFIG;
    try {
      const loyaltySetting = await innerTx.setting.findUnique({ where: { key: 'loyaltyConfig' } });
      if (loyaltySetting) loyaltyConfig = loyaltySetting.value;
    } catch (e) {
      console.warn('Failed to fetch loyalty config, using defaults.');
    }

    const user = order.user;
    const newTotalSpent = (user.totalSpent || 0) + (order.finalPrice || order.amount - (order.vatAmount || 0)); 
    const newPoints = (user.points || 0) + (order.pointsEarned || 0);
    const newTier = determineTier(newTotalSpent, loyaltyConfig.tiers);

    await innerTx.user.update({
      where: { id: user.id },
      data: {
        totalSpent: newTotalSpent,
        points: newPoints,
        memberTier: newTier,
      }
    });

    console.log(`Order ${order.orderCode} completed: Enrollment created & Loyalty updated (Tier: ${newTier}, Points: +${order.pointsEarned}).`);
    return updatedOrder;
  };

  if (tx) {
    return performCompletion(tx);
  } else {
    return prisma.$transaction(performCompletion);
  }
}

module.exports = {
  completeOrder
};
