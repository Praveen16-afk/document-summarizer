const fetch = require('node-fetch');
const { summarizeExtractive, extractKeyPoints } = require('../utils/extractiveSummarizer');

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const MAX_CHARS_FOR_AI = 18000;

const LENGTH_INSTRUCTIONS = {
  short: 'Write a concise summary in 3-4 sentences.',
  medium: 'Write a clear summary in 1-2 short paragraphs (roughly 6-8 sentences).',
  long: 'Write a thorough summary in 3-4 paragraphs, covering all major points in detail.',
};

function buildPrompt(text, length) {
  const instruction = LENGTH_INSTRUCTIONS[length] || LENGTH_INSTRUCTIONS.medium;

  return (
    `You are summarizing a document that was extracted from a PDF or a scanned image, ` +
    `so it may contain minor OCR noise or formatting artifacts - ignore those.\n\n` +
    `${instruction}\n` +
    `Then list 3-6 key points as short bullet points, prefixed with "- ".\n` +
    `Respond in plain text using exactly this structure:\n` +
    `SUMMARY:\n<summary text>\n\nKEY POINTS:\n- point one\n- point two\n\n` +
    `Document:\n"""${text.slice(0, MAX_CHARS_FOR_AI)}"""`
  );
}

function parseAiResponse(rawText) {
  const summaryMatch = rawText.match(/SUMMARY:\s*([\s\S]*?)(?:\n\s*KEY POINTS:|$)/i);
  const keyPointsMatch = rawText.match(/KEY POINTS:\s*([\s\S]*)/i);

  const summary = summaryMatch ? summaryMatch[1].trim() : rawText.trim();

  const keyPoints = keyPointsMatch
    ? keyPointsMatch[1]
        .split('\n')
        .map((line) => line.replace(/^[-*]\s*/, '').trim())
        .filter(Boolean)
    : [];

  return { summary, keyPoints };
}

async function summarizeWithGemini(text, length, apiKey) {
  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(text, length) }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Gemini API returned an empty response.');
  }

  return parseAiResponse(rawText);
}

function summarizeLocally(text, length) {
  return {
    summary: summarizeExtractive(text, length),
    keyPoints: extractKeyPoints(text, 5),
  };
}

async function generateSummary(text, length = 'medium') {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const result = await summarizeWithGemini(text, length, apiKey);
      return { ...result, engine: 'gemini' };
    } catch (err) {
      console.warn('Gemini summarization failed, falling back to local summarizer:', err.message);
    }
  }

  const result = summarizeLocally(text, length);
  return { ...result, engine: 'extractive' };
}

module.exports = { generateSummary };
