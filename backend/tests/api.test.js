const test = require('node:test');
const assert = require('node:assert');

const URL = 'http://localhost:' + (process.env.PORT || 3000) + '/api';
let token = '';

async function call(path, method = 'GET', body) {
  const res = await fetch(URL + path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json() };
}

test('7.1 Login รหัสผิด ได้ 401', async () => {
  const r = await call('/auth/login', 'POST', { username: 'admin', password: 'wrong' });
  assert.strictEqual(r.status, 401);
});

test('7.1 Login รหัสถูก ได้ token', async () => {
  const r = await call('/auth/login', 'POST', { username: 'admin', password: 'admin1234' });
  assert.strictEqual(r.status, 200);
  token = r.body.data.token;
});

const username = 'test' + Date.now();
let newId;

test('7.4 Validate: อีเมลผิดรูปแบบ ได้ 400', async () => {
  const r = await call('/users', 'POST', {
    username, password: 'test12345', full_name: 'ทดสอบ', role: 'evaluatee', email: 'abc',
  });
  assert.strictEqual(r.status, 400);
});

test('7.2 Insert: POST เพิ่มผู้ใช้', async () => {
  const r = await call('/users', 'POST', {
    username, password: 'test12345', full_name: 'ทดสอบ', role: 'evaluatee', email: 'a@b.com',
  });
  assert.strictEqual(r.status, 200);
  newId = r.body.data.id;
});

test('7.3 Update: PUT แก้ชื่อ แล้ว GET ตรวจผล', async () => {
  await call('/users/' + newId, 'PUT', { full_name: 'ชื่อใหม่', role: 'evaluatee' });
  const r = await call('/users/' + newId);
  assert.strictEqual(r.body.data.full_name, 'ชื่อใหม่');
});

test('DELETE ลบผู้ใช้ทดสอบ', async () => {
  const r = await call('/users/' + newId, 'DELETE');
  assert.strictEqual(r.status, 200);
});

test('4.4 ไม่มี token ได้ 401 / ไม่มี API ได้ 404', async () => {
  token = '';
  assert.strictEqual((await call('/users')).status, 401);
  assert.strictEqual((await call('/nothing')).status, 404);
});
