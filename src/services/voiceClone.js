// Voice Cloning via public HF Space (FREE, no account needed)
// Uses Nymbo/Voice-Clone-Multilingual running XTTS-v2 on HF Spaces
// Voice samples stored in IndexedDB for persistence

const HF_CLONE_URL = 'https://Nymbo-Voice-Clone-Multilingual.hf.space';
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

// --- Voice Cloning API (Nymbo's XTTS-v2 Space) ---

// Upload audio file to HF Space
async function uploadAudio(blob) {
  const file = new File([blob], 'voice-sample.wav', { type: blob.type || 'audio/wav' });
  const fd = new FormData();
  fd.append('files', file);

  const res = await fetch(`${HF_CLONE_URL}/upload`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  const paths = await res.json();
  return paths[0];
}

// Clone voice: send text + audio to HF Space, get back cloned audio URL
export async function cloneVoiceFree(text, audioBlob, language = 'en') {
  try {
    // Step 1: Upload the voice sample
    const audioPath = await uploadAudio(audioBlob);

    // Step 2: Join the queue
    const session = `eva_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const joinRes = await fetch(`${HF_CLONE_URL}/queue/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [
          text,
          { path: audioPath, orig_name: 'voice-sample.wav', mime_type: 'audio/wav' },
          language,
        ],
        fn_index: 0,
        session_hash: session,
      }),
    });

    if (!joinRes.ok) throw new Error(`Queue join failed: ${joinRes.status}`);
    const { event_id } = await joinRes.json();

    // Step 3: Poll for result via SSE stream
    const audioUrl = await pollForResult(session, event_id);
    return audioUrl;
  } catch (err) {
    console.warn('Voice clone failed:', err.message);
    return null;
  }
}

// Poll the SSE stream for completion
function pollForResult(session, eventId) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout: voice cloning took too long'));
    }, 180000); // 3 minute timeout

    const evtSource = new EventSource(`${HF_CLONE_URL}/queue/data?session_hash=${session}`);

    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.msg === 'process_completed' && data.success) {
          clearTimeout(timeout);
          evtSource.close();
          const output = data.output?.data?.[0];
          if (output?.url) {
            resolve(output.url);
          } else if (output?.path) {
            resolve(`${HF_CLONE_URL}/file=${output.path}`);
          } else {
            reject(new Error('No audio in response'));
          }
        }

        if (data.msg === 'process_completed' && !data.success) {
          clearTimeout(timeout);
          evtSource.close();
          reject(new Error('Voice cloning failed on server'));
        }
      } catch { /* ignore parse errors from heartbeats */ }
    };

    evtSource.onerror = () => {
      clearTimeout(timeout);
      evtSource.close();
      reject(new Error('Connection to voice server lost'));
    };
  });
}

// Test a saved cloned voice by name
export async function testClonedVoice(voiceName, text = 'Hello! This is Eva speaking in your cloned voice.') {
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

// Check if the voice clone service is available
export async function isHFSpaceAvailable() {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${HF_CLONE_URL}/info`, { signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  }
}
