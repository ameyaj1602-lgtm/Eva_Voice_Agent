// Server-side proxy to OpenAI.
//
// The browser sends the conversation; this function adds the API key. The key
// is read from OPENAI_API_KEY — note the missing REACT_APP_ prefix, which is
// what keeps it out of the browser bundle.

const { reject } = require('./_lib/guard');

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

// The client never chooses these. A caller who reaches this endpoint should not
// be able to ask for an expensive model or a huge completion on your account.
const MODEL = 'gpt-4o-mini';
const MAX_TOKENS_CEILING = 500;
const MAX_MESSAGES = 20;
const MAX_CHARS = 20_000;

module.exports = async function handler(req, res) {
  if (reject(req, res)) return;

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'Server is missing OPENAI_API_KEY' });
  }

  const { messages, maxTokens } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages must be a non-empty array' });
  }
  if (messages.length > MAX_MESSAGES) {
    return res.status(400).json({ error: `At most ${MAX_MESSAGES} messages` });
  }

  const clean = [];
  let total = 0;
  for (const m of messages) {
    const role = m?.role === 'system' || m?.role === 'assistant' ? m.role : 'user';
    const content = typeof m?.content === 'string' ? m.content : '';
    if (!content) continue;
    total += content.length;
    if (total > MAX_CHARS) {
      return res.status(400).json({ error: 'Conversation too long' });
    }
    clean.push({ role, content });
  }
  if (!clean.length) return res.status(400).json({ error: 'No usable messages' });

  const cap = Math.min(Number(maxTokens) || 220, MAX_TOKENS_CEILING);

  try {
    const upstream = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: MODEL, messages: clean, temperature: 0.9, max_tokens: cap }),
    });

    if (!upstream.ok) {
      // Never forward OpenAI's body: its errors can echo back request details.
      console.error('[api/chat] upstream', upstream.status, (await upstream.text()).slice(0, 300));
      return res.status(502).json({ error: 'Upstream AI request failed' });
    }

    const data = await upstream.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) return res.status(502).json({ error: 'Empty response from AI' });
    return res.status(200).json({ text });
  } catch (err) {
    console.error('[api/chat]', err.message);
    return res.status(502).json({ error: 'Could not reach the AI service' });
  }
};
