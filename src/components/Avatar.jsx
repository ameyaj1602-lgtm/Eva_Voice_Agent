import React, { useEffect, useState, useRef, useMemo } from 'react';

// Mode-specific expressions - each mode has a unique face
const MODE_EXPRESSIONS = {
  calm:        { eyeSize: 12, eyeGap: 24, browAngle: -3, browY: 0, mouthCurve: 0.6, blush: false, eyeShape: 'round', breatheSync: true },
  therapist:   { eyeSize: 13, eyeGap: 24, browAngle: -5, browY: -1, mouthCurve: 0.4, blush: false, eyeShape: 'round', breatheSync: false },
  motivation:  { eyeSize: 14, eyeGap: 22, browAngle: -10, browY: -3, mouthCurve: 0.8, blush: false, eyeShape: 'intense', breatheSync: false },
  seductive:   { eyeSize: 11, eyeGap: 26, browAngle: -4, browY: -1, mouthCurve: 0.5, blush: true, eyeShape: 'half-closed', breatheSync: false },
  companion:   { eyeSize: 14, eyeGap: 24, browAngle: -3, browY: 0, mouthCurve: 0.9, blush: true, eyeShape: 'round', breatheSync: false },
  lullaby:     { eyeSize: 10, eyeGap: 26, browAngle: -2, browY: 1, mouthCurve: 0.3, blush: false, eyeShape: 'sleepy', breatheSync: true },
  storyteller: { eyeSize: 14, eyeGap: 22, browAngle: -6, browY: -2, mouthCurve: 0.7, blush: false, eyeShape: 'wide', breatheSync: false },
  comedian:    { eyeSize: 14, eyeGap: 22, browAngle: -4, browY: -1, mouthCurve: 1.0, blush: false, eyeShape: 'round', breatheSync: false },
  philosopher: { eyeSize: 12, eyeGap: 24, browAngle: -6, browY: -2, mouthCurve: 0.3, blush: false, eyeShape: 'thoughtful', breatheSync: false },
  silence:     { eyeSize: 10, eyeGap: 28, browAngle: -2, browY: 1, mouthCurve: 0.1, blush: false, eyeShape: 'serene', breatheSync: true },
  dream:       { eyeSize: 9, eyeGap: 28, browAngle: -1, browY: 2, mouthCurve: 0.2, blush: false, eyeShape: 'dreamy', breatheSync: true },
  futureSelf:  { eyeSize: 13, eyeGap: 22, browAngle: -5, browY: -1, mouthCurve: 0.7, blush: false, eyeShape: 'confident', breatheSync: false },
  crisis:      { eyeSize: 14, eyeGap: 22, browAngle: -3, browY: 0, mouthCurve: 0.4, blush: false, eyeShape: 'steady', breatheSync: false },
};

