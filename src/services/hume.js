// Hume AI - Emotion Detection from Text
// Detects emotions in user messages to auto-suggest modes

const HUME_API_URL = 'https://api.hume.ai/v0/batch/jobs';
const HUME_LANGUAGE_URL = 'https://api.hume.ai/v0/batch/jobs';

const API_KEY = process.env.REACT_APP_HUME_API_KEY || '';

// Simplified emotion-to-mode mapping
const EMOTION_MODE_MAP = {
  // Negative emotions
  Sadness: 'companion',
  Distress: 'therapist',
  Anxiety: 'calm',
  Fear: 'calm',
  Anger: 'calm',
  Confusion: 'therapist',
  Disappointment: 'companion',
  Embarrassment: 'therapist',
  Pain: 'therapist',
  Tiredness: 'lullaby',
  Boredom: 'comedian',

  // Positive emotions
  Joy: 'companion',
  Excitement: 'motivation',
  Amusement: 'comedian',
  Love: 'seductive',
  Desire: 'seductive',
  Interest: 'philosopher',
  Admiration: 'motivation',
  Determination: 'motivation',
  Contemplation: 'philosopher',
  Calmness: 'calm',
  Awe: 'storyteller',
};

// Use Hume's text emotion analysis
export async function detectEmotionFromText(text) {
  if (!API_KEY || !text?.trim()) return null;

  try {
    // Use the inference endpoint for quick text analysis
    const res = await fetch('https://api.hume.ai/v0/batch/jobs', {
      method: 'POST',
      headers: {
        'X-Hume-Api-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        models: { language: {} },
        text: [text],
      }),
    });

    if (!res.ok) {
      console.warn('Hume API error:', res.status);
      return null;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Hume emotion detection failed:', err.message);
    return null;
  }
}

// Simple client-side emotion detection (no API needed, instant)
// Uses keyword matching as a fast fallback
export function detectEmotionLocal(text) {
  if (!text) return { emotion: 'neutral', suggestedMode: null, confidence: 0 };

  const lower = text.toLowerCase();

  const patterns = [
    { keywords: ['sad', 'crying', 'depressed', 'heartbroken', 'lonely', 'miss', 'lost someone', 'grief'], emotion: 'Sadness', mode: 'companion' },
    { keywords: ['anxious', 'worried', 'nervous', 'panic', 'scared', 'afraid', 'overthink'], emotion: 'Anxiety', mode: 'calm' },
    { keywords: ['angry', 'furious', 'pissed', 'frustrated', 'annoyed', 'hate'], emotion: 'Anger', mode: 'calm' },
    { keywords: ['tired', 'exhausted', 'sleepy', 'insomnia', 'can\'t sleep', 'restless'], emotion: 'Tiredness', mode: 'lullaby' },
    { keywords: ['stressed', 'overwhelmed', 'pressure', 'burnout', 'too much'], emotion: 'Distress', mode: 'therapist' },
    { keywords: ['bored', 'nothing to do', 'boring', 'dull'], emotion: 'Boredom', mode: 'comedian' },
    { keywords: ['happy', 'great', 'amazing', 'wonderful', 'excited', 'joy'], emotion: 'Joy', mode: 'companion' },
    { keywords: ['motivated', 'pumped', 'ready', 'let\'s go', 'crush it', 'goals'], emotion: 'Determination', mode: 'motivation' },
    { keywords: ['love', 'romantic', 'crush', 'flirty', 'attractive', 'beautiful'], emotion: 'Love', mode: 'seductive' },
    { keywords: ['curious', 'wonder', 'think about', 'meaning', 'why', 'philosophy'], emotion: 'Interest', mode: 'philosopher' },
    { keywords: ['tell me a story', 'story', 'adventure', 'tale', 'imagine'], emotion: 'Awe', mode: 'storyteller' },
    { keywords: ['funny', 'joke', 'laugh', 'humor', 'hilarious', 'comedy'], emotion: 'Amusement', mode: 'comedian' },
    { keywords: ['unmotivated', 'lazy', 'procrastinat', 'give up', 'quit', 'can\'t do'], emotion: 'Disappointment', mode: 'motivation' },
  ];

  for (const p of patterns) {
    for (const kw of p.keywords) {
      if (lower.includes(kw)) {
        return { emotion: p.emotion, suggestedMode: p.mode, confidence: 0.7 };
      }
    }
  }

  return { emotion: 'neutral', suggestedMode: null, confidence: 0 };
}

export function getSuggestedMode(emotion) {
  return EMOTION_MODE_MAP[emotion] || null;
}
