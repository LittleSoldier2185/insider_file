const jwt = require('jsonwebtoken');
const { error } = require('./helpers');

const SECRET = process.env.JWT_SECRET || 'change-this-secret-key';

function createToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, must_change_password: !!user.must_change_password },
    SECRET,
    { expiresIn: '8h' },
  );
}

function login(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '') || req.query.token;
  try {
    req.user = jwt.verify(token, SECRET);
  } catch {
    return error(res, 401, 'กรุณาเข้าสู่ระบบ');
  }
  const allowed = ['/api/auth/me', '/api/auth/password'];
  if (req.user.must_change_password && !allowed.includes(req.originalUrl)) {
    return error(res, 403, 'กรุณาเปลี่ยนรหัสผ่านก่อนใช้งาน');
  }
  next();
}

function allow(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return error(res, 403, 'ไม่มีสิทธิ์ใช้งานส่วนนี้');
    next();
  };
}

module.exports = { createToken, login, allow };