export default function Avatar({ mode, isListening, isSpeaking, volume }) {
  const rings = useMemo(() => Array.from({ length: 4 }, (_, i) => i), []);
  const particles = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

  // States
  const [mouthOpen, setMouthOpen] = useState(0);
  const [eyeDirection, setEyeDirection] = useState({ x: 0, y: 0 });
  const [breathePhase, setBreathePhase] = useState(0); // 0-1 cycle
  const [blinkState, setBlinkState] = useState(1); // 1 = open, 0 = closed
  const [emotionPulse, setEmotionPulse] = useState(0);
  const breatheRef = useRef(null);

  const expr = MODE_EXPRESSIONS[mode.id] || MODE_EXPRESSIONS.calm;

  // === LIP SYNC: Smooth mouth movement when speaking ===
  useEffect(() => {
    if (!isSpeaking) { setMouthOpen(0); return; }
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      // Natural speech pattern: varies between open/closed with smooth transitions
      const base = Math.sin(frame * 0.3) * 0.3 + 0.3;
      const variation = Math.random() * 0.4;
      const volumeInfluence = volume * 0.3;
      setMouthOpen(Math.min(1, base + variation + volumeInfluence));
    }, 80); // 12.5fps for smooth lip movement
    return () => clearInterval(interval);
  }, [isSpeaking, volume]);

  // === BREATHING ANIMATION: Synced with breathing exercises ===
  useEffect(() => {
    // Continuous gentle breathing for all modes
    let frame = 0;
    breatheRef.current = setInterval(() => {
      frame++;
      // Slow breathing cycle: ~6 seconds per breath
      const cycle = (Math.sin(frame * 0.05) + 1) / 2; // 0 to 1
      setBreathePhase(cycle);
    }, 50);
    return () => clearInterval(breatheRef.current);
  }, []);

  // === NATURAL BLINKING ===
  useEffect(() => {
    const blink = () => {
      setBlinkState(0);
      setTimeout(() => setBlinkState(1), 150);
    };
    // Blink every 3-6 seconds
    const schedule = () => {
      const delay = 3000 + Math.random() * 3000;
      return setTimeout(() => { blink(); schedule(); }, delay);
    };
    const timer = schedule();
    return () => clearTimeout(timer);
  }, []);

  // === SUBTLE EYE MOVEMENT ===
  useEffect(() => {
    const interval = setInterval(() => {
      setEyeDirection({
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 2,
      });
    }, 2000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  // === EMOTION PULSE (heartbeat-like glow) ===
  useEffect(() => {
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      setEmotionPulse(Math.sin(frame * 0.08) * 0.5 + 0.5);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Computed values
  const breatheScale = 1 + breathePhase * 0.03; // Subtle body breathing
  const speakingScale = isSpeaking ? 1 + volume * 0.2 : 1;
  const listeningScale = isListening ? 1 + volume * 0.4 : 1;
  const glowIntensity = 40 + emotionPulse * 30; // Pulsing glow

  // Eye shape based on mode
  const getEyeStyle = () => {
    const base = { width: expr.eyeSize, height: expr.eyeSize * blinkState };
    switch (expr.eyeShape) {
      case 'sleepy': return { ...base, height: base.height * 0.5, borderRadius: '50% 50% 40% 40%' };
      case 'dreamy': return { ...base, height: base.height * 0.4, borderRadius: '50%', opacity: 0.7 };
      case 'half-closed': return { ...base, height: base.height * 0.6, borderRadius: '50% 50% 40% 40%' };
      case 'intense': return { ...base, height: base.height * 0.85, borderRadius: '40%' };
      case 'wide': return { ...base, height: base.height * 1.1, borderRadius: '50%' };
      case 'thoughtful': return { ...base, height: base.height * 0.8, borderRadius: '50%' };
      case 'serene': return { ...base, height: base.height * 0.5, borderRadius: '50%' };
      case 'confident': return { ...base, height: base.height * 0.9, borderRadius: '45%' };
      case 'steady': return { ...base, height: base.height * 0.9, borderRadius: '50%' };
      default: return { ...base, borderRadius: '50%' };
    }
  };

  // Mouth shape
  const getMouthStyle = () => {
    if (isSpeaking) {
      // Lip sync: oval that opens and closes
      const openAmount = mouthOpen;
      return {
        width: 14 + openAmount * 8,
        height: 3 + openAmount * 14,
        borderRadius: '50%',
        backgroundColor: `${mode.accentColor}${Math.round(40 + openAmount * 60).toString(16).padStart(2, '0')}`,
        border: 'none',
        transition: 'width 0.06s, height 0.06s',
      };
    }
    if (isListening) {
      return {
        width: 24, height: 2, borderRadius: '2px',
        backgroundColor: 'transparent',
        borderBottom: `2px solid ${mode.accentColor}`,
        border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: mode.accentColor,
      };
    }
    // Resting mouth - curve based on mode personality
    const curve = expr.mouthCurve;
    if (curve > 0.7) {
      // Big smile
      return {
        width: 22, height: 12, borderRadius: '0 0 22px 22px',
        backgroundColor: 'transparent',
        borderBottom: `2px solid ${mode.accentColor}`,
        borderLeft: `2px solid ${mode.accentColor}`,
        borderRight: `2px solid ${mode.accentColor}`,
        borderTop: 'none',
      };
    }
    if (curve > 0.4) {
      // Gentle smile
      return {
        width: 20, height: 10, borderRadius: '0 0 20px 20px',
        backgroundColor: 'transparent',
        borderBottom: `2px solid ${mode.accentColor}`,
        borderLeft: `1px solid transparent`,
        borderRight: `1px solid transparent`,
        borderTop: 'none',
      };
    }
    // Neutral/contemplative
    return {
      width: 16, height: 6, borderRadius: '0 0 14px 14px',
      backgroundColor: 'transparent',
      borderBottom: `2px solid ${mode.accentColor}`,
      borderLeft: 'none', borderRight: 'none', borderTop: 'none',
    };
  };

  const eyeStyle = getEyeStyle();
  const mouthStyle = getMouthStyle();

  return (
    <div className="avatar-container">
      {/* Background glow - pulses with emotion */}
      <div className="avatar-glow" style={{
        background: mode.glowColor,
        transform: `scale(${listeningScale * breatheScale})`,
        opacity: 0.5 + emotionPulse * 0.3,
      }} />

      {/* Orbiting rings - breathe with avatar */}
      {rings.map((i) => (
        <div key={i}
          className={`avatar-ring ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}
          style={{
            width: `${180 + i * 40}px`, height: `${180 + i * 40}px`,
            borderColor: mode.accentColor,
            opacity: (0.1 + i * 0.05) * (0.8 + emotionPulse * 0.2),
            animationDuration: `${8 + i * 4}s`,
            animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
            transform: `scale(${speakingScale * breatheScale})`,
          }}
        />
      ))}

      {/* Floating particles */}
      {particles.map((i) => (
        <div key={`p-${i}`} className="avatar-particle" style={{
          '--angle': `${(360 / 12) * i}deg`,
          '--delay': `${i * 0.3}s`,
          '--distance': `${100 + Math.random() * 40}px`,
          backgroundColor: mode.accentColor,
        }} />
      ))}

      {/* Main avatar circle - BREATHES */}
      <div className={`avatar-core ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}
        style={{
          background: mode.gradient,
          boxShadow: `0 0 ${glowIntensity}px ${mode.glowColor}, inset 0 0 60px rgba(255,255,255,0.1)`,
          animationDuration: mode.pulseSpeed,
          transform: `scale(${breatheScale})`,
        }}>

        {/* Face */}
        <div className="avatar-face">
          {/* Eyebrows - react to mode + state */}
          <div className="avatar-eyebrows">
            <div className="avatar-eyebrow left" style={{
              backgroundColor: mode.accentColor,
              width: expr.eyeShape === 'intense' ? 16 : 14,
              transform: `rotate(${expr.browAngle + (isSpeaking ? -3 : isListening ? -5 : 0)}deg) translateY(${expr.browY + (isListening ? -3 : 0)}px)`,
            }} />
            <div className="avatar-eyebrow right" style={{
              backgroundColor: mode.accentColor,
              width: expr.eyeShape === 'intense' ? 16 : 14,
              transform: `rotate(${-expr.browAngle + (isSpeaking ? 3 : isListening ? 5 : 0)}deg) translateY(${expr.browY + (isListening ? -3 : 0)}px)`,
            }} />
          </div>

          {/* Eyes with pupils that follow */}
          <div className="avatar-eyes" style={{ gap: expr.eyeGap }}>
            {['left', 'right'].map((side) => (
              <div key={side} className={`avatar-eye ${side}`} style={{
                backgroundColor: mode.accentColor,
                width: eyeStyle.width, height: Math.max(1, eyeStyle.height),
                borderRadius: eyeStyle.borderRadius || '50%',
                opacity: eyeStyle.opacity || 1,
                transition: 'height 0.15s ease, width 0.2s ease',
              }}>
                {blinkState > 0.5 && (
                  <div className="avatar-pupil" style={{
                    transform: `translate(calc(-50% + ${eyeDirection.x}px), calc(-50% + ${eyeDirection.y}px))`,
                    width: expr.eyeShape === 'intense' ? 6 : 5,
                    height: expr.eyeShape === 'intense' ? 6 : 5,
                  }} />
                )}
                <div className="avatar-eye-highlight" />
              </div>
            ))}
          </div>

          {/* Blush marks */}
          {expr.blush && (
            <div className="avatar-blush">
              <div className="blush-mark left" style={{ backgroundColor: `${mode.accentColor}25`, width: 18, height: 9 }} />
              <div className="blush-mark right" style={{ backgroundColor: `${mode.accentColor}25`, width: 18, height: 9 }} />
            </div>
          )}

          {/* Mouth - FULL LIP SYNC */}
          <div className="avatar-mouth-dynamic" style={mouthStyle} />
        </div>

        {/* Audio visualizer */}
        {(isListening || isSpeaking) && (
          <div className="avatar-visualizer">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={`v-${i}`} className="visualizer-bar" style={{
                backgroundColor: mode.accentColor,
                animationDelay: `${i * 0.1}s`,
                height: `${20 + volume * 60 * (1 + Math.sin(i + Date.now() * 0.005))}%`,
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Status text */}
      <div className="avatar-status" style={{ color: mode.accentColor }}>
        {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Eva'}
      </div>
    </div>
  );
}
