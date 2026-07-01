/**
 * PayOS Service
 * 
 * Business logic for PayOS payment integration.
 * Handles client initialization, payment link creation, and webhook/return payload signature verification.
 */

const { PayOS } = require('@payos/node');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PAYOS_CONFIG = {
  get clientId() { return process.env.PAYOS_CLIENT_ID; },
  get apiKey() { return process.env.PAYOS_API_KEY; },
  get checksumKey() { return process.env.PAYOS_CHECKSUM_KEY; },
};

let payosInstance = null;

/**
 * Returns the lazily initialized PayOS SDK instance.
 */
function getPayOS() {
  if (!payosInstance) {
    const { clientId, apiKey, checksumKey } = PAYOS_CONFIG;
    if (!clientId || !apiKey || !checksumKey) {
      console.error('PayOS configuration is missing (PAYOS_CLIENT_ID, PAYOS_API_KEY, or PAYOS_CHECKSUM_KEY).');
      throw new Error('PayOS is not configured on this server.');
    }
    payosInstance = new PayOS({
      clientId,
      apiKey,
      checksumKey,
    });
  }
  return payosInstance;
}

/**
 * Converts alphanumeric orderCode (e.g. ORD-20260415-A1B2) into a unique integer for PayOS.
 * - Extracts date part: 20260415 (8 digits)
 * - Converts hex suffix: A1B2 -> decimal (max 65535, padded to 5 digits, e.g. 41394)
 * - Combines them: 2026041541394
 * 
 * @param {string} orderCode 
 * @returns {number}
 */
function orderCodeToNumber(orderCode) {
  if (!orderCode) throw new Error('Order code is required');
  const parts = orderCode.split('-');
  if (parts.length !== 3 || parts[0] !== 'ORD') {
    throw new Error(`Invalid order code format: ${orderCode}`);
  }
  const dateStr = parts[1]; // e.g. "20260623"
  const hexStr = parts[2];  // e.g. "A1B2"
  const decVal = parseInt(hexStr, 16);
  
  const numStr = `${dateStr}${String(decVal).padStart(5, '0')}`;
  return parseInt(numStr, 10);
}

/**
 * Converts the unique integer back into the alphanumeric orderCode format.
 * 
 * @param {number|string} num 
 * @returns {string}
 */
function numberToOrderCode(num) {
  const numStr = String(num);
  if (numStr.length < 6) {
    throw new Error(`Invalid numeric order code: ${num}`);
  }
  const decStr = numStr.slice(-5);
  const dateStr = numStr.slice(0, -5);
  const decVal = parseInt(decStr, 10);
  const hexStr = decVal.toString(16).toUpperCase().padStart(4, '0');
  return `ORD-${dateStr}-${hexStr}`;
}

/**
 * Create a PayOS payment link for an order
 * 
 * @param {object} order - Prisma Order object (with program pre-loaded)
 * @param {string} frontendUrl - Frontend application URL
 * @returns {Promise<{ checkoutUrl: string, orderCodeNum: number }>}
 */
async function createPaymentLink(order, frontendUrl) {
  const payos = getPayOS();
  const orderCodeNum = orderCodeToNumber(order.orderCode);

  const cleanDescription = `BAKING ${order.orderCode}`.replace(/-/g, ' ');

  const paymentData = {
    orderCode: orderCodeNum,
    amount: order.amount, // PayOS takes original VND integer
    description: cleanDescription,
    cancelUrl: `${frontendUrl}/payment/result?orderId=${order.id}&status=cancelled`,
    returnUrl: `${frontendUrl}/payment/result?orderId=${order.id}&status=success`,
    items: [
      {
        name: order.program?.title || 'Khoa hoc lam banh',
        quantity: 1,
        price: order.amount,
      }
    ]
  };

  const response = await payos.paymentRequests.create(paymentData);
  return {
    checkoutUrl: response.checkoutUrl,
    orderCodeNum
  };
}

/**
 * Verifies webhook data and returns the decoded payload.
 * Throws an error if verification fails.
 * 
 * @param {object} body - Webhook request body
 * @returns {object} Verified data object
 */
function verifyWebhook(body) {
  const payos = getPayOS();
  return payos.webhooks.verify(body);
}

module.exports = {
  orderCodeToNumber,
  numberToOrderCode,
  createPaymentLink,
  verifyWebhook,
};
