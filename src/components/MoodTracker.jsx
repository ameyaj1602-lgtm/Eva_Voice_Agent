import React, { useState, useEffect } from 'react';

const MOODS = [
  { emoji: '\u{1F601}', label: 'Great', value: 5, color: '#38ef7d' },
  { emoji: '\u{1F60A}', label: 'Good', value: 4, color: '#4ecdc4' },
  { emoji: '\u{1F610}', label: 'Okay', value: 3, color: '#f5af19' },
  { emoji: '\u{1F614}', label: 'Low', value: 2, color: '#fcb69f' },
  { emoji: '\u{1F622}', label: 'Bad', value: 1, color: '#f5576c' },
];

function getMoodLog() {
  try { return JSON.parse(localStorage.getItem('eva-mood-log')) || []; }
  catch { return []; }
}

function saveMoodLog(log) {
  localStorage.setItem('eva-mood-log', JSON.stringify(log));
}

export default function MoodTracker({ isOpen, onClose, mode }) {
  const [log, setLog] = useState([]);
  const [todayLogged, setTodayLogged] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existing = getMoodLog();
      setLog(existing);
      const today = new Date().toDateString();
      setTodayLogged(existing.some((e) => new Date(e.date).toDateString() === today));
    }
  }, [isOpen]);

  const logMood = (mood) => {
    const entry = { ...mood, date: Date.now() };
    const updated = [...log, entry].slice(-30);
    setLog(updated);
    saveMoodLog(updated);
    setTodayLogged(true);
  };

  if (!isOpen) return null;

  const last7 = log.slice(-7);

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal mood-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Mood Tracker</h2>
          <button className="settings-close" onClick={onClose}>&times;</button>
        </div>
        <div className="settings-body">
          {!todayLogged ? (
            <div className="mood-today">
              <p className="mood-question">How are you feeling right now?</p>
              <div className="mood-options">
                {MOODS.map((m) => (
                  <button key={m.value} className="mood-btn" onClick={() => logMood(m)}
                    style={{ '--mood-color': m.color }}>
                    <span className="mood-emoji">{m.emoji}</span>
                    <span className="mood-label">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="mood-done" style={{ color: mode.accentColor }}>
              You've logged your mood today. See you tomorrow!
            </p>
          )}

          {last7.length > 0 && (
            <div className="mood-history">
              <h3>Last 7 Days</h3>
              <div className="mood-chart">
                {last7.map((entry, i) => (
                  <div key={i} className="mood-bar-col">
                    <div className="mood-bar" style={{
                      height: `${entry.value * 20}%`,
                      backgroundColor: entry.color,
                    }} />
                    <span className="mood-bar-emoji">{entry.emoji}</span>
                    <span className="mood-bar-day">
                      {new Date(entry.date).toLocaleDateString([], { weekday: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
