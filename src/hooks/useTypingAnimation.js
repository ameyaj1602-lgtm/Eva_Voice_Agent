import { useState, useEffect, useRef } from 'react';

export function useTypingAnimation(text, speed = 30, enabled = true) {
  const [displayText, setDisplayText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!enabled || !text) {
      setDisplayText(text || '');
      return;
    }

    setDisplayText('');
    setIsAnimating(true);
    indexRef.current = 0;

    // Sync typing speed with voice speed
    // Slower voice (rate 0.5) = slower typing (40ms/char)
    // Faster voice (rate 1.5) = faster typing (10ms/char)
    const voiceRate = parseFloat(localStorage.getItem('eva-voice-rate')) || 0.85;
    const adjustedSpeed = Math.round(speed / voiceRate);

    const timer = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current >= text.length) {
        setDisplayText(text);
        setIsAnimating(false);
        clearInterval(timer);
      } else {
        setDisplayText(text.slice(0, indexRef.current));
      }
    }, adjustedSpeed);

    return () => clearInterval(timer);
  }, [text, speed, enabled]);

  return { displayText, isAnimating };
}
