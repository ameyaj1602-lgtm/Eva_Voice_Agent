// Maya1 Voice Engine - connects to Kaggle/Colab Gradio endpoint
// Best quality free voice AI with 20+ emotions

export async function maya1TTS(mayaUrl, text, voicePreset = 'Eva Calm') {
  if (!mayaUrl) return null;

  try {
    // Try Gradio queue API first
    const session = `eva_${Date.now()}`;
    const joinRes = await fetch(`${mayaUrl}/queue/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [text, voicePreset, '', ''],
        fn_index: 0,
        session_hash: session,
      }),
    });

    if (joinRes.ok) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Maya1 timeout')), 120000);
        const evtSource = new EventSource(`${mayaUrl}/queue/data?session_hash=${session}`);
        evtSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.msg === 'process_completed' && data.success) {
              clearTimeout(timeout); evtSource.close();
              const out = data.output?.data?.[0];
              resolve(out?.url || (out?.path ? `${mayaUrl}/file=${out.path}` : null));
            }
            if (data.msg === 'process_completed' && !data.success) {
              clearTimeout(timeout); evtSource.close(); resolve(null);
            }
          } catch {}
        };
        evtSource.onerror = () => { clearTimeout(timeout); evtSource.close(); resolve(null); };
      });
    }

    // Try Gradio 5.x API
    const submitRes = await fetch(`${mayaUrl}/gradio_api/call/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [text, voicePreset, '', ''] }),
    });

    if (!submitRes.ok) return null;
    const { event_id } = await submitRes.json();

    const resultRes = await fetch(`${mayaUrl}/gradio_api/call/predict/${event_id}`);
    const resultText = await resultRes.text();
    const lines = resultText.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('event: complete') && i + 1 < lines.length) {
        const data = JSON.parse(lines[i + 1].slice(6));
        if (data?.[0]?.url) return data[0].url;
        if (data?.[0]?.path) return `${mayaUrl}/gradio_api/file=${data[0].path}`;
      }
    }
    return null;
  } catch (err) {
    console.warn('Maya1 TTS failed:', err.message);
    return null;
  }
}

// Map Eva modes to Maya1 voice presets
export const MODE_TO_MAYA = {
  calm: 'Eva Calm',
  therapist: 'Eva Therapist',
  motivation: 'Eva Motivator',
  companion: 'Eva Companion',
  lullaby: 'Eva Lullaby',
  silence: 'Eva Calm',
  dream: 'Eva Lullaby',
  futureSelf: 'Eva Motivator',
  crisis: 'Eva Therapist',
  philosopher: 'Eva Deep Male',
  storyteller: 'Eva Deep Male',
  comedian: 'Eva Companion',
  seductive: 'Eva Calm',
};
