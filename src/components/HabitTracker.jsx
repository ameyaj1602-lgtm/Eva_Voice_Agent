import React, { useState, useEffect } from 'react';

const DEFAULT_HABITS = [
  { id: 'meditate', name: 'Meditate', emoji: '🧘' },
  { id: 'journal', name: 'Journal', emoji: '📝' },
  { id: 'exercise', name: 'Exercise', emoji: '💪' },
  { id: 'water', name: 'Drink Water', emoji: '💧' },
  { id: 'sleep', name: 'Sleep 7h+', emoji: '😴' },
  { id: 'gratitude', name: 'Gratitude', emoji: '🙏' },
];

function getHabitData() {
  try { return JSON.parse(localStorage.getItem('eva-habits')) || { habits: DEFAULT_HABITS, log: {} }; }
  catch { return { habits: DEFAULT_HABITS, log: {} }; }
}
function saveHabitData(data) { localStorage.setItem('eva-habits', JSON.stringify(data)); }

export default function HabitTracker({ isOpen, onClose, mode }) {
  const [data, setData] = useState(getHabitData);
  const [newHabit, setNewHabit] = useState('');

  if (!isOpen) return null;

  const today = new Date().toDateString();
  const todayLog = data.log[today] || {};
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    return d.toDateString();
  });

  const toggleHabit = (habitId) => {
    const updated = { ...data };
    if (!updated.log[today]) updated.log[today] = {};
    updated.log[today][habitId] = !updated.log[today][habitId];
    setData(updated);
    saveHabitData(updated);
  };

  const addHabit = () => {
    if (!newHabit.trim()) return;
    const id = newHabit.toLowerCase().replace(/\s+/g, '-');
    const updated = { ...data, habits: [...data.habits, { id, name: newHabit.trim(), emoji: '✅' }] };
    setData(updated);
    saveHabitData(updated);
    setNewHabit('');
  };

  const removeHabit = (id) => {
    const updated = { ...data, habits: data.habits.filter(h => h.id !== id) };
    setData(updated);
    saveHabitData(updated);
  };

  // Streak for each habit
  const getStreak = (habitId) => {
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(Date.now() - i * 86400000).toDateString();
      if (data.log[d]?.[habitId]) streak++;
      else break;
    }
    return streak;
  };

  const completedToday = data.habits.filter(h => todayLog[h.id]).length;
  const totalHabits = data.habits.length;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480, maxHeight: '90vh' }}>
        <div className="settings-header">
          <h2>Habit Tracker</h2>
          <button className="settings-close" onClick={onClose}>&times;</button>
        </div>
        <div className="settings-body" style={{ overflowY: 'auto' }}>
          {/* Progress */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: mode.accentColor }}>
              {completedToday}/{totalHabits}
            </span>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>completed today</p>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 8 }}>
              <div style={{ height: '100%', width: `${(completedToday / totalHabits) * 100}%`, background: mode.accentColor, borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
          </div>

          {/* Habit list */}
          {data.habits.map(h => {
            const done = !!todayLog[h.id];
            const streak = getStreak(h.id);
            return (
              <div key={h.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                background: done ? `${mode.accentColor}11` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${done ? mode.accentColor + '33' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 12, marginBottom: 8, cursor: 'pointer', transition: 'all 0.2s',
              }} onClick={() => toggleHabit(h.id)}>
                <span style={{ fontSize: 24 }}>{done ? '✅' : h.emoji}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.6 : 1 }}>{h.name}</span>
                  {streak > 0 && <span style={{ fontSize: 11, color: mode.accentColor, marginLeft: 8 }}>{streak}d streak 🔥</span>}
                </div>
                {/* 7-day dots */}
                <div style={{ display: 'flex', gap: 3 }}>
                  {last7Days.map((d, i) => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: data.log[d]?.[h.id] ? mode.accentColor : 'rgba(255,255,255,0.1)',
                    }} />
                  ))}
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeHabit(h.id); }}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: 16, cursor: 'pointer', padding: 4 }}>&times;</button>
              </div>
            );
          })}

          {/* Add habit */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input style={{
              flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none',
            }} placeholder="Add new habit..." value={newHabit} onChange={e => setNewHabit(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addHabit()} />
            <button onClick={addHabit} style={{
              padding: '10px 16px', borderRadius: 10, border: 'none', background: mode.accentColor,
              color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>Add</button>
          </div>
        </div>
      </div>
    </div>
  );
}
