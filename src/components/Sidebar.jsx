import React, { useState, useEffect } from 'react';
import { getRandomQuote, getRandomAdvice, getRandomJoke, getRandomFact, getRandomAffirmation, getHoroscope, HOROSCOPE_SIGNS } from '../services/freeApis';

// Web Audio ambient sounds
function createAmbientSound(type) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const nodes = [];
  if (type === 'rain' || type === 'ocean') {
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer; source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = type === 'rain' ? 'highpass' : 'lowpass';
    filter.frequency.value = type === 'rain' ? 800 : 300;
    const gain = ctx.createGain();
    gain.gain.value = type === 'rain' ? 0.15 : 0.2;
    source.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    source.start(); nodes.push(source);
  } else if (type === 'fire') {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (Math.random() > 0.97 ? 1 : 0.1);
    const source = ctx.createBufferSource();
    source.buffer = buffer; source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass'; filter.frequency.value = 600; filter.Q.value = 0.5;
    const gain = ctx.createGain(); gain.gain.value = 0.25;
    source.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    source.start(); nodes.push(source);
  } else if (type === 'birds') {
    const chirp = () => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = 2000 + Math.random() * 2000;
      gain.gain.value = 0; osc.connect(gain); gain.connect(ctx.destination); osc.start();
      const loop = () => {
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
        gain.gain.linearRampToValueAtTime(0, now + 0.15);
        osc.frequency.setValueAtTime(2000 + Math.random() * 2000, now);
        setTimeout(loop, 500 + Math.random() * 2000);
      }; loop(); nodes.push(osc);
    }; chirp(); chirp(); chirp();
  } else if (type === 'lofi') {
    [261.6, 329.6, 392.0].forEach((f) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'triangle'; osc.frequency.value = f; gain.gain.value = 0.06;
      osc.connect(gain); gain.connect(ctx.destination); osc.start(); nodes.push(osc);
    });
  }
  return { ctx, nodes, stop: () => { nodes.forEach(n => { try { n.stop(); } catch {} }); ctx.close(); } };
}

const SOUNDS = [
  { id: 'rain', name: 'Rain', icon: '🌧️' },
  { id: 'ocean', name: 'Ocean', icon: '🌊' },
  { id: 'fire', name: 'Fire', icon: '🔥' },
  { id: 'birds', name: 'Birds', icon: '🐦' },
  { id: 'lofi', name: 'Lo-Fi', icon: '🎵' },
];

const SIGN_EMOJIS = {
  aries: '\u2648', taurus: '\u2649', gemini: '\u264A', cancer: '\u264B',
  leo: '\u264C', virgo: '\u264D', libra: '\u264E', scorpio: '\u264F',
  sagittarius: '\u2650', capricorn: '\u2651', aquarius: '\u2652', pisces: '\u2653',
};

