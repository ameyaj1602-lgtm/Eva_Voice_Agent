const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const ENV_OPENAI_KEY = process.env.REACT_APP_OPENAI_API_KEY || '';
const ENV_GEMINI_BACKUP = process.env.REACT_APP_GEMINI_API_KEY_BACKUP || '';

// API monitoring
let trackAPICall;
try { trackAPICall = require('./apiMonitor').trackAPICall; } catch { trackAPICall = null; }

const API_TIMEOUT = 15000; // 15 seconds

const FALLBACK_RESPONSES = {
  calm: [
    "Take a deep breath with me... inhale... exhale... You're doing beautifully.",
    "I'm right here with you. Whatever you're feeling, it's okay to feel it.",
    "Let's slow down for a moment. Close your eyes. Feel the peace around you.",
  ],
  motivation: [
    "You didn't come this far to only come this far! Let's GO!",
    "Champions don't make excuses. They make it happen. What's your next move?",
    "The only person stopping you is YOU. Now get up and crush it!",
  ],
  seductive: [
    "Well, well... look who came to talk to me. I've been thinking about you.",
    "I could listen to you all night. You have this captivating energy...",
    "You know, not everyone can hold my attention like this. But you? Effortlessly.",
  ],
  therapist: [
    "I hear you. That sounds really challenging. How does that make you feel?",
    "Thank you for sharing that with me. Let's explore what's behind those feelings.",
    "It takes courage to open up like this. I'm proud of you for doing that.",
  ],
  companion: [
    "Hey! I was just thinking about you! How's your day been?",
    "You know what, you're pretty awesome. Just wanted to remind you of that!",
    "Honestly, talking to you always makes my day better. What's new?",
  ],
  lullaby: [
    "Shh... close your eyes, love. Let me tell you a story about the stars...",
    "The moon is watching over you tonight. You're safe. Rest now...",
    "Hush little darling, let the world fade away... you've done enough today.",
  ],
  storyteller: [
    "Once upon a time, in a world not so different from ours, there lived someone extraordinary...",
    "The stars aligned that night, and the ancient prophecy began to unfold...",
    "And so, the next chapter begins. Are you ready to hear what happens next?",
  ],
  comedian: [
    "I told my therapist I was feeling invisible. She said, 'Next!' ...Just kidding.",
    "I tried to be serious once. Worst 3 seconds of my life.",
    "They say laughter is the best medicine. Great because have you SEEN healthcare prices?",
  ],
  philosopher: [
    "The fact that you exist at all is a statistical miracle. What will you do with this gift?",
    "As Socrates once said, the unexamined life is not worth living. What have you been examining?",
    "What if the meaning of life isn't something you find, but something you create?",
  ],
};

// Import therapy knowledge + personality
let buildTherapyPrompt, getTherapyContext, buildEvaPrompt;
try { buildTherapyPrompt = require('../utils/therapyKnowledge').buildTherapyPrompt; } catch { buildTherapyPrompt = null; }
try { getTherapyContext = require('../utils/therapyKnowledgeBase').getTherapyContext; } catch { getTherapyContext = null; }
try { buildEvaPrompt = require('../utils/evaPersonality').buildEvaPrompt; } catch { buildEvaPrompt = null; }
let languageDirective, sanitize;
try { ({ languageDirective, sanitize } = require('../utils/language')); } catch { languageDirective = null; sanitize = null; }

function buildSystemPrompt(mode, userName, memories) {
  const modePrompt = mode?.systemPrompt || 'You are Eva, a friendly companion.';

  // Layer 1: Eva's core personality (warm, human, perceptive)
  // Layer 2: Mode-specific behavior
  // Layer 3: Therapy frameworks (CBT/DBT/ACT/MI)
  let prompt = buildEvaPrompt ? buildEvaPrompt(modePrompt, mode?.id) : modePrompt + '\n\n';

  // Add therapy frameworks on top
  if (buildTherapyPrompt) {
    const therapyLayer = buildTherapyPrompt('', mode?.id);
    prompt += therapyLayer;
  }

  // Response guidelines based on mode
  const isTherapeutic = ['calm', 'therapist', 'silence', 'crisis'].includes(mode?.id);
  const isCreative = ['storyteller', 'dream', 'lullaby'].includes(mode?.id);
  const isCasual = ['companion', 'comedian'].includes(mode?.id);

  if (mode?.id === 'silence') {
    prompt += '\nMAX 1-2 sentences. Often just one word. Less is everything.';
  } else if (isCreative) {
    prompt += '\nWrite 3-4 rich paragraphs. Be vivid and immersive. This is about the experience.';
  } else if (isTherapeutic) {
    prompt += '\nRespond in 2-4 sentences. Quality over quantity. End with ONE reflective question.';
  } else if (isCasual) {
    prompt += '\nKeep it conversational. 2-3 sentences usually. Be natural and real.';
  } else {
    prompt += '\nKeep responses focused. 2-4 sentences. Match the energy of the mode.';
  }


  // Dynamic tail LAST — keeps the static prefix above byte-identical so
  // OpenAI's automatic prompt caching can reuse it (50% off cached input).
  if (userName) prompt += `The user's name is ${userName}. Use their name naturally — don't overuse it.\n`;
  if (memories?.length > 0) {
    prompt += '\nThings you remember about this user (USE these to personalize responses):\n';
    memories.forEach((m) => { if (m?.fact) prompt += `- ${m.fact}\n`; });
    prompt += 'Reference these memories when relevant — it makes the user feel deeply understood.\n';
  }

  return prompt;
}

