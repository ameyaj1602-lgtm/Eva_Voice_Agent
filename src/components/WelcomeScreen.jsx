import React, { useState, useEffect } from 'react';
import { MODES } from '../utils/modes';
import { getDailyAffirmation } from '../utils/affirmations';
import { getWeather } from '../services/freeApis';
import { getSmartGreeting, QUICK_MOODS } from '../utils/smartGreeting';

const MODE_IMAGES = {
  calm: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop&q=80',
  motivation: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&q=80',
  seductive: 'https://images.unsplash.com/photo-1516967124798-10656f7dca28?w=600&h=400&fit=crop&q=80',
  therapist: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&h=400&fit=crop&q=80',
  companion: 'https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=600&h=400&fit=crop&q=80',
  lullaby: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=400&fit=crop&q=80',
  storyteller: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=400&fit=crop&q=80',
  comedian: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=600&h=400&fit=crop&q=80',
  philosopher: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop&q=80',
};

const HERO_BG = 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=400&fit=crop&q=80';

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

function getStreakCount() {
  try {
    const data = JSON.parse(localStorage.getItem('eva-streak'));
    return data?.current || 0;
  } catch { return 0; }
}

export default function WelcomeScreen({ userName, onSelectMode, onSelectFeeling, onOpenSidebar, onOpenProfile }) {
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [lightMode, setLightMode] = useState(() => localStorage.getItem('eva-theme') === 'light');
  const [weather, setWeather] = useState(null);
  const [greeting] = useState(() => getSmartGreeting(userName));

  // Fetch weather on mount
  useEffect(() => {
    const key = process.env.REACT_APP_OPENWEATHER_API_KEY;
    if (!key) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => getWeather(key, pos.coords.latitude, pos.coords.longitude).then(setWeather),
        () => getWeather(key, 19.076, 72.8777).then(setWeather) // default Mumbai
      );
    }
  }, []);
  const modes = Object.values(MODES).filter(m => !m.special);
  const topModes = modes.slice(0, 3);
  const restModes = modes.slice(3);
  const streak = getStreakCount();

  const toggleTheme = () => {
    const next = !lightMode;
    setLightMode(next);
    localStorage.setItem('eva-theme', next ? 'light' : 'dark');
  };

  const handleFeelingClick = (feeling) => {
    setSelectedFeeling(feeling);
    // Also log mood
    try {
      const log = JSON.parse(localStorage.getItem('eva-mood-log') || '[]');
      log.push({ emoji: feeling.emoji, label: feeling.label, value: feeling.value || 3, date: Date.now() });
      localStorage.setItem('eva-mood-log', JSON.stringify(log.slice(-30)));
    } catch {}
    setTimeout(() => onSelectFeeling(feeling.suggestion || feeling.suggestedMode), 600);
  };

  return (
    <div className={`ws ${lightMode ? 'light' : ''}`}>
      {/* Header */}
      <div className="ws-header">
        <div className="ws-header-left">
          <span className="ws-date">{getDateStr()}</span>
          <h1 className="ws-greeting">{greeting.text}</h1>
        </div>
        <div className="ws-header-right">
          <button className="ws-discover-btn" onClick={onOpenSidebar}>
            {'\u2728'} Discover
          </button>
          <button className="ws-theme-toggle" onClick={toggleTheme} title={lightMode ? 'Dark mode' : 'Light mode'}>
            {lightMode ? '\u{1F319}' : '\u2600\uFE0F'}
          </button>
          <span className="ws-brand">Eva</span>
        </div>
      </div>

      {/* Profile Card */}
      <button className="ws-profile-card" onClick={onOpenProfile} style={{ width: '100%', border: 'none', textAlign: 'left' }}>
        <div className="ws-profile-avatar">
          {userName?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="ws-profile-info">
          <div className="ws-profile-name">{userName || 'Guest'}</div>
          <div className="ws-profile-meta">Tap to view your profile, mood history & memories</div>
        </div>
        <div className="ws-profile-streak">
          <span className="ws-profile-streak-num">{streak}</span>
          <span className="ws-profile-streak-label">🔥 day streak</span>
        </div>
      </button>

      {/* Hero Card with background image + weather */}
      <div className="ws-hero-card">
        <img className="ws-hero-video" src={HERO_BG} alt="" style={{ objectFit: 'cover' }} />
        <div className="ws-hero-overlay" />
        <div className="ws-hero-content">
          <div className="ws-hero-top-row">
            <p className="ws-hero-label">Today's thought</p>
            {weather && (
              <span className="ws-hero-weather">
                {weather.mood?.emoji} {weather.temp}°C {weather.city}
              </span>
            )}
          </div>
          <p className="ws-hero-text">{getDailyAffirmation()}</p>
          <button className="ws-hero-btn" onClick={() => onSelectMode('calm')}>
            Talk to Eva
          </button>
        </div>
      </div>

      {/* Feelings */}
      <div className="ws-section">
        <h2 className="ws-section-title">How are you feeling?</h2>
        <p className="ws-section-sub">Tap your mood and Eva will adapt to you</p>
        <div className="ws-feelings">
          {QUICK_MOODS.map((f) => (
            <button key={f.label}
              className={`ws-feeling ${selectedFeeling?.label === f.label ? 'active' : ''}`}
              onClick={() => handleFeelingClick({ ...f, suggestedMode: f.suggestion })}
              style={selectedFeeling?.label === f.label ? { borderColor: f.color, background: `${f.color}22` } : {}}>
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

      {/* Quick Start */}
      <div className="ws-section">
        <h2 className="ws-section-title">Quick Start</h2>
        <p className="ws-section-sub">Jump right into a conversation</p>
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

      {/* Explore Modes */}
      <div className="ws-section">
        <h2 className="ws-section-title">Explore Modes</h2>
        <p className="ws-section-sub">Each mode transforms Eva's personality completely</p>
        <div className="ws-rec-grid">
          {restModes.map((mode) => (
            <button key={mode.id} className="ws-rec-card"
              onClick={() => onSelectMode(mode.id)}
              onMouseEnter={() => setHoveredCard(mode.id)}
              onMouseLeave={() => setHoveredCard(null)}>
              <div className="ws-rec-img" style={{
                backgroundImage: `url(${MODE_IMAGES[mode.id]})`,
                backgroundColor: `${mode.accentColor}33`,
              }}>
                <div className={`ws-rec-img-overlay ${hoveredCard === mode.id ? 'hovered' : ''}`}
                  style={{ background: `linear-gradient(to top, #1a1520ee, ${mode.accentColor}44, transparent)` }} />
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

      {/* Quote */}
      <div className="ws-quote-card">
        <span className="ws-quote-label">From Eva</span>
        <p className="ws-quote-text">
          "This is your safe space. No judgments, no pretending. Just you, being you. I'm here whenever you need me."
        </p>
      </div>

      <div className="ws-privacy">
        <span>{'\uD83D\uDD12'} Your chats are private and stored on your device only</span>
      </div>
    </div>
  );
}