export default function Sidebar({ isOpen, onClose, mode, settings, lightMode }) {
  const [activePanel, setActivePanel] = useState(null);
  const [quote, setQuote] = useState(null);
  const [advice, setAdvice] = useState(null);
  const [joke, setJoke] = useState(null);
  const [fact, setFact] = useState(null);
  const [affirmation, setAffirmation] = useState(null);
  const [horoscope, setHoroscope] = useState(null);
  const [selectedSign, setSelectedSign] = useState('aries');
  const [horoscopeLoading, setHoroscopeLoading] = useState(false);
  const [playingSound, setPlayingSound] = useState(null);
  const [audioEl, setAudioEl] = useState(null);
  const [journalEntry, setJournalEntry] = useState('');

  const fetchQuote = async () => { setQuote(await getRandomQuote()); };
  const fetchAdvice = async () => { setAdvice(await getRandomAdvice()); };
  const fetchJoke = async () => { setJoke(await getRandomJoke()); };
  const fetchFact = async () => { setFact(await getRandomFact()); };
  const fetchAffirmation = async () => { setAffirmation(await getRandomAffirmation()); };
  const fetchHoroscope = async (sign) => {
    setSelectedSign(sign);
    setHoroscopeLoading(true);
    const h = await getHoroscope(sign);
    setHoroscope(h);
    setHoroscopeLoading(false);
  };

  const toggleSound = (sound) => {
    if (audioEl) { audioEl.stop(); setAudioEl(null); }
    if (playingSound === sound.id) { setPlayingSound(null); return; }
    const amb = createAmbientSound(sound.id);
    setAudioEl(amb); setPlayingSound(sound.id);
  };

  const saveJournalEntry = () => {
    if (!journalEntry.trim()) return;
    try {
      const entries = JSON.parse(localStorage.getItem('eva-journal') || '[]');
      entries.push({ text: journalEntry.trim(), date: Date.now() });
      localStorage.setItem('eva-journal', JSON.stringify(entries.slice(-100)));
      setJournalEntry('');
    } catch {}
  };

  const journalEntries = (() => {
    try { return JSON.parse(localStorage.getItem('eva-journal') || '[]').slice(-5).reverse(); }
    catch { return []; }
  })();

  useEffect(() => { return () => { if (audioEl) audioEl.stop(); }; }, [audioEl]);

  if (!isOpen) return null;

  const Item = ({ icon, label, onClick, active, badge }) => (
    <button className={`sb-item ${active ? 'active' : ''}`} onClick={onClick}
      style={active ? { color: mode.accentColor, borderLeftColor: mode.accentColor } : {}}>
      <span className="sb-item-icon">{icon}</span>
      <span className="sb-item-label">{label}</span>
      {badge && <span className="sb-item-badge" style={{ backgroundColor: mode.accentColor }}>{badge}</span>}
    </button>
  );

  return (
    <>
      <div className="sb-overlay" onClick={onClose} />
      <div className={`sb ${lightMode ? 'sb-light' : ''}`} style={{ '--sb-accent': mode.accentColor }}>
        <div className="sb-header">
          <h2 className="sb-title">{'\u2728'} Discover</h2>
          <button className="sb-close" onClick={onClose}>&times;</button>
        </div>

        <div className="sb-body">
          {/* SOUNDS */}
          <div className="sb-category">
            <span className="sb-cat-label">Ambient Sounds</span>
            <div className="sb-sounds">
              {SOUNDS.map((s) => (
                <button key={s.id} className={`sb-sound-chip ${playingSound === s.id ? 'playing' : ''}`}
                  onClick={() => toggleSound(s)}
                  style={playingSound === s.id ? { borderColor: mode.accentColor, color: mode.accentColor } : {}}>
                  <span>{s.icon}</span> {s.name}
                  {playingSound === s.id && <span className="sb-playing-dot" style={{ backgroundColor: mode.accentColor }} />}
                </button>
              ))}
            </div>
          </div>

          {/* JOURNAL */}
          <div className="sb-category">
            <span className="sb-cat-label">Journal</span>
            <div className="sb-journal">
              <textarea className="sb-journal-input" placeholder="Write your thoughts..."
                value={journalEntry} onChange={(e) => setJournalEntry(e.target.value)} rows={3} />
              <button className="sb-journal-save" onClick={saveJournalEntry}
                disabled={!journalEntry.trim()} style={{ backgroundColor: mode.accentColor }}>
                Save Entry
              </button>
            </div>
            {journalEntries.length > 0 && (
              <div className="sb-journal-history">
                {journalEntries.map((e, i) => (
                  <div key={i} className="sb-journal-entry">
                    <span className="sb-journal-date">{new Date(e.date).toLocaleDateString()}</span>
                    <p>{e.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* INSPIRATION */}
          <div className="sb-category">
            <span className="sb-cat-label">Inspiration</span>
            <Item icon="💡" label="Random Quote" active={activePanel === 'quote'}
              onClick={() => { setActivePanel(activePanel === 'quote' ? null : 'quote'); fetchQuote(); }} />
            {activePanel === 'quote' && quote && (
              <div className="sb-panel">
                <p className="sb-panel-text">"{quote.text}"</p>
                <p className="sb-panel-author">— {quote.author}</p>
                <button className="sb-panel-btn" onClick={fetchQuote} style={{ color: mode.accentColor }}>New Quote</button>
              </div>
            )}
            <Item icon="🎯" label="Life Advice" active={activePanel === 'advice'}
              onClick={() => { setActivePanel(activePanel === 'advice' ? null : 'advice'); fetchAdvice(); }} />
            {activePanel === 'advice' && advice && (
              <div className="sb-panel">
                <p className="sb-panel-text">{advice}</p>
                <button className="sb-panel-btn" onClick={fetchAdvice} style={{ color: mode.accentColor }}>New Advice</button>
              </div>
            )}
            <Item icon="✨" label="Affirmation" active={activePanel === 'affirm'}
              onClick={() => { setActivePanel(activePanel === 'affirm' ? null : 'affirm'); fetchAffirmation(); }} />
            {activePanel === 'affirm' && affirmation && (
              <div className="sb-panel">
                <p className="sb-panel-text">{affirmation}</p>
                <button className="sb-panel-btn" onClick={fetchAffirmation} style={{ color: mode.accentColor }}>New Affirmation</button>
              </div>
            )}
          </div>

          {/* FUN */}
          <div className="sb-category">
            <span className="sb-cat-label">Fun</span>
            <Item icon="😂" label="Random Joke" active={activePanel === 'joke'}
              onClick={() => { setActivePanel(activePanel === 'joke' ? null : 'joke'); fetchJoke(); }} />
            {activePanel === 'joke' && joke && (
              <div className="sb-panel">
                <p className="sb-panel-text">{joke}</p>
                <button className="sb-panel-btn" onClick={fetchJoke} style={{ color: mode.accentColor }}>Another One</button>
              </div>
            )}
            <Item icon="🧪" label="Fun Fact" active={activePanel === 'fact'}
              onClick={() => { setActivePanel(activePanel === 'fact' ? null : 'fact'); fetchFact(); }} />
            {activePanel === 'fact' && fact && (
              <div className="sb-panel">
                <p className="sb-panel-text">{fact}</p>
                <button className="sb-panel-btn" onClick={fetchFact} style={{ color: mode.accentColor }}>New Fact</button>
              </div>
            )}
          </div>

          {/* HOROSCOPE */}
          <div className="sb-category">
            <span className="sb-cat-label">Horoscope</span>
            <div className="sb-horoscope-grid">
              {HOROSCOPE_SIGNS.map((s) => (
                <button key={s} className={`sb-sign-btn ${selectedSign === s ? 'active' : ''}`}
                  onClick={() => fetchHoroscope(s)}
                  style={selectedSign === s ? { borderColor: mode.accentColor, background: `${mode.accentColor}15` } : {}}>
                  <span className="sb-sign-emoji">{SIGN_EMOJIS[s]}</span>
                  <span className="sb-sign-name">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                </button>
              ))}
            </div>
            {horoscopeLoading && <p className="sb-horoscope-loading">Reading the stars...</p>}
            {horoscope && !horoscopeLoading && (
              <div className="sb-horoscope-result">
                <p>{horoscope}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
