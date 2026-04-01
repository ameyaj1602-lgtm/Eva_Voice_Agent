// ElevenLabs API Integration
// Free tier: 10,000 characters/month
// Paid: voice cloning, more characters, premium voices

const BASE_URL = 'https://api.elevenlabs.io/v1';

// Default voice IDs from ElevenLabs (free to use)
export const DEFAULT_VOICES = {
  rachel: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', style: 'Calm, warm female' },
  drew: { id: '29vD33N1CtxCmqQRPOHJ', name: 'Drew', style: 'Confident male' },
  clyde: { id: '2EiwWnXFnvU5JabPnv8n', name: 'Clyde', style: 'Deep male narrator' },
  domi: { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', style: 'Energetic female' },
  bella: { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', style: 'Soft, warm female' },
  elli: { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', style: 'Young female' },
  josh: { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', style: 'Deep, warm male' },
  sam: { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', style: 'Raspy, dynamic male' },
};

// Mode to voice mapping
export const MODE_VOICE_MAP = {
  calm: 'bella',
  motivation: 'sam',
  seductive: 'rachel',
  therapist: 'elli',
  companion: 'domi',
  lullaby: 'bella',
  storyteller: 'clyde',
  comedian: 'drew',
  philosopher: 'josh',
  silence: 'bella',
  dream: 'bella',
  futureSelf: 'sam',
  crisis: 'elli',
};

export async function getVoices(apiKey) {
  try {
    const res = await fetch(`${BASE_URL}/voices`, {
      headers: { 'xi-api-key': apiKey },
    });
    if (!res.ok) throw new Error('Failed to fetch voices');
    const data = await res.json();
    return data.voices || [];
  } catch (err) {
    console.error('ElevenLabs voices error:', err);
    return [];
  }
}

export async function synthesizeSpeech(text, apiKey, voiceId, options = {}) {
  const {
    stability = 0.5,
    similarityBoost = 0.75,
    style = 0.0,
    speakerBoost = true,
  } = options;

  try {
    const res = await fetch(`${BASE_URL}/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
          style,
          use_speaker_boost: speakerBoost,
        },
      }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error('ElevenLabs TTS error:', error);
      return null;
    }

    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('ElevenLabs TTS failed:', err);
    return null;
  }
}

export async function getUsage(apiKey) {
  try {
    const res = await fetch(`${BASE_URL}/user/subscription`, {
      headers: { 'xi-api-key': apiKey },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      characterCount: data.character_count,
      characterLimit: data.character_limit,
      remaining: data.character_limit - data.character_count,
      tier: data.tier,
    };
  } catch {
    return null;
  }
}

// Voice cloning - requires paid plan
export async function cloneVoice(apiKey, name, description, files) {
  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    files.forEach((file) => formData.append('files', file));

    const res = await fetch(`${BASE_URL}/voices/add`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return { error: error.detail?.message || 'Voice cloning failed. Requires paid plan.' };
    }

    const data = await res.json();
    return { voiceId: data.voice_id, success: true };
  } catch (err) {
    return { error: err.message };
  }
}
