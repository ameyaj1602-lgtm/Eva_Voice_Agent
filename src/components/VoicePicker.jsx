import React, { useState, useEffect } from 'react';

const PRESETS = [
  { name: 'Calm & Soft', rate: 0.8, pitch: 0.9, icon: '🌿' },
  { name: 'Natural', rate: 0.95, pitch: 1.0, icon: '🎵' },
  { name: 'Warm & Slow', rate: 0.75, pitch: 0.85, icon: '💛' },
  { name: 'Sharp & Clear', rate: 1.05, pitch: 1.1, icon: '✨' },
  { name: 'Energetic', rate: 1.15, pitch: 1.15, icon: '🔥' },
  { name: 'Deep & Low', rate: 0.85, pitch: 0.7, icon: '🎭' },
];

const PRIMARY_LANGS = ['en', 'hi', 'mr'];
const LANG_NAMES = {
  en: 'English', hi: 'Hindi', mr: 'Marathi',
  es: 'Spanish', fr: 'French', de: 'German', it: 'Italian', pt: 'Portuguese',
  ja: 'Japanese', ko: 'Korean', zh: 'Chinese', ar: 'Arabic', ru: 'Russian',
  nl: 'Dutch', pl: 'Polish', tr: 'Turkish', sv: 'Swedish', da: 'Danish',
  fi: 'Finnish', nb: 'Norwegian', cs: 'Czech', el: 'Greek', he: 'Hebrew',
  id: 'Indonesian', ms: 'Malay', th: 'Thai', vi: 'Vietnamese', ro: 'Romanian',
  hu: 'Hungarian', uk: 'Ukrainian', sk: 'Slovak', bg: 'Bulgarian', hr: 'Croatian',
  ta: 'Tamil', te: 'Telugu', bn: 'Bengali', gu: 'Gujarati', kn: 'Kannada',
  ml: 'Malayalam', pa: 'Punjabi', ur: 'Urdu',
};

// Known male voice names (macOS/Chrome) - everything else assumed female
const MALE_VOICES = new Set([
  'Albert', 'Daniel', 'Fred', 'Ralph', 'Junior', 'Rishi',
  'Eddy', 'Grandpa', 'Reed', 'Rocko',
  // Common across platforms
  'Google UK English Male', 'Google US English Male', 'Microsoft David',
  'Microsoft Mark', 'Alex', 'Bruce', 'Tom',
]);

function isMaleVoice(name) {
  if (MALE_VOICES.has(name)) return true;
  // Check if name contains known male identifiers
  const lower = name.toLowerCase();
  return lower.includes('male') || lower.includes('grandpa') ||
    MALE_VOICES.has(name.split(' (')[0]); // Handle "Eddy (English (United States))"
}

