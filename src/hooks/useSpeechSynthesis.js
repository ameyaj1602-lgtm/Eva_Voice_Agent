import { useState, useEffect, useCallback, useRef } from 'react';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const utteranceRef = useRef(null);

  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
      // Pick a nice default female English voice
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

  const speak = useCallback(
    (text, modeId) => {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      if (selectedVoice) utterance.voice = selectedVoice;

      // User's saved tuning (from Voice Picker)
      const savedRate = parseFloat(localStorage.getItem('eva-voice-rate')) || 0.9;
      const savedPitch = parseFloat(localStorage.getItem('eva-voice-pitch')) || 1.0;
      const savedVolume = parseFloat(localStorage.getItem('eva-voice-volume')) || 0.85;

      // Per-mode adjustments on top of user settings
      // Calm/therapy modes: slower, softer, more soothing
      // Energetic modes: faster, louder
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
      utterance.rate = Math.max(0.5, Math.min(1.5, savedRate + adj.rate));
      utterance.pitch = Math.max(0.5, Math.min(1.5, savedPitch + adj.pitch));
      utterance.volume = Math.max(0.2, Math.min(1.0, savedVolume + adj.volume));

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [selectedVoice]
  );

  const stop = useCallback(() => {
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
