/**
 * VNPay Service
 * 
 * Business logic for VNPay payment integration.
 * Handles URL creation, IPN processing, and return callback processing.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {
  sortParams,
  buildQueryString,
  signPayload,
  verifySecureHash,
  formatVnpDate,
  generateTxnRef,
} = require('../utils/vnpay');

const VNPAY_CONFIG = {
  get tmnCode() { return process.env.VNPAY_TMN_CODE; },
  get hashSecret() { return process.env.VNPAY_HASH_SECRET; },
  get paymentUrl() { return process.env.VNPAY_PAYMENT_URL; },
  get returnUrl() { return process.env.VNPAY_RETURN_URL; },
  get locale() { return process.env.VNPAY_LOCALE || 'vn'; },
  get orderType() { return process.env.VNPAY_ORDER_TYPE || 'other'; },
};

/**
 * Create a VNPay payment URL for a given order
 * 
 * @param {object} order - Prisma Order object (must have id, orderCode, amount)
 * @param {string} ipAddress - Client IP address
 * @param {string} [bankCode] - Optional bank code (e.g. 'VNBANK', 'INTCARD')
 * @returns {{ paymentUrl: string, txnRef: string, expireDate: Date }}
 */
function createPaymentUrl(order, ipAddress, bankCode) {
  if (!VNPAY_CONFIG.tmnCode || !VNPAY_CONFIG.hashSecret) {
    console.error('VNPay configuration is missing (VNPAY_TMN_CODE or VNPAY_HASH_SECRET).');
    throw new Error('VNPay is not configured on this server.');
  }

  const txnRef = generateTxnRef(order.orderCode);
  const now = new Date();
  const expireDate = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes

  const params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: VNPAY_CONFIG.tmnCode,
    vnp_Locale: VNPAY_CONFIG.locale,
    vnp_CurrCode: 'VND',
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: `Course payment - ${order.orderCode}`,
    vnp_OrderType: VNPAY_CONFIG.orderType,
    vnp_Amount: order.amount * 100, // VNPay requires amount × 100
    vnp_ReturnUrl: VNPAY_CONFIG.returnUrl,
    vnp_IpAddr: ipAddress || '127.0.0.1',
    vnp_CreateDate: formatVnpDate(now),
    vnp_ExpireDate: formatVnpDate(expireDate),
  };

  if (bankCode) {
    params.vnp_BankCode = bankCode;
  }

  const sorted = sortParams(params);
  const signData = buildQueryString(sorted);
  const secureHash = signPayload(signData, VNPAY_CONFIG.hashSecret);

  sorted.vnp_SecureHash = secureHash;

  const paymentUrl = `${VNPAY_CONFIG.paymentUrl}?${buildQueryString(sorted)}`;

  return { paymentUrl, txnRef, expireDate };
}

/**
 * Process IPN (Instant Payment Notification) callback from VNPay
 * This is the source of truth for payment confirmation.
 * 
 * @param {object} queryParams - Full query params from VNPay IPN call
 * @returns {{ RspCode: string, Message: string }}
 */
async function processIpnCallback(queryParams) {
  // 1. Verify secure hash
  if (!verifySecureHash(queryParams, VNPAY_CONFIG.hashSecret)) {
    console.error('VNPay IPN: Invalid checksum');
    return { RspCode: '97', Message: 'Invalid Checksum' };
  }

  const vnpTxnRef = queryParams['vnp_TxnRef'];
  const vnpAmount = parseInt(queryParams['vnp_Amount'], 10);
  const vnpResponseCode = queryParams['vnp_ResponseCode'];
  const vnpTransactionNo = queryParams['vnp_TransactionNo'];
  const vnpTransactionStatus = queryParams['vnp_TransactionStatus'];

  // 2. Find order by gatewayTxnRef
  const order = await prisma.order.findFirst({
    where: { gatewayTxnRef: vnpTxnRef },
  });

  if (!order) {
    console.warn('VNPay IPN: Order not found for txnRef:', vnpTxnRef);
    return { RspCode: '01', Message: 'Order not found' };
  }

  // 3. Verify amount
  if (vnpAmount !== order.amount * 100) {
    console.warn(`VNPay IPN: Amount mismatch for ${vnpTxnRef}. Expected ${order.amount * 100}, got ${vnpAmount}`);
    return { RspCode: '04', Message: 'Invalid Amount' };
  }

  // 4. Check idempotency — already confirmed
  if (order.status === 'CONFIRMED') {
    return { RspCode: '02', Message: 'Order already confirmed' };
  }

  // 5. Build raw payload (exclude secret hash for safety)
  const rawPayload = { ...queryParams };
  delete rawPayload['vnp_SecureHash'];
  delete rawPayload['vnp_SecureHashType'];

  // 6. Process based on response code
  if (vnpResponseCode === '00' && vnpTransactionStatus === '00') {
    // Payment successful — confirm order
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CONFIRMED',
        paidAt: new Date(),
        paidViaWebhook: true,
        confirmedAt: new Date(),
        paymentProvider: 'VNPAY',
        gatewayTransactionNo: vnpTransactionNo || null,
        gatewayResponseCode: vnpResponseCode,
        gatewayTransactionStatus: vnpTransactionStatus,
        rawGatewayPayload: rawPayload,
        adminNote: 'Auto-confirmed via VNPay IPN.',
      },
    });
    console.log(`VNPay IPN: Order ${order.orderCode} CONFIRMED (txnRef: ${vnpTxnRef})`);

    // Auto-create enrollment after successful VNPay payment
    const enrollmentService = require('./enrollmentService');
    await enrollmentService.createEnrollmentForOrder(order.id);
  } else {
    // Payment failed — update gateway info but keep PENDING
    await prisma.order.update({
      where: { id: order.id },
      data: {
        gatewayResponseCode: vnpResponseCode,
        gatewayTransactionStatus: vnpTransactionStatus,
        gatewayTransactionNo: vnpTransactionNo || null,
        rawGatewayPayload: rawPayload,
      },
    });
    console.log(`VNPay IPN: Order ${order.orderCode} payment FAILED (code: ${vnpResponseCode})`);
  }

  return { RspCode: '00', Message: 'Confirm Success' };
}

/**
 * Process Return URL callback (user redirect back)
 * This is NOT the source of truth — only for UI display.
 * 
 * @param {object} queryParams - Full query params from VNPay return redirect
 * @returns {{ orderId: string|null, status: string, message: string }}
 */
async function processReturnCallback(queryParams) {
  // Verify hash first
  if (!verifySecureHash(queryParams, VNPAY_CONFIG.hashSecret)) {
    return { orderId: null, status: 'failed', message: 'Invalid payment signature' };
  }

  const vnpTxnRef = queryParams['vnp_TxnRef'];
  const vnpResponseCode = queryParams['vnp_ResponseCode'];

  const order = await prisma.order.findFirst({
    where: { gatewayTxnRef: vnpTxnRef },
  });

  if (!order) {
    return { orderId: null, status: 'failed', message: 'Order not found' };
  }

  // Map VNPay response code to simple status for frontend
  let status;
  if (vnpResponseCode === '00') {
    status = order.status === 'CONFIRMED' ? 'success' : 'pending';
  } else if (vnpResponseCode === '24') {
    status = 'cancelled'; // User cancelled on VNPay
  } else {
    status = 'failed';
  }

  return { orderId: order.id, status, message: `Response code: ${vnpResponseCode}` };
}

module.exports = {
  createPaymentUrl,
  processIpnCallback,
  processReturnCallback,
};
