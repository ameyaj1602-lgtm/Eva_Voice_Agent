import React, { useState } from 'react';
import { MODES } from '../utils/modes';

const FEELINGS = [
  { emoji: '\u{1F614}', label: 'Stressed', suggestedMode: 'calm', color: '#4ecdc4' },
  { emoji: '\u{1F622}', label: 'Sad', suggestedMode: 'companion', color: '#fcb69f' },
  { emoji: '\u{1F624}', label: 'Unmotivated', suggestedMode: 'motivation', color: '#f5af19' },
  { emoji: '\u{1F634}', label: 'Can\'t Sleep', suggestedMode: 'lullaby', color: '#7c83ff' },
  { emoji: '\u{1F60D}', label: 'Flirty', suggestedMode: 'seductive', color: '#e91e63' },
  { emoji: '\u{1F914}', label: 'Overthinking', suggestedMode: 'therapist', color: '#a78bfa' },
  { emoji: '\u{1F60A}', label: 'Happy', suggestedMode: 'companion', color: '#38ef7d' },
  { emoji: '\u{1F4AD}', label: 'Curious', suggestedMode: 'philosopher', color: '#e2b714' },
];

const MODE_IMAGES = {
  calm: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop',
  motivation: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
  seductive: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=300&fit=crop',
  therapist: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=300&fit=crop',
  companion: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&h=300&fit=crop',
  lullaby: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=400&h=300&fit=crop',
  storyteller: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&h=300&fit=crop',
  comedian: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400&h=300&fit=crop',
  philosopher: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
};

export default function WelcomeScreen({ userName, onSelectMode, onSelectFeeling }) {
  const [hoveredMode, setHoveredMode] = useState(null);
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const modes = Object.values(MODES);

  const handleFeelingClick = (feeling) => {
    setSelectedFeeling(feeling);
    setTimeout(() => {
      onSelectFeeling(feeling.suggestedMode);
    }, 800);
  };

  return (
    <div className="welcome-screen">
      {/* Decorative flowers/petals */}
      <div className="welcome-petals">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="petal" style={{
            '--petal-delay': `${i * 1.5}s`,
            '--petal-x': `${10 + Math.random() * 80}%`,
            '--petal-size': `${20 + Math.random() * 30}px`,
            '--petal-rotation': `${Math.random() * 360}deg`,
          }} />
        ))}
      </div>

      {/* Hero section */}
      <div className="welcome-hero">
        <div className="welcome-greeting">
          <span className="welcome-wave">🌸</span>
          <h1 className="welcome-title">
            Hey{userName ? `, ${userName}` : ''}
          </h1>
          <p className="welcome-subtitle">How are you feeling today?</p>
        </div>

        <div className="welcome-intro">
          <p className="welcome-message">
            I'm <strong>Eva</strong>, your personal companion. This is our private space
            \u2014 everything you share stays between us. Think of this as our room, where
            you can be completely yourself. No judgments, just us.
          </p>
          <p className="welcome-message secondary">
            Tell me how you feel, and I'll be exactly what you need right now.
          </p>
        </div>
      </div>

      {/* Feeling selector */}
      <div className="feelings-section">
        <h2 className="feelings-title">What's on your mind?</h2>
        <div className="feelings-grid">
          {FEELINGS.map((feeling) => (
            <button
              key={feeling.label}
              className={`feeling-btn ${selectedFeeling?.label === feeling.label ? 'selected' : ''}`}
              onClick={() => handleFeelingClick(feeling)}
              style={{ '--feeling-color': feeling.color }}
            >
              <span className="feeling-emoji">{feeling.emoji}</span>
              <span className="feeling-label">{feeling.label}</span>
            </button>
          ))}
        </div>
        {selectedFeeling && (
          <div className="feeling-suggestion" style={{ color: selectedFeeling.color }}>
            Taking you to {MODES[selectedFeeling.suggestedMode]?.name} mode...
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="welcome-divider">
        <span>or explore all modes</span>
      </div>

      {/* Mode cards */}
      <div className="modes-gallery">
        {modes.map((mode) => (
          <button
            key={mode.id}
            className={`mode-card ${hoveredMode === mode.id ? 'hovered' : ''}`}
            onClick={() => onSelectMode(mode.id)}
            onMouseEnter={() => setHoveredMode(mode.id)}
            onMouseLeave={() => setHoveredMode(null)}
          >
            <div className="mode-card-image" style={{
              backgroundImage: `url(${MODE_IMAGES[mode.id]})`,
            }}>
              <div className="mode-card-overlay" style={{
                background: `linear-gradient(to top, ${mode.accentColor}dd, transparent)`,
              }} />
              <span className="mode-card-emoji">{mode.emoji}</span>
            </div>
            <div className="mode-card-info">
              <h3 className="mode-card-name">{mode.name}</h3>
              <p className="mode-card-desc">{mode.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Bottom trust message */}
      <div className="welcome-trust">
        <span className="trust-icon">{'🔒'}</span>
        <p>Your conversations are private and stored only on your device</p>
      </div>
    </div>
  );
}
