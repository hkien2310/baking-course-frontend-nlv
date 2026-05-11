const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Creates an Enrollment record for a confirmed Order
 * Automatically handles VIDEO_COURSE vs LIVE_CLASS
 */
exports.createEnrollmentForOrder = async (orderId, tx = null) => {
  const client = tx || prisma;
  try {
    const order = await client.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        program: true
      }
    });

    if (!order) {
      console.error(`createEnrollmentForOrder: Order ${orderId} not found`);
      return null;
    }

    if (order.status !== 'CONFIRMED') {
      console.error(`createEnrollmentForOrder: Cannot enroll for non-confirmed order ${orderId} (Status: ${order.status})`);
      return null;
    }

    // Check if already enrolled to avoid duplicates
    const existing = await client.enrollment.findFirst({
      where: {
        userId: order.userId,
        programId: order.programId
      }
    });

    if (existing) {
      console.log(`User ${order.userId} already enrolled in program ${order.programId}`);
      return existing;
    }

    // Create enrollment
    const enrollment = await client.enrollment.create({
      data: {
        classSessionId: order.classSessionId, // will be null for VIDEO_COURSE
        userId: order.userId,
        programId: order.programId,
        fullName: order.user ? order.user.fullName : 'Học viên ẩn danh',
        email: order.user ? order.user.email : 'No email',
        phone: order.user?.phoneNumber || null,
        status: 'CONFIRMED'
      }
    });

    console.log(`Created Enrollment ${enrollment.id} for Order ${order.id}`);
    return enrollment;
  } catch (err) {
    console.error('createEnrollmentForOrder error:', err);
    throw err;
  }
};
