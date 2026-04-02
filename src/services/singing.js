// Eva Singing Service - uses Bark on HuggingFace Space
const HF_SINGING_URL = 'https://Ameyabro-Eva-Singing-Engine.hf.space';

// Check if the singing space is available
export async function isSingingAvailable() {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${HF_SINGING_URL}`, { signal: controller.signal });
    return res.ok;
  } catch { return false; }
}

// Generate singing audio
export async function generateSinging(lyrics, voice = 'English Female', mode = 'Singing') {
  try {
    // Gradio queue API
    const session = `eva_sing_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const joinRes = await fetch(`${HF_SINGING_URL}/queue/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [lyrics, voice, mode],
        fn_index: 0,
        session_hash: session,
      }),
    });

    if (!joinRes.ok) {
      // Try Gradio 5.x API
      const submitRes = await fetch(`${HF_SINGING_URL}/gradio_api/call/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [lyrics, voice, mode] }),
      });
      if (!submitRes.ok) throw new Error('Failed to submit');
      const { event_id } = await submitRes.json();

      const resultRes = await fetch(`${HF_SINGING_URL}/gradio_api/call/predict/${event_id}`);
      const text = await resultRes.text();
      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('event: complete') && i + 1 < lines.length) {
          const data = JSON.parse(lines[i + 1].slice(6));
          if (data?.[0]?.url) return data[0].url;
          if (data?.[0]?.path) return `${HF_SINGING_URL}/gradio_api/file=${data[0].path}`;
        }
      }
      throw new Error('No audio in response');
    }

    // Queue-based API
    const { event_id } = await joinRes.json();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Singing timeout')), 180000);
      const evtSource = new EventSource(`${HF_SINGING_URL}/queue/data?session_hash=${session}`);

      evtSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.msg === 'process_completed' && data.success) {
            clearTimeout(timeout);
            evtSource.close();
            const output = data.output?.data?.[0];
            if (output?.url) resolve(output.url);
            else if (output?.path) resolve(`${HF_SINGING_URL}/file=${output.path}`);
            else reject(new Error('No audio'));
          }
          if (data.msg === 'process_completed' && !data.success) {
            clearTimeout(timeout);
            evtSource.close();
            reject(new Error('Singing failed on server'));
          }
        } catch {}
      };

      evtSource.onerror = () => { clearTimeout(timeout); evtSource.close(); reject(new Error('Connection lost')); };
    });
  } catch (err) {
    console.warn('Singing failed:', err.message);
    return null;
  }
}

// Detect if user wants Eva to sing
export function wantsSinging(text) {
  const lower = text.toLowerCase();
  return lower.includes('sing') || lower.includes('gaa') || lower.includes('gaana') ||
    lower.includes('song') || lower.includes('lullaby') || lower.includes('melody') ||
    lower.includes('music') || lower.includes('lyrics');
}
