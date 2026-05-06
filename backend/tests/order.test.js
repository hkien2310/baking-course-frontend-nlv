const express = require('express');
const request = require('supertest');
const { PrismaClient } = require('@prisma/client');

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mPrisma = {
    program: {
      findUnique: jest.fn(),
    },
    order: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    paymentConfig: {
      findFirst: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

// Mock the middleware and service before importing routes
jest.mock('../src/middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: 'user-123', role: 'USER' };
  next();
});

jest.mock('../src/services/enrollmentService', () => ({
  createEnrollmentForOrder: jest.fn(),
}));

const prisma = new PrismaClient();
const enrollmentService = require('../src/services/enrollmentService');
const orderRoutes = require('../src/routes/orderRoutes');

const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);

describe('Order Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/orders', () => {
    it('should create a new order successfully', async () => {
      const mockProgram = {
        id: 'prog-1',
        title: 'Baking 101',
        price: 100000,
        programType: 'VIDEO_COURSE',
      };
      const mockPaymentConfig = {
        transferNote: 'BAKING {orderCode}',
        isActive: true,
      };

      prisma.program.findUnique.mockResolvedValue(mockProgram);
      prisma.order.findFirst.mockResolvedValue(null); // No existing or purchased order
      prisma.paymentConfig.findFirst.mockResolvedValue(mockPaymentConfig);
      prisma.order.create.mockResolvedValue({
        id: 'order-1',
        orderCode: 'ORD-20231027-ABCD',
        amount: 108000,
      });

      const res = await request(app)
        .post('/api/orders')
        .send({ programId: 'prog-1' });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Tạo đơn hàng thành công.');
      expect(res.body.order).toBeDefined();
      expect(prisma.order.create).toHaveBeenCalled();
    });

    it('should return 400 if programId is missing', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Yêu cầu mã khóa học (Program ID).');
    });

    it('should return 404 if program not found', async () => {
      prisma.program.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/orders')
        .send({ programId: 'non-existent' });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Không tìm thấy khóa học.');
    });
  });

  describe('GET /api/orders/my', () => {
    it('should return the current user\'s orders', async () => {
      const mockOrders = [
        { id: 'order-1', userId: 'user-123', amount: 108000 },
        { id: 'order-2', userId: 'user-123', amount: 216000 },
      ];
      prisma.order.findMany.mockResolvedValue(mockOrders);

      const res = await request(app).get('/api/orders/my');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(prisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: 'user-123' }
      }));
    });
  });

  describe('PATCH /api/orders/:id/confirm', () => {
    it('should confirm an order and create enrollment (Admin action)', async () => {
      const mockOrder = {
        id: 'order-1',
        status: 'AWAITING_CONFIRM',
        userId: 'user-123',
        programId: 'prog-1'
      };
      
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.order.update.mockResolvedValue({ ...mockOrder, status: 'CONFIRMED' });
      enrollmentService.createEnrollmentForOrder.mockResolvedValue({ id: 'enrol-1' });

      const res = await request(app)
        .patch('/api/orders/order-1/confirm')
        .send({ adminNote: 'Payment verified' });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Duyệt đơn hàng và mở khóa khóa học thành công.');
      expect(prisma.order.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'order-1' },
        data: expect.objectContaining({ status: 'CONFIRMED' })
      }));
      expect(enrollmentService.createEnrollmentForOrder).toHaveBeenCalledWith('order-1');
    });

    it('should return 400 if order is already confirmed', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'order-1', status: 'CONFIRMED' });

      const res = await request(app)
        .patch('/api/orders/order-1/confirm')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Đơn hàng đã được duyệt trước đó.');
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return order details for the owner', async () => {
      const mockOrder = {
        id: 'order-1',
        userId: 'user-123',
        program: { title: 'Baking 101' },
        user: { fullName: 'John Doe' }
      };
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      const res = await request(app).get('/api/orders/order-1');

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe('order-1');
    });

    it('should return 403 if user tries to access another user\'s order', async () => {
      const mockOrder = { id: 'order-1', userId: 'other-user' };
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      const res = await request(app).get('/api/orders/order-1');

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toBe('Access denied.');
    });

    it('should return 404 if order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/api/orders/non-existent');

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Order not found.');
    });
  });
});
