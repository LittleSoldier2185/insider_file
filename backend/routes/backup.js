const router = require('express').Router();
const { pool, query } = require('../db');
const { ok, error } = require('../helpers');

const TABLES = ['users', 'periods', 'topics', 'indicators', 'assignments', 'self_scores', 'self_details', 'scores'];

router.get('/', async (req, res) => {
  const backup = { created_at: new Date().toISOString(), tables: {} };
  for (const table of TABLES) {
    backup.tables[table] = await query(`SELECT * FROM ${table}`);
  }
  res.setHeader('Content-Disposition', 'attachment; filename=backup.json');
  res.json(backup);
});

router.post('/restore', async (req, res) => {
  const tables = req.body.tables;
  if (!tables || !tables.users) return error(res, 400, 'ไฟล์สำรองไม่ถูกต้อง');

  const db = await pool.getConnection();
  try {
    await db.beginTransaction();
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of TABLES) {
      await db.query(`DELETE FROM ${table}`);
      for (const row of tables[table] || []) {
        await db.query(`INSERT INTO ${table} SET ?`, [row]);
      }
    }
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    await db.commit();
  } catch (err) {
    await db.rollback();
    throw err;
  } finally {
    db.release();
  }
  ok(res, null, 'กู้คืนข้อมูลแล้ว');
});

module.exports = router;
