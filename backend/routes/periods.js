const router = require('express').Router();
const { query } = require('../db');
const { ok, error } = require('../helpers');

function validate(b) {
  if (!b.name) return 'กรอกชื่อรอบการประเมิน';
  if (!b.start_date || !b.end_date) return 'กรอกวันเริ่มและวันสิ้นสุด';
  if (b.start_date > b.end_date) return 'วันสิ้นสุดต้องไม่ก่อนวันเริ่ม';
  return '';
}

router.get('/', async (req, res) => {
  ok(res, await query('SELECT * FROM periods ORDER BY id DESC'));
});

router.get('/:id', async (req, res) => {
  const periods = await query('SELECT * FROM periods WHERE id = ?', [req.params.id]);
  if (periods.length === 0) return error(res, 404, 'ไม่พบรอบการประเมิน');

  const topics = await query('SELECT * FROM topics WHERE period_id = ? ORDER BY id', [req.params.id]);
  for (const topic of topics) {
    topic.indicators = await query('SELECT * FROM indicators WHERE topic_id = ? ORDER BY id', [topic.id]);
  }
  ok(res, { ...periods[0], topics });
});

router.post('/', async (req, res) => {
  const message = validate(req.body);
  if (message) return error(res, 400, message);

  const { name, start_date, end_date } = req.body;
  const result = await query('INSERT INTO periods (name, start_date, end_date) VALUES (?, ?, ?)', [
    name, start_date, end_date,
  ]);
  ok(res, { id: result.insertId }, 'สร้างรอบแล้ว');
});

router.put('/:id', async (req, res) => {
  const message = validate(req.body);
  if (message) return error(res, 400, message);

  const { name, start_date, end_date } = req.body;
  const result = await query('UPDATE periods SET name = ?, start_date = ?, end_date = ? WHERE id = ?', [
    name, start_date, end_date, req.params.id,
  ]);
  if (result.affectedRows === 0) return error(res, 404, 'ไม่พบรอบการประเมิน');
  ok(res, null, 'แก้ไขรอบแล้ว');
});

router.delete('/:id', async (req, res) => {
  const result = await query('DELETE FROM periods WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) return error(res, 404, 'ไม่พบรอบการประเมิน');
  ok(res, null, 'ลบรอบแล้ว');
});

module.exports = router;
