// Sarvam TTS -> Telegram voice note.
//
// Sarvam returns base64 WAV; Telegram's sendVoice only accepts OGG/Opus, MP3
// or M4A, so we transcode through ffmpeg. Anything else shows up as a file
// attachment instead of a playable voice bubble.

import { spawn } from 'node:child_process';

const SARVAM_TTS = 'https://api.sarvam.ai/text-to-speech';

// Sarvam bills per character. Strip what costs money and adds nothing to the
// audio — and stops the voice reading "asterisk asterisk" out loud.
export function cleanForTTS(text) {
  if (!text) return '';
  return String(text)
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

const HINDI_SCRIPT = /[ऀ-ॿ]/;
const HINGLISH_WORDS = /\b(hai|hoon|kya|kaise|mein|toh|yeh|aur|nahi|haan|accha|theek|karo|raha|rahi|tha|thi)\b/i;

export function detectLanguage(text) {
  return HINDI_SCRIPT.test(text) || HINGLISH_WORDS.test(text) ? 'hi-IN' : 'en-IN';
}

function toOggOpus(wavBuffer) {
  return new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-hide_banner', '-loglevel', 'error',
      '-i', 'pipe:0',
      '-c:a', 'libopus', '-b:a', '32k', '-ar', '48000', '-ac', '1',
      '-f', 'ogg', 'pipe:1',
    ]);
    const out = [];
    const err = [];
    ff.stdout.on('data', (d) => out.push(d));
    ff.stderr.on('data', (d) => err.push(d));
    ff.on('error', reject);
    ff.on('close', (code) => {
      if (code === 0 && out.length) return resolve(Buffer.concat(out));
      reject(new Error(`ffmpeg exited ${code}: ${Buffer.concat(err).toString().slice(0, 200)}`));
    });
    ff.stdin.on('error', () => { /* ffmpeg closed early; the close handler reports it */ });
    ff.stdin.end(wavBuffer);
  });
}

// Returns an OGG/Opus Buffer ready for sendVoice, or null if TTS is unavailable
// — callers fall back to plain text rather than failing the whole reply.
export async function synthesize(text, apiKey, speaker = 'ritu') {
  if (!apiKey) return null;
  const clean = cleanForTTS(text);
  if (!clean) return null;

  try {
    const res = await fetch(SARVAM_TTS, {
      method: 'POST',
      headers: { 'api-subscription-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputs: [clean],
        target_language_code: detectLanguage(clean),
        speaker,
        model: 'bulbul:v3',
        pace: 0.95,
      }),
    });
    if (!res.ok) throw new Error(`Sarvam ${res.status}: ${(await res.text()).slice(0, 150)}`);
    const data = await res.json();
    const b64 = data?.audios?.[0];
    if (!b64) return null;
    return await toOggOpus(Buffer.from(b64, 'base64'));
  } catch (err) {
    console.error('[voice] synthesis failed:', err.message);
    return null;
  }
}
