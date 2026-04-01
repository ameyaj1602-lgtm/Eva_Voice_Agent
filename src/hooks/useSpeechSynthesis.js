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

      // Use user's saved tuning settings (from Voice Picker)
      const savedRate = parseFloat(localStorage.getItem('eva-voice-rate')) || 0.9;
      const savedPitch = parseFloat(localStorage.getItem('eva-voice-pitch')) || 1.0;
      const savedVolume = parseFloat(localStorage.getItem('eva-voice-volume')) || 0.85;

      utterance.rate = savedRate;
      utterance.pitch = savedPitch;
      utterance.volume = savedVolume;

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
