const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_LOYALTY_CONFIG = {
  discountMode: 'SINGLE',
  discountOrder: ['PROMO', 'TIER', 'POINTS'],
  enabledTypes: ['PROMO', 'TIER', 'POINTS'],
  tiers: [
    { name: 'Bronze', minSpent: 0, discountPercent: 1 },
    { name: 'Silver', minSpent: 100000, discountPercent: 3 },
    { name: 'Gold', minSpent: 5000000, discountPercent: 5 },
  ],
  points: {
    earnRate: 10,      // Default values
    earnPer: 1000,     // Default values
    redeemRate: 1,     // 1 điểm = 1 VND
  },
};

/**
 * Xác định hạng thành viên dựa trên totalSpent và cấu hình tiers.
 */
const determineTier = (totalSpent, tiers) => {
  if (!tiers || tiers.length === 0) return 'NONE';
  // Sort tiers giảm dần theo minSpent để lấy hạng cao nhất đạt được
  const sorted = [...tiers].sort((a, b) => b.minSpent - a.minSpent);
  for (const tier of sorted) {
    if (totalSpent >= tier.minSpent) return tier.name;
  }
  return 'NONE';
};

/**
 * Tính số điểm nhận được từ subTotal.
 */
const calculatePointsEarned = (subTotal, pointsConfig) => {
  if (!pointsConfig || !pointsConfig.earnPer || subTotal <= 0) return 0;
  return Math.floor(subTotal / pointsConfig.earnPer) * pointsConfig.earnRate;
};

/**
 * Tính giá tạm tính (Subtotal) sau khi trừ giảm giá trực tiếp (salePrice).
 */
const calculateSubTotal = (program) => {
  if (!program) return 0;
  const originalPrice = program.price || 0;
  const subTotal = program.salePrice !== null && program.salePrice !== undefined && program.price > program.salePrice 
    ? program.salePrice 
    : originalPrice;
  return subTotal;
};

/**
 * Tính thuế VAT (mặc định 8%).
 */
const calculateVAT = (amount, rate = 0.08) => {
  return Math.round(amount * rate);
};

/**
 * Tính discount từ hạng thành viên trên runningPrice.
 */
const calculateTierDiscount = (memberTier, tiers, runningPrice) => {
  if (!memberTier || memberTier === 'NONE' || !tiers) return 0;
  const tier = tiers.find(t => t.name === memberTier);
  if (!tier) return 0;
  return Math.round(runningPrice * tier.discountPercent / 100);
};

/**
 * Validate và tính discount từ promo code trên runningPrice.
 * Returns: { valid, discount, promoCodeId, error }
 */
const validateAndApplyPromoCode = async (code, runningPrice) => {
  if (!code) return { valid: false, discount: 0, promoCodeId: null, error: 'Không có mã giảm giá.' };

  const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase().trim() } });

  if (!promo) return { valid: false, discount: 0, promoCodeId: null, error: 'Mã giảm giá không tồn tại.' };
  if (!promo.isActive) return { valid: false, discount: 0, promoCodeId: null, error: 'Mã giảm giá đã bị vô hiệu hóa.' };

  const now = new Date();
  if (promo.startDate && now < promo.startDate) return { valid: false, discount: 0, promoCodeId: null, error: 'Mã giảm giá chưa có hiệu lực.' };
  if (promo.endDate && now > promo.endDate) return { valid: false, discount: 0, promoCodeId: null, error: 'Mã giảm giá đã hết hạn.' };
  if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) return { valid: false, discount: 0, promoCodeId: null, error: 'Mã giảm giá đã đạt giới hạn sử dụng.' };
  if (runningPrice < promo.minOrderValue) return { valid: false, discount: 0, promoCodeId: null, error: `Đơn hàng tối thiểu ${promo.minOrderValue.toLocaleString()}đ để dùng mã này.` };

  let discount = 0;
  if (promo.type === 'PERCENTAGE') {
    discount = Math.round(runningPrice * promo.value / 100);
    if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
  } else {
    // FIXED
    discount = Math.min(promo.value, runningPrice);
  }

  return { valid: true, discount, promoCodeId: promo.id, error: null };
};

/**
 * Apply tất cả discounts theo discountOrder từ config.
 * Returns: { promoCodeId, promoCodeDiscount, tierDiscount, pointsUsed, pointsDiscount, finalPrice }
 */
const applyDiscounts = async ({ appliedDiscounts, loyaltyConfig, promoCode, pointsToUse, memberTier, userPoints, subTotal }) => {
  const order = loyaltyConfig.discountOrder || [];
  const enabled = new Set(loyaltyConfig.enabledTypes || []);
  const mode = loyaltyConfig.discountMode || 'SINGLE';

  // Validate: SINGLE chỉ cho 1 loại
  const requestedTypes = (appliedDiscounts || []).filter(t => enabled.has(t));
  if (mode === 'SINGLE' && requestedTypes.length > 1) {
    throw new Error('Chế độ giảm giá hiện tại chỉ cho phép áp dụng 1 loại ưu đãi.');
  }

  let runningPrice = subTotal;
  let promoCodeId = null, promoCodeDiscount = 0, tierDiscount = 0, pointsUsed = 0, pointsDiscount = 0;

  // Apply theo thứ tự config
  for (const type of order) {
    if (!requestedTypes.includes(type)) continue;

    if (type === 'PROMO') {
      const result = await validateAndApplyPromoCode(promoCode, runningPrice);
      if (!result.valid) throw new Error(result.error);
      promoCodeId = result.promoCodeId;
      promoCodeDiscount = result.discount;
      runningPrice = Math.max(0, runningPrice - promoCodeDiscount);
    }

    if (type === 'TIER') {
      tierDiscount = calculateTierDiscount(memberTier, loyaltyConfig.tiers, runningPrice);
      runningPrice = Math.max(0, runningPrice - tierDiscount);
    }

    if (type === 'POINTS') {
      const redeemRate = loyaltyConfig.points?.redeemRate || 1;
      const safePointsToUse = Math.max(0, pointsToUse || 0);
      const wantToUse = Math.min(safePointsToUse, userPoints || 0);
      
      pointsDiscount = Math.min(wantToUse * redeemRate, runningPrice);
      pointsUsed = redeemRate > 0 ? Math.ceil(pointsDiscount / redeemRate) : 0;
      runningPrice = Math.max(0, runningPrice - pointsDiscount);
    }
  }

  return { promoCodeId, promoCodeDiscount, tierDiscount, pointsUsed, pointsDiscount, finalPrice: runningPrice };
};

module.exports = {
  DEFAULT_LOYALTY_CONFIG,
  determineTier,
  calculatePointsEarned,
  calculateSubTotal,
  calculateVAT,
  calculateTierDiscount,
  validateAndApplyPromoCode,
  applyDiscounts,
};
