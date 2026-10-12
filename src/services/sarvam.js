// Sarvam AI - Indian language TTS (Hindi, Marathi, Tamil, Telugu, Bengali, etc.)
// High quality neural voices for 22+ Indian languages

const SARVAM_API = 'https://api.sarvam.ai';

// Available voices
// bulbul:v2 was deprecated by Sarvam; v3 is the current model and ships a
// different speaker roster. The voices below are the v3-compatible set —
// anushka, manisha, vidya, arya, abhilash, karun and hitesh no longer exist.
export const SARVAM_VOICES = {
  female: [
    { id: 'ritu', name: 'Ritu', desc: 'Warm, friendly, conversational', gender: 'female' },
    { id: 'priya', name: 'Priya', desc: 'Sweet, light, uplifting', gender: 'female' },
    { id: 'neha', name: 'Neha', desc: 'Calm, measured, thoughtful', gender: 'female' },
    { id: 'pooja', name: 'Pooja', desc: 'Cheerful, bright, expressive', gender: 'female' },
    { id: 'simran', name: 'Simran', desc: 'Soft, dreamy, Punjabi warmth', gender: 'female' },
    { id: 'kavya', name: 'Kavya', desc: 'Poetic, gentle, introspective', gender: 'female' },
    { id: 'ishita', name: 'Ishita', desc: 'Sharp, articulate, direct', gender: 'female' },
    { id: 'shreya', name: 'Shreya', desc: 'Musical, melodic, pleasant', gender: 'female' },
    { id: 'tanya', name: 'Tanya', desc: 'Modern, casual, relatable', gender: 'female' },
    { id: 'shruti', name: 'Shruti', desc: 'Delicate, soft, whisper-like', gender: 'female' },
    { id: 'suhani', name: 'Suhani', desc: 'Elegant, refined, graceful', gender: 'female' },
    { id: 'kavitha', name: 'Kavitha', desc: 'Strong, South Indian warmth', gender: 'female' },
    { id: 'rupali', name: 'Rupali', desc: 'Earthy, grounded, maternal', gender: 'female' },
    { id: 'roopa', name: 'Roopa', desc: 'Lively, animated, fun', gender: 'female' },
  ],
  male: [
    { id: 'aditya', name: 'Aditya', desc: 'Confident, clear, professional', gender: 'male' },
    { id: 'rahul', name: 'Rahul', desc: 'Casual, relatable, everyday', gender: 'male' },
    { id: 'rohan', name: 'Rohan', desc: 'Energetic, upbeat, motivating', gender: 'male' },
    { id: 'amit', name: 'Amit', desc: 'Steady, reliable, trustworthy', gender: 'male' },
    { id: 'dev', name: 'Dev', desc: 'Smooth, rich, deep tone', gender: 'male' },
    { id: 'ratan', name: 'Ratan', desc: 'Wise, elder, grandfatherly', gender: 'male' },
    { id: 'varun', name: 'Varun', desc: 'Young, fresh, dynamic', gender: 'male' },
    { id: 'manan', name: 'Manan', desc: 'Thoughtful, intellectual, calm', gender: 'male' },
    { id: 'kabir', name: 'Kabir', desc: 'Poetic, soulful, philosophical', gender: 'male' },
    { id: 'mohit', name: 'Mohit', desc: 'Warm, big-brother energy', gender: 'male' },
    { id: 'sunny', name: 'Sunny', desc: 'Bright, cheerful, positive', gender: 'male' },
    { id: 'vijay', name: 'Vijay', desc: 'Bold, commanding, strong', gender: 'male' },
    { id: 'anand', name: 'Anand', desc: 'Peaceful, meditative, serene', gender: 'male' },
  ],
};

// Available languages
export const SARVAM_LANGUAGES = {
  'hi-IN': 'Hindi',
  'mr-IN': 'Marathi',
  'en-IN': 'English (Indian)',
  'ta-IN': 'Tamil',
  'te-IN': 'Telugu',
  'kn-IN': 'Kannada',
  'ml-IN': 'Malayalam',
  'bn-IN': 'Bengali',
  'gu-IN': 'Gujarati',
  'pa-IN': 'Punjabi',
  'od-IN': 'Odia',
};

// Text to Speech

// Sarvam bills per character, so strip anything that costs money but adds
// nothing to the audio — emoji, markdown symbols, repeated whitespace.
// Bonus: stops the voice reading "asterisk asterisk" out loud.
export function cleanForTTS(text) {
  if (!text) return '';
  return String(text)
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{2190}-\u{21FF}]/gu, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

