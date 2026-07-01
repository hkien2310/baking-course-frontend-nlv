/**
 * PayOS Integration Tests
 * Tests both payosService and payosController
 */

const request = require('supertest');
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const enrollmentService = require('../src/services/enrollmentService');

// --- Mocking Dependencies ---

const mockPrisma = {
  order: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  setting: {
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(mockPrisma)),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

const mockCreatePaymentLink = jest.fn();
const mockVerifyWebhookData = jest.fn();

jest.mock('@payos/node', () => ({
  PayOS: jest.fn().mockImplementation(() => ({
    paymentRequests: {
      create: mockCreatePaymentLink,
    },
    webhooks: {
      verify: mockVerifyWebhookData,
    },
  })),
}));

jest.mock('../src/services/enrollmentService', () => ({
  createEnrollmentForOrder: jest.fn(),
}));

// Mock auth middleware
jest.mock('../src/middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: 'user-1' };
  next();
});

// Set up mock env variables
process.env.PAYOS_CLIENT_ID = 'test-client-id';
process.env.PAYOS_API_KEY = 'test-api-key';
process.env.PAYOS_CHECKSUM_KEY = 'test-checksum-key';
process.env.FRONTEND_URL = 'http://localhost:5173';

// Import service and controller after mocks and env
const payosService = require('../src/services/payosService');
const payosController = require('../src/controllers/payosController');

// --- Setup Test App ---
const app = express();
app.use(express.json());
const payosRoutes = require('../src/routes/payosRoutes');
app.use('/api/payos', payosRoutes);

describe('PayOS Service & Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Utility Functions', () => {
    test('should correctly convert alphanumeric orderCode to unique number', () => {
      const orderCode = 'ORD-20260623-A1B2';
      const expectedNumber = 2026062341394; // A1B2 in hex is 41394 in decimal
      expect(payosService.orderCodeToNumber(orderCode)).toBe(expectedNumber);
    });

    test('should correctly convert unique number back to orderCode string', () => {
      const number = 2026062341394;
      const expectedOrderCode = 'ORD-20260623-A1B2';
      expect(payosService.numberToOrderCode(number)).toBe(expectedOrderCode);
    });

    test('should handle conversion edge cases like low hex values', () => {
      const orderCode = 'ORD-20260623-0005';
      const number = payosService.orderCodeToNumber(orderCode);
      expect(number).toBe(2026062300005);
      expect(payosService.numberToOrderCode(number)).toBe(orderCode);
    });

    test('should throw error for invalid orderCode formats', () => {
      expect(() => payosService.orderCodeToNumber('INVALID-12345')).toThrow();
    });
  });

  describe('POST /api/payos/create-payment-url', () => {
    test('should successfully create a PayOS payment URL', async () => {
      const mockOrder = {
        id: 'order-1',
        orderCode: 'ORD-20260623-A1B2',
        amount: 500000,
        userId: 'user-1',
        status: 'PENDING',
        program: { title: 'Baking Masterclass' },
      };

      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      mockCreatePaymentLink.mockResolvedValue({
        checkoutUrl: 'https://checkout.payos.vn/test-payment',
      });
      mockPrisma.order.update.mockResolvedValue({ ...mockOrder, paymentMethod: 'PAYOS' });

      const response = await request(app)
        .post('/api/payos/create-payment-url')
        .send({ orderId: 'order-1' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ paymentUrl: 'https://checkout.payos.vn/test-payment' });
      expect(mockCreatePaymentLink).toHaveBeenCalledWith(expect.objectContaining({
        orderCode: 2026062341394,
        amount: 500000,
        description: 'BAKING ORD 20260623 A1B2',
      }));
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: expect.objectContaining({
          paymentMethod: 'PAYOS',
          paymentProvider: 'PAYOS',
          paymentUrl: 'https://checkout.payos.vn/test-payment',
          gatewayTxnRef: '2026062341394',
        }),
      });
    });

    test('should return 404 if order not found', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/payos/create-payment-url')
        .send({ orderId: 'nonexistent-order' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Order not found.' });
    });

    test('should return 403 if order does not belong to user', async () => {
      const mockOrder = {
        id: 'order-1',
        userId: 'different-user',
      };
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      const response = await request(app)
        .post('/api/payos/create-payment-url')
        .send({ orderId: 'order-1' });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: 'Access denied.' });
    });

    test('should return 400 if order status is not PENDING or REJECTED', async () => {
      const mockOrder = {
        id: 'order-1',
        userId: 'user-1',
        status: 'CONFIRMED',
      };
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      const response = await request(app)
        .post('/api/payos/create-payment-url')
        .send({ orderId: 'order-1' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Cannot create payment URL for order with status');
    });
  });

  describe('POST /api/payos/webhook', () => {
    test('should successfully confirm payment when webhook is verified and successful', async () => {
      const mockWebhookPayload = {
        success: true,
        data: {
          orderCode: 2026062341394,
          amount: 500000,
          code: '00',
          reference: 'PAYOS-12345',
          desc: 'SUCCESS',
        },
      };

      const mockOrder = {
        id: 'order-1',
        orderCode: 'ORD-20260623-A1B2',
        amount: 500000,
        status: 'PENDING',
        userId: 'user-1',
        pointsEarned: 10,
        user: { id: 'user-1', totalSpent: 0, points: 0 },
      };

      mockVerifyWebhookData.mockReturnValue(mockWebhookPayload.data);
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.setting.findUnique.mockResolvedValue(null); // defaults for loyalty

      const response = await request(app)
        .post('/api/payos/webhook')
        .send(mockWebhookPayload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(mockVerifyWebhookData).toHaveBeenCalledWith(mockWebhookPayload);
      expect(mockPrisma.order.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'order-1' },
        data: expect.objectContaining({
          status: 'CONFIRMED',
          paymentProvider: 'PAYOS',
          gatewayTransactionNo: 'PAYOS-12345',
          gatewayResponseCode: '00',
        }),
      }));
      expect(enrollmentService.createEnrollmentForOrder).toHaveBeenCalledWith('order-1', expect.any(Object));
    });

    test('should fail if signature verification throws an error', async () => {
      mockVerifyWebhookData.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const response = await request(app)
        .post('/api/payos/webhook')
        .send({ invalid: 'data' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid signature' });
    });

    test('should fail if amount mismatch occurs', async () => {
      const mockWebhookPayload = {
        success: true,
        data: {
          orderCode: 2026062341394,
          amount: 100000, // mismatch
          code: '00',
        },
      };

      const mockOrder = {
        id: 'order-1',
        orderCode: 'ORD-20260623-A1B2',
        amount: 500000,
        status: 'PENDING',
      };

      mockVerifyWebhookData.mockReturnValue(mockWebhookPayload.data);
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      const response = await request(app)
        .post('/api/payos/webhook')
        .send(mockWebhookPayload);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid Amount' });
    });
  });
});
