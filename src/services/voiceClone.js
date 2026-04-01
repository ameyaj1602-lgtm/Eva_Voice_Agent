// Voice Cloning via Hugging Face Space (FREE)
// Uses Coqui XTTS-v2 running on HF Spaces
// Falls back to ElevenLabs if HF Space is unavailable

const HF_SPACE_URL = 'https://ameyabro-eva-voice-cloner.hf.space';

// Clone voice using HF Space Gradio API
export async function cloneVoiceFree(text, audioBlob, language = 'en') {
  try {
    // Gradio API call
    const formData = new FormData();
    const audioFile = new File([audioBlob], 'voice-sample.wav', { type: 'audio/wav' });

    // Step 1: Upload the audio file
    const uploadRes = await fetch(`${HF_SPACE_URL}/upload`, {
      method: 'POST',
      body: (() => {
        const fd = new FormData();
        fd.append('files', audioFile);
        return fd;
      })(),
    });

    if (!uploadRes.ok) throw new Error('Upload failed');
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

    if (!predictRes.ok) throw new Error('Prediction failed');
    const result = await predictRes.json();

    // Step 3: Get the output audio URL
    if (result?.data?.[0]?.path) {
      return `${HF_SPACE_URL}/file=${result.data[0].path}`;
    }

    // Alternative: direct URL
    if (result?.data?.[0]?.url) {
      return result.data[0].url;
    }

    throw new Error('No audio in response');
  } catch (err) {
    console.warn('HF Space voice clone failed:', err.message);
    return null;
  }
}

// Check if HF Space is running
export async function isHFSpaceAvailable() {
  try {
    const res = await fetch(`${HF_SPACE_URL}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: ['test', null, 'en'] }),
    });
    return res.ok || res.status === 422; // 422 means API exists but bad input
  } catch {
    return false;
  }
}

// TTS with cloned voice: sends text + saved voice sample to HF Space
export async function speakWithClonedVoice(text, voiceSampleUrl, language = 'en') {
  try {
    // Fetch the saved voice sample
    const sampleRes = await fetch(voiceSampleUrl);
    const sampleBlob = await sampleRes.blob();

    // Clone and generate
    const audioUrl = await cloneVoiceFree(text, sampleBlob, language);
    if (!audioUrl) return null;

    return audioUrl;
  } catch (err) {
    console.warn('speakWithClonedVoice failed:', err.message);
    return null;
  }
}
