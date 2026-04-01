import React, { useEffect, useState } from 'react';

function getStreakData() {
  try { return JSON.parse(localStorage.getItem('eva-streak')) || { dates: [], current: 0, best: 0 }; }
  catch { return { dates: [], current: 0, best: 0 }; }
}

function saveStreakData(d) { localStorage.setItem('eva-streak', JSON.stringify(d)); }

export function recordVisit() {
  const data = getStreakData();
  const today = new Date().toDateString();
  if (data.dates.includes(today)) return data;

  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const isConsecutive = data.dates.includes(yesterday);

  data.dates.push(today);
  data.dates = data.dates.slice(-365); // keep 1 year
  data.current = isConsecutive ? data.current + 1 : 1;
  data.best = Math.max(data.best, data.current);

  saveStreakData(data);
  return data;
}

export default function StreakTracker({ isOpen, onClose, mode }) {
  const [data, setData] = useState({ dates: [], current: 0, best: 0 });

  useEffect(() => {
    if (isOpen) setData(getStreakData());
  }, [isOpen]);

  if (!isOpen) return null;

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    return {
      day: d.toLocaleDateString([], { weekday: 'short' }),
      date: d.toDateString(),
      active: data.dates.includes(d.toDateString()),
    };
  });

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Your Streak</h2>
          <button className="settings-close" onClick={onClose}>&times;</button>
        </div>
        <div className="settings-body" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{'\uD83D\uDD25'}</div>
          <div style={{ fontSize: 42, fontWeight: 700, color: mode.accentColor }}>{data.current}</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>day streak</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Best: {data.best} days</div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '24px 0' }}>
            {last7.map((d, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: d.active ? mode.accentColor : 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: d.active ? '#fff' : 'rgba(255,255,255,0.2)',
                }}>
                  {d.active ? '\u2713' : '\u00B7'}
                </div>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{d.day}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
            {data.current >= 7 ? "Amazing! You're on fire! Keep it going!" :
             data.current >= 3 ? "Great consistency! You're building a habit." :
             "Every journey starts with a single step. Keep coming back!"}
          </p>
        </div>
      </div>
    </div>
  );
}
