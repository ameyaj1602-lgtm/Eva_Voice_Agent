import React, { useState, useEffect, useRef } from 'react';
import { sarvamTTS, SARVAM_VOICES } from '../services/sarvam';

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

export default function VoicePicker({ voices, selectedVoice, onVoiceChange, mode, clonedVoices, settings, onSaveSettings }) {
  const [isOpen, setIsOpen] = useState(false);
  const [testing, setTesting] = useState(null);
  const [tab, setTab] = useState('voices');
  const [search, setSearch] = useState('');
  const [showAllLangs, setShowAllLangs] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [showSarvamVoices, setShowSarvamVoices] = useState(false);
  const [testingAudio, setTestingAudio] = useState(null);
  const sarvamAudioRef = useRef(null);

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
    if (sarvamAudioRef.current) { sarvamAudioRef.current.pause(); sarvamAudioRef.current = null; }
    setTesting(null);
  };

  const testVoice = (voice, customRate, customPitch) => {
    // STOP everything first - no overlapping audio
    window.speechSynthesis.cancel();
    if (sarvamAudioRef.current) { sarvamAudioRef.current.pause(); sarvamAudioRef.current = null; }

    setTesting(voice?.name || 'preview');
    const u = new SpeechSynthesisUtterance('Hello, I am Eva. I am here to help you feel calm and supported.');
    if (voice) u.voice = voice;
    u.rate = customRate ?? rate;
    u.pitch = customPitch ?? pitch;
    u.volume = Math.min(volume, 0.7); // Cap test volume
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

  // Active engine: if sarvam voice is set, that's active. Otherwise browser voice.
  const activeSarvamVoice = settings?.sarvamVoice || (settings?.sarvamApiKey ? 'anushka' : null);
  const activeEngine = activeSarvamVoice ? 'sarvam' : 'browser';
  const [showBrowserVoices, setShowBrowserVoices] = useState(false);

  // Browser voice descriptions
  const BROWSER_VOICE_DESCS = {
    'Samantha': 'Warm, natural, American female',
    'Karen': 'Clear, professional, Australian',
    'Moira': 'Soothing, gentle, Irish accent',
    'Daniel': 'Deep, calm, British male',
    'Tessa': 'Warm, friendly, South African',
    'Rishi': 'Clear, professional, Indian male',
    'Flo': 'Bright, expressive, casual',
    'Shelley': 'Soft, gentle, approachable',
    'Sandy': 'Light, cheerful, friendly',
    'Reed': 'Smooth, steady, narrator-like',
    'Eddy': 'Casual, fun, energetic',
    'Rocko': 'Deep, rough, character voice',
  };

  const getVoiceDesc = (name) => {
    for (const [key, desc] of Object.entries(BROWSER_VOICE_DESCS)) {
      if (name.includes(key)) return desc;
    }
    return '';
  };

  const renderVoiceItem = (v) => {
    const isActive = activeEngine === 'browser' && selectedVoice?.name === v.name;
    const isTesting = testing === v.name;
    const desc = getVoiceDesc(v.name);
    return (
      <div key={v.name} className={`voice-picker-item ${isActive ? 'active' : ''}`}
        style={isActive ? { borderColor: mode.accentColor } : {}}>
        <button className="voice-picker-select" onClick={() => {
          // Switch to browser engine
          onSaveSettings?.({ sarvamVoice: null, sarvamDefault: false });
          selectAndDeploy(v);
        }}>
          <div>
            <span className="voice-picker-name" style={{ fontWeight: 600 }}>{v.name}</span>
            {desc && <span className="voice-picker-desc">{desc}</span>}
          </div>
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
              <button className={`vp-tab ${tab === 'engine' ? 'active' : ''}`}
                style={tab === 'engine' ? { color: mode.accentColor, borderColor: mode.accentColor } : {}}
                onClick={() => setTab('engine')}>Engine</button>
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

                  {/* Sarvam AI voices (Hindi/Indian - premium quality) */}
                  {settings?.sarvamApiKey && (!search || 'sarvam hindi indian'.includes(searchLower)) && (
                    <div className="voice-picker-group">
                      <div className="voice-picker-lang">SARVAM AI — Hindi & Indian</div>
                      {/* Default Sarvam voice */}
                      <div className={`voice-picker-item vp-sarvam-voice ${settings?.sarvamVoice === 'anushka' || !settings?.sarvamVoice ? 'active' : ''}`}
                        style={!settings?.sarvamVoice || settings?.sarvamVoice === 'anushka' ? { borderColor: mode.accentColor } : {}}>
                        <button className="voice-picker-select" onClick={() => {
                          onSaveSettings?.({ sarvamVoice: 'anushka', sarvamDefault: true });
                          setDeployed(true); setTimeout(() => setDeployed(false), 2000);
                        }}>
                          <div>
                            <span className="voice-picker-name" style={{ fontWeight: 600 }}>🇮🇳 Anushka</span>
                            <span className="voice-picker-desc">Warm, calm, soothing — ideal for therapy</span>
                          </div>
                          {activeEngine === 'sarvam' && (!settings?.sarvamVoice || settings?.sarvamVoice === 'anushka') && <span className="voice-picker-check" style={{ color: mode.accentColor }}>✓</span>}
                        </button>
                        <button className={`voice-picker-test ${testing === 'sarvam-anushka' ? 'playing' : ''}`}
                          onClick={async () => {
                            if (testing === 'sarvam-anushka') { sarvamAudioRef.current?.pause(); setTesting(null); return; }
                            setTesting('sarvam-anushka');
                            const url = await sarvamTTS(settings.sarvamApiKey, 'Namaste! Main Eva hoon, aapki personal voice companion. Aap kaise feel kar rahe ho aaj? Mujhe batao, main sun rahi hoon.', 'anushka', 'hi-IN');
                            if (url) { const a = new Audio(url); sarvamAudioRef.current = a; a.onended = () => setTesting(null); a.play(); }
                            else setTesting(null);
                          }}
                          style={{ color: testing === 'sarvam-anushka' ? '#ff4444' : mode.accentColor, borderColor: testing === 'sarvam-anushka' ? '#ff4444' : mode.accentColor }}>
                          {testing === 'sarvam-anushka' ? '■' : '▶'}
                        </button>
                      </div>

                      {/* Toggle to show all Sarvam voices */}
                      <button className="vp-show-more" onClick={() => setShowSarvamVoices(!showSarvamVoices)}
                        style={{ color: mode.accentColor }}>
                        {showSarvamVoices ? 'Hide Sarvam voices ▲' : `Show all 34 Sarvam voices ▼`}
                      </button>

                      {showSarvamVoices && (
                        <>
                          <div className="vp-gender-label">Female</div>
                          {SARVAM_VOICES.female.map(v => (
                            <div key={v.id} className={`voice-picker-item ${settings?.sarvamVoice === v.id ? 'active' : ''}`}
                              style={settings?.sarvamVoice === v.id ? { borderColor: mode.accentColor } : {}}>
                              <button className="voice-picker-select" onClick={() => {
                                onSaveSettings?.({ sarvamVoice: v.id, sarvamDefault: true });
                                setDeployed(true); setTimeout(() => setDeployed(false), 2000);
                              }}>
                                <div>
                                  <span className="voice-picker-name" style={{ fontWeight: 600 }}>🇮🇳 {v.name}</span>
                                  {v.desc && <span className="voice-picker-desc">{v.desc}</span>}
                                </div>
                                {activeEngine === 'sarvam' && settings?.sarvamVoice === v.id && <span className="voice-picker-check" style={{ color: mode.accentColor }}>✓</span>}
                              </button>
                              <button className={`voice-picker-test ${testing === `sarvam-${v.id}` ? 'playing' : ''}`}
                                onClick={async () => {
                                  if (testing === `sarvam-${v.id}`) { sarvamAudioRef.current?.pause(); setTesting(null); return; }
                                  setTesting(`sarvam-${v.id}`);
                                  const url = await sarvamTTS(settings.sarvamApiKey, 'Namaste! Main Eva hoon, aapki personal voice companion. Aap kaise feel kar rahe ho aaj? Mujhe batao, main sun rahi hoon.', v.id, 'hi-IN');
                                  if (url) { const a = new Audio(url); sarvamAudioRef.current = a; a.onended = () => setTesting(null); a.play(); }
                                  else setTesting(null);
                                }}
                                style={{ color: testing === `sarvam-${v.id}` ? '#ff4444' : mode.accentColor, borderColor: testing === `sarvam-${v.id}` ? '#ff4444' : mode.accentColor }}>
                                {testing === `sarvam-${v.id}` ? '■' : '▶'}
                              </button>
                            </div>
                          ))}
                          <div className="vp-gender-label">Male</div>
                          {SARVAM_VOICES.male.map(v => (
                            <div key={v.id} className={`voice-picker-item ${settings?.sarvamVoice === v.id ? 'active' : ''}`}
                              style={settings?.sarvamVoice === v.id ? { borderColor: mode.accentColor } : {}}>
                              <button className="voice-picker-select" onClick={() => {
                                onSaveSettings?.({ sarvamVoice: v.id, sarvamDefault: true });
                                setDeployed(true); setTimeout(() => setDeployed(false), 2000);
                              }}>
                                <div>
                                  <span className="voice-picker-name" style={{ fontWeight: 600 }}>🇮🇳 {v.name}</span>
                                  {v.desc && <span className="voice-picker-desc">{v.desc}</span>}
                                </div>
                                {activeEngine === 'sarvam' && settings?.sarvamVoice === v.id && <span className="voice-picker-check" style={{ color: mode.accentColor }}>✓</span>}
                              </button>
                              <button className={`voice-picker-test ${testing === `sarvam-${v.id}` ? 'playing' : ''}`}
                                onClick={async () => {
                                  if (testing === `sarvam-${v.id}`) { sarvamAudioRef.current?.pause(); setTesting(null); return; }
                                  setTesting(`sarvam-${v.id}`);
                                  const url = await sarvamTTS(settings.sarvamApiKey, 'Namaste! Main Eva hoon, aapki personal voice companion. Aap kaise feel kar rahe ho aaj? Mujhe batao, main sun rahi hoon.', v.id, 'hi-IN');
                                  if (url) { const a = new Audio(url); sarvamAudioRef.current = a; a.onended = () => setTesting(null); a.play(); }
                                  else setTesting(null);
                                }}
                                style={{ color: testing === `sarvam-${v.id}` ? '#ff4444' : mode.accentColor, borderColor: testing === `sarvam-${v.id}` ? '#ff4444' : mode.accentColor }}>
                                {testing === `sarvam-${v.id}` ? '■' : '▶'}
                              </button>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}

                  {/* Browser voices (collapsed by default) */}
                  <button className="vp-show-more" onClick={() => setShowBrowserVoices(!showBrowserVoices)}
                    style={{ color: mode.accentColor }}>
                    {showBrowserVoices ? 'Hide browser voices ▲' : 'Show browser voices ▼'}
                  </button>
                  {showBrowserVoices && primaryLangs.map(renderLangGroup)}

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

            {/* ENGINE TAB */}
            {tab === 'engine' && (
              <div className="vp-tune">
                <div className="vp-presets-label">Voice Engine</div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                  Choose which voice engine Eva uses. Higher = better quality.
                </p>

                {[
                  { id: 'sarvam', name: 'Sarvam AI', desc: 'Hindi/Indian neural voices (34 voices)', emoji: '🇮🇳', active: !!settings?.sarvamApiKey },
                  { id: 'maya1', name: 'Maya1 (Kaggle)', desc: '20+ emotions, voice design, best quality', emoji: '🎭', active: !!settings?.mayaUrl },
                  { id: 'browser', name: 'Browser TTS', desc: 'Free, instant, 160+ voices', emoji: '🔊', active: true },
                  { id: 'elevenlabs', name: 'ElevenLabs', desc: 'Premium quality ($5/mo)', emoji: '💎', active: !!settings?.elevenLabsApiKey && settings?.useElevenLabs },
                ].map(engine => (
                  <div key={engine.id} style={{
                    padding: 12, marginBottom: 8, borderRadius: 12,
                    background: engine.active ? 'rgba(56,239,125,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${engine.active ? 'rgba(56,239,125,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>{engine.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: 13 }}>{engine.name}</strong>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{engine.desc}</p>
                      </div>
                      <span style={{ fontSize: 11, color: engine.active ? '#38ef7d' : '#ff6b6b', fontWeight: 600 }}>
                        {engine.active ? '● ON' : '○ OFF'}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Maya1 URL input */}
                <div style={{ marginTop: 12 }}>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Maya1 Kaggle URL</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input className="settings-input" placeholder="https://xxxxx.gradio.live"
                      value={settings?.mayaUrl || ''}
                      onChange={(e) => onSaveSettings?.({ mayaUrl: e.target.value })}
                      style={{ flex: 1, fontSize: 12 }} />
                  </div>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>
                    Paste from Kaggle notebook. Changes save automatically.
                  </p>
                </div>

                {/* Sarvam voice selector */}
                {settings?.sarvamApiKey && (
                  <div style={{ marginTop: 12 }}>
                    <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Sarvam Default Voice</label>
                    <select className="settings-select"
                      value={settings?.sarvamVoice || 'anushka'}
                      onChange={(e) => onSaveSettings?.({ sarvamVoice: e.target.value })}
                      style={{ fontSize: 12 }}>
                      <optgroup label="Female">
                        {SARVAM_VOICES.female.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </optgroup>
                      <optgroup label="Male">
                        {SARVAM_VOICES.male.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </optgroup>
                    </select>
                  </div>
                )}

                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 16 }}>
                  Eva tries engines top-to-bottom. First working one wins.
                </p>
              </div>
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
