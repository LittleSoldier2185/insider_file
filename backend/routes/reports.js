const router = require('express').Router();
const { query } = require('../db');
const { ok, error, percent, getIndicators } = require('../helpers');
const { allow } = require('../auth');

router.get('/dashboard', allow('admin'), async (req, res) => {
  const users = await query('SELECT role, COUNT(*) AS total FROM users GROUP BY role');
  const status = await query('SELECT status, COUNT(*) AS total FROM assignments GROUP BY status');
  const periods = await query('SELECT COUNT(*) AS total FROM periods');
  ok(res, { users, status, periods: periods[0].total });
});

router.get('/periods/:id', allow('admin'), async (req, res) => {
  const periods = await query('SELECT * FROM periods WHERE id = ?', [req.params.id]);
  if (periods.length === 0) return error(res, 404, 'ไม่พบรอบการประเมิน');
  const indicators = await getIndicators(req.params.id);

  const assignments = await query(
    `SELECT a.*, e.full_name AS evaluatee_name, v.full_name AS evaluator_name
     FROM assignments a
     JOIN users e ON e.id = a.evaluatee_id
     JOIN users v ON v.id = a.evaluator_id
     WHERE a.period_id = ? ORDER BY e.full_name`,
    [req.params.id],
  );

  const evaluatees = [];
  for (const a of assignments) {
    a.percent = percent(indicators, await query('SELECT * FROM scores WHERE assignment_id = ?', [a.id]));
    let person = evaluatees.find((p) => p.id === a.evaluatee_id);
    if (!person) {
      const filled = await query(
        `SELECT COUNT(*) AS total FROM self_scores s JOIN indicators i ON i.id = s.indicator_id
         JOIN topics t ON t.id = i.topic_id WHERE s.evaluatee_id = ? AND t.period_id = ?`,
        [a.evaluatee_id, req.params.id],
      );
      person = {
        id: a.evaluatee_id,
        full_name: a.evaluatee_name,
        progress: indicators.length ? Math.round((filled[0].total / indicators.length) * 100) : 0,
        committees: [],
      };
      evaluatees.push(person);
    }
    person.committees.push(a);
  }

  const evaluators = [];
  for (const a of assignments) {
    let row = evaluators.find((v) => v.id === a.evaluator_id);
    if (!row) {
      row = { id: a.evaluator_id, full_name: a.evaluator_name, total: 0, confirmed: 0 };
      evaluators.push(row);
    }
    row.total++;
    if (a.status === 'confirmed') row.confirmed++;
  }

  ok(res, { period: periods[0], indicators: indicators.length, evaluatees, evaluators });
});

router.get('/result/:periodId/:userId', async (req, res) => {
  const { periodId, userId } = req.params;
  const committees = await query(
    `SELECT a.*, u.full_name FROM assignments a JOIN users u ON u.id = a.evaluator_id
     WHERE a.period_id = ? AND a.evaluatee_id = ? ORDER BY a.committee_role`,
    [periodId, userId],
  );
  const isOwner = req.user.id === Number(userId);
  const isCommittee = committees.some((c) => c.evaluator_id === req.user.id);
  if (req.user.role !== 'admin' && !isOwner && !isCommittee) return error(res, 403, 'ไม่มีสิทธิ์ดูรายงานนี้');

  const users = await query('SELECT id, full_name, email, department FROM users WHERE id = ?', [userId]);
  const periods = await query('SELECT * FROM periods WHERE id = ?', [periodId]);
  if (users.length === 0 || periods.length === 0) return error(res, 404, 'ไม่พบข้อมูล');

  const indicators = await getIndicators(periodId);
  const selfScores = await query('SELECT * FROM self_scores WHERE evaluatee_id = ?', [userId]);
  for (const item of indicators) {
    const self = selfScores.find((s) => s.indicator_id === item.id);
    item.self_score = self ? self.score : null;
  }

  const confirmed = [];
  for (const c of committees) {
    c.scores = await query('SELECT indicator_id, score FROM scores WHERE assignment_id = ?', [c.id]);
    c.percent = percent(indicators, c.scores);
    if (c.status === 'confirmed') confirmed.push(c.percent);
    if (isOwner && c.status !== 'confirmed') {
      c.scores = [];
      c.percent = null;
      c.comment = null;
    }
  }
  const total = confirmed.length
    ? Math.round((confirmed.reduce((sum, p) => sum + p, 0) / confirmed.length) * 100) / 100
    : null;

  ok(res, { evaluatee: users[0], period: periods[0], indicators, committees, total });
});

module.exports = router;
