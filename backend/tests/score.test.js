const test = require('node:test');
const assert = require('node:assert');
const { percent, validScore } = require('../helpers');

const indicators = [
  { id: 1, score_type: 'scale', weight: 60 },
  { id: 2, score_type: 'yesno', weight: 40 },
];

test('คะแนนเต็มทุกข้อ ได้ 100%', () => {
  const scores = [{ indicator_id: 1, score: 4 }, { indicator_id: 2, score: 1 }];
  assert.strictEqual(percent(indicators, scores), 100);
});

test('ถ่วงน้ำหนัก: ระดับ 2 จาก 4 (60) + ไม่มี (40) = 30%', () => {
  const scores = [{ indicator_id: 1, score: 2 }, { indicator_id: 2, score: 0 }];
  assert.strictEqual(percent(indicators, scores), 30);
});

test('ให้คะแนนไม่ครบ ได้ null', () => {
  assert.strictEqual(percent(indicators, [{ indicator_id: 1, score: 4 }]), null);
});

test('ตรวจชนิดคะแนน', () => {
  assert.strictEqual(validScore(indicators[0], 5), false);
  assert.strictEqual(validScore(indicators[1], 1), true);
});
