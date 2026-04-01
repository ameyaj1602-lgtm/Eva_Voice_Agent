// Deepgram Speech-to-Text
// Uses WebSocket for real-time transcription

const DEEPGRAM_STT_URL = 'https://api.deepgram.com/v1/listen';

// REST-based transcription (simpler, works with recorded audio blobs)
export async function transcribeAudio(audioBlob, apiKey) {
  try {
    const res = await fetch(
      `${DEEPGRAM_STT_URL}?model=nova-2&smart_format=true&language=en`,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${apiKey}`,
          'Content-Type': audioBlob.type || 'audio/webm',
        },
        body: audioBlob,
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Deepgram STT error:', err);
      return null;
    }

    const data = await res.json();
    const transcript =
      data?.results?.channels?.[0]?.alternatives?.[0]?.transcript;
    return transcript || null;
  } catch (err) {
    console.error('Deepgram STT failed:', err);
    return null;
  }
}
