const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');
const enrollmentService = require('../services/enrollmentService');
const { 
  applyDiscounts, 
  calculatePointsEarned, 
  determineTier, 
  calculateSubTotal, 
  calculateVAT, 
  DEFAULT_LOYALTY_CONFIG 
} = require('../services/loyaltyService');

const orderService = require('../services/orderService');

/**
 * Generate a unique order code like "ORD-20260415-A1B2"
 */
const generateOrderCode = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `ORD-${date}-${rand}`;
};

// POST /api/orders/preview — Preview price breakdown without creating order
exports.previewOrder = async (req, res) => {
  try {
    const { programId, appliedDiscounts, promoCode, pointsToUse } = req.body;
    const userId = req.user.id;

    if (!programId) {
      return res.status(400).json({ error: 'Yêu cầu mã khóa học (Program ID).' });
    }

    const program = await prisma.program.findUnique({ where: { id: programId } });
    if (!program) {
      return res.status(404).json({ error: 'Không tìm thấy khóa học.' });
    }

    const originalPrice = program.price || 0;
    const subTotal = calculateSubTotal(program);
    const saleDiscount = originalPrice - subTotal;

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { memberTier: true, points: true, totalSpent: true }
    });

    const loyaltySetting = await prisma.setting.findUnique({ where: { key: 'loyaltyConfig' } });
    const loyaltyConfig = loyaltySetting ? loyaltySetting.value : DEFAULT_LOYALTY_CONFIG;

    let discountResult = { promoCodeDiscount: 0, tierDiscount: 0, pointsUsed: 0, pointsDiscount: 0, finalPrice: subTotal };
    try {
      discountResult = await applyDiscounts({
        appliedDiscounts: appliedDiscounts || [],
        loyaltyConfig,
        promoCode: promoCode || null,
        pointsToUse: pointsToUse || 0,
        memberTier: currentUser.memberTier,
        userPoints: currentUser.points,
        subTotal,
      });
    } catch (err) {
      // Discount error (invalid promo, etc.) — trả về giá gốc kèm lỗi
      const vatAmount = calculateVAT(subTotal);
      return res.json({
        originalPrice, subTotal, saleDiscount,
        promoCodeDiscount: 0, tierDiscount: 0, pointsDiscount: 0, pointsUsed: 0,
        finalPrice: subTotal,
        vatAmount,
        totalPayment: subTotal + vatAmount,
        pointsEarned: calculatePointsEarned(subTotal, loyaltyConfig.points),
        memberTier: currentUser.memberTier,
        userPoints: currentUser.points,
        discountError: err.message,
      });
    }

    const finalPrice = discountResult.finalPrice;
    const vatAmount = calculateVAT(finalPrice);
    const totalPayment = finalPrice + vatAmount;
    const pointsEarned = calculatePointsEarned(finalPrice, loyaltyConfig.points);

    res.json({
      originalPrice, subTotal, saleDiscount,
      promoCodeDiscount: discountResult.promoCodeDiscount,
      tierDiscount: discountResult.tierDiscount,
      pointsDiscount: discountResult.pointsDiscount,
      pointsUsed: discountResult.pointsUsed,
      finalPrice, vatAmount, totalPayment,
      pointsEarned,
      memberTier: currentUser.memberTier,
      userPoints: currentUser.points,
    });
  } catch (err) {
    console.error('Preview order error:', err);
    res.status(500).json({ error: 'Lỗi khi tính giá.' });
  }
};

