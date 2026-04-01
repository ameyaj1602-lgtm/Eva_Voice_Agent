import React, { useState } from 'react';

export default function VoicePicker({ voices, selectedVoice, onVoiceChange, mode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [testing, setTesting] = useState(null);

  const testVoice = (voice) => {
    window.speechSynthesis.cancel();
    setTesting(voice.name);
    const u = new SpeechSynthesisUtterance('Hello, I am Eva, your personal voice companion.');
    u.voice = voice;
    u.rate = 0.9;
    u.pitch = 1.0;
    u.onend = () => setTesting(null);
    u.onerror = () => setTesting(null);
    window.speechSynthesis.speak(u);
  };

  // Group voices by language
  const grouped = {};
  voices.forEach((v) => {
    const lang = v.lang?.split('-')[0] || 'other';
    if (!grouped[lang]) grouped[lang] = [];
    grouped[lang].push(v);
  });

  // Show English first, then others
  const langOrder = ['en', ...Object.keys(grouped).filter(l => l !== 'en').sort()];

  return (
    <div className="voice-picker">
      <button
        className="toolbar-labeled"
        onClick={() => setIsOpen(!isOpen)}
        title={selectedVoice ? `Voice: ${selectedVoice.name}` : 'Choose voice'}
      >
        <span>{'🔊'}</span>
        <span className="toolbar-text">Voice</span>
      </button>

      {isOpen && (
        <>
          <div className="voice-picker-backdrop" onClick={() => setIsOpen(false)} />
          <div className="voice-picker-dropdown">
            <div className="voice-picker-header">
              <h3>Eva's Voice</h3>
              <button className="voice-picker-close" onClick={() => setIsOpen(false)}>&times;</button>
            </div>
            <div className="voice-picker-list">
              {langOrder.map((lang) => {
                const langVoices = grouped[lang];
                if (!langVoices) return null;
                return (
                  <div key={lang} className="voice-picker-group">
                    <div className="voice-picker-lang">{lang.toUpperCase()}</div>
                    {langVoices.map((v) => (
                      <div
                        key={v.name}
                        className={`voice-picker-item ${selectedVoice?.name === v.name ? 'active' : ''}`}
                        style={selectedVoice?.name === v.name ? { borderColor: mode.accentColor } : {}}
                      >
                        <button
                          className="voice-picker-select"
                          onClick={() => { onVoiceChange(v); setIsOpen(false); }}
                        >
                          <span className="voice-picker-name">{v.name}</span>
                          {selectedVoice?.name === v.name && (
                            <span className="voice-picker-check" style={{ color: mode.accentColor }}>&#10003;</span>
                          )}
                        </button>
                        <button
                          className="voice-picker-test"
                          onClick={() => testVoice(v)}
                          style={{ color: mode.accentColor, borderColor: mode.accentColor }}
                        >
                          {testing === v.name ? '...' : '▶'}
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
