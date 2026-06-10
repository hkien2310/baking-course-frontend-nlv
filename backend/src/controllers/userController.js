const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const ALLOWED_PERMISSIONS = [
  'programs', 'categories', 'posts',
  'orders', 'enrollments', 'contacts',
  'banners', 'studentWorks', 'loyalty', 'settings', 'qna'
];

// GET /api/users/staff — Danh sách ADMIN + EDITOR accounts
exports.getStaffAccounts = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'EDITOR'] } },
      select: { id: true, fullName: true, email: true, role: true, permissions: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi hệ thống.' });
  }
};

// POST /api/users/staff — Tạo tài khoản EDITOR hoặc ADMIN mới
exports.createStaffAccount = async (req, res) => {
  try {
    const { fullName, email, password, role = 'EDITOR', permissions = [] } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ thông tin.' });
    }
    if (!['ADMIN', 'EDITOR'].includes(role)) {
      return res.status(400).json({ error: 'Role không hợp lệ.' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email này đã được sử dụng.' });

    const validPerms = permissions.filter(p => ALLOWED_PERMISSIONS.includes(p));
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: { fullName, email, password: hashedPassword, role, permissions: validPerms },
      select: { id: true, fullName: true, email: true, role: true, permissions: true, createdAt: true }
    });

    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi hệ thống.' });
  }
};

// PATCH /api/users/staff/:id — Sửa tên, role, permissions (không tự sửa mình)
exports.updateStaffAccount = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ error: 'Không thể tự thay đổi tài khoản của chính mình.' });
    }

    const { fullName, role, permissions, password } = req.body;
    const data = {};

    if (fullName) data.fullName = fullName;
    if (role && ['ADMIN', 'EDITOR'].includes(role)) data.role = role;
    if (permissions) data.permissions = permissions.filter(p => ALLOWED_PERMISSIONS.includes(p));
    if (password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(password, salt);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, fullName: true, email: true, role: true, permissions: true, createdAt: true }
    });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi hệ thống.' });
  }
};

// DELETE /api/users/staff/:id — Xóa tài khoản (không tự xóa mình)
exports.deleteStaffAccount = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ error: 'Không thể tự xóa tài khoản của chính mình.' });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'Đã xóa tài khoản.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi hệ thống.' });
  }
};
