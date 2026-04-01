import { useState, useEffect, useCallback, useRef } from 'react';

// Split text into small chunks to prevent browser TTS from breaking
function chunkText(text) {
  // Split on sentence boundaries
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const chunks = [];
  let current = '';
  for (const s of sentences) {
    if ((current + s).length > 150) {
      if (current) chunks.push(current.trim());
      current = s;
    } else {
      current += s;
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

  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
      const preferred = available.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Samantha') ||
            v.name.includes('Karen') ||
            v.name.includes('Fiona') ||
            v.name.includes('Victoria') ||
            v.name.includes('Female'))
      );
      if (preferred) setSelectedVoice(preferred);
      else if (available.length > 0) {
        const english = available.find((v) => v.lang.startsWith('en'));
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
    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback(
    (text, modeId) => {
      window.speechSynthesis.cancel();
      cancelledRef.current = false;

      const savedRate = parseFloat(localStorage.getItem('eva-voice-rate')) || 0.9;
      const savedPitch = parseFloat(localStorage.getItem('eva-voice-pitch')) || 1.0;
      const savedVolume = parseFloat(localStorage.getItem('eva-voice-volume')) || 0.85;

      // Per-mode adjustments
      const modeAdjust = {
        calm:        { rate: -0.1, pitch: -0.1, volume: -0.1 },
        therapist:   { rate: -0.1, pitch: -0.05, volume: -0.1 },
        lullaby:     { rate: -0.15, pitch: -0.15, volume: -0.2 },
        companion:   { rate: 0, pitch: 0, volume: 0 },
        philosopher: { rate: -0.05, pitch: -0.1, volume: -0.05 },
        motivation:  { rate: 0.1, pitch: 0.1, volume: 0.1 },
        comedian:    { rate: 0.05, pitch: 0.1, volume: 0.05 },
        storyteller: { rate: -0.05, pitch: 0, volume: 0 },
        seductive:   { rate: -0.1, pitch: -0.1, volume: -0.15 },
      };

      const adj = modeAdjust[modeId] || { rate: 0, pitch: 0, volume: 0 };
      const finalRate = Math.max(0.5, Math.min(1.5, savedRate + adj.rate));
      const finalPitch = Math.max(0.5, Math.min(1.5, savedPitch + adj.pitch));
      const finalVol = Math.max(0.2, Math.min(1.0, savedVolume + adj.volume));

      // Chunk text to prevent breaking
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
        speakChunk(next, selectedVoice, finalRate, finalPitch, finalVol, speakNext);
      };

      speakNext();
    },
    [selectedVoice, speakChunk]
  );

  const stop = useCallback(() => {
    cancelledRef.current = true;
    queueRef.current = [];
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
