// Voice Cloning via Hugging Face Space (FREE)
// Uses Coqui XTTS-v2 running on HF Spaces
// Voice samples stored in IndexedDB for persistence

const HF_SPACE_URL = 'https://Ameyabro-Eva-Voice-Cloner.hf.space';
const DB_NAME = 'eva-voice-samples';
const STORE_NAME = 'samples';

// --- IndexedDB helpers for voice sample storage ---
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

// --- HF Space API ---

// Clone voice: send text + audio sample to HF Space, get back audio
export async function cloneVoiceFree(text, audioBlob, language = 'en') {
  try {
    // Step 1: Upload the audio file
    const audioFile = new File([audioBlob], 'voice-sample.wav', { type: audioBlob.type || 'audio/wav' });
    const fd = new FormData();
    fd.append('files', audioFile);

    const uploadRes = await fetch(`${HF_SPACE_URL}/upload`, {
      method: 'POST',
      body: fd,
    });

    if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);
    const uploadedFiles = await uploadRes.json();
    const audioPath = uploadedFiles[0];

    // Step 2: Call the predict endpoint
    const predictRes = await fetch(`${HF_SPACE_URL}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [text, { path: audioPath, meta: { _type: 'gradio.FileData' } }, language],
      }),
    });

    if (!predictRes.ok) throw new Error(`Prediction failed: ${predictRes.status}`);
    const result = await predictRes.json();

    // Get the output audio URL
    if (result?.data?.[0]?.path) {
      return `${HF_SPACE_URL}/file=${result.data[0].path}`;
    }
    if (result?.data?.[0]?.url) {
      return result.data[0].url;
    }

    throw new Error('No audio in response');
  } catch (err) {
    console.warn('HF Space voice clone failed:', err.message);
    return null;
  }
}

// Test a saved cloned voice by name
export async function testClonedVoice(voiceName, text = 'Hello, this is a test.') {
  const sample = await getVoiceSample(voiceName);
  if (!sample?.blob) return null;
  return cloneVoiceFree(text, sample.blob);
}

// Speak with a cloned voice (called from TTS pipeline)
export async function speakWithClonedVoice(text, voiceName, language = 'en') {
  const sample = await getVoiceSample(voiceName);
  if (!sample?.blob) return null;
  return cloneVoiceFree(text, sample.blob, language);
}

// Check if HF Space is available
export async function isHFSpaceAvailable() {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${HF_SPACE_URL}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: ['test', null, 'en'] }),
      signal: controller.signal,
    });
    return res.ok || res.status === 422;
  } catch {
    return false;
  }
}
