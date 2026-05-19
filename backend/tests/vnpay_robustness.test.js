const mockPrisma = {
  order: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  user: {
    update: jest.fn(),
  },
  enrollment: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  setting: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(async (callback) => {
    return callback(mockPrisma);
  }),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

// Mock vnpayUtils BEFORE importing vnpayService
jest.mock('../src/utils/vnpay', () => ({
  verifySecureHash: jest.fn().mockReturnValue(true),
  sortParams: jest.fn(p => p),
  buildQueryString: jest.fn(p => 'mock_query'),
  signPayload: jest.fn(() => 'mock_hash'),
  formatVnpDate: jest.fn(() => '20231010101010'),
  generateTxnRef: jest.fn(code => `${code}-TXN`),
}));

const vnpayService = require('../src/services/vnpayService');
const orderService = require('../src/services/orderService');
const vnpayUtils = require('../src/utils/vnpay');

describe('VNPay Robustness & Concurrency', () => {
  let dbState;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env.VNPAY_TMN_CODE = 'TEST_TMN';
    process.env.VNPAY_HASH_SECRET = 'TEST_SECRET';

    // In-memory DB state for mock
    dbState = {
      order: {
        id: 'order-1',
        orderCode: 'ORD123',
        amount: 1000,
        status: 'PENDING',
        userId: 'user-1',
        gatewayTxnRef: 'ORD123-TXN',
        user: { id: 'user-1', totalSpent: 0, points: 0 }
      }
    };

    // Update mocks to use dbState
    mockPrisma.order.findFirst.mockImplementation(async () => dbState.order);
    mockPrisma.order.findUnique.mockImplementation(async () => dbState.order);
    mockPrisma.order.update.mockImplementation(async ({ data }) => {
      dbState.order = { ...dbState.order, ...data };
      return dbState.order;
    });
    mockPrisma.user.update.mockImplementation(async ({ data }) => {
      dbState.order.user = { ...dbState.order.user, ...data };
      return dbState.order.user;
    });
    mockPrisma.enrollment.findFirst.mockImplementation(async () => null);
    mockPrisma.enrollment.create.mockImplementation(async ({ data }) => ({ id: 'enroll-1', ...data }));
  });

  test('Concurrency: Double IPN should handle idempotency correctly', async () => {
    // Mock verifySecureHash to always return true for this test
    vnpayUtils.verifySecureHash.mockReturnValue(true);

    const queryParams = {
      vnp_TxnRef: 'ORD123-TXN',
      vnp_Amount: '100000',
      vnp_ResponseCode: '00',
      vnp_TransactionStatus: '00',
      vnp_SecureHash: 'valid_hash'
    };

    // We simulate two calls. Since our mock transaction is serial (it just calls the callback),
    // the first one will complete before the second one starts.
    // This tests the logical idempotency inside the transaction.
    const result1 = await vnpayService.processIpnCallback(queryParams);
    const result2 = await vnpayService.processIpnCallback(queryParams);

    expect(result1.RspCode).toBe('00');
    expect(result2.RspCode).toBe('02'); // Should be 'already confirmed' for the second call
    
    // Order update should have been called only once for the success path
    // Wait, in our current code, orderService.completeOrder is called twice, 
    // but the second time it should skip the update because of the status check inside.
    expect(mockPrisma.order.update).toHaveBeenCalledTimes(1);
    expect(dbState.order.status).toBe('CONFIRMED');
  });

  test('Security: Invalid checksum should be rejected', async () => {
    vnpayUtils.verifySecureHash.mockReturnValue(false);
    const result = await vnpayService.processIpnCallback({ vnp_SecureHash: 'wrong' });
    expect(result.RspCode).toBe('97');
  });

  test('Integrity: Amount mismatch should be rejected', async () => {
    vnpayUtils.verifySecureHash.mockReturnValue(true);
    const result = await vnpayService.processIpnCallback({ 
      vnp_TxnRef: 'ORD123-TXN',
      vnp_Amount: '200000' // Wrong amount (2000 vs 1000)
    });
    expect(result.RspCode).toBe('04');
  });

  test('Robustness: CANCELLED order should not be confirmed by IPN', async () => {
    vnpayUtils.verifySecureHash.mockReturnValue(true);
    dbState.order.status = 'CANCELLED';
    
    const result = await vnpayService.processIpnCallback({ 
      vnp_TxnRef: 'ORD123-TXN',
      vnp_Amount: '100000',
      vnp_ResponseCode: '00',
      vnp_TransactionStatus: '00'
    });
    
    expect(result.RspCode).toBe('99');
    expect(dbState.order.status).toBe('CANCELLED');
    expect(mockPrisma.order.update).not.toHaveBeenCalled();
  });
});
