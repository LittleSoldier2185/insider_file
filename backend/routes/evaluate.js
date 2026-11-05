const router = require('express').Router();
const { query } = require('../db');
const { ok, error, validScore, percent, getIndicators } = require('../helpers');
const { upload } = require('../upload');

async function getMyAssignment(id, userId) {
  const rows = await query('SELECT * FROM assignments WHERE id = ? AND evaluator_id = ?', [id, userId]);
  return rows[0];
}

router.get('/', async (req, res) => {
  const rows = await query(
    `SELECT a.id, a.committee_role, a.status, u.full_name, u.department, p.name AS period_name
     FROM assignments a
     JOIN users u ON u.id = a.evaluatee_id
     JOIN periods p ON p.id = a.period_id
     WHERE a.evaluator_id = ? ORDER BY a.id DESC`,
    [req.user.id],
  );
  ok(res, rows);
});

router.get('/:id', async (req, res) => {
  const assignment = await getMyAssignment(req.params.id, req.user.id);
  if (!assignment) return error(res, 404, 'ไม่พบงานที่มอบหมาย');

  const users = await query('SELECT id, full_name, email, department FROM users WHERE id = ?', [
    assignment.evaluatee_id,
  ]);
  const periods = await query('SELECT * FROM periods WHERE id = ?', [assignment.period_id]);
  const indicators = await getIndicators(assignment.period_id);
  const selfScores = await query('SELECT * FROM self_scores WHERE evaluatee_id = ?', [assignment.evaluatee_id]);
  const details = await query('SELECT * FROM self_details WHERE evaluatee_id = ?', [assignment.evaluatee_id]);
  const myScores = await query('SELECT * FROM scores WHERE assignment_id = ?', [assignment.id]);

  for (const item of indicators) {
    const self = selfScores.find((s) => s.indicator_id === item.id);
    const mine = myScores.find((s) => s.indicator_id === item.id);
    item.self_score = self ? self.score : null;
    item.score = mine ? mine.score : null;
    item.details = details.filter((d) => d.indicator_id === item.id);
  }

  ok(res, {
    assignment,
    evaluatee: users[0],
    period: periods[0],
    indicators,
    percent: percent(indicators, myScores),
  });
});

router.put('/:id', async (req, res) => {
  const assignment = await getMyAssignment(req.params.id, req.user.id);
  if (!assignment) return error(res, 404, 'ไม่พบงานที่มอบหมาย');
  if (assignment.status === 'confirmed') return error(res, 400, 'ยืนยันผลแล้ว แก้ไขไม่ได้');

  const indicators = await getIndicators(assignment.period_id);
  const scores = req.body.scores || [];
  for (const s of scores) {
    const item = indicators.find((i) => i.id === s.indicator_id);
    if (!item) return error(res, 400, 'ตัวชี้วัดไม่อยู่ในรอบนี้');
    if (s.score === null) continue;
    if (!validScore(item, s.score)) return error(res, 400, 'คะแนนข้อ ' + item.name + ' ไม่ถูกต้อง');
    await query(
      `INSERT INTO scores (assignment_id, indicator_id, score) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE score = VALUES(score)`,
      [assignment.id, s.indicator_id, s.score],
    );
  }

  await query("UPDATE assignments SET comment = ?, status = 'draft' WHERE id = ?", [
    req.body.comment || '', assignment.id,
  ]);
  ok(res, null, 'บันทึกร่างแล้ว');
});

router.post('/:id/signature', upload.single('file'), async (req, res) => {
  const assignment = await getMyAssignment(req.params.id, req.user.id);
  if (!assignment) return error(res, 404, 'ไม่พบงานที่มอบหมาย');
  if (assignment.status === 'confirmed') return error(res, 400, 'ยืนยันผลแล้ว แก้ไขไม่ได้');
  if (!req.file || !req.file.mimetype.startsWith('image/')) return error(res, 400, 'เลือกรูปลายเซ็น PNG หรือ JPG');

  await query('UPDATE assignments SET signature = ? WHERE id = ?', [req.file.filename, assignment.id]);
  ok(res, { signature: req.file.filename }, 'แนบลายเซ็นแล้ว');
});

router.put('/:id/confirm', async (req, res) => {
  const assignment = await getMyAssignment(req.params.id, req.user.id);
  if (!assignment) return error(res, 404, 'ไม่พบงานที่มอบหมาย');

  const indicators = await getIndicators(assignment.period_id);
  const scores = await query('SELECT * FROM scores WHERE assignment_id = ?', [assignment.id]);
  if (percent(indicators, scores) === null) return error(res, 400, 'ให้คะแนนยังไม่ครบทุกตัวชี้วัด');
  if (!assignment.comment) return error(res, 400, 'กรอกความคิดเห็นสรุปก่อน');
  if (!assignment.signature) return error(res, 400, 'แนบลายเซ็นก่อน');

  await query("UPDATE assignments SET status = 'confirmed' WHERE id = ?", [assignment.id]);
  ok(res, null, 'ยืนยันและส่งผลการประเมินแล้ว');
});

module.exports = router;
