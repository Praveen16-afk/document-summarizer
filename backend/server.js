require('dotenv').config();

const express = require('express');
const cors = require('cors');

const summarizeRoute = require('./src/routes/summarize');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

// Parse allowed origins, cleaning up trailing slashes, surrounding quotes, and supporting wildcards
const allowedOrigins = (process.env.CLIENT_ORIGIN)
  .split(',')
  .map((origin) => origin.trim().replace(/^["']|["']$/g, '').replace(/\/$/, ''));

// Helper to check if origin matches an allowed pattern (supporting * wildcards)
const originMatches = (origin, pattern) => {
  if (pattern === '*') return true;
  if (pattern.includes('*')) {
    const escaped = pattern.replace(/[.+*?^${}()|[\]\\]/g, '\\$&');
    const regexStr = '^' + escaped.replace(/\\\*/g, '.*') + '$';
    const regex = new RegExp(regexStr, 'i');
    return regex.test(origin);
  }
  return origin.toLowerCase() === pattern.toLowerCase();
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      const normalizedOrigin = origin.trim().replace(/\/$/, '');
      const isAllowed = allowedOrigins.some((pattern) => originMatches(normalizedOrigin, pattern));

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`[CORS Blocked] Request origin "${origin}" does not match allowed origins:`, allowedOrigins);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
  })
);

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'document-summary-assistant-backend' });
});

app.use('/api', summarizeRoute);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Document Summary Assistant API running on port ${PORT}`);
});