// POST /api/orders — Create new order (User)
exports.createOrder = async (req, res) => {
  try {
    const { programId, classSessionId, requiresInvoice, taxCode, companyName, companyAddress, invoiceEmail,
            appliedDiscounts, promoCode, pointsToUse } = req.body;
    const userId = req.user.id;

    if (!programId) {
      return res.status(400).json({ error: 'Yêu cầu mã khóa học (Program ID).' });
    }

    // Fetch the program to get its price
    const program = await prisma.program.findUnique({ where: { id: programId } });
    if (!program) {
      return res.status(404).json({ error: 'Không tìm thấy khóa học.' });
    }

    const isFree = !program.price || program.price === 0;

    // Validate classSessionId based on program type
    if (program.programType === 'LIVE_CLASS' && !classSessionId) {
      return res.status(400).json({ error: 'Vui lòng chọn lịch học trước khi đăng ký lớp trực tiếp.' });
    }

    // VIDEO_COURSE never needs classSessionId
    const finalClassSessionId = program.programType === 'VIDEO_COURSE' ? null : (classSessionId || null);

    // Calculate Subtotal
    const subTotal = calculateSubTotal(program);

    // Get current user info for loyalty
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { memberTier: true, points: true, totalSpent: true }
    });

    // Read loyalty config
    const loyaltySetting = await prisma.setting.findUnique({ where: { key: 'loyaltyConfig' } });
    const loyaltyConfig = loyaltySetting ? loyaltySetting.value : DEFAULT_LOYALTY_CONFIG;

    let discountResult;
    try {
      discountResult = await applyDiscounts({
        appliedDiscounts: appliedDiscounts || [],
        loyaltyConfig,
        promoCode: promoCode || null,
        pointsToUse: pointsToUse || 0,
        memberTier: currentUser.memberTier,
        userPoints: currentUser.points,
        subTotal,
      });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    const finalPrice = discountResult.finalPrice;
    const vatAmount = calculateVAT(finalPrice);
    const amount = finalPrice + vatAmount;
    const pointsEarned = calculatePointsEarned(finalPrice, loyaltyConfig.points);

    // Re-check isFree based on final amount (could be 0 after discounts/points)
    const isFreeOrder = isFree || amount === 0;

    // Enter transaction for locking and creation
    const result = await prisma.$transaction(async (tx) => {
      // 1. Optimistic Locking for PromoCode
      if (discountResult.promoCodeId) {
        const promo = await tx.promoCode.findUnique({ where: { id: discountResult.promoCodeId } });
        if (promo.usageLimit !== null) {
          if (promo.usedCount >= promo.usageLimit) {
            throw new Error('Mã giảm giá đã đạt giới hạn sử dụng.');
          }
          const updatedPromo = await tx.promoCode.updateMany({
            where: { id: promo.id, usedCount: promo.usedCount },
            data: { usedCount: { increment: 1 } }
          });
          if (updatedPromo.count === 0) {
            throw new Error('Mã giảm giá vừa bị sử dụng hết bởi người khác.');
          }
        } else {
          await tx.promoCode.update({
            where: { id: promo.id },
            data: { usedCount: { increment: 1 } }
          });
        }
      }

      // 2. Optimistic Locking for User Points
      if (discountResult.pointsUsed > 0) {
        const updatedUser = await tx.user.updateMany({
          where: { id: userId, points: { gte: discountResult.pointsUsed } },
          data: { points: { decrement: discountResult.pointsUsed } }
        });
        if (updatedUser.count === 0) {
          throw new Error('Không đủ điểm thưởng hoặc điểm đã bị thay đổi trong quá trình xử lý.');
        }
      }

      // 3. Handle existing order or create new order
      const existingOrder = await tx.order.findFirst({
        where: {
          userId,
          programId,
          status: { in: ['PENDING', 'AWAITING_CONFIRM'] }
        }
      });

      if (existingOrder) {
        if (existingOrder.status === 'PENDING') {
          // Refund previous points if they were used
          if (existingOrder.pointsUsed > 0) {
            await tx.user.update({
              where: { id: userId },
              data: { points: { increment: existingOrder.pointsUsed } }
            });
          }
          // Refund previous promo usage count if it was used
          if (existingOrder.promoCodeId) {
            await tx.promoCode.update({
              where: { id: existingOrder.promoCodeId },
              data: { usedCount: { decrement: 1 } }
            });
          }

          const updated = await tx.order.update({
            where: { id: existingOrder.id },
            data: { 
              classSessionId: finalClassSessionId,
              subTotal,
              vatAmount,
              amount,
              requiresInvoice: !!requiresInvoice,
              taxCode: taxCode || null,
              companyName: companyName || null,
              companyAddress: companyAddress || null,
              invoiceEmail: invoiceEmail || null,
              appliedDiscounts: appliedDiscounts || [],
              promoCodeId: discountResult.promoCodeId || null,
              promoCodeDiscount: discountResult.promoCodeDiscount,
              tierDiscount: discountResult.tierDiscount,
              pointsUsed: discountResult.pointsUsed,
              pointsDiscount: discountResult.pointsDiscount,
              pointsEarned,
            }
          });
          return { message: 'Tiếp tục thanh toán đơn hàng cũ (đã cập nhật thông tin).', order: updated };
        }
        return { message: 'Bạn đã có một đơn hàng đang chờ xử lý cho khóa học này.', order: existingOrder };
      }

      // Check if already purchased
      const alreadyPurchased = await tx.order.findFirst({
        where: { userId, programId, status: 'CONFIRMED' }
      });

      if (alreadyPurchased) {
        throw new Error('Bạn đã sở hữu khóa học này rồi.');
      }

      const orderCode = generateOrderCode();
      const paymentConfig = await tx.paymentConfig.findFirst({ where: { isActive: true } });
      const transferTemplate = paymentConfig?.transferNote || 'BAKING {orderCode}';
      const transferContent = transferTemplate.replace('{orderCode}', orderCode);

      const newOrder = await tx.order.create({
        data: {
          orderCode,
          userId,
          programId,
          classSessionId: finalClassSessionId,
          subTotal,
          vatAmount,
          amount,
          transferContent,
          requiresInvoice: !!requiresInvoice,
          taxCode: taxCode || null,
          companyName: companyName || null,
          companyAddress: companyAddress || null,
          invoiceEmail: invoiceEmail || null,
          appliedDiscounts: appliedDiscounts || [],
          promoCodeId: discountResult.promoCodeId || null,
          promoCodeDiscount: discountResult.promoCodeDiscount,
          tierDiscount: discountResult.tierDiscount,
          pointsUsed: discountResult.pointsUsed,
          pointsDiscount: discountResult.pointsDiscount,
          pointsEarned,
          status: isFreeOrder ? 'CONFIRMED' : 'PENDING',
          confirmedAt: isFreeOrder ? new Date() : null,
          paymentMethod: isFreeOrder ? 'FREE' : null,
          paymentProvider: isFreeOrder ? 'SYSTEM' : null,
        },
        include: {
          program: { select: { id: true, title: true, slug: true, thumbnail: true, price: true } }
        }
      });

      if (isFreeOrder) {
        // Run enrollment and loyalty logic for free course
        await orderService.completeOrder(newOrder.id, { 
          adminNote: 'Auto-confirmed (Free or fully discounted)'
        }, tx);
      }

      return { message: isFreeOrder ? 'Đăng ký thành công.' : 'Tạo đơn hàng thành công.', order: newOrder, isFree: isFreeOrder };
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('createOrder error:', error);
    // Map transaction validation errors to 400
    const msg = error.message;
    if (['Mã giảm giá', 'Không đủ điểm', 'Bạn đã sở hữu'].some(k => msg.includes(k))) {
      return res.status(400).json({ error: msg });
    }
    res.status(500).json({ error: msg || 'Failed to create order.' });
  }
};

// GET /api/orders/my — List current user's orders (User)
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        program: { select: { id: true, title: true, slug: true, thumbnail: true, price: true } }
      }
    });
    res.json(orders);
  } catch (error) {
    console.error('getMyOrders error:', error);
    res.status(500).json({ error: 'Failed to fetch your orders.' });
  }
};

