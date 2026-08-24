const express = require('express');
const upload = require('../middleware/upload');
const { extractText } = require('../services/extractText');
const { generateSummary } = require('../services/summarize');

const router = express.Router();

const VALID_LENGTHS = new Set(['short', 'medium', 'long']);

router.post('/summarize', upload.single('document'), async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error('Please attach a document under the field name "document".');
      err.status = 400;
      throw err;
    }

    const length = VALID_LENGTHS.has(req.body.length) ? req.body.length : 'medium';

    const { text, pageCount } = await extractText(req.file);
    const { summary, keyPoints, engine } = await generateSummary(text, length);

    res.json({
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      pageCount,
      length,
      engine,
      wordCount: text.trim().split(/\s+/).length,
      extractedText: text,
      summary,
      keyPoints,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;