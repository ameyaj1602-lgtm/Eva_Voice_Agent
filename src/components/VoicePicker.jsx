import React, { useState, useEffect } from 'react';

const PRESETS = [
  { name: 'Calm & Soft', rate: 0.8, pitch: 0.9, icon: '🌿' },
  { name: 'Natural', rate: 0.95, pitch: 1.0, icon: '🎵' },
  { name: 'Warm & Slow', rate: 0.75, pitch: 0.85, icon: '💛' },
  { name: 'Sharp & Clear', rate: 1.05, pitch: 1.1, icon: '✨' },
  { name: 'Energetic', rate: 1.15, pitch: 1.15, icon: '🔥' },
  { name: 'Deep & Low', rate: 0.85, pitch: 0.7, icon: '🎭' },
];

export default function VoicePicker({ voices, selectedVoice, onVoiceChange, mode, onSaveVoiceSettings }) {
  const [isOpen, setIsOpen] = useState(false);
  const [testing, setTesting] = useState(null);
  const [tab, setTab] = useState('voices'); // 'voices' or 'tune'

  // Voice tuning state - load from localStorage
  const [rate, setRate] = useState(() => {
    try { return parseFloat(localStorage.getItem('eva-voice-rate')) || 0.9; } catch { return 0.9; }
  });
  const [pitch, setPitch] = useState(() => {
    try { return parseFloat(localStorage.getItem('eva-voice-pitch')) || 1.0; } catch { return 1.0; }
  });
  const [volume, setVolume] = useState(() => {
    try { return parseFloat(localStorage.getItem('eva-voice-volume')) || 0.85; } catch { return 0.85; }
  });

  // Save tuning to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('eva-voice-rate', rate);
    localStorage.setItem('eva-voice-pitch', pitch);
    localStorage.setItem('eva-voice-volume', volume);
  }, [rate, pitch, volume]);

  const testVoice = (voice, customRate, customPitch) => {
    window.speechSynthesis.cancel();
    setTesting(voice?.name || 'preview');
    const u = new SpeechSynthesisUtterance('Hello, I am Eva, your personal voice companion. How does this sound?');
    if (voice) u.voice = voice;
    u.rate = customRate ?? rate;
    u.pitch = customPitch ?? pitch;
    u.volume = volume;
    u.onend = () => setTesting(null);
    u.onerror = () => setTesting(null);
    window.speechSynthesis.speak(u);
  };

  const applyPreset = (preset) => {
    setRate(preset.rate);
    setPitch(preset.pitch);
    testVoice(selectedVoice, preset.rate, preset.pitch);
  };

  // Group voices by language, only show quality voices
  const grouped = {};
  voices.forEach((v) => {
    const lang = v.lang?.split('-')[0] || 'other';
    if (!grouped[lang]) grouped[lang] = [];
    grouped[lang].push(v);
  });
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

            {/* Tabs */}
            <div className="vp-tabs">
              <button className={`vp-tab ${tab === 'voices' ? 'active' : ''}`}
                style={tab === 'voices' ? { color: mode.accentColor, borderColor: mode.accentColor } : {}}
                onClick={() => setTab('voices')}>
                Voices
              </button>
              <button className={`vp-tab ${tab === 'tune' ? 'active' : ''}`}
                style={tab === 'tune' ? { color: mode.accentColor, borderColor: mode.accentColor } : {}}
                onClick={() => setTab('tune')}>
                Tune Voice
              </button>
            </div>

            {/* Voices tab */}
            {tab === 'voices' && (
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
                            onClick={() => { onVoiceChange(v); }}
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
            )}

            {/* Tune tab */}
            {tab === 'tune' && (
              <div className="vp-tune">
                {/* Presets */}
                <div className="vp-presets-label">Quick Presets</div>
                <div className="vp-presets">
                  {PRESETS.map((p) => (
                    <button key={p.name} className="vp-preset-btn" onClick={() => applyPreset(p)}
                      style={{ borderColor: `${mode.accentColor}33` }}>
                      <span>{p.icon}</span>
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>

                {/* Sliders */}
                <div className="vp-slider-group">
                  <div className="vp-slider-row">
                    <label>Speed</label>
                    <span className="vp-slider-value">{rate.toFixed(2)}x</span>
                  </div>
                  <input type="range" min="0.5" max="1.5" step="0.05" value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    style={{ accentColor: mode.accentColor }} />
                  <div className="vp-slider-labels"><span>Slower</span><span>Faster</span></div>
                </div>

                <div className="vp-slider-group">
                  <div className="vp-slider-row">
                    <label>Pitch</label>
                    <span className="vp-slider-value">{pitch.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0.5" max="1.5" step="0.05" value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    style={{ accentColor: mode.accentColor }} />
                  <div className="vp-slider-labels"><span>Deeper</span><span>Higher</span></div>
                </div>

                <div className="vp-slider-group">
                  <div className="vp-slider-row">
                    <label>Volume</label>
                    <span className="vp-slider-value">{Math.round(volume * 100)}%</span>
                  </div>
                  <input type="range" min="0.2" max="1.0" step="0.05" value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    style={{ accentColor: mode.accentColor }} />
                  <div className="vp-slider-labels"><span>Quiet</span><span>Loud</span></div>
                </div>

                {/* Preview button */}
                <button className="vp-preview-btn" onClick={() => testVoice(selectedVoice)}
                  style={{ backgroundColor: mode.accentColor }}>
                  {testing ? 'Playing...' : '▶ Preview Voice'}
                </button>

                <p className="vp-tune-hint">
                  Current: {selectedVoice?.name || 'Default'} — {rate.toFixed(2)}x speed, {pitch.toFixed(2)} pitch
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
