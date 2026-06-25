const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

const prisma = new PrismaClient();
const resetCodes = new Map();

const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

const generateTokens = async (user) => {
  const payload = {
    user: {
      id: user.id,
      role: user.role,
      fullName: user.fullName,
      permissions: user.permissions || []
    },
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret_123', {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  const refreshTokenValue = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET || 'refresh_fallback_secret_456', {
    expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d`,
  });

  // Store refresh token in DB
  await prisma.refreshToken.create({
    data: {
      token: refreshTokenValue,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
    }
  });

  return { accessToken, refreshToken: refreshTokenValue };
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng cung cấp email và mật khẩu.' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Thông tin đăng nhập không hợp lệ.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Thông tin đăng nhập không hợp lệ.' });
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    res.json({
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        role: user.role,
        fullName: user.fullName
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error.');
  }
};

exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Vui lòng cung cấp tên, email và mật khẩu.' });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      return res.status(400).json({ error: 'Email này đã được sử dụng.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { determineTier, DEFAULT_LOYALTY_CONFIG } = require('../services/loyaltyService');
    const loyaltySetting = await prisma.setting.findUnique({ where: { key: 'loyaltyConfig' } });
    const loyaltyConfig = loyaltySetting ? loyaltySetting.value : DEFAULT_LOYALTY_CONFIG;
    const initialTier = determineTier(0, loyaltyConfig.tiers);

    user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role: 'USER',
        memberTier: initialTier
      }
    });

    const { accessToken, refreshToken } = await generateTokens(user);

    res.status(201).json({ 
      token: accessToken, 
      refreshToken, 
      user: {
        id: user.id,
        role: user.role,
        fullName: user.fullName
      } 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error.');
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required.' });
    }

    // Verify token exists in DB
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      if (storedToken) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      }
      return res.status(401).json({ error: 'Refresh token expired or invalid.' });
    }

    // Verify JWT
    try {
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_fallback_secret_456');
    } catch (err) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      return res.status(401).json({ error: 'Invalid refresh token signature.' });
    }

    // Generate new access token
    const payload = {
      user: {
        id: storedToken.user.id,
        role: storedToken.user.role,
        fullName: storedToken.user.fullName,
        permissions: storedToken.user.permissions || []
      },
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret_123', {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    res.json({ token: accessToken });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(500).json({ error: 'Internal server error during token refresh.' });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken }
      });
    }
    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Internal server error during logout.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const isStaff = req.user.role === 'ADMIN' || req.user.role === 'EDITOR';

    if (isStaff) {
      // Staff chỉ cần thông tin cơ bản, không query enrollments/orders
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          permissions: true,
          createdAt: true,
        }
      });

      if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
      return res.json(user);
    }

    // USER: lấy đầy đủ bao gồm enrollments, orders, loyalty
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        totalSpent: true,
        points: true,
        memberTier: true,
        enrollments: {
          include: { 
            classSession: {
              include: { program: true }
            }
          }
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            program: { select: { id: true, title: true, slug: true, thumbnail: true, price: true } }
          }
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error.');
  }
};


exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Mật khẩu hiện tại không chính xác.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Đổi mật khẩu thành công!' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Lỗi hệ thống khi đổi mật khẩu.' });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { fullName } = req.body;
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'Họ tên không được để trống.' });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { fullName: fullName.trim() },
      select: { id: true, fullName: true, email: true, role: true, permissions: true },
    });

    res.json(updated);
  } catch (err) {
    console.error('updateMe error:', err);
    res.status(500).json({ error: 'Lỗi hệ thống khi cập nhật thông tin.' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Vui lòng cung cấp email.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy tài khoản với email này.' });
    }

    // Generate a 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    resetCodes.set(email, { code, expires });

    console.log(`[PASSWORD RESET] Email: ${email} | Code: ${code}`);

    // Send email via emailService
    await emailService.sendEmail({
      to: email,
      subject: '[YumSaigon] Mã OTP Khôi Phục Mật Khẩu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #c19a5b; text-align: center;">Khôi Phục Mật Khẩu</h2>
          <p>Xin chào <strong>${user.fullName}</strong>,</p>
          <p>Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản trên hệ thống <strong>YumSaigon</strong>.</p>
          <p>Mã OTP xác nhận của bạn là:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; background-color: #f7f7f7; padding: 10px 20px; border-radius: 5px; border: 1px dashed #c19a5b; color: #222;">${code}</span>
          </div>
          <p style="color: #666; font-size: 14px;">Mã OTP này có hiệu lực trong vòng <strong>10 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
          <p>Nếu bạn không yêu cầu thay đổi này, hãy bỏ qua email này.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">YumSaigon - Học làm bánh chuyên nghiệp</p>
        </div>
      `
    });

    // Determine if SMTP is configured
    const smtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;

    res.json({ 
      success: true, 
      message: 'Mã OTP khôi phục mật khẩu đã được gửi đến email của bạn.',
      ...(!smtpConfigured ? { code } : {})
    });
  } catch (err) {
    console.error('ForgotPassword error:', err);
    res.status(500).json({ error: 'Lỗi hệ thống khi yêu cầu khôi phục mật khẩu.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ email, mã OTP và mật khẩu mới.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
    }

    const record = resetCodes.get(email);
    if (!record) {
      return res.status(400).json({ error: 'Yêu cầu khôi phục mật khẩu không tồn tại hoặc đã hết hạn.' });
    }

    if (record.code !== code) {
      return res.status(400).json({ error: 'Mã OTP không chính xác.' });
    }

    if (Date.now() > record.expires) {
      resetCodes.delete(email);
      return res.status(400).json({ error: 'Mã OTP đã hết hạn.' });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { email },
      data: { password: hash },
    });

    // Clear reset code
    resetCodes.delete(email);

    res.json({ success: true, message: 'Đặt lại mật khẩu thành công!' });
  } catch (err) {
    console.error('ResetPassword error:', err);
    res.status(500).json({ error: 'Lỗi hệ thống khi đặt lại mật khẩu.' });
  }
};
