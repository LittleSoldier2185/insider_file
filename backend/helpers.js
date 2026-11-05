const { query } = require('./db');

function ok(res, data = null, message = 'สำเร็จ') {
  res.json({ status: 'success', message, data });
}

function error(res, code, message) {
  res.status(code).json({ status: 'error', message, data: null });
}

function isOpen(period) {
  const today = new Date().toLocaleDateString('sv-SE');
  return today >= period.start_date && today <= period.end_date;
}

function validScore(indicator, score) {
  if (indicator.score_type === 'yesno') return score === 0 || score === 1;
  return [1, 2, 3, 4].includes(score);
}

function percent(indicators, scores) {
  if (indicators.length === 0) return null;
  let total = 0;
  let totalWeight = 0;
  for (const item of indicators) {
    const row = scores.find((s) => s.indicator_id === item.id);
    if (!row) return null;
    const max = item.score_type === 'yesno' ? 1 : 4;
    total += (row.score / max) * Number(item.weight);
    totalWeight += Number(item.weight);
  }
  return Math.round((total / totalWeight) * 10000) / 100;
}

function getIndicators(periodId) {
  return query(
    `SELECT i.*, t.name AS topic_name FROM indicators i
     JOIN topics t ON t.id = i.topic_id
     WHERE t.period_id = ? ORDER BY t.id, i.id`,
    [periodId],
  );
}

async function getPeriodOfIndicator(indicatorId) {
  const rows = await query(
    `SELECT p.* FROM periods p
     JOIN topics t ON t.period_id = p.id
     JOIN indicators i ON i.topic_id = t.id
     WHERE i.id = ?`,
    [indicatorId],
  );
  return rows[0];
}

module.exports = { ok, error, isOpen, validScore, percent, getIndicators, getPeriodOfIndicator };
