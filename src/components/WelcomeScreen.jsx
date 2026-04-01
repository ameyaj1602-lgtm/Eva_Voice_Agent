import React, { useState } from 'react';
import { MODES } from '../utils/modes';
import { getDailyAffirmation } from '../utils/affirmations';

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

const FEELINGS = [
  { emoji: '\u{1F614}', label: 'Stressed', suggestedMode: 'calm' },
  { emoji: '\u{1F622}', label: 'Sad', suggestedMode: 'companion' },
  { emoji: '\u{1F624}', label: 'Low Energy', suggestedMode: 'motivation' },
  { emoji: '\u{1F634}', label: 'Sleepless', suggestedMode: 'lullaby' },
  { emoji: '\u{1F60D}', label: 'Romantic', suggestedMode: 'seductive' },
  { emoji: '\u{1F914}', label: 'Anxious', suggestedMode: 'therapist' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

function getDateStr() {
  return new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

export default function WelcomeScreen({ userName, onSelectMode, onSelectFeeling }) {
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const modes = Object.values(MODES);
  const topModes = modes.slice(0, 3);
  const restModes = modes.slice(3);

  const handleFeelingClick = (feeling) => {
    setSelectedFeeling(feeling);
    setTimeout(() => onSelectFeeling(feeling.suggestedMode), 600);
  };

  return (
    <div className="ws">
      {/* Header */}
      <div className="ws-header">
        <span className="ws-date">{getDateStr()}</span>
        <h1 className="ws-greeting">{getGreeting()}, {userName || 'there'}</h1>
      </div>

      {/* Hero Card - Gratitude / Affirmation */}
      <div className="ws-hero-card">
        <div className="ws-hero-content">
          <p className="ws-hero-text">{getDailyAffirmation()}</p>
          <button className="ws-hero-btn" onClick={() => onSelectMode('calm')}>
            Talk to Eva
          </button>
        </div>
        <div className="ws-hero-art">
          <div className="ws-hero-orb" />
          <div className="ws-hero-orb small" />
        </div>
      </div>

      {/* How are you feeling */}
      <div className="ws-section">
        <h2 className="ws-section-title">How are you feeling?</h2>
        <div className="ws-feelings">
          {FEELINGS.map((f) => (
            <button key={f.label}
              className={`ws-feeling ${selectedFeeling?.label === f.label ? 'active' : ''}`}
              onClick={() => handleFeelingClick(f)}>
              <span className="ws-feeling-emoji">{f.emoji}</span>
              <span className="ws-feeling-label">{f.label}</span>
            </button>
          ))}
        </div>
        {selectedFeeling && (
          <p className="ws-feeling-hint">
            Taking you to {MODES[selectedFeeling.suggestedMode]?.name}...
          </p>
        )}
      </div>

      {/* Quick Access - Top 3 modes as big gradient cards */}
      <div className="ws-section">
        <h2 className="ws-section-title">Quick Start</h2>
        <div className="ws-quick-cards">
          {topModes.map((mode) => (
            <button key={mode.id} className="ws-quick-card"
              onClick={() => onSelectMode(mode.id)}
              style={{ background: mode.gradient }}>
              <div className="ws-quick-card-inner">
                <span className="ws-quick-emoji">{mode.emoji}</span>
                <h3 className="ws-quick-name">{mode.name}</h3>
                <p className="ws-quick-desc">{mode.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations - grid cards */}
      <div className="ws-section">
        <h2 className="ws-section-title">Explore Modes</h2>
        <div className="ws-rec-grid">
          {restModes.map((mode) => (
            <button key={mode.id} className="ws-rec-card"
              onClick={() => onSelectMode(mode.id)}>
              <div className="ws-rec-img" style={{ backgroundImage: `url(${MODE_IMAGES[mode.id]})` }}>
                <div className="ws-rec-img-overlay" style={{ background: `${mode.accentColor}88` }} />
                <span className="ws-rec-emoji">{mode.emoji}</span>
              </div>
              <div className="ws-rec-info">
                <h3 className="ws-rec-name">{mode.name}</h3>
                <p className="ws-rec-desc">{mode.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quote Card */}
      <div className="ws-quote-card">
        <span className="ws-quote-label">Quote</span>
        <p className="ws-quote-text">
          "This is your safe space. No judgments, no pretending. Just you, being you. I'm here whenever you need me."
        </p>
        <span className="ws-quote-author">- Eva</span>
      </div>

      {/* Privacy */}
      <div className="ws-privacy">
        <span>{'🔒'} Your chats are private & stored on your device only</span>
      </div>

      {/* Bottom Nav */}
      <nav className="ws-bottom-nav">
        <button className="ws-nav-item active">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <span>Home</span>
        </button>
        <button className="ws-nav-item" onClick={() => onSelectMode('lullaby')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          <span>Sleep</span>
        </button>
        <button className="ws-nav-item" onClick={() => onSelectMode('calm')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          <span>Meditate</span>
        </button>
        <button className="ws-nav-item" onClick={() => onSelectMode('therapist')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          <span>Journal</span>
        </button>
        <button className="ws-nav-item" onClick={() => onSelectMode('companion')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}
