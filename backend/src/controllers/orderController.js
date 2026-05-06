const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');
const enrollmentService = require('../services/enrollmentService');

/**
 * Generate a unique order code like "ORD-20260415-A1B2"
 */
const generateOrderCode = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `ORD-${date}-${rand}`;
};

// POST /api/orders — Create new order (User)
exports.createOrder = async (req, res) => {
  try {
    const { programId, classSessionId, requiresInvoice, taxCode, companyName, companyAddress, invoiceEmail } = req.body;
    const userId = req.user.id;

    if (!programId) {
      return res.status(400).json({ error: 'Yêu cầu mã khóa học (Program ID).' });
    }

    // Fetch the program to get its price
    const program = await prisma.program.findUnique({ where: { id: programId } });
    if (!program) {
      return res.status(404).json({ error: 'Không tìm thấy khóa học.' });
    }

    if (program.price === 0) {
      return res.status(400).json({ error: 'Khóa học này miễn phí và không cần thanh toán.' });
    }

    // Validate classSessionId based on program type
    if (program.programType === 'LIVE_CLASS' && !classSessionId) {
      return res.status(400).json({ error: 'Vui lòng chọn lịch học trước khi đăng ký lớp trực tiếp.' });
    }

    // VIDEO_COURSE never needs classSessionId
    const finalClassSessionId = program.programType === 'VIDEO_COURSE' ? null : (classSessionId || null);

    // Calculate Subtotal and VAT
    const subTotal = program.salePrice && program.price > program.salePrice ? program.salePrice : program.price;
    const vatAmount = Math.round(subTotal * 0.08);
    const amount = subTotal + vatAmount;

    // Check for existing active order (PENDING or AWAITING_CONFIRM) for same user + program
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId,
        programId,
        status: { in: ['PENDING', 'AWAITING_CONFIRM'] }
      }
    });

    if (existingOrder) {
      if (existingOrder.status === 'PENDING') {
        const updated = await prisma.order.update({
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
          }
        });
        return res.json({ message: 'Tiếp tục thanh toán đơn hàng cũ (đã cập nhật thông tin).', order: updated });
      }
      return res.json({ message: 'Bạn đã có một đơn hàng đang chờ xử lý cho khóa học này.', order: existingOrder });
    }

    // Check if already purchased
    const alreadyPurchased = await prisma.order.findFirst({
      where: { userId, programId, status: 'CONFIRMED' }
    });

    if (alreadyPurchased) {
      return res.status(400).json({ error: 'Bạn đã sở hữu khóa học này rồi.' });
    }

    const orderCode = generateOrderCode();

    // Fetch payment config for transfer content
    const paymentConfig = await prisma.paymentConfig.findFirst({ where: { isActive: true } });
    const transferTemplate = paymentConfig?.transferNote || 'BAKING {orderCode}';
    const transferContent = transferTemplate.replace('{orderCode}', orderCode);

    const order = await prisma.order.create({
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
      },
      include: {
        program: { select: { id: true, title: true, slug: true, thumbnail: true, price: true } }
      }
    });

    res.status(201).json({ message: 'Tạo đơn hàng thành công.', order });
  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({ error: 'Failed to create order.' });
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
    if (order.status === 'CONFIRMED') return res.status(400).json({ error: 'Không thể hủy một đơn hàng đã nạp thành công.' });

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' }
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
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) return res.status(404).json({ error: 'Không tìm thấy hóa đơn.' });
    if (order.status === 'CONFIRMED') return res.status(400).json({ error: 'Đơn hàng đã được duyệt trước đó.' });

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        adminNote: adminNote || null,
        confirmedAt: new Date()
      },
      include: {
        program: { select: { id: true, title: true } },
        user: { select: { id: true, fullName: true, email: true } }
      }
    });

    // Auto-create enrollment
    await enrollmentService.createEnrollmentForOrder(updated.id);

    res.json({ message: 'Duyệt đơn hàng và mở khóa khóa học thành công.', order: updated });
  } catch (error) {
    console.error('confirmOrder error:', error);
    res.status(500).json({ error: 'Failed to confirm order.' });
  }
};

// PATCH /api/orders/:id/reject — Admin rejects payment
exports.rejectOrder = async (req, res) => {
  try {
    const { adminNote } = req.body;
    const orderId = req.params.id;
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) return res.status(404).json({ error: 'Không tìm thấy hóa đơn.' });
    if (order.status === 'CONFIRMED') return res.status(400).json({ error: 'Không thể từ chối một đơn hàng đã được duyệt.' });

    const updated = await prisma.order.update({
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

    res.json({ message: 'Đã từ chối đơn hàng.', order: updated });
  } catch (error) {
    console.error('rejectOrder error:', error);
    res.status(500).json({ error: 'Failed to reject order.' });
  }
};
