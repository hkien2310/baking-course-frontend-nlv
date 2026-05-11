/**
 * VNPay Integration Tests
 * Tests both vnpayService and vnpayController
 */

const request = require('supertest');
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const vnpayUtils = require('../src/utils/vnpay');
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

jest.mock('../src/utils/vnpay', () => ({
  sortParams: jest.fn(p => p),
  buildQueryString: jest.fn(params => Object.keys(params).map(key => `${key}=${params[key]}`).join('&')),
  signPayload: jest.fn(() => 'mock_secure_hash'),
  verifySecureHash: jest.fn(),
  formatVnpDate: jest.fn(() => '20231010101010'),
  generateTxnRef: jest.fn(code => `${code}-TXN`),
}));

jest.mock('../src/services/enrollmentService', () => ({
  createEnrollmentForOrder: jest.fn(),
}));

// Mock auth middleware
jest.mock('../src/middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: 'user-1' };
  next();
});

// Import service and controller after mocks
const vnpayService = require('../src/services/vnpayService');
const vnpayController = require('../src/controllers/vnpayController');

// --- Setup Test App ---
const app = express();
app.use(express.json());
const vnpayRoutes = require('../src/routes/vnpayRoutes');
app.use('/api/vnpay', vnpayRoutes);

describe('VNPay Module Tests', () => {
  beforeAll(() => {
    process.env.VNPAY_TMN_CODE = 'TEST_TMN';
    process.env.VNPAY_HASH_SECRET = 'TEST_SECRET';
    process.env.VNPAY_PAYMENT_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    process.env.VNPAY_RETURN_URL = 'http://localhost:5000/api/vnpay/return';
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('vnpayService', () => {
    const mockOrder = {
      id: 'order-1',
      orderCode: 'ORD123',
      amount: 1000,
    };

    test('createPaymentUrl should generate a valid URL', () => {
      const result = vnpayService.createPaymentUrl(mockOrder, '127.0.0.1', 'NCB');
      
      expect(result).toHaveProperty('paymentUrl');
      expect(result.paymentUrl).toContain('mock_secure_hash');
      expect(vnpayUtils.generateTxnRef).toHaveBeenCalledWith(mockOrder.orderCode);
      expect(vnpayUtils.signPayload).toHaveBeenCalled();
    });

    test('processIpnCallback should return RspCode 97 for invalid hash', async () => {
      vnpayUtils.verifySecureHash.mockReturnValue(false);
      
      const result = await vnpayService.processIpnCallback({ vnp_SecureHash: 'invalid' });
      expect(result.RspCode).toBe('97');
    });

    test('processIpnCallback should successfully confirm an order', async () => {
      vnpayUtils.verifySecureHash.mockReturnValue(true);
      const mockUser = { id: 'user-1', totalSpent: 0, points: 0 };
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'order-1',
        orderCode: 'ORD123',
        amount: 1000,
        subTotal: 1000,
        pointsEarned: 50,
        status: 'PENDING',
        userId: 'user-1',
        user: mockUser
      });
      // Also mock findUnique for OrderService
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        orderCode: 'ORD123',
        amount: 1000,
        subTotal: 1000,
        pointsEarned: 50,
        status: 'PENDING',
        userId: 'user-1',
        user: mockUser
      });

      const query = {
        vnp_TxnRef: 'ORD123-TXN',
        vnp_Amount: '100000',
        vnp_ResponseCode: '00',
        vnp_TransactionStatus: '00',
        vnp_TransactionNo: '123456',
        vnp_SecureHash: 'mock_secure_hash'
      };

      const result = await vnpayService.processIpnCallback(query);
      
      expect(result.RspCode).toBe('00');
      expect(mockPrisma.order.update).toHaveBeenCalled();
      expect(enrollmentService.createEnrollmentForOrder).toHaveBeenCalledWith('order-1', expect.anything());
    });

    test('processIpnCallback should handle amount mismatch', async () => {
      vnpayUtils.verifySecureHash.mockReturnValue(true);
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'order-1',
        amount: 1000,
      });

      const query = {
        vnp_Amount: '500000', // Different amount
      };

      const result = await vnpayService.processIpnCallback(query);
      expect(result.RspCode).toBe('04');
    });

    test('processReturnCallback should handle invalid hash', async () => {
      vnpayUtils.verifySecureHash.mockReturnValue(false);
      const result = await vnpayService.processReturnCallback({ vnp_SecureHash: 'invalid' });
      expect(result.status).toBe('failed');
    });

    test('processReturnCallback should handle valid hash and found order', async () => {
      vnpayUtils.verifySecureHash.mockReturnValue(true);
      mockPrisma.order.findFirst.mockResolvedValue({ id: 'order-1', status: 'CONFIRMED' });
      const result = await vnpayService.processReturnCallback({ vnp_ResponseCode: '00' });
      expect(result.status).toBe('success');
    });
  });

  describe('vnpayController', () => {
    test('POST /api/vnpay/create-payment-url should return 200 and paymentUrl', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'user-1',
        status: 'PENDING',
        amount: 1000,
        orderCode: 'ORD123'
      });

      const response = await request(app)
        .post('/api/vnpay/create-payment-url')
        .send({ orderId: 'order-1', bankCode: 'NCB' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('paymentUrl');
      expect(mockPrisma.order.update).toHaveBeenCalled();
    });

    test('POST /api/vnpay/create-payment-url should return 404 if order not found', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);
      const response = await request(app)
        .post('/api/vnpay/create-payment-url')
        .send({ orderId: 'non-existent' });
      expect(response.status).toBe(404);
    });

    test('POST /api/vnpay/create-payment-url should return 403 if user does not own order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'other-user',
        status: 'PENDING'
      });

      const response = await request(app)
        .post('/api/vnpay/create-payment-url')
        .send({ orderId: 'order-1' });

      expect(response.status).toBe(403);
    });

    test('GET /api/vnpay/return should redirect to frontend', async () => {
      vnpayUtils.verifySecureHash.mockReturnValue(true);
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'order-1',
        status: 'CONFIRMED'
      });

      const response = await request(app)
        .get('/api/vnpay/return')
        .query({ vnp_ResponseCode: '00', vnp_SecureHash: 'mock' });

      expect(response.status).toBe(302);
      expect(response.header.location).toContain('status=success');
    });

    test('GET /api/vnpay/ipn should return RspCode', async () => {
      vnpayUtils.verifySecureHash.mockReturnValue(true);
      const mockUser = { id: 'user-1', totalSpent: 0, points: 0 };
      const mockOrder = {
        id: 'order-1',
        amount: 1000,
        subTotal: 1000,
        pointsEarned: 50,
        status: 'PENDING',
        userId: 'user-1',
        user: mockUser
      };
      mockPrisma.order.findFirst.mockResolvedValue(mockOrder);
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      const response = await request(app)
        .get('/api/vnpay/ipn')
        .query({ vnp_Amount: '100000', vnp_ResponseCode: '00', vnp_TransactionStatus: '00' });

      expect(response.status).toBe(200);
      expect(response.body.RspCode).toBe('00');
    });
  });
});
