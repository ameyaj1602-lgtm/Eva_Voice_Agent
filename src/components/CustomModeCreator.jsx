import React, { useState } from 'react';

const GRADIENT_PRESETS = [
  { name: 'Ocean', value: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' },
  { name: 'Sunset', value: 'linear-gradient(135deg, #f12711, #f5af19)' },
  { name: 'Purple', value: 'linear-gradient(135deg, #8e2de2, #4a00e0)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #134e5e, #71b280)' },
  { name: 'Cherry', value: 'linear-gradient(135deg, #eb3349, #f45c43)' },
  { name: 'Night', value: 'linear-gradient(135deg, #0c0c1d, #1a1a3e, #2d2d6b)' },
  { name: 'Gold', value: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)' },
  { name: 'Candy', value: 'linear-gradient(135deg, #f093fb, #f5576c)' },
];

const ACCENT_COLORS = [
  '#4ecdc4', '#f5af19', '#e91e63', '#a78bfa', '#fcb69f', '#7c83ff',
  '#38ef7d', '#f5576c', '#e2b714', '#ff6b6b', '#00b4d8', '#95e1d3',
];

export default function CustomModeCreator({ isOpen, onClose, onCreateMode }) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [description, setDescription] = useState('');
  const [personality, setPersonality] = useState('');
  const [gradient, setGradient] = useState(GRADIENT_PRESETS[0].value);
  const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0]);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!name.trim() || !personality.trim()) return;
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    onCreateMode({
      id,
      name: name.trim(),
      emoji: emoji || '\u2728',
      description: description.trim() || `Custom ${name} mode`,
      gradient,
      accentColor,
      glowColor: `${accentColor}66`,
      pulseSpeed: '3s',
      voiceStyle: 'custom',
      systemPrompt: personality.trim(),
    });
    onClose();
    setName(''); setEmoji(''); setDescription(''); setPersonality('');
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Create Custom Mode</h2>
          <button className="settings-close" onClick={onClose}>&times;</button>
        </div>
        <div className="settings-body">
          <div className="settings-section">
            <h3>Mode Name</h3>
            <input className="settings-input" placeholder="e.g., My Best Friend"
              value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="settings-section">
            <h3>Emoji</h3>
            <input className="settings-input" placeholder="e.g., \u{1F31F}" maxLength={2}
              value={emoji} onChange={(e) => setEmoji(e.target.value)}
              style={{ width: 80, fontSize: 24, textAlign: 'center' }} />
          </div>

          <div className="settings-section">
            <h3>Short Description</h3>
            <input className="settings-input" placeholder="e.g., Wise and caring mentor"
              value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="settings-section">
            <h3>Personality (How should Eva behave?)</h3>
            <textarea className="settings-input custom-textarea"
              placeholder="Describe the personality in detail... e.g., 'You are a wise grandmother who tells stories from the old days. Be warm, use metaphors, and always end with a life lesson.'"
              value={personality} onChange={(e) => setPersonality(e.target.value)} rows={4} />
          </div>

          <div className="settings-section">
            <h3>Theme Color</h3>
            <div className="color-picker-row">
              {ACCENT_COLORS.map((c) => (
                <button key={c} className={`color-dot ${accentColor === c ? 'active' : ''}`}
                  style={{ backgroundColor: c }} onClick={() => setAccentColor(c)} />
              ))}
            </div>
          </div>

          <div className="settings-section">
            <h3>Background</h3>
            <div className="gradient-picker-row">
              {GRADIENT_PRESETS.map((g) => (
                <button key={g.name}
                  className={`gradient-dot ${gradient === g.value ? 'active' : ''}`}
                  style={{ background: g.value }} onClick={() => setGradient(g.value)}
                  title={g.name} />
              ))}
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="settings-save-btn" onClick={handleCreate}
            disabled={!name.trim() || !personality.trim()}
            style={{ backgroundColor: accentColor }}>
            Create Mode
          </button>
        </div>
      </div>
    </div>
  );
}
