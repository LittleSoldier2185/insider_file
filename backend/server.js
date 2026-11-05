const express = require('express');
const cors = require('cors');
const { login, allow } = require('./auth');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
  req.body = req.body || {};
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', login, allow('admin'), require('./routes/users'));
app.use('/api/periods', login, allow('admin'), require('./routes/periods'));
app.use('/api/topics', login, allow('admin'), require('./routes/topics'));
app.use('/api/indicators', login, allow('admin'), require('./routes/indicators'));
app.use('/api/assignments', login, allow('admin'), require('./routes/assignments'));
app.use('/api/self', login, allow('evaluatee'), require('./routes/self'));
app.use('/api/evaluate', login, allow('evaluator'), require('./routes/evaluate'));
app.use('/api/reports', login, require('./routes/reports'));
app.use('/api/files', login, require('./routes/files'));
app.use('/api/backup', login, allow('admin'), require('./routes/backup'));

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'ไม่พบ API นี้', data: null });
});

app.use((err, req, res, next) => {
  console.error(err.message);
  let code = 500;
  let message = 'ระบบขัดข้อง: ' + err.message;
  if (err.code === 'ER_DUP_ENTRY') { code = 400; message = 'ข้อมูลซ้ำกับที่มีอยู่แล้ว'; }
  if (err.code === 'LIMIT_FILE_SIZE') { code = 400; message = 'ไฟล์ใหญ่เกิน 5 MB'; }
  if (err.message.startsWith('รับเฉพาะไฟล์')) { code = 400; message = err.message; }
  res.status(code).json({ status: 'error', message, data: null });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('API พร้อมที่ http://localhost:' + PORT));
