import React, { useEffect, useState } from 'react';

export default function Avatar({ mode, isListening, isSpeaking, volume }) {
  const rings = Array.from({ length: 4 }, (_, i) => i);
  const particles = Array.from({ length: 12 }, (_, i) => i);
  const speakingScale = isSpeaking ? 1 + volume * 0.3 : 1;
  const listeningScale = isListening ? 1 + volume * 0.5 : 1;

  // Lip-sync animation state
  const [mouthOpen, setMouthOpen] = useState(0);
  const [eyeDirection, setEyeDirection] = useState({ x: 0, y: 0 });

  // Simulate lip movement when speaking
  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(0);
      return;
    }
    const interval = setInterval(() => {
      setMouthOpen(Math.random() * 0.8 + 0.2);
    }, 120);
    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Subtle eye movement
  useEffect(() => {
    const interval = setInterval(() => {
      setEyeDirection({
        x: (Math.random() - 0.5) * 3,
        y: (Math.random() - 0.5) * 2,
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const mouthHeight = isSpeaking ? 4 + mouthOpen * 16 : isListening ? 2 : 10;
  const mouthWidth = isSpeaking ? 14 + mouthOpen * 6 : isListening ? 24 : 20;
  const mouthRadius = isSpeaking ? '50%' : isListening ? '2px' : '0 0 20px 20px';

  return (
    <div className="avatar-container">
      {/* Background glow */}
      <div
        className="avatar-glow"
        style={{
          background: mode.glowColor,
          transform: `scale(${listeningScale})`,
        }}
      />

      {/* Orbiting rings */}
      {rings.map((i) => (
        <div
          key={i}
          className={`avatar-ring ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}
          style={{
            width: `${180 + i * 40}px`,
            height: `${180 + i * 40}px`,
            borderColor: mode.accentColor,
            opacity: 0.1 + i * 0.05,
            animationDuration: `${8 + i * 4}s`,
            animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
            transform: `scale(${speakingScale})`,
          }}
        />
      ))}

      {/* Floating particles */}
      {particles.map((i) => (
        <div
          key={`p-${i}`}
          className="avatar-particle"
          style={{
            '--angle': `${(360 / 12) * i}deg`,
            '--delay': `${i * 0.3}s`,
            '--distance': `${100 + Math.random() * 40}px`,
            backgroundColor: mode.accentColor,
          }}
        />
      ))}

      {/* Main avatar circle */}
      <div
        className={`avatar-core ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}
        style={{
          background: mode.gradient,
          boxShadow: `0 0 60px ${mode.glowColor}, inset 0 0 60px rgba(255,255,255,0.1)`,
          animationDuration: mode.pulseSpeed,
        }}
      >
        {/* Face */}
        <div className="avatar-face">
          {/* Eyebrows */}
          <div className="avatar-eyebrows">
            <div
              className="avatar-eyebrow left"
              style={{
                backgroundColor: mode.accentColor,
                transform: isSpeaking
                  ? 'rotate(-8deg) translateY(-2px)'
                  : isListening
                  ? 'rotate(-12deg) translateY(-4px)'
                  : 'rotate(-5deg)',
              }}
            />
            <div
              className="avatar-eyebrow right"
              style={{
                backgroundColor: mode.accentColor,
                transform: isSpeaking
                  ? 'rotate(8deg) translateY(-2px)'
                  : isListening
                  ? 'rotate(12deg) translateY(-4px)'
                  : 'rotate(5deg)',
              }}
            />
          </div>

          {/* Eyes */}
          <div className="avatar-eyes">
            <div className="avatar-eye left" style={{ backgroundColor: mode.accentColor }}>
              <div
                className="avatar-pupil"
                style={{
                  transform: `translate(calc(-50% + ${eyeDirection.x}px), calc(-50% + ${eyeDirection.y}px))`,
                }}
              />
              {/* Eye highlight */}
              <div className="avatar-eye-highlight" />
            </div>
            <div className="avatar-eye right" style={{ backgroundColor: mode.accentColor }}>
              <div
                className="avatar-pupil"
                style={{
                  transform: `translate(calc(-50% + ${eyeDirection.x}px), calc(-50% + ${eyeDirection.y}px))`,
                }}
              />
              <div className="avatar-eye-highlight" />
            </div>
          </div>

          {/* Blush marks (for certain modes) */}
          {(mode.id === 'seductive' || mode.id === 'companion') && (
            <div className="avatar-blush">
              <div className="blush-mark left" style={{ backgroundColor: `${mode.accentColor}30` }} />
              <div className="blush-mark right" style={{ backgroundColor: `${mode.accentColor}30` }} />
            </div>
          )}

          {/* Mouth - dynamic lip sync */}
          <div
            className="avatar-mouth-dynamic"
            style={{
              width: `${mouthWidth}px`,
              height: `${mouthHeight}px`,
              borderRadius: mouthRadius,
              backgroundColor: isSpeaking ? `${mode.accentColor}88` : 'transparent',
              border: isSpeaking ? 'none' : `2px solid ${mode.accentColor}`,
              borderTop: isListening ? `2px solid ${mode.accentColor}` : isSpeaking ? 'none' : undefined,
              transition: 'width 0.08s, height 0.08s, border-radius 0.1s',
            }}
          />
        </div>

        {/* Audio visualizer waves inside the avatar */}
        {(isListening || isSpeaking) && (
          <div className="avatar-visualizer">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={`v-${i}`}
                className="visualizer-bar"
                style={{
                  backgroundColor: mode.accentColor,
                  animationDelay: `${i * 0.1}s`,
                  height: `${20 + volume * 60 * (1 + Math.sin(i))}%`,
                }}
              />
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
