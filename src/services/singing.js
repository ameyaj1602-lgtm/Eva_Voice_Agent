// Eva Singing Service - uses Bark on HuggingFace Space
// WITH RETRY: tries up to 3 times before giving up
const HF_SINGING_URL = 'https://Ameyabro-Eva-Singing-Engine.hf.space';

export async function isSingingAvailable() {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${HF_SINGING_URL}`, { signal: controller.signal });
    return res.ok;
  } catch { return false; }
}

// Single attempt to generate singing
async function attemptSinging(lyrics, voice, mode) {
  // Try Gradio 5.x API first (most reliable)
  const submitRes = await fetch(`${HF_SINGING_URL}/gradio_api/call/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [lyrics, voice, mode] }),
  });

  if (!submitRes.ok) throw new Error(`Submit failed: ${submitRes.status}`);
  const { event_id } = await submitRes.json();
  if (!event_id) throw new Error('No event_id');

  // Poll for result
  const resultRes = await fetch(`${HF_SINGING_URL}/gradio_api/call/predict/${event_id}`);
  const text = await resultRes.text();
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('event: complete') && i + 1 < lines.length) {
      const data = JSON.parse(lines[i + 1].slice(6));
      if (data?.[0]?.url) return data[0].url;
      if (data?.[0]?.path) return `${HF_SINGING_URL}/gradio_api/file=${data[0].path}`;
    }
    if (lines[i].startsWith('event: error')) {
      throw new Error('Server error during singing');
    }
  }

  throw new Error('No audio in response');
}

// Generate singing with RETRY (up to 3 attempts)
export async function generateSinging(lyrics, voice = 'English Female', mode = 'Singing') {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Singing attempt ${attempt}/${maxRetries}...`);
      const url = await attemptSinging(lyrics, voice, mode);
      if (url) return url;
    } catch (err) {
      console.warn(`Singing attempt ${attempt} failed:`, err.message);
      if (attempt < maxRetries) {
        // Wait 2 seconds before retrying
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  console.warn('All singing attempts failed');
  return null;
}

// Detect if user wants Eva to sing
export function wantsSinging(text) {
  const lower = text.toLowerCase();
  return lower.includes('sing') || lower.includes('gaa') || lower.includes('gaana') ||
    lower.includes('song') || lower.includes('lullaby') || lower.includes('melody') ||
    lower.includes('lyrics');
}
