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

    const timer = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current >= text.length) {
        setDisplayText(text);
        setIsAnimating(false);
        clearInterval(timer);
      } else {
        setDisplayText(text.slice(0, indexRef.current));
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, enabled]);

  return { displayText, isAnimating };
}
