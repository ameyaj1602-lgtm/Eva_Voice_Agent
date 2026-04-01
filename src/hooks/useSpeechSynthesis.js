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

      // Adjust voice params per mode
      switch (modeId) {
        case 'calm':
          utterance.rate = 0.85;
          utterance.pitch = 0.9;
          utterance.volume = 0.8;
          break;
        case 'motivation':
          utterance.rate = 1.1;
          utterance.pitch = 1.1;
          utterance.volume = 1.0;
          break;
        case 'seductive':
          utterance.rate = 0.8;
          utterance.pitch = 0.85;
          utterance.volume = 0.75;
          break;
        case 'therapist':
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = 0.85;
          break;
        case 'companion':
          utterance.rate = 1.0;
          utterance.pitch = 1.05;
          utterance.volume = 0.9;
          break;
        case 'lullaby':
          utterance.rate = 0.7;
          utterance.pitch = 0.8;
          utterance.volume = 0.6;
          break;
        case 'storyteller':
          utterance.rate = 0.9;
          utterance.pitch = 0.95;
          utterance.volume = 0.9;
          break;
        case 'comedian':
          utterance.rate = 1.05;
          utterance.pitch = 1.1;
          utterance.volume = 0.95;
          break;
        case 'philosopher':
          utterance.rate = 0.85;
          utterance.pitch = 0.9;
          utterance.volume = 0.85;
          break;
        default:
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
      }

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
