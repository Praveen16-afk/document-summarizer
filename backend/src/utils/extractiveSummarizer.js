const STOP_WORDS = new Set(
  (
    'a about above after again against all am an and any are as at be because been before being ' +
    'below between both but by could did do does doing down during each few for from further had ' +
    'has have having he her here hers herself him himself his how i if in into is it its itself ' +
    'just me more most my myself no nor not now of off on once only or other our ours ourselves ' +
    'out over own same she should so some such than that the their theirs them themselves then ' +
    'there these they this those through to too under until up very was we were what when where ' +
    'which while who whom why will with you your yours yourself yourselves'
  ).split(' ')
);

function splitIntoSentences(text) {
  const normalized = text.replace(/\s+/g, ' ').trim();

  const raw = normalized.match(/[^.!?]+[.!?]+(\s|$)/g) || [normalized];

  return raw
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.split(' ').length > 3); 
}

function tokenize(sentence) {
  return sentence
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

function buildWordFrequencies(sentences) {
  const freq = {};
  sentences.forEach((sentence) => {
    tokenize(sentence).forEach((word) => {
      freq[word] = (freq[word] || 0) + 1;
    });
  });
  return freq;
}

function sentenceCountForLength(length, totalSentences) {
  const ratios = { short: 0.15, medium: 0.3, long: 0.5 };
  const ratio = ratios[length] ?? ratios.medium;
  const target = Math.round(totalSentences * ratio);
  return Math.min(totalSentences, Math.max(3, target));
}

function summarizeExtractive(text, length = 'medium') {
  const sentences = splitIntoSentences(text);

  if (sentences.length === 0) {
    return '';
  }

  if (sentences.length <= 3) {
    return sentences.join(' ');
  }

  const wordFreq = buildWordFrequencies(sentences);

  const scored = sentences.map((sentence, index) => {
    const words = tokenize(sentence);
    const score = words.reduce((sum, word) => sum + (wordFreq[word] || 0), 0);
    const normalizedScore = words.length > 0 ? score / words.length : 0;

    const positionBoost = index < sentences.length * 0.1 ? 1.15 : 1;

    return { sentence, index, score: normalizedScore * positionBoost };
  });

  const targetCount = sentenceCountForLength(length, sentences.length);

  const topSentences = [...scored]
    .sort((a, b) => b.score - a.score)
    .slice(0, targetCount)
    .sort((a, b) => a.index - b.index);

  return topSentences.map((s) => s.sentence).join(' ');
}

function extractKeyPoints(text, count = 5) {
  const sentences = splitIntoSentences(text);
  if (sentences.length === 0) return [];

  const wordFreq = buildWordFrequencies(sentences);

  const scored = sentences.map((sentence, index) => {
    const words = tokenize(sentence);
    const score = words.reduce((sum, word) => sum + (wordFreq[word] || 0), 0);
    return { sentence, index, score: words.length ? score / words.length : 0 };
  });

  return [...scored]
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .sort((a, b) => a.index - b.index)
    .map((s) => s.sentence);
}

module.exports = { summarizeExtractive, extractKeyPoints, splitIntoSentences };