// GET /api/orders/:id — Order detail (User, must own the order)
exports.getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        program: { select: { id: true, title: true, slug: true, thumbnail: true, price: true } },
        user: { select: { id: true, fullName: true, email: true } }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Users can only view their own orders, admins can view all
    if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json(order);
  } catch (error) {
    console.error('getOrderById error:', error);
    res.status(500).json({ error: 'Failed to fetch order details.' });
  }
};

// PATCH /api/orders/:id/proof — Upload payment proof (User)
exports.submitProof = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { proofImage, proofTxnId } = req.body;

    if (!proofImage && !proofTxnId) {
      return res.status(400).json({ error: 'Vui lòng cung cấp hình ảnh minh chứng hoặc mã giao dịch.' });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return res.status(404).json({ error: 'Không tìm thấy hóa đơn.' });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Từ chối quyền truy cập.' });
    }

    // Allow re-upload if PENDING or REJECTED
    if (!['PENDING', 'REJECTED'].includes(order.status)) {
      return res.status(400).json({ error: `Cannot submit proof for an order with status: ${order.status}` });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        proofImage: proofImage || order.proofImage,
        transactionRef: proofTxnId || order.transactionRef,
        status: 'AWAITING_CONFIRM',
        adminNote: null // Clear previous rejection note on re-upload
      },
      include: {
        program: { select: { id: true, title: true, slug: true } }
      }
    });

    res.json({ message: 'Đã gửi minh chứng thanh toán thành công. Chúng tôi sẽ kiểm tra sớm.', order: updated });
  } catch (error) {
    console.error('submitProof error:', error);
    res.status(500).json({ error: 'Failed to submit payment proof.' });
  }
};

