const multer = require('multer');

function notFound(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error('Request failed:', err.message);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File is too large. Please upload a smaller document.' });
    }
    return res.status(400).json({ error: err.message });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Something went wrong while processing your document.' : err.message;

  res.status(status).json({ error: message });
}

module.exports = { notFound, errorHandler };