// Same reply spoken twice (Replay button, repeated greetings) should not be
// billed twice. Small LRU so blob URLs don't pile up forever.
const _ttsCache = new Map();
const _TTS_CACHE_MAX = 30;


function base64ToAudioUrl(b64) {
  return URL.createObjectURL(base64ToBlob(b64, 'audio/wav'));
}

function cacheAudio(key, url) {
  if (!url) return null;
  if (_ttsCache.size >= _TTS_CACHE_MAX) {
    const oldest = _ttsCache.keys().next().value;
    URL.revokeObjectURL(_ttsCache.get(oldest));
    _ttsCache.delete(oldest);
  }
  _ttsCache.set(key, url);
  return url;
}

// Returns an object URL, or null when no proxy is deployed (plain `npm start`
// serves no /api) so the caller can fall back to a browser-side key.
async function ttsViaProxy({ text, speaker, language, pace, loudness }) {
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, speaker, language, pace, loudness }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.audio ? base64ToAudioUrl(data.audio) : null;
  } catch {
    return null;
  }
}

export async function sarvamTTS(apiKey, text, speaker = 'ritu', language = 'hi-IN') {
  try {
    const clean = cleanForTTS(text);
    if (!clean) return null;

    const cacheKey = `${speaker}|${language}|${clean}`;
    if (_ttsCache.has(cacheKey)) return _ttsCache.get(cacheKey);

    // Read user's tuning settings
    const savedRate = parseFloat(localStorage.getItem('eva-voice-rate')) || 0.9;
    const savedVolume = parseFloat(localStorage.getItem('eva-voice-volume')) || 0.85;

    // Map rate (0.5-1.5) to Sarvam pace (0.5-2.0)
    const pace = Math.max(0.5, Math.min(2.0, savedRate * 1.1));
    // Map volume (0.2-1.0) to loudness (0.3-3.0)
    const loudness = Math.max(0.3, Math.min(3.0, savedVolume * 3));

    // Our own server first — it holds the key. In production this is the only
    // path that works, because no Sarvam key is compiled into the bundle.
    const viaProxy = await ttsViaProxy({ text: clean, speaker, language, pace, loudness });
    if (viaProxy) return cacheAudio(cacheKey, viaProxy);

    // Falls through to a browser-side key, which only exists in local dev.
    if (!apiKey) return null;

    const res = await fetch(`${SARVAM_API}/text-to-speech`, {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: [clean],
        target_language_code: language,
        speaker: speaker,
        model: 'bulbul:v3',
        pace: pace,
        loudness: loudness,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Sarvam TTS failed: ${res.status}`);
    }

    const data = await res.json();
    if (data?.audios?.[0]) {
      // Convert base64 to audio URL
      const audioData = data.audios[0];
      return cacheAudio(cacheKey, base64ToAudioUrl(audioData));
    }
    return null;
  } catch (err) {
    console.warn('Sarvam TTS failed:', err.message);
    return null;
  }
}

// Speech to Text
export async function sarvamSTT(apiKey, audioBlob, language = 'hi-IN') {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('language_code', language);
    formData.append('model', 'saarika:v2');

    const res = await fetch(`${SARVAM_API}/speech-to-text`, {
      method: 'POST',
      headers: { 'api-subscription-key': apiKey },
      body: formData,
    });

    if (!res.ok) throw new Error(`Sarvam STT failed: ${res.status}`);
    const data = await res.json();
    return data?.transcript || null;
  } catch (err) {
    console.warn('Sarvam STT failed:', err.message);
    return null;
  }
}

// Translate text
export async function sarvamTranslate(apiKey, text, sourceLang = 'en-IN', targetLang = 'hi-IN') {
  try {
    const res = await fetch(`${SARVAM_API}/translate`, {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        source_language_code: sourceLang,
        target_language_code: targetLang,
        model: 'mayura:v1',
      }),
    });

    if (!res.ok) throw new Error(`Translate failed: ${res.status}`);
    const data = await res.json();
    return data?.translated_text || null;
  } catch (err) {
    console.warn('Sarvam translate failed:', err.message);
    return null;
  }
}

function base64ToBlob(base64, mimeType) {
  const byteChars = atob(base64);
  const byteArrays = [];
  for (let offset = 0; offset < byteChars.length; offset += 512) {
    const slice = byteChars.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
    byteArrays.push(new Uint8Array(byteNumbers));
  }
  return new Blob(byteArrays, { type: mimeType });
}
