const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { validateAndApplyPromoCode } = require('../services/loyaltyService');

// GET /api/promo-codes — Admin: list all
exports.getAll = async (req, res) => {
  try {
    const codes = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(codes);
  } catch (err) {
    console.error('getAll promoCodes error:', err);
    res.status(500).json({ error: 'Failed to fetch promo codes.' });
  }
};

// POST /api/promo-codes — Admin: tạo mã
exports.create = async (req, res) => {
  try {
    const { code, type, value, maxDiscount, minOrderValue, usageLimit, startDate, endDate, isActive } = req.body;

    // 1. Auto-generate code if empty
    let finalCode = code?.toUpperCase().trim();
    if (!finalCode) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      finalCode = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }

    if (!type || value === undefined) {
      return res.status(400).json({ error: 'Thiếu thông tin: loại mã (type) hoặc giá trị (value).' });
    }

    // 2. Date Validation
    const now = new Date();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && start < now.setHours(0,0,0,0)) {
      return res.status(400).json({ error: 'Ngày bắt đầu không được ở quá khứ.' });
    }
    if (start && end && end <= start) {
      return res.status(400).json({ error: 'Ngày kết thúc phải lớn hơn ngày bắt đầu.' });
    }

    if (!['PERCENTAGE', 'FIXED'].includes(type)) {
      return res.status(400).json({ error: 'Loại mã không hợp lệ. Chỉ chấp nhận PERCENTAGE hoặc FIXED.' });
    }
    if (type === 'PERCENTAGE' && (value <= 0 || value > 100)) {
      return res.status(400).json({ error: 'Giá trị % phải từ 1 đến 100.' });
    }
    if (type === 'FIXED' && value <= 0) {
      return res.status(400).json({ error: 'Giá trị cố định phải lớn hơn 0.' });
    }

    const existing = await prisma.promoCode.findUnique({ where: { code: finalCode } });
    if (existing) return res.status(400).json({ error: 'Mã giảm giá đã tồn tại.' });

    const promo = await prisma.promoCode.create({
      data: {
        code: finalCode,
        type,
        value: parseInt(value),
        maxDiscount: maxDiscount ? parseInt(maxDiscount) : null,
        minOrderValue: minOrderValue ? parseInt(minOrderValue) : 0,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      }
    });
    res.status(201).json({ message: 'Tạo mã giảm giá thành công.', promo });
  } catch (err) {
    console.error('create promoCode error:', err);
    res.status(500).json({ error: 'Failed to create promo code.' });
  }
};

// PUT /api/promo-codes/:id — Admin: sửa mã
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, type, value, maxDiscount, minOrderValue, usageLimit, startDate, endDate, isActive } = req.body;

    const existing = await prisma.promoCode.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Không tìm thấy mã giảm giá.' });

    const effectiveType = type || existing.type;
    const effectiveValue = value !== undefined ? parseInt(value) : existing.value;

    if (effectiveType === 'PERCENTAGE' && (effectiveValue <= 0 || effectiveValue > 100)) {
      return res.status(400).json({ error: 'Giá trị % phải từ 1 đến 100.' });
    }
    if (effectiveType === 'FIXED' && effectiveValue <= 0) {
      return res.status(400).json({ error: 'Giá trị cố định phải lớn hơn 0.' });
    }

    const promo = await prisma.promoCode.update({
      where: { id },
      data: {
        ...(code && { code: code.toUpperCase().trim() }),
        ...(type && { type }),
        ...(value !== undefined && { value: parseInt(value) }),
        ...(maxDiscount !== undefined && { maxDiscount: maxDiscount ? parseInt(maxDiscount) : null }),
        ...(minOrderValue !== undefined && { minOrderValue: parseInt(minOrderValue) }),
        ...(usageLimit !== undefined && { usageLimit: usageLimit ? parseInt(usageLimit) : null }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      }
    });
    res.json({ message: 'Cập nhật mã giảm giá thành công.', promo });
  } catch (err) {
    console.error('update promoCode error:', err);
    res.status(500).json({ error: 'Failed to update promo code.' });
  }
};

// DELETE /api/promo-codes/:id — Admin: xóa mã
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.promoCode.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Không tìm thấy mã giảm giá.' });

    await prisma.promoCode.delete({ where: { id } });
    res.json({ message: 'Xóa mã giảm giá thành công.' });
  } catch (err) {
    console.error('delete promoCode error:', err);
    res.status(500).json({ error: 'Failed to delete promo code.' });
  }
};

// POST /api/promo-codes/validate — User: preview discount (không cần auth)
exports.validate = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code || !orderAmount) {
      return res.status(400).json({ error: 'Thiếu code hoặc orderAmount.' });
    }
    const result = await validateAndApplyPromoCode(code, parseInt(orderAmount));
    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ valid: true, discount: result.discount, promoCodeId: result.promoCodeId });
  } catch (err) {
    console.error('validate promoCode error:', err);
    res.status(500).json({ error: 'Failed to validate promo code.' });
  }
};
