// Real-time API credit monitoring
// Tracks usage across Gemini, OpenAI, and all services

const STORAGE_KEY = 'eva-api-usage';

function getUsage() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || createEmpty(); }
  catch { return createEmpty(); }
}

function createEmpty() {
  return {
    date: new Date().toDateString(),
    gemini: { calls: 0, failures: 0, lastError: null },
    openai: { calls: 0, failures: 0, lastError: null },
    tts: { calls: 0 },
    stt: { calls: 0 },
    total: 0,
    history: [], // last 50 calls
  };
}

function save(usage) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
}

// Reset daily
function ensureToday(usage) {
  if (usage.date !== new Date().toDateString()) {
    const fresh = createEmpty();
    fresh.history = usage.history?.slice(-20) || [];
    return fresh;
  }
  return usage;
}

export function trackAPICall(source, success, errorMsg = null) {
  let usage = ensureToday(getUsage());

  if (source === 'gemini' || source === 'gemini-backup') {
    usage.gemini.calls++;
    if (!success) { usage.gemini.failures++; usage.gemini.lastError = errorMsg; }
  } else if (source === 'openai') {
    usage.openai.calls++;
    if (!success) { usage.openai.failures++; usage.openai.lastError = errorMsg; }
  } else if (source === 'tts') {
    usage.tts.calls++;
  } else if (source === 'stt') {
    usage.stt.calls++;
  }

  usage.total++;
  usage.history.push({
    source, success, error: errorMsg,
    time: new Date().toLocaleTimeString(),
    timestamp: Date.now(),
  });

  // Keep last 100 entries
  if (usage.history.length > 100) usage.history = usage.history.slice(-100);

  save(usage);
  return usage;
}

export function getAPIUsage() {
  return ensureToday(getUsage());
}

// Gemini free tier limits
export function getGeminiLimits() {
  const usage = ensureToday(getUsage());
  return {
    used: usage.gemini.calls,
    dailyLimit: 1500, // Gemini free: 1500 requests/day
    minuteLimit: 15, // 15 requests/minute
    remaining: Math.max(0, 1500 - usage.gemini.calls),
    percentUsed: Math.round((usage.gemini.calls / 1500) * 100),
    failures: usage.gemini.failures,
    lastError: usage.gemini.lastError,
  };
}

export function getOpenAILimits() {
  const usage = ensureToday(getUsage());
  return {
    used: usage.openai.calls,
    // OpenAI free tier varies, estimate 100/day for gpt-4o-mini
    remaining: 'pay-as-you-go',
    failures: usage.openai.failures,
  };
}