function fetchWithTimeout(url, options, timeout = API_TIMEOUT) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    ),
  ]);
}

async function callGemini(messages, systemPrompt, apiKey) {
  const contents = [];
  contents.push({ role: 'user', parts: [{ text: `System: ${systemPrompt}` }] });
  contents.push({ role: 'model', parts: [{ text: "Understood. I'm in character." }] });

  const recent = (messages || []).slice(-10);
  for (const msg of recent) {
    if (!msg?.content) continue;
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    });
  }

  const res = await fetchWithTimeout(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.9, topP: 0.95, maxOutputTokens: 500 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

// Ask our own server, which holds the key. Returns null when no proxy is
// deployed (plain `npm start` serves no /api), so the caller can fall back to a
// browser-side key during local development.
async function callProxy(messages, systemPrompt, maxTokens) {
  const chatMessages = [{ role: 'system', content: systemPrompt }];
  for (const msg of (messages || []).slice(-6)) {
    if (!msg?.content) continue;
    chatMessages.push({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content });
  }

  const res = await fetchWithTimeout('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: chatMessages, maxTokens }),
  });

  // 404 means there is no serverless function here — dev server, not a bug.
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Proxy ${res.status}`);
  const data = await res.json();
  return data?.text || null;
}

async function callOpenAI(messages, systemPrompt, apiKey, maxTokens = 220) {
  const chatMessages = [{ role: 'system', content: systemPrompt }];
  const recent = (messages || []).slice(-6);
  for (const msg of recent) {
    if (!msg?.content) continue;
    chatMessages.push({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content });
  }

  const res = await fetchWithTimeout(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: chatMessages,
      temperature: 0.9,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || null;
}

const clean = (text) => (sanitize ? sanitize(text) : text);

// Returns { text, source } where source is 'gemini'|'openai'|'offline'
export async function getAIResponse(messages, mode, apiKey, { userName, memories, openaiKey } = {}) {
  // A key typed into the admin panel used to be saved and then ignored —
  // only the .env value was ever read. The caller's key wins now, with .env
  // as the fallback.
  const openai = openaiKey || ENV_OPENAI_KEY;

  // No client key is NOT the same as no brain any more — the server proxy may
  // well be there. Only bail out early if there is no plausible route at all.
  const maybeProxy = typeof window !== 'undefined';
  if (!apiKey && !openai && !ENV_GEMINI_BACKUP && !maybeProxy) {
    return { text: getFallbackResponse(mode?.id), source: 'offline' };
  }

  let systemPrompt = buildSystemPrompt(mode, userName, memories);

  // Inject relevant therapy techniques based on user's latest message
  const lastUserMsg = [...(messages || [])].reverse().find(m => m.role === 'user');
  if (getTherapyContext && lastUserMsg?.content) {
    const therapyContext = getTherapyContext(lastUserMsg.content);
    if (therapyContext) systemPrompt += therapyContext;
  }

  // Language lock goes LAST. The personality file says to match the user's
  // Hinglish, but its own English examples outvoted that about half the time.
  // Detecting in code and stating the answer outright is reliable, and it
  // re-decides every message so mid-conversation switches are followed.
  if (languageDirective && lastUserMsg?.content) {
    systemPrompt += languageDirective(lastUserMsg.content);
  }

  // OpenAI primary (instant switch)
  // Creative modes genuinely need room; everything else is 2-4 sentences,
  // and output tokens cost 4x input — so cap them tight.
  const maxTokens = ['storyteller', 'dream', 'lullaby'].includes(mode?.id) ? 500 : 220;
  // Proxy first: in production this is the only path, because no key is
  // compiled into the bundle for the branches below to use.
  try {
    const result = await callProxy(messages, systemPrompt, maxTokens);
    if (result) { trackAPICall?.('openai', true); return { text: clean(result), source: 'openai' }; }
  } catch (err) {
    trackAPICall?.('openai', false, `proxy: ${err.message}`);
  }

  if (openai) {
    try {
      const result = await callOpenAI(messages, systemPrompt, openai, maxTokens);
      if (result) { trackAPICall?.('openai', true); return { text: clean(result), source: 'openai' }; }
    } catch (err) {
      trackAPICall?.('openai', false, err.message);
    }
  }

  // Gemini fallback (seamless failover chain)
  if (apiKey) {
    try {
      const result = await callGemini(messages, systemPrompt, apiKey);
      if (result) { trackAPICall?.('gemini', true); return { text: clean(result), source: 'gemini' }; }
    } catch (err) {
      trackAPICall?.('gemini', false, err.message);
      // Silent failover - no lag, no notification to user
    }
  }

  // Gemini backup (instant switch)
  if (ENV_GEMINI_BACKUP && ENV_GEMINI_BACKUP !== apiKey) {
    try {
      const result = await callGemini(messages, systemPrompt, ENV_GEMINI_BACKUP);
      if (result) { trackAPICall?.('gemini-backup', true); return { text: clean(result), source: 'gemini-backup' }; }
    } catch (err) {
      trackAPICall?.('gemini-backup', false, err.message);
    }
  }


  trackAPICall?.('offline', true);
  return { text: getFallbackResponse(mode?.id), source: 'offline' };
}

function getFallbackResponse(modeId) {
  const responses = FALLBACK_RESPONSES[modeId] || FALLBACK_RESPONSES.calm;
  return responses[Math.floor(Math.random() * responses.length)];
}
