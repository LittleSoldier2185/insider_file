const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { query } = require('../db');
const { ok, error } = require('../helpers');

const FIELDS = 'id, username, full_name, email, department, role, must_change_password';

function validate(b) {
  if (!b.full_name) return 'กรอกชื่อ-นามสกุล';
  if (!['evaluatee', 'evaluator'].includes(b.role)) return 'เลือกบทบาทผู้รับการประเมินหรือกรรมการ';
  if (b.email && !/^\S+@\S+\.\S+$/.test(b.email)) return 'รูปแบบอีเมลไม่ถูกต้อง';
  return '';
}

router.get('/', async (req, res) => {
  if (req.query.role) {
    return ok(res, await query(`SELECT ${FIELDS} FROM users WHERE role = ? ORDER BY id`, [req.query.role]));
  }
  ok(res, await query(`SELECT ${FIELDS} FROM users ORDER BY id`));
});

router.get('/:id', async (req, res) => {
  const rows = await query(`SELECT ${FIELDS} FROM users WHERE id = ?`, [req.params.id]);
  if (rows.length === 0) return error(res, 404, 'ไม่พบผู้ใช้');
  ok(res, rows[0]);
});

router.post('/', async (req, res) => {
  const b = req.body;
  if (!b.username || b.username.length > 50) return error(res, 400, 'กรอกชื่อผู้ใช้ (ไม่เกิน 50 ตัว)');
  if (!b.password || b.password.length < 8) return error(res, 400, 'รหัสผ่านอย่างน้อย 8 ตัวอักษร');
  const message = validate(b);
  if (message) return error(res, 400, message);

  const hash = await bcrypt.hash(b.password, 10);
  const result = await query(
    'INSERT INTO users (username, password, full_name, email, department, role) VALUES (?, ?, ?, ?, ?, ?)',
    [b.username, hash, b.full_name, b.email || '', b.department || '', b.role],
  );
  ok(res, { id: result.insertId }, 'เพิ่มผู้ใช้แล้ว');
});

router.put('/:id', async (req, res) => {
  const b = req.body;
  const message = validate(b);
  if (message) return error(res, 400, message);

  const result = await query(
    'UPDATE users SET full_name = ?, email = ?, department = ?, role = ? WHERE id = ?',
    [b.full_name, b.email || '', b.department || '', b.role, req.params.id],
  );
  if (result.affectedRows === 0) return error(res, 404, 'ไม่พบผู้ใช้');
  ok(res, null, 'แก้ไขผู้ใช้แล้ว');
});

router.put('/:id/reset-password', async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 8) return error(res, 400, 'รหัสผ่านอย่างน้อย 8 ตัวอักษร');

  const hash = await bcrypt.hash(password, 10);
  const result = await query(
    'UPDATE users SET password = ?, must_change_password = 1 WHERE id = ? AND role <> "admin"',
    [hash, req.params.id],
  );
  if (result.affectedRows === 0) return error(res, 404, 'ไม่พบผู้ใช้');
  ok(res, null, 'รีเซ็ตรหัสผ่านแล้ว');
});

router.delete('/:id', async (req, res) => {
  const result = await query('DELETE FROM users WHERE id = ? AND role <> "admin"', [req.params.id]);
  if (result.affectedRows === 0) return error(res, 404, 'ไม่พบผู้ใช้');
  ok(res, null, 'ลบผู้ใช้แล้ว');
});

module.exports = router;
