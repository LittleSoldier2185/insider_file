const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { query } = require('../db');
const { ok, error } = require('../helpers');
const { createToken, login } = require('../auth');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return error(res, 400, 'กรอกชื่อผู้ใช้และรหัสผ่าน');

  const rows = await query('SELECT * FROM users WHERE username = ?', [username]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return error(res, 401, 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
  }
  delete user.password;
  ok(res, { token: createToken(user), user }, 'เข้าสู่ระบบสำเร็จ');
});

router.get('/me', login, async (req, res) => {
  const rows = await query(
    'SELECT id, username, full_name, email, department, role, must_change_password FROM users WHERE id = ?',
    [req.user.id],
  );
  if (rows.length === 0) return error(res, 404, 'ไม่พบผู้ใช้');
  ok(res, rows[0]);
});

router.put('/me', login, async (req, res) => {
  const { full_name, email, department } = req.body;
  if (!full_name) return error(res, 400, 'กรอกชื่อ-นามสกุล');
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return error(res, 400, 'รูปแบบอีเมลไม่ถูกต้อง');

  await query('UPDATE users SET full_name = ?, email = ?, department = ? WHERE id = ?', [
    full_name, email || '', department || '', req.user.id,
  ]);
  ok(res, null, 'บันทึกข้อมูลส่วนตัวแล้ว');
});

router.put('/password', login, async (req, res) => {
  const { old_password, new_password } = req.body;
  if (!new_password || new_password.length < 8) {
    return error(res, 400, 'รหัสผ่านใหม่ต้องยาวอย่างน้อย 8 ตัวอักษร');
  }
  const rows = await query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  const user = rows[0];
  if (!(await bcrypt.compare(old_password || '', user.password))) {
    return error(res, 400, 'รหัสผ่านเดิมไม่ถูกต้อง');
  }

  const hash = await bcrypt.hash(new_password, 10);
  await query('UPDATE users SET password = ?, must_change_password = 0 WHERE id = ?', [hash, user.id]);
  user.must_change_password = 0;
  ok(res, { token: createToken(user) }, 'เปลี่ยนรหัสผ่านแล้ว');
});

module.exports = router;
