const router = require('express').Router();
const { query } = require('../db');
const { ok, error } = require('../helpers');

router.post('/', async (req, res) => {
  const { period_id, name } = req.body;
  if (!period_id || !name) return error(res, 400, 'เลือกรอบและกรอกชื่อหัวข้อ');

  const result = await query('INSERT INTO topics (period_id, name) VALUES (?, ?)', [period_id, name]);
  ok(res, { id: result.insertId }, 'เพิ่มหัวข้อแล้ว');
});

router.put('/:id', async (req, res) => {
  if (!req.body.name) return error(res, 400, 'กรอกชื่อหัวข้อ');

  const result = await query('UPDATE topics SET name = ? WHERE id = ?', [req.body.name, req.params.id]);
  if (result.affectedRows === 0) return error(res, 404, 'ไม่พบหัวข้อ');
  ok(res, null, 'แก้ไขหัวข้อแล้ว');
});

router.delete('/:id', async (req, res) => {
  const result = await query('DELETE FROM topics WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) return error(res, 404, 'ไม่พบหัวข้อ');
  ok(res, null, 'ลบหัวข้อแล้ว');
});

module.exports = router;
