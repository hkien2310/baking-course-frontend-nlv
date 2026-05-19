/**
 * VNPay Red Team vs. Blue Team Simulation
 * 
 * RED TEAM: Tấn công (Giả mạo, Đua tốc độ, Replay)
 * BLUE TEAM: Phòng thủ (Transaction, Hash Verify, Idempotency)
 */

const { PrismaClient } = require('@prisma/client');

// --- Mocking Setup ---
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
    // Để mô phỏng transaction thật, ta chạy callback tuần tự
    return await callback(mockPrisma);
  }),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

const vnpayService = require('../src/services/vnpayService');
const vnpayUtils = require('../src/utils/vnpay');
const orderService = require('../src/services/orderService');

describe('VNPay Red Team vs Blue Team Simulation', () => {
  let dbState;
  const SECRET = 'SECRET_KEY_LIVE';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.VNPAY_HASH_SECRET = SECRET;

    dbState = {
      order: {
        id: 'order-1',
        orderCode: 'ORD_ATTACK_001',
        amount: 1000,
        status: 'PENDING',
        userId: 'user-1',
        gatewayTxnRef: 'TXN_REF_001',
        user: { id: 'user-1', totalSpent: 0, points: 0 }
      }
    };

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

  /**
   * ATTACK 1: Tấn công giả mạo Chữ ký (Signature Forgery)
   * RED TEAM: Thử thay đổi số tiền từ 1,000 thành 1,000,000 nhưng vẫn giữ Hash cũ hoặc tạo Hash giả.
   */
  test('RED TEAM Attack: Signature Forgery | BLUE TEAM: HMAC-SHA512 Verification', async () => {
    console.log('\n--- Round 1: Signature Forgery ---');
    
    // Attacker sends fake payload
    const fakeIpn = {
      vnp_TxnRef: 'TXN_REF_001',
      vnp_Amount: '100000000', // Sửa số tiền lên 1 triệu
      vnp_ResponseCode: '00',
      vnp_SecureHash: 'fake_hash_value'
    };

    const result = await vnpayService.processIpnCallback(fakeIpn);
    
    // Blue Team output
    expect(result.RspCode).toBe('97'); // Invalid Checksum
    expect(dbState.order.status).toBe('PENDING'); // Không bị đổi trạng thái
    console.log('Result: RED TEAM failed to bypass signature. BLUE TEAM won.');
  });

  /**
   * ATTACK 2: Tấn công Đua tốc độ (Race Condition / Double Spend)
   * RED TEAM: Gửi đồng thời 10 yêu cầu IPN xác nhận thành công.
   */
  test('RED TEAM Attack: Race Condition | BLUE TEAM: Atomic Transactions & Status Check', async () => {
    console.log('\n--- Round 2: Race Condition ---');
    
    // Tạo hash đúng để bypass Round 1
    const validParams = {
      vnp_TxnRef: 'TXN_REF_001',
      vnp_Amount: '100000',
      vnp_ResponseCode: '00',
      vnp_TransactionStatus: '00'
    };
    const sorted = vnpayUtils.sortParams(validParams);
    const signData = vnpayUtils.buildQueryString(sorted);
    const validHash = vnpayUtils.signPayload(signData, SECRET);
    const validIpn = { ...validParams, vnp_SecureHash: validHash };

    // Simulate 10 concurrent requests
    // Vì mock $transaction của chúng ta chạy tuần tự (như cách DB khóa hàng), 
    // ta sẽ chạy từng cái một để kiểm tra logic Idempotency bên trong.
    const results = [];
    for (let i = 0; i < 10; i++) {
      results.push(await vnpayService.processIpnCallback(validIpn));
    }

    const success = results.filter(r => r.RspCode === '00').length;
    const alreadyConfirmed = results.filter(r => r.RspCode === '02').length;

    console.log(`Summary: ${success} success, ${alreadyConfirmed} blocked as duplicate.`);
    
    expect(success).toBe(1);
    expect(alreadyConfirmed).toBe(9);
    expect(mockPrisma.order.update).toHaveBeenCalledTimes(1);
    console.log('Result: RED TEAM only got 1 confirmation. BLUE TEAM won via Transactions.');
  });

  /**
   * ATTACK 3: Tấn công Chèn trạng thái (State Injection)
   * RED TEAM: Đơn hàng đã HỦY (CANCELLED) nhưng vẫn cố gửi IPN thành công để "hồi sinh" đơn hàng.
   */
  test('RED TEAM Attack: State Injection | BLUE TEAM: Terminal State Check', async () => {
    console.log('\n--- Round 3: State Injection ---');
    
    dbState.order.status = 'CANCELLED'; // Đã hủy

    const validParams = {
      vnp_TxnRef: 'TXN_REF_001',
      vnp_Amount: '100000',
      vnp_ResponseCode: '00',
      vnp_TransactionStatus: '00'
    };
    const sorted = vnpayUtils.sortParams(validParams);
    const signData = vnpayUtils.buildQueryString(sorted);
    const validHash = vnpayUtils.signPayload(signData, SECRET);
    const validIpn = { ...validParams, vnp_SecureHash: validHash };

    const result = await vnpayService.processIpnCallback(validIpn);

    expect(result.RspCode).toBe('99'); // Invalid state
    expect(dbState.order.status).toBe('CANCELLED'); 
    console.log('Result: RED TEAM could not revive a cancelled order. BLUE TEAM won.');
  });

  /**
   * ATTACK 4: Tấn công Sai lệch số tiền (Amount Tampering)
   * RED TEAM: Thanh toán 1 đồng cho đơn hàng 1 triệu.
   */
  test('RED TEAM Attack: Amount Tampering | BLUE TEAM: Server-side Amount Validation', async () => {
    console.log('\n--- Round 4: Amount Tampering ---');

    const tamperingIpn = {
      vnp_TxnRef: 'TXN_REF_001',
      vnp_Amount: '100', // Chỉ trả 1 VND
      vnp_ResponseCode: '00',
      vnp_TransactionStatus: '00'
    };
    
    // Giả sử attacker có SECRET để ký hash đúng cho số tiền 1đ này
    const sorted = vnpayUtils.sortParams(tamperingIpn);
    const signData = vnpayUtils.buildQueryString(sorted);
    const validHash = vnpayUtils.signPayload(signData, SECRET);
    const validIpn = { ...tamperingIpn, vnp_SecureHash: validHash };

    const result = await vnpayService.processIpnCallback(validIpn);

    expect(result.RspCode).toBe('04'); // Invalid Amount
    expect(dbState.order.status).toBe('PENDING');
    console.log('Result: RED TEAM paid the wrong amount. BLUE TEAM won.');
  });
});
