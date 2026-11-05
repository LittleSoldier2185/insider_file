const router = require('express').Router();
const { query } = require('../db');
const { ok, error } = require('../helpers');

function validate(b) {
  if (!b.name) return 'กรอกชื่อตัวชี้วัด';
  if (!(Number(b.weight) > 0)) return 'น้ำหนักคะแนนต้องมากกว่า 0';
  if (!['yesno', 'scale'].includes(b.score_type)) return 'เลือกรูปแบบการประเมิน';
  return '';
}

router.post('/', async (req, res) => {
  const b = req.body;
  if (!b.topic_id) return error(res, 400, 'เลือกหัวข้อ');
  const message = validate(b);
  if (message) return error(res, 400, message);

  const result = await query(
    'INSERT INTO indicators (topic_id, name, detail, weight, score_type, evidence) VALUES (?, ?, ?, ?, ?, ?)',
    [b.topic_id, b.name, b.detail || '', b.weight, b.score_type, b.evidence || ''],
  );
  ok(res, { id: result.insertId }, 'เพิ่มตัวชี้วัดแล้ว');
});

router.put('/:id', async (req, res) => {
  const b = req.body;
  const message = validate(b);
  if (message) return error(res, 400, message);

  const result = await query(
    'UPDATE indicators SET name = ?, detail = ?, weight = ?, score_type = ?, evidence = ? WHERE id = ?',
    [b.name, b.detail || '', b.weight, b.score_type, b.evidence || '', req.params.id],
  );
  if (result.affectedRows === 0) return error(res, 404, 'ไม่พบตัวชี้วัด');
  ok(res, null, 'แก้ไขตัวชี้วัดแล้ว');
});

router.delete('/:id', async (req, res) => {
  const result = await query('DELETE FROM indicators WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) return error(res, 404, 'ไม่พบตัวชี้วัด');
  ok(res, null, 'ลบตัวชี้วัดแล้ว');
});

module.exports = router;
