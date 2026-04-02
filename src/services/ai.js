const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const ENV_OPENAI_KEY = process.env.REACT_APP_OPENAI_API_KEY || '';
const ENV_GEMINI_BACKUP = process.env.REACT_APP_GEMINI_API_KEY_BACKUP || '';

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

// Import therapy knowledge
let buildTherapyPrompt;
try {
  const therapy = require('../utils/therapyKnowledge');
  buildTherapyPrompt = therapy.buildTherapyPrompt;
} catch { buildTherapyPrompt = null; }

function buildSystemPrompt(mode, userName, memories) {
  const modePrompt = mode?.systemPrompt || 'You are Eva, a friendly companion.';
  // Inject real therapy frameworks into the prompt
  let prompt = buildTherapyPrompt ? buildTherapyPrompt(modePrompt, mode?.id) : modePrompt + '\n\n';

  if (userName) prompt += `The user's name is ${userName}. Use their name naturally — don't overuse it.\n`;
  if (memories?.length > 0) {
    prompt += '\nThings you remember about this user (USE these to personalize responses):\n';
    memories.forEach((m) => { if (m?.fact) prompt += `- ${m.fact}\n`; });
    prompt += 'Reference these memories when relevant — it makes the user feel deeply understood.\n';
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

async function callOpenAI(messages, systemPrompt, apiKey) {
  const chatMessages = [{ role: 'system', content: systemPrompt }];
  const recent = (messages || []).slice(-10);
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
      max_tokens: 200,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || null;
}

// Returns { text, source } where source is 'gemini'|'openai'|'offline'
export async function getAIResponse(messages, mode, apiKey, { userName, memories } = {}) {
  if (!apiKey && !ENV_OPENAI_KEY && !ENV_GEMINI_BACKUP) {
    return { text: getFallbackResponse(mode?.id), source: 'offline' };
  }

  const systemPrompt = buildSystemPrompt(mode, userName, memories);

  // Try Gemini primary
  if (apiKey) {
    try {
      const result = await callGemini(messages, systemPrompt, apiKey);
      if (result) return { text: result, source: 'gemini' };
    } catch (err) {
      console.warn('Gemini primary failed:', err.message);
    }
  }

  // Try Gemini backup
  if (ENV_GEMINI_BACKUP && ENV_GEMINI_BACKUP !== apiKey) {
    try {
      const result = await callGemini(messages, systemPrompt, ENV_GEMINI_BACKUP);
      if (result) return { text: result, source: 'gemini-backup' };
    } catch (err) {
      console.warn('Gemini backup failed:', err.message);
    }
  }

  // Try OpenAI
  if (ENV_OPENAI_KEY) {
    try {
      const result = await callOpenAI(messages, systemPrompt, ENV_OPENAI_KEY);
      if (result) return { text: result, source: 'openai' };
    } catch (err) {
      console.warn('OpenAI failed:', err.message);
    }
  }

  return { text: getFallbackResponse(mode?.id), source: 'offline' };
}

function getFallbackResponse(modeId) {
  const responses = FALLBACK_RESPONSES[modeId] || FALLBACK_RESPONSES.calm;
  return responses[Math.floor(Math.random() * responses.length)];
}
