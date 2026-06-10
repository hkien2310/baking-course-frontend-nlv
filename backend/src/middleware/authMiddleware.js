const jwt = require('jsonwebtoken');

// Verify JWT token
const auth = function (req, res, next) {
  const authHeader = req.header('Authorization');
  let token;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    token = req.header('x-auth-token');
  }

  if (!token) {
    return res.status(401).json({ error: 'Access denied, no token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_123');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Chỉ cho phép các role cụ thể (dùng cho ADMIN-only routes)
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Không có quyền truy cập.' });
  }
  next();
};

// Cho phép ADMIN hoặc EDITOR có permission module đó
const requirePermission = (module) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Chưa xác thực.' });
  }
  if (req.user.role === 'ADMIN') return next();
  if (req.user.role === 'EDITOR' && req.user.permissions?.includes(module)) return next();
  return res.status(403).json({ error: 'Không có quyền truy cập module này.' });
};

module.exports = auth;
module.exports.requireRole = requireRole;
module.exports.requirePermission = requirePermission;
