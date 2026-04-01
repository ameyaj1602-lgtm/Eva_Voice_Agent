// Voice Engine via Hugging Face Space (FREE)
// Uses Microsoft Edge TTS neural voices
// Voice samples stored in IndexedDB for persistence

const HF_SPACE_URL = 'https://Ameyabro-Eva-Voice-Cloner.hf.space';
const DB_NAME = 'eva-voice-samples';
const STORE_NAME = 'samples';

// Available HF Space voices
export const HF_VOICES = {
  'en-female-1': 'Jenny (US Female)',
  'en-female-2': 'Aria (US Female)',
  'en-female-3': 'Sonia (UK Female)',
  'en-male-1': 'Guy (US Male)',
  'en-male-2': 'Christopher (US Male)',
  'en-male-3': 'Ryan (UK Male)',
  'hi-female': 'Swara (Hindi Female)',
  'hi-male': 'Madhur (Hindi Male)',
  'es-female': 'Elvira (Spanish Female)',
  'fr-female': 'Denise (French Female)',
  'de-female': 'Katja (German Female)',
  'ja-female': 'Nanami (Japanese Female)',
  'ko-female': 'SunHi (Korean Female)',
  'zh-female': 'Xiaoxiao (Chinese Female)',
  'ar-male': 'Hamed (Arabic Male)',
  'pt-female': 'Francisca (Portuguese Female)',
};

// --- IndexedDB helpers for voice preferences ---
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveVoiceSample(name, blob) {
  try {
    const db = await openDB();
    const key = `voice-${name}`;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put({ name, blob, createdAt: Date.now() }, key);
      tx.oncomplete = () => resolve({ key, name });
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to save voice sample:', err);
    return null;
  }
}

export async function getVoiceSample(name) {
  try {
    const db = await openDB();
    const key = `voice-${name}`;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function getVoiceSamples() {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function deleteVoiceSample(name) {
  try {
    const db = await openDB();
    const key = `voice-${name}`;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

// --- HF Space TTS API (Gradio 5.x) ---

// Generate speech using HF Space neural TTS
export async function speakWithHFVoice(text, voiceId = 'en-female-1', rate = 0, pitch = 0) {
  try {
    // Submit prediction job
    const submitRes = await fetch(`${HF_SPACE_URL}/gradio_api/call/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [text, voiceId, rate, pitch],
      }),
    });

    if (!submitRes.ok) throw new Error(`Submit failed: ${submitRes.status}`);
    const { event_id } = await submitRes.json();
    if (!event_id) throw new Error('No event_id returned');

    // Poll for result via SSE stream
    const resultRes = await fetch(`${HF_SPACE_URL}/gradio_api/call/predict/${event_id}`);
    if (!resultRes.ok) throw new Error(`Result failed: ${resultRes.status}`);

    const resultText = await resultRes.text();
    const lines = resultText.split('\n');

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('event: complete') && i + 1 < lines.length) {
        const dataLine = lines[i + 1];
        if (dataLine.startsWith('data: ')) {
          const resultData = JSON.parse(dataLine.slice(6));
          if (resultData?.[0]?.url) return resultData[0].url;
          if (resultData?.[0]?.path) return `${HF_SPACE_URL}/gradio_api/file=${resultData[0].path}`;
        }
      }
      if (lines[i].startsWith('event: error')) {
        throw new Error('Server error during TTS');
      }
    }

    throw new Error('No audio in response');
  } catch (err) {
    console.warn('HF Space TTS failed:', err.message);
    return null;
  }
}

// Test a voice
export async function testClonedVoice(voiceName, text = 'Hello, this is Eva speaking. How does it sound?') {
  // voiceName might be a saved voice preference or an HF voice ID
  const settings = JSON.parse(localStorage.getItem('eva-settings') || '{}');
  const voiceData = settings.clonedVoices?.[voiceName];
  const voiceId = voiceData?.hfVoice || 'en-female-1';
  return speakWithHFVoice(text, voiceId);
}

// Speak with a saved voice (called from TTS pipeline)
export async function speakWithClonedVoice(text, voiceName, language = 'en') {
  const settings = JSON.parse(localStorage.getItem('eva-settings') || '{}');
  const voiceData = settings.clonedVoices?.[voiceName];
  const voiceId = voiceData?.hfVoice || 'en-female-1';
  return speakWithHFVoice(text, voiceId);
}

// Check if HF Space is available
export async function isHFSpaceAvailable() {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${HF_SPACE_URL}/gradio_api/call/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: ['test', 'en-female-1', 0, 0] }),
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  }
}
