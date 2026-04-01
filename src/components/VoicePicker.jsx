import React, { useState, useEffect } from 'react';

const PRESETS = [
  { name: 'Calm & Soft', rate: 0.8, pitch: 0.9, icon: '🌿' },
  { name: 'Natural', rate: 0.95, pitch: 1.0, icon: '🎵' },
  { name: 'Warm & Slow', rate: 0.75, pitch: 0.85, icon: '💛' },
  { name: 'Sharp & Clear', rate: 1.05, pitch: 1.1, icon: '✨' },
  { name: 'Energetic', rate: 1.15, pitch: 1.15, icon: '🔥' },
  { name: 'Deep & Low', rate: 0.85, pitch: 0.7, icon: '🎭' },
];

// Primary languages shown by default
const PRIMARY_LANGS = ['en', 'hi', 'mr'];
const LANG_NAMES = {
  en: 'English', hi: 'Hindi', mr: 'Marathi',
  es: 'Spanish', fr: 'French', de: 'German', it: 'Italian', pt: 'Portuguese',
  ja: 'Japanese', ko: 'Korean', zh: 'Chinese', ar: 'Arabic', ru: 'Russian',
  nl: 'Dutch', pl: 'Polish', tr: 'Turkish', sv: 'Swedish', da: 'Danish',
  fi: 'Finnish', nb: 'Norwegian', cs: 'Czech', el: 'Greek', he: 'Hebrew',
  id: 'Indonesian', ms: 'Malay', th: 'Thai', vi: 'Vietnamese', ro: 'Romanian',
  hu: 'Hungarian', uk: 'Ukrainian', sk: 'Slovak', bg: 'Bulgarian', hr: 'Croatian',
  ca: 'Catalan', eu: 'Basque', gl: 'Galician', ta: 'Tamil', te: 'Telugu',
  bn: 'Bengali', gu: 'Gujarati', kn: 'Kannada', ml: 'Malayalam', pa: 'Punjabi',
  ur: 'Urdu',
};

export default function VoicePicker({ voices, selectedVoice, onVoiceChange, mode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [testing, setTesting] = useState(null);
  const [tab, setTab] = useState('voices');
  const [search, setSearch] = useState('');
  const [showAllLangs, setShowAllLangs] = useState(false);

  const [rate, setRate] = useState(() => {
    try { return parseFloat(localStorage.getItem('eva-voice-rate')) || 0.9; } catch { return 0.9; }
  });
  const [pitch, setPitch] = useState(() => {
    try { return parseFloat(localStorage.getItem('eva-voice-pitch')) || 1.0; } catch { return 1.0; }
  });
  const [volume, setVolume] = useState(() => {
    try { return parseFloat(localStorage.getItem('eva-voice-volume')) || 0.85; } catch { return 0.85; }
  });

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

  // Group voices by language
  const grouped = {};
  voices.forEach((v) => {
    const lang = v.lang?.split('-')[0] || 'other';
    if (!grouped[lang]) grouped[lang] = [];
    grouped[lang].push(v);
  });

  // Filter by search
  const searchLower = search.toLowerCase();
  const filteredGrouped = {};
  Object.entries(grouped).forEach(([lang, langVoices]) => {
    const langName = (LANG_NAMES[lang] || lang).toLowerCase();
    const filtered = langVoices.filter((v) => {
      if (!search) return true;
      return v.name.toLowerCase().includes(searchLower) || langName.includes(searchLower) || lang.includes(searchLower);
    });
    if (filtered.length > 0) filteredGrouped[lang] = filtered;
  });

  // Split into primary and secondary languages
  const primaryLangs = PRIMARY_LANGS.filter(l => filteredGrouped[l]);
  const secondaryLangs = Object.keys(filteredGrouped).filter(l => !PRIMARY_LANGS.includes(l)).sort();

  // When searching, show all matching languages
  const visibleSecondary = search ? secondaryLangs : (showAllLangs ? secondaryLangs : []);

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
              <>
                {/* Search bar */}
                <div className="vp-search">
                  <input
                    type="text"
                    className="vp-search-input"
                    placeholder="Search voice or language..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                  />
                  {search && (
                    <button className="vp-search-clear" onClick={() => setSearch('')}>&times;</button>
                  )}
                </div>

                <div className="voice-picker-list">
                  {/* Primary languages: EN, HI, MR */}
                  {primaryLangs.map((lang) => (
                    <div key={lang} className="voice-picker-group">
                      <div className="voice-picker-lang">{LANG_NAMES[lang] || lang.toUpperCase()}</div>
                      {filteredGrouped[lang].map((v) => (
                        <div
                          key={v.name}
                          className={`voice-picker-item ${selectedVoice?.name === v.name ? 'active' : ''}`}
                          style={selectedVoice?.name === v.name ? { borderColor: mode.accentColor } : {}}
                        >
                          <button className="voice-picker-select" onClick={() => onVoiceChange(v)}>
                            <span className="voice-picker-name">{v.name}</span>
                            {selectedVoice?.name === v.name && (
                              <span className="voice-picker-check" style={{ color: mode.accentColor }}>&#10003;</span>
                            )}
                          </button>
                          <button className="voice-picker-test" onClick={() => testVoice(v)}
                            style={{ color: mode.accentColor, borderColor: mode.accentColor }}>
                            {testing === v.name ? '...' : '▶'}
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Secondary languages (hidden by default) */}
                  {visibleSecondary.map((lang) => (
                    <div key={lang} className="voice-picker-group">
                      <div className="voice-picker-lang">{LANG_NAMES[lang] || lang.toUpperCase()}</div>
                      {filteredGrouped[lang].map((v) => (
                        <div
                          key={v.name}
                          className={`voice-picker-item ${selectedVoice?.name === v.name ? 'active' : ''}`}
                          style={selectedVoice?.name === v.name ? { borderColor: mode.accentColor } : {}}
                        >
                          <button className="voice-picker-select" onClick={() => onVoiceChange(v)}>
                            <span className="voice-picker-name">{v.name}</span>
                            {selectedVoice?.name === v.name && (
                              <span className="voice-picker-check" style={{ color: mode.accentColor }}>&#10003;</span>
                            )}
                          </button>
                          <button className="voice-picker-test" onClick={() => testVoice(v)}
                            style={{ color: mode.accentColor, borderColor: mode.accentColor }}>
                            {testing === v.name ? '...' : '▶'}
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Show more / less toggle */}
                  {!search && secondaryLangs.length > 0 && (
                    <button className="vp-show-more" onClick={() => setShowAllLangs(!showAllLangs)}
                      style={{ color: mode.accentColor }}>
                      {showAllLangs
                        ? 'Hide other languages ▲'
                        : `Show ${secondaryLangs.length} more languages ▼`}
                    </button>
                  )}

                  {Object.keys(filteredGrouped).length === 0 && (
                    <p className="vp-no-results">No voices found for "{search}"</p>
                  )}
                </div>
              </>
            )}

            {/* Tune tab */}
            {tab === 'tune' && (
              <div className="vp-tune">
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
