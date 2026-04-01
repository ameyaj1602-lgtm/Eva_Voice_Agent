// Fish Audio API - High quality voice cloning TTS
// Free tier: 30,000 characters/month
// https://fish.audio

const FISH_API = 'https://api.fish.audio';

// Create a voice model from uploaded audio
export async function createVoiceModel(apiKey, name, audioBlob) {
  try {
    const formData = new FormData();
    formData.append('type', 'tts');
    formData.append('title', name);
    formData.append('train_mode', 'fast');
    formData.append('visibility', 'private');
    formData.append('voices', new File([audioBlob], 'voice.mp3', { type: audioBlob.type || 'audio/mpeg' }));

    const res = await fetch(`${FISH_API}/model`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed: ${res.status}`);
    }

    const model = await res.json();
    return { success: true, modelId: model._id, name: model.title };
  } catch (err) {
    console.warn('Fish Audio model creation failed:', err.message);
    return { success: false, error: err.message };
  }
}

// List user's voice models
export async function listVoiceModels(apiKey) {
  try {
    const res = await fetch(`${FISH_API}/model?page_size=50&author_id=me`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

// Text to Speech with Fish Audio
export async function fishTTS(apiKey, text, modelId, options = {}) {
  try {
    const body = {
      text,
      format: 'mp3',
      latency: 'balanced',
      ...(modelId ? { reference_id: modelId } : {}),
    };

    const res = await fetch(`${FISH_API}/v1/tts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'model': 's1',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `TTS failed: ${res.status}`);
    }

    // Response is streamed audio
    const audioBlob = await res.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    return audioUrl;
  } catch (err) {
    console.warn('Fish Audio TTS failed:', err.message);
    return null;
  }
}

// Check if API key is valid and has credits
export async function checkCredits(apiKey) {
  try {
    const res = await fetch(`${FISH_API}/wallet/self/api-credit`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (!res.ok) return { valid: false, credits: 0 };
    const data = await res.json();
    return { valid: true, credits: parseFloat(data.credit) || 0 };
  } catch {
    return { valid: false, credits: 0 };
  }
}
