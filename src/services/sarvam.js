// Sarvam AI - Indian language TTS (Hindi, Marathi, Tamil, Telugu, Bengali, etc.)
// High quality neural voices for 22+ Indian languages

const SARVAM_API = 'https://api.sarvam.ai';

// Available voices
export const SARVAM_VOICES = {
  female: [
    { id: 'anushka', name: 'Anushka', gender: 'female' },
    { id: 'manisha', name: 'Manisha', gender: 'female' },
    { id: 'vidya', name: 'Vidya', gender: 'female' },
    { id: 'arya', name: 'Arya', gender: 'female' },
    { id: 'ritu', name: 'Ritu', gender: 'female' },
    { id: 'priya', name: 'Priya', gender: 'female' },
    { id: 'neha', name: 'Neha', gender: 'female' },
    { id: 'pooja', name: 'Pooja', gender: 'female' },
    { id: 'simran', name: 'Simran', gender: 'female' },
    { id: 'kavya', name: 'Kavya', gender: 'female' },
    { id: 'ishita', name: 'Ishita', gender: 'female' },
    { id: 'shreya', name: 'Shreya', gender: 'female' },
    { id: 'tanya', name: 'Tanya', gender: 'female' },
    { id: 'shruti', name: 'Shruti', gender: 'female' },
    { id: 'suhani', name: 'Suhani', gender: 'female' },
    { id: 'kavitha', name: 'Kavitha', gender: 'female' },
    { id: 'rupali', name: 'Rupali', gender: 'female' },
    { id: 'roopa', name: 'Roopa', gender: 'female' },
  ],
  male: [
    { id: 'abhilash', name: 'Abhilash', gender: 'male' },
    { id: 'karun', name: 'Karun', gender: 'male' },
    { id: 'hitesh', name: 'Hitesh', gender: 'male' },
    { id: 'aditya', name: 'Aditya', gender: 'male' },
    { id: 'rahul', name: 'Rahul', gender: 'male' },
    { id: 'rohan', name: 'Rohan', gender: 'male' },
    { id: 'amit', name: 'Amit', gender: 'male' },
    { id: 'dev', name: 'Dev', gender: 'male' },
    { id: 'ratan', name: 'Ratan', gender: 'male' },
    { id: 'varun', name: 'Varun', gender: 'male' },
    { id: 'manan', name: 'Manan', gender: 'male' },
    { id: 'kabir', name: 'Kabir', gender: 'male' },
    { id: 'mohit', name: 'Mohit', gender: 'male' },
    { id: 'sunny', name: 'Sunny', gender: 'male' },
    { id: 'vijay', name: 'Vijay', gender: 'male' },
    { id: 'anand', name: 'Anand', gender: 'male' },
  ],
};

// Available languages
export const SARVAM_LANGUAGES = {
  'hi-IN': 'Hindi',
  'mr-IN': 'Marathi',
  'en-IN': 'English (Indian)',
  'ta-IN': 'Tamil',
  'te-IN': 'Telugu',
  'kn-IN': 'Kannada',
  'ml-IN': 'Malayalam',
  'bn-IN': 'Bengali',
  'gu-IN': 'Gujarati',
  'pa-IN': 'Punjabi',
  'od-IN': 'Odia',
};

// Text to Speech
export async function sarvamTTS(apiKey, text, speaker = 'anushka', language = 'hi-IN') {
  try {
    const res = await fetch(`${SARVAM_API}/text-to-speech`, {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: language,
        speaker: speaker,
        model: 'bulbul:v2',
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Sarvam TTS failed: ${res.status}`);
    }

    const data = await res.json();
    if (data?.audios?.[0]) {
      // Convert base64 to audio URL
      const audioData = data.audios[0];
      const blob = base64ToBlob(audioData, 'audio/wav');
      return URL.createObjectURL(blob);
    }
    return null;
  } catch (err) {
    console.warn('Sarvam TTS failed:', err.message);
    return null;
  }
}

// Speech to Text
export async function sarvamSTT(apiKey, audioBlob, language = 'hi-IN') {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('language_code', language);
    formData.append('model', 'saarika:v2');

    const res = await fetch(`${SARVAM_API}/speech-to-text`, {
      method: 'POST',
      headers: { 'api-subscription-key': apiKey },
      body: formData,
    });

    if (!res.ok) throw new Error(`Sarvam STT failed: ${res.status}`);
    const data = await res.json();
    return data?.transcript || null;
  } catch (err) {
    console.warn('Sarvam STT failed:', err.message);
    return null;
  }
}

// Translate text
export async function sarvamTranslate(apiKey, text, sourceLang = 'en-IN', targetLang = 'hi-IN') {
  try {
    const res = await fetch(`${SARVAM_API}/translate`, {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        source_language_code: sourceLang,
        target_language_code: targetLang,
        model: 'mayura:v1',
      }),
    });

    if (!res.ok) throw new Error(`Translate failed: ${res.status}`);
    const data = await res.json();
    return data?.translated_text || null;
  } catch (err) {
    console.warn('Sarvam translate failed:', err.message);
    return null;
  }
}

function base64ToBlob(base64, mimeType) {
  const byteChars = atob(base64);
  const byteArrays = [];
  for (let offset = 0; offset < byteChars.length; offset += 512) {
    const slice = byteChars.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
    byteArrays.push(new Uint8Array(byteNumbers));
  }
  return new Blob(byteArrays, { type: mimeType });
}
