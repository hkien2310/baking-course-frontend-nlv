/**
 * Format price from cents (Int) to display string
 * @param {number} priceInCents - Price in cents
 * @param {boolean} showFreeText - Whether to show "Miễn phí" for 0
 * @returns {string} Formatted price string
 */
export const formatPrice = (priceInCents, showFreeText = true) => {
  if (priceInCents === null) return 'Liên hệ';
  if (priceInCents === 0 || priceInCents === '0' || priceInCents == null) {
    return showFreeText ? 'Miễn phí' : '0đ';
  }
  return `${Number(priceInCents).toLocaleString('vi-VN')}đ`;
};

/**
 * Format price for input fields (returns just the number in dollars)
 * @param {number} priceInCents - Price in cents
 * @returns {string} Price in dollars as plain number string
 */
export const priceToDollars = (priceInCents) => {
  if (priceInCents == null) return '';
  return priceInCents.toString();
};

/**
 * Convert dollar amount to cents for storage
 * @param {string|number} dollars - Dollar amount (e.g. "550" or 550)
 * @returns {number} Price in cents
 */
export const dollarsToCents = (dollars) => {
  const num = parseFloat(dollars);
  if (isNaN(num)) return 0;
  return Math.round(num);
};

/**
 * Get order status badge configuration
 * @param {string} status - Order status
 * @returns {{ label: string, className: string }}
 */
export const getOrderStatusBadge = (status) => {
  switch (status) {
    case 'PENDING':
      return { label: 'Chờ thanh toán', className: 'badge-warning bg-warning text-dark' };
    case 'AWAITING_CONFIRM':
      return { label: 'Chờ đối soát', className: 'badge-info bg-info text-white' };
    case 'CONFIRMED':
      return { label: 'Đã duyệt', className: 'badge-success bg-success text-white' };
    case 'REJECTED':
      return { label: 'Từ chối', className: 'badge-danger bg-danger text-white' };
    case 'CANCELLED':
      return { label: 'Đã hủy', className: 'badge-secondary bg-secondary text-white' };
    default:
      return { label: status || 'Không rõ', className: 'badge-secondary bg-secondary' };
  }
};

/**
 * Format student count for display: 1600 → "1,6k", 813 → "813"
 * @param {number} count
 * @returns {string}
 */
export const formatStudentCount = (count) => {
  if (count == null || count === 0) return '0';
  if (count >= 1000) {
    const k = count / 1000;
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1).replace('.0', '')}k`;
  }
  return count.toLocaleString('vi-VN');
};

/**
 * Calculate discount percentage between original price and sale price
 * @param {number} price - Original price
 * @param {number} salePrice - Sale price
 * @returns {number|null} Discount percentage or null
 */
export const calcDiscountPercent = (price, salePrice) => {
  if (!price || !salePrice || salePrice >= price) return null;
  return Math.round(((price - salePrice) / price) * 100);
};
