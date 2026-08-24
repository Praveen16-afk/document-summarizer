const { extractText: extractPdfText, getDocumentProxy } = require('unpdf');
const Tesseract = require('tesseract.js');

async function extractFromPdf(buffer) {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text, totalPages } = await extractPdfText(pdf, { mergePages: true });
  const trimmed = (text || '').trim();

  if (!trimmed) {
    throw Object.assign(
      new Error('No selectable text found in this PDF. If it is a scanned document, try uploading it as an image instead.'),
      { status: 422 }
    );
  }

  return { text: trimmed, pageCount: totalPages || null };
}

async function extractFromImage(buffer) {
  let worker;
  let workerError = null;

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('OCR timed out (language data download or recognition took too long). Try again or use a smaller image.')),
        60000
      )
    );

    const runOcr = async () => {
      worker = await Tesseract.createWorker('eng', 1, {
        errorHandler: (err) => {
          workerError = err;
        },
      });
      return worker.recognize(buffer);
    };

    const {
      data: { text },
    } = await Promise.race([runOcr(), timeoutPromise]);

    if (workerError) {
      throw new Error(typeof workerError === 'string' ? workerError : workerError.message || 'OCR worker error');
    }

    const cleaned = (text || '').trim();

    if (!cleaned) {
      throw Object.assign(
        new Error('OCR could not find any readable text in this image. Try a clearer scan or a higher resolution photo.'),
        { status: 422 }
      );
    }

    return { text: cleaned, pageCount: 1 };
  } catch (err) {
    if (err.status) throw err;
    throw Object.assign(new Error(`OCR failed: ${err.message || 'unknown error'}`), { status: 502 });
  } finally {
    if (worker) {
      worker.terminate().catch(() => {});
    }
  }
}

async function extractText(file) {
  if (file.mimetype === 'application/pdf') {
    return extractFromPdf(file.buffer);
  }
  return extractFromImage(file.buffer);
}

module.exports = { extractText, extractFromPdf, extractFromImage };
