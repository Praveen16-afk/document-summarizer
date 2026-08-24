const multer = require('multer');

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

const maxSizeMb = Number(process.env.MAX_UPLOAD_MB) || 15;

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(Object.assign(new Error('Unsupported file type. Please upload a PDF, PNG, or JPEG.'), { status: 400 }));
    return;
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxSizeMb * 1024 * 1024,
  },
});

module.exports = upload;
