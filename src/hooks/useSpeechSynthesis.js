import { useState, useEffect, useCallback, useRef } from 'react';

// Novelty/joke voices to filter out from the picker
const NOVELTY_VOICES = new Set([
  'Albert', 'Bad News', 'Bahh', 'Bells', 'Boing', 'Bubbles', 'Cellos',
  'Good News', 'Jester', 'Junior', 'Organ', 'Superstar', 'Trinoids',
  'Whisper', 'Wobble', 'Zarvox', 'Fred', 'Ralph', 'Kathy',
]);

// Best voices for therapy/calm modes (ranked)
const PREFERRED_CALM = ['Samantha', 'Moira', 'Karen', 'Tessa', 'Fiona', 'Victoria', 'Shelley', 'Sandy', 'Flo'];
const PREFERRED_ENERGY = ['Daniel', 'Rishi', 'Reed', 'Eddy', 'Rocko'];

// Split text into natural sentences with pauses
function chunkText(text) {
  // Split on sentence endings, keeping punctuation
  const raw = text.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [text];
  const chunks = [];
  let current = '';

  for (const s of raw) {
    const trimmed = s.trim();
    if (!trimmed) continue;

    if ((current + ' ' + trimmed).length > 200) {
      if (current) chunks.push(current.trim());
      current = trimmed;
    } else {
      current = current ? current + ' ' + trimmed : trimmed;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text];
}

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const utteranceRef = useRef(null);
  const queueRef = useRef([]);
  const cancelledRef = useRef(false);
  const pauseTimerRef = useRef(null);

  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();

      // Filter out novelty voices for the picker
      const filtered = available.filter(v => !NOVELTY_VOICES.has(v.name));
      setVoices(filtered.length > 0 ? filtered : available);

      // Auto-select the best calm female voice
      const findVoice = (names) => {
        for (const name of names) {
          const match = available.find(v => v.name.includes(name) && v.lang.startsWith('en'));
          if (match) return match;
        }
        return null;
      };

      const best = findVoice(PREFERRED_CALM);
      if (best) {
        setSelectedVoice(best);
      } else {
        const english = available.find(v => v.lang.startsWith('en') && !NOVELTY_VOICES.has(v.name));
        setSelectedVoice(english || available[0]);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speakChunk = useCallback((text, voice, rate, pitch, vol, onDone) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = vol;

    utterance.onend = onDone;
    utterance.onerror = onDone;

    // Chrome bug: speechSynthesis stops after 15s. Resume it periodically.
    const resumeInterval = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);

    utterance.onend = () => { clearInterval(resumeInterval); onDone(); };
    utterance.onerror = () => { clearInterval(resumeInterval); onDone(); };

    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback(
    (text, modeId) => {
      window.speechSynthesis.cancel();
      cancelledRef.current = false;
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);

      const savedRate = parseFloat(localStorage.getItem('eva-voice-rate')) || 0.9;
      const savedPitch = parseFloat(localStorage.getItem('eva-voice-pitch')) || 1.0;
      const savedVolume = parseFloat(localStorage.getItem('eva-voice-volume')) || 0.85;

      // Per-mode adjustments - calm modes are slower/softer
      const modeAdjust = {
        calm:        { rate: -0.1, pitch: -0.1, volume: -0.1, pause: 400 },
        therapist:   { rate: -0.1, pitch: -0.05, volume: -0.1, pause: 350 },
        lullaby:     { rate: -0.2, pitch: -0.15, volume: -0.2, pause: 600 },
        companion:   { rate: 0, pitch: 0, volume: 0, pause: 250 },
        philosopher: { rate: -0.05, pitch: -0.1, volume: -0.05, pause: 400 },
        motivation:  { rate: 0.05, pitch: 0.05, volume: 0.1, pause: 150 },
        comedian:    { rate: 0.05, pitch: 0.1, volume: 0.05, pause: 200 },
        storyteller: { rate: -0.05, pitch: 0, volume: 0, pause: 350 },
        seductive:   { rate: -0.15, pitch: -0.1, volume: -0.15, pause: 450 },
      };

      const adj = modeAdjust[modeId] || { rate: 0, pitch: 0, volume: 0, pause: 250 };
      const finalRate = Math.max(0.5, Math.min(1.5, savedRate + adj.rate));
      const finalPitch = Math.max(0.5, Math.min(1.5, savedPitch + adj.pitch));
      const finalVol = Math.max(0.2, Math.min(1.0, savedVolume + adj.volume));
      const pauseMs = adj.pause || 250;

      // Chunk text for natural flow
      const chunks = chunkText(text);
      queueRef.current = [...chunks];
      setIsSpeaking(true);

      const speakNext = () => {
        if (cancelledRef.current || queueRef.current.length === 0) {
          setIsSpeaking(false);
          queueRef.current = [];
          return;
        }
        const next = queueRef.current.shift();

        // Add a natural pause between sentences (like breathing)
        if (chunks.length > 1 && next !== chunks[0]) {
          pauseTimerRef.current = setTimeout(() => {
            if (!cancelledRef.current) {
              speakChunk(next, selectedVoice, finalRate, finalPitch, finalVol, speakNext);
            }
          }, pauseMs);
        } else {
          speakChunk(next, selectedVoice, finalRate, finalPitch, finalVol, speakNext);
        }
      };

      speakNext();
    },
    [selectedVoice, speakChunk]
  );

  const stop = useCallback(() => {
    cancelledRef.current = true;
    queueRef.current = [];
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    isSpeaking,
    voices,
    selectedVoice,
    setSelectedVoice,
    speak,
    stop,
  };
}
