/**
 * VNPay Utility Functions
 * 
 * Core crypto and formatting functions for VNPay integration.
 * No Express/Prisma dependencies — pure utility.
 */

const crypto = require('crypto');
const querystring = require('qs');

/**
 * Sort object keys alphabetically (VNPay requires sorted params)
 */
function sortParams(params) {
  const sorted = {};
  const keys = Object.keys(params)
    .filter(key => params[key] !== '' && params[key] !== undefined && params[key] !== null)
    .sort();

  for (const key of keys) {
    sorted[encodeURIComponent(key)] = encodeURIComponent(params[key]).replace(/%20/g, '+');
  }
  return sorted;
}

/**
 * Build URL-encoded query string from sorted params
 */
function buildQueryString(params) {
  return querystring.stringify(params, { encode: false });
}

/**
 * Sign payload with HMAC SHA512
 * @param {string} queryString - URL-encoded query string
 * @param {string} secret - VNPay hash secret
 * @returns {string} hex-encoded HMAC SHA512 hash
 */
function signPayload(queryString, secret) {
  const hmac = crypto.createHmac('sha512', secret);
  hmac.update(Buffer.from(queryString, 'utf-8'));
  return hmac.digest('hex');
}

/**
 * Verify the vnp_SecureHash from VNPay callback params
 * @param {object} queryParams - Full query params from VNPay (including vnp_SecureHash)
 * @param {string} secret - VNPay hash secret
 * @returns {boolean} Whether the hash is valid
 */
function verifySecureHash(queryParams, secret) {
  const receivedHash = queryParams['vnp_SecureHash'];
  if (!receivedHash) return false;

  // Remove hash fields before re-signing
  const params = { ...queryParams };
  delete params['vnp_SecureHash'];
  delete params['vnp_SecureHashType'];

  const sorted = sortParams(params);
  const signData = buildQueryString(sorted);
  const computedHash = signPayload(signData, secret);

  return receivedHash === computedHash;
}

/**
 * Format Date to VNPay date string: yyyyMMddHHmmss (GMT+7)
 */
function formatVnpDate(date) {
  // Convert to GMT+7
  const gmt7 = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const y = gmt7.getUTCFullYear();
  const m = String(gmt7.getUTCMonth() + 1).padStart(2, '0');
  const d = String(gmt7.getUTCDate()).padStart(2, '0');
  const h = String(gmt7.getUTCHours()).padStart(2, '0');
  const min = String(gmt7.getUTCMinutes()).padStart(2, '0');
  const s = String(gmt7.getUTCSeconds()).padStart(2, '0');
  return `${y}${m}${d}${h}${min}${s}`;
}

/**
 * Generate unique txn ref from orderCode + timestamp
 * VNPay requires vnp_TxnRef to be unique per payment attempt
 */
function generateTxnRef(orderCode) {
  const ts = Date.now().toString(36).toUpperCase();
  return `${orderCode}-${ts}`;
}

module.exports = {
  sortParams,
  buildQueryString,
  signPayload,
  verifySecureHash,
  formatVnpDate,
  generateTxnRef,
};
