const router = require('express').Router();
const path = require('node:path');
const fs = require('node:fs');
const { error } = require('../helpers');
const { folder } = require('../upload');

router.get('/:name', (req, res) => {
  const file = path.join(folder, path.basename(req.params.name));
  if (!fs.existsSync(file)) return error(res, 404, 'ไม่พบไฟล์');
  res.download(file);
});

module.exports = router;
