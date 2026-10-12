// Server-side proxy to Sarvam text-to-speech.
//
// Same idea as api/chat.js: the browser sends text, this function adds the key
// from SARVAM_API_KEY and returns the audio. The key never reaches the browser.

const { reject } = require('./_lib/guard');

const SARVAM_URL = 'https://api.sarvam.ai/text-to-speech';
const MODEL = 'bulbul:v3';
const DEFAULT_SPEAKER = 'ritu';
const MAX_CHARS = 1_500;        // Sarvam bills per character
const ALLOWED_LANGS = new Set(['hi-IN', 'en-IN', 'bn-IN', 'gu-IN', 'kn-IN', 'ml-IN', 'mr-IN', 'od-IN', 'pa-IN', 'ta-IN', 'te-IN']);
const SPEAKER_PATTERN = /^[a-z]{2,20}$/;

module.exports = async function handler(req, res) {
  if (reject(req, res)) return;

  const key = process.env.SARVAM_API_KEY;
  if (!key) return res.status(500).json({ error: 'Server is missing SARVAM_API_KEY' });

  const { text, speaker, language, pace, loudness } = req.body || {};
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text is required' });
  }
  if (text.length > MAX_CHARS) {
    return res.status(400).json({ error: `Text must be under ${MAX_CHARS} characters` });
  }

  // Validated rather than passed through: these go into an upstream request
  // billed to your account.
  const voice = SPEAKER_PATTERN.test(speaker || '') ? speaker : DEFAULT_SPEAKER;
  const lang = ALLOWED_LANGS.has(language) ? language : 'hi-IN';
  const clampedPace = Math.max(0.5, Math.min(2.0, Number(pace) || 0.95));
  const clampedLoudness = Math.max(0.3, Math.min(3.0, Number(loudness) || 1.5));

  try {
    const upstream = await fetch(SARVAM_URL, {
      method: 'POST',
      headers: { 'api-subscription-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: lang,
        speaker: voice,
        model: MODEL,
        pace: clampedPace,
        loudness: clampedLoudness,
      }),
    });

    if (!upstream.ok) {
      console.error('[api/tts] upstream', upstream.status, (await upstream.text()).slice(0, 300));
      return res.status(502).json({ error: 'Upstream voice request failed' });
    }

    const data = await upstream.json();
    const audio = data?.audios?.[0];
    if (!audio) return res.status(502).json({ error: 'No audio returned' });
    return res.status(200).json({ audio });
  } catch (err) {
    console.error('[api/tts]', err.message);
    return res.status(502).json({ error: 'Could not reach the voice service' });
  }
};
