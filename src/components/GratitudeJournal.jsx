import React, { useState, useEffect } from 'react';

function getEntries() {
  try { return JSON.parse(localStorage.getItem('eva-gratitude')) || []; } catch { return []; }
}
function saveEntries(e) { localStorage.setItem('eva-gratitude', JSON.stringify(e.slice(-90))); }

export default function GratitudeJournal({ isOpen, onClose, mode }) {
  const [entries, setEntries] = useState([]);
  const [inputs, setInputs] = useState(['', '', '']);
  const [todayDone, setTodayDone] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const all = getEntries();
    setEntries(all);
    const today = new Date().toDateString();
    setTodayDone(all.some((e) => new Date(e.date).toDateString() === today));
  }, [isOpen]);

  const handleSave = () => {
    const filled = inputs.filter((i) => i.trim());
    if (filled.length === 0) return;
    const entry = { date: Date.now(), items: filled };
    const updated = [...entries, entry];
    setEntries(updated);
    saveEntries(updated);
    setTodayDone(true);
    setInputs(['', '', '']);
  };

  if (!isOpen) return null;

  const recent = entries.slice(-7).reverse();

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Gratitude Journal</h2>
          <button className="settings-close" onClick={onClose}>&times;</button>
        </div>
        <div className="settings-body">
          {!todayDone ? (
            <div className="gratitude-today">
              <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 16, fontStyle: 'italic' }}>
                What are 3 things you're grateful for today?
              </p>
              {inputs.map((val, i) => (
                <input key={i} className="settings-input" style={{ marginBottom: 8 }}
                  placeholder={`${i + 1}. I'm grateful for...`}
                  value={val} onChange={(e) => {
                    const next = [...inputs]; next[i] = e.target.value; setInputs(next);
                  }} />
              ))}
              <button className="settings-save-btn" onClick={handleSave}
                style={{ backgroundColor: mode.accentColor, marginTop: 12 }}
                disabled={!inputs.some((i) => i.trim())}>
                Save Today's Gratitude
              </button>
            </div>
          ) : (
            <p style={{ color: mode.accentColor, textAlign: 'center', padding: 16, fontStyle: 'italic' }}>
              You've journaled today. Beautiful! See you tomorrow.
            </p>
          )}

          {recent.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>Recent Entries</h3>
              {recent.map((entry, i) => (
                <div key={i} style={{ marginBottom: 12, padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                  {entry.items.map((item, j) => (
                    <p key={j} style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                      {'\u2728'} {item}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