export default function VoicePicker({ voices, selectedVoice, onVoiceChange, mode, clonedVoices }) {
  const [isOpen, setIsOpen] = useState(false);
  const [testing, setTesting] = useState(null);
  const [tab, setTab] = useState('voices');
  const [search, setSearch] = useState('');
  const [showAllLangs, setShowAllLangs] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deployed, setDeployed] = useState(false);

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

  const stopTest = () => {
    window.speechSynthesis.cancel();
    setTesting(null);
  };

  const testVoice = (voice, customRate, customPitch) => {
    window.speechSynthesis.cancel();
    setTesting(voice?.name || 'preview');
    const u = new SpeechSynthesisUtterance('Hello, I am Eva, your personal voice companion. I am here to help you feel calm and supported.');
    if (voice) u.voice = voice;
    u.rate = customRate ?? rate;
    u.pitch = customPitch ?? pitch;
    u.volume = volume;
    u.onend = () => setTesting(null);
    u.onerror = () => setTesting(null);
    window.speechSynthesis.speak(u);
  };

  const selectAndDeploy = (voice) => {
    stopTest();
    onVoiceChange(voice);
    localStorage.setItem('eva-voice-name', voice.name);
    localStorage.setItem('eva-voice-rate', rate);
    localStorage.setItem('eva-voice-pitch', pitch);
    localStorage.setItem('eva-voice-volume', volume);
    setDeployed(true);
    setSaved(true);
    setTimeout(() => { setDeployed(false); setSaved(false); }, 2000);
  };

  const applyPreset = (preset) => {
    setRate(preset.rate);
    setPitch(preset.pitch);
    testVoice(selectedVoice, preset.rate, preset.pitch);
  };

  // Group voices by language, then split female/male within each
  const grouped = {};
  voices.forEach((v) => {
    const lang = v.lang?.split('-')[0] || 'other';
    if (!grouped[lang]) grouped[lang] = { female: [], male: [] };
    if (isMaleVoice(v.name)) {
      grouped[lang].male.push(v);
    } else {
      grouped[lang].female.push(v);
    }
  });

  const searchLower = search.toLowerCase();
  const filteredGrouped = {};
  Object.entries(grouped).forEach(([lang, { female, male }]) => {
    const langName = (LANG_NAMES[lang] || lang).toLowerCase();
    const filterFn = (v) => !search || v.name.toLowerCase().includes(searchLower) || langName.includes(searchLower) || lang.includes(searchLower);
    const ff = female.filter(filterFn);
    const fm = male.filter(filterFn);
    if (ff.length > 0 || fm.length > 0) filteredGrouped[lang] = { female: ff, male: fm };
  });

  const primaryLangs = PRIMARY_LANGS.filter(l => filteredGrouped[l]);
  const secondaryLangs = Object.keys(filteredGrouped).filter(l => !PRIMARY_LANGS.includes(l)).sort();
  const visibleSecondary = search ? secondaryLangs : (showAllLangs ? secondaryLangs : []);

  const renderVoiceItem = (v) => {
    const isActive = selectedVoice?.name === v.name;
    const isTesting = testing === v.name;
    return (
      <div key={v.name} className={`voice-picker-item ${isActive ? 'active' : ''}`}
        style={isActive ? { borderColor: mode.accentColor } : {}}>
        <button className="voice-picker-select" onClick={() => selectAndDeploy(v)}>
          <span className="voice-picker-name">{v.name}</span>
          {isActive && <span className="voice-picker-check" style={{ color: mode.accentColor }}>&#10003;</span>}
        </button>
        <button className={`voice-picker-test ${isTesting ? 'playing' : ''}`}
          onClick={() => isTesting ? stopTest() : testVoice(v)}
          style={{ color: isTesting ? '#ff4444' : mode.accentColor, borderColor: isTesting ? '#ff4444' : mode.accentColor }}>
          {isTesting ? '■' : '▶'}
        </button>
      </div>
    );
  };

  const renderLangGroup = (lang) => {
    const data = filteredGrouped[lang];
    if (!data) return null;
    return (
      <div key={lang} className="voice-picker-group">
        <div className="voice-picker-lang">{LANG_NAMES[lang] || lang.toUpperCase()}</div>
        {data.female.length > 0 && (
          <>
            <div className="vp-gender-label">Female</div>
            {data.female.map(renderVoiceItem)}
          </>
        )}
        {data.male.length > 0 && (
          <>
            <div className="vp-gender-label">Male</div>
            {data.male.map(renderVoiceItem)}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="voice-picker">
      <button className="toolbar-labeled" onClick={() => setIsOpen(!isOpen)}
        title={selectedVoice ? `Voice: ${selectedVoice.name}` : 'Choose voice'}>
        <span>{'🔊'}</span>
        <span className="toolbar-text">Voice</span>
      </button>

      {isOpen && (
        <>
          <div className="voice-picker-backdrop" onClick={() => { stopTest(); setIsOpen(false); }} />
          <div className="voice-picker-dropdown">
            {/* Header with current voice shown */}
            <div className="voice-picker-header">
              <div>
                <h3>Eva's Voice</h3>
                <p className="vp-current-voice">
                  Current: <strong style={{ color: mode.accentColor }}>{selectedVoice?.name || 'Default'}</strong>
                  {deployed && <span className="vp-deployed-tag">Deployed!</span>}
                </p>
              </div>
              <button className="voice-picker-close" onClick={() => { stopTest(); setIsOpen(false); }}>&times;</button>
            </div>

            {/* Stop bar */}
            {testing && (
              <div className="vp-stop-bar">
                <span>Testing: {testing}</span>
                <button className="vp-stop-btn" onClick={stopTest}>&#9724; Stop</button>
              </div>
            )}

            <div className="vp-tabs">
              <button className={`vp-tab ${tab === 'voices' ? 'active' : ''}`}
                style={tab === 'voices' ? { color: mode.accentColor, borderColor: mode.accentColor } : {}}
                onClick={() => setTab('voices')}>Voices</button>
              <button className={`vp-tab ${tab === 'tune' ? 'active' : ''}`}
                style={tab === 'tune' ? { color: mode.accentColor, borderColor: mode.accentColor } : {}}
                onClick={() => setTab('tune')}>Tune Voice</button>
            </div>

            {tab === 'voices' && (
              <>
                <div className="vp-search">
                  <input type="text" className="vp-search-input" placeholder="Search voice or language..."
                    value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
                  {search && <button className="vp-search-clear" onClick={() => setSearch('')}>&times;</button>}
                </div>

                <div className="voice-picker-list">
                  {/* Cloned voices at top */}
                  {clonedVoices && Object.keys(clonedVoices).filter(k => k !== 'default').length > 0 && (!search || 'cloned my voice'.includes(searchLower) || Object.values(clonedVoices).some(v => (v?.name || '').toLowerCase().includes(searchLower))) && (
                    <div className="voice-picker-group">
                      <div className="voice-picker-lang">MY VOICES</div>
                      {Object.entries(clonedVoices).filter(([k]) => k !== 'default').map(([vname, data]) => {
                        const name = typeof data === 'object' ? data.name : vname;
                        if (search && !name.toLowerCase().includes(searchLower) && !'cloned my voice'.includes(searchLower)) return null;
                        return (
                          <div key={`cloned-${vname}`} className="voice-picker-item vp-cloned-voice">
                            <button className="voice-picker-select" onClick={() => selectAndDeploy({ name: `Cloned: ${name}`, clonedKey: vname })}>
                              <span className="voice-picker-name">{'🎤'} {name}</span>
                              <span className="vp-new-tag">NEW</span>
                            </button>
                            <button className={`voice-picker-test ${testing === name ? 'playing' : ''}`}
                              onClick={() => {
                                if (testing === name) { stopTest(); return; }
                                setTesting(name);
                                window.speechSynthesis.cancel();
                                const u = new SpeechSynthesisUtterance(`This is ${name}'s voice. Eva will speak like this in your therapy sessions.`);
                                u.rate = rate; u.pitch = pitch; u.volume = volume;
                                if (selectedVoice) u.voice = selectedVoice;
                                u.onend = () => setTesting(null);
                                u.onerror = () => setTesting(null);
                                window.speechSynthesis.speak(u);
                              }}
                              style={{ color: testing === name ? '#ff4444' : mode.accentColor, borderColor: testing === name ? '#ff4444' : mode.accentColor }}>
                              {testing === name ? '■' : '▶'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Primary languages (female first, male below) */}
                  {primaryLangs.map(renderLangGroup)}

                  {/* Secondary languages */}
                  {visibleSecondary.map(renderLangGroup)}

                  {!search && secondaryLangs.length > 0 && (
                    <button className="vp-show-more" onClick={() => setShowAllLangs(!showAllLangs)}
                      style={{ color: mode.accentColor }}>
                      {showAllLangs ? 'Hide other languages ▲' : `Show ${secondaryLangs.length} more languages ▼`}
                    </button>
                  )}

                  {Object.keys(filteredGrouped).length === 0 && !clonedVoices && (
                    <p className="vp-no-results">No voices found for "{search}"</p>
                  )}
                </div>
              </>
            )}

            {tab === 'tune' && (
              <div className="vp-tune">
                <div className="vp-presets-label">Quick Presets</div>
                <div className="vp-presets">
                  {PRESETS.map((p) => (
                    <button key={p.name} className="vp-preset-btn" onClick={() => applyPreset(p)}
                      style={{ borderColor: `${mode.accentColor}33` }}>
                      <span>{p.icon}</span><span>{p.name}</span>
                    </button>
                  ))}
                </div>

                <div className="vp-slider-group">
                  <div className="vp-slider-row"><label>Speed</label><span className="vp-slider-value">{rate.toFixed(2)}x</span></div>
                  <input type="range" min="0.5" max="1.5" step="0.05" value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))} style={{ accentColor: mode.accentColor }} />
                  <div className="vp-slider-labels"><span>Slower</span><span>Faster</span></div>
                </div>

                <div className="vp-slider-group">
                  <div className="vp-slider-row"><label>Pitch</label><span className="vp-slider-value">{pitch.toFixed(2)}</span></div>
                  <input type="range" min="0.5" max="1.5" step="0.05" value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))} style={{ accentColor: mode.accentColor }} />
                  <div className="vp-slider-labels"><span>Deeper</span><span>Higher</span></div>
                </div>

                <div className="vp-slider-group">
                  <div className="vp-slider-row"><label>Volume</label><span className="vp-slider-value">{Math.round(volume * 100)}%</span></div>
                  <input type="range" min="0.2" max="1.0" step="0.05" value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))} style={{ accentColor: mode.accentColor }} />
                  <div className="vp-slider-labels"><span>Quiet</span><span>Loud</span></div>
                </div>

                <button className="vp-preview-btn" onClick={() => testing ? stopTest() : testVoice(selectedVoice)}
                  style={{ backgroundColor: testing ? '#ff4444' : mode.accentColor }}>
                  {testing ? '■ Stop Preview' : '▶ Preview Voice'}
                </button>

                <p className="vp-tune-hint">
                  Current: {selectedVoice?.name || 'Default'} — {rate.toFixed(2)}x speed, {pitch.toFixed(2)} pitch
                </p>
              </div>
            )}

            <div className="vp-save-footer">
              <button className={`vp-save-btn ${saved ? 'saved' : ''}`}
                onClick={() => {
                  selectAndDeploy(selectedVoice);
                  setTimeout(() => setIsOpen(false), 1200);
                }}
                style={{ backgroundColor: saved ? '#38ef7d' : mode.accentColor }}>
                {saved ? '✓ Voice Deployed!' : 'Save & Deploy Voice'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
