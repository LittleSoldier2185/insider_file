const multer = require('multer');
const path = require('node:path');
const fs = require('node:fs');

const folder = path.join(__dirname, 'uploads');
fs.mkdirSync(folder, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: folder,
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const okTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (okTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('รับเฉพาะไฟล์ PDF, PNG, JPG'));
  },
});

module.exports = { upload, folder };
