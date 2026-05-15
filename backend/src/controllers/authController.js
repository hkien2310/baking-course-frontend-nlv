const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

const generateTokens = async (user) => {
  const payload = {
    user: {
      id: user.id,
      role: user.role,
      fullName: user.fullName
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
        fullName: storedToken.user.fullName
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
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        // Loyalty fields
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

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
    }

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