// PATCH /api/orders/:id/cancel — Cancel order (User)
exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) return res.status(404).json({ error: 'Không tìm thấy hóa đơn.' });
    if (order.userId !== req.user.id) return res.status(403).json({ error: 'Từ chối quyền truy cập.' });
    if (['CONFIRMED', 'CANCELLED', 'REJECTED'].includes(order.status)) {
      return res.status(400).json({ error: 'Chỉ có thể hủy đơn hàng đang chờ xử lý.' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' }
      });
      
      if (order.pointsUsed > 0) {
        await tx.user.update({
          where: { id: order.userId },
          data: { points: { increment: order.pointsUsed } }
        });
      }
      
      if (order.promoCodeId) {
        await tx.promoCode.update({
          where: { id: order.promoCodeId },
          data: { usedCount: { decrement: 1 } }
        });
      }
      
      return updatedOrder;
    });

    res.json({ message: 'Hóa đơn đã bị hủy.', order: updated });
  } catch (error) {
    console.error('cancelOrder error:', error);
    res.status(500).json({ error: 'Failed to cancel order.' });
  }
};

// GET /api/orders — List all orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        program: { select: { id: true, title: true, slug: true, price: true } },
        user: { select: { id: true, fullName: true, email: true } }
      }
    });
    res.json(orders);
  } catch (error) {
    console.error('getAllOrders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
};

// PATCH /api/orders/:id/confirm — Admin confirms payment
exports.confirmOrder = async (req, res) => {
  try {
    const { adminNote } = req.body;
    const orderId = req.params.id;

    const updated = await orderService.completeOrder(orderId, {
      adminNote: adminNote || 'Confirmed by admin.'
    });

    res.json({ message: 'Duyệt đơn hàng và mở khóa khóa học thành công.', order: updated });
  } catch (error) {
    console.error('confirmOrder error:', error);
    res.status(error.status || 500).json({ error: error.message || 'Failed to confirm order.' });
  }
};

// PATCH /api/orders/:id/reject — Admin rejects payment
exports.rejectOrder = async (req, res) => {
  try {
    const { adminNote } = req.body;
    const orderId = req.params.id;
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) return res.status(404).json({ error: 'Không tìm thấy hóa đơn.' });
    if (['CONFIRMED', 'CANCELLED', 'REJECTED'].includes(order.status)) {
      return res.status(400).json({ error: 'Đơn hàng này không thể bị từ chối nữa.' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'REJECTED',
          adminNote: adminNote || 'Payment rejected by admin.'
        },
        include: {
          program: { select: { id: true, title: true } },
          user: { select: { id: true, fullName: true, email: true } }
        }
      });

      if (order.pointsUsed > 0) {
        await tx.user.update({
          where: { id: order.userId },
          data: { points: { increment: order.pointsUsed } }
        });
      }
      
      if (order.promoCodeId) {
        await tx.promoCode.update({
          where: { id: order.promoCodeId },
          data: { usedCount: { decrement: 1 } }
        });
      }

      return updatedOrder;
    });

    res.json({ message: 'Đã từ chối đơn hàng.', order: updated });
  } catch (error) {
    console.error('rejectOrder error:', error);
    res.status(500).json({ error: 'Failed to reject order.' });
  }
};
