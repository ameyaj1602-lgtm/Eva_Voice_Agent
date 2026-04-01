import React, { useState, useEffect } from 'react';
import { getRandomQuote, getRandomAdvice, getRandomJoke, getRandomFact, getRandomAffirmation, getHoroscope } from '../services/freeApis';
import { ZODIAC_DATA, getSignFromDate, getLuckyNumbers, getLuckyColor } from '../utils/horoscope';

// Web Audio ambient sounds (mobile-compatible)
function createAmbientSound(type) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  // Resume context on mobile (autoplay policy)
  if (ctx.state === 'suspended') ctx.resume();
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
    gain.gain.value = type === 'rain' ? 0.4 : 0.5;
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
    const gain = ctx.createGain(); gain.gain.value = 0.5;
    source.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    source.start(); nodes.push(source);
  } else if (type === 'birds') {
    const chirp = () => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = 2000 + Math.random() * 2000;
      gain.gain.value = 0; osc.connect(gain); gain.connect(ctx.destination); osc.start();
      const loop = () => {
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gain.gain.linearRampToValueAtTime(0, now + 0.15);
        osc.frequency.setValueAtTime(2000 + Math.random() * 2000, now);
        setTimeout(loop, 500 + Math.random() * 2000);
      }; loop(); nodes.push(osc);
    }; chirp(); chirp(); chirp();
  } else if (type === 'lofi') {
    [261.6, 329.6, 392.0].forEach((f) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'triangle'; osc.frequency.value = f; gain.gain.value = 0.15;
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

// Meme soundboard - one-shot sounds using Web Audio API
function playMemeSound(type) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  const now = ctx.currentTime;

  if (type === 'airhorn') {
    // Classic MLG airhorn
    [440, 587, 698, 880].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now + i * 0.05);
      osc.stop(now + 1.5);
    });
  } else if (type === 'bruh') {
    // Low descending tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.4);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(now + 0.5);
  } else if (type === 'sadtrombone') {
    // Wah wah wah wahhh
    const notes = [293.66, 277.18, 261.63, 220];
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0, now + i * 0.4);
      gain.gain.linearRampToValueAtTime(0.3, now + i * 0.4 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.4 + (i === 3 ? 0.8 : 0.35));
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now + i * 0.4);
      osc.stop(now + i * 0.4 + (i === 3 ? 0.8 : 0.4));
    });
  } else if (type === 'boom') {
    // Vine boom / bass drop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(now + 0.5);
  } else if (type === 'tada') {
    // Victory fanfare
    const melody = [523, 659, 784, 1047];
    melody.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0, now + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.15 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + (i === 3 ? 0.5 : 0.12));
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.5);
    });
  } else if (type === 'wrong') {
    // Buzzer / wrong answer
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 90;
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.setValueAtTime(0.3, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(now + 0.7);
  }

  setTimeout(() => ctx.close(), 3000);
}

const MEME_SOUNDS = [
  { id: 'airhorn', name: 'Airhorn', icon: '📯' },
  { id: 'bruh', name: 'Bruh', icon: '😐' },
  { id: 'boom', name: 'Vine Boom', icon: '💥' },
  { id: 'sadtrombone', name: 'Sad Trombone', icon: '🎺' },
  { id: 'tada', name: 'Ta-da!', icon: '🎉' },
  { id: 'wrong', name: 'Wrong!', icon: '❌' },
];

const SIGN_EMOJIS = {
  aries: '\u2648', taurus: '\u2649', gemini: '\u264A', cancer: '\u264B',
  leo: '\u264C', virgo: '\u264D', libra: '\u264E', scorpio: '\u264F',
  sagittarius: '\u2650', capricorn: '\u2651', aquarius: '\u2652', pisces: '\u2653',
};

const JOURNAL_PROMPTS = [
  "What made you smile today?",
  "What's one thing you're grateful for right now?",
  "How are you really feeling? Be honest.",
  "What's been on your mind lately?",
  "Write a letter to your future self.",
  "What would make tomorrow better than today?",
  "Describe a moment of peace you experienced recently.",
  "What's something you need to let go of?",
];

export default function Sidebar({ isOpen, onClose, mode, settings, lightMode }) {
  const [activePanel, setActivePanel] = useState(null);
  const [quote, setQuote] = useState(null);
  const [advice, setAdvice] = useState(null);
  const [joke, setJoke] = useState(null);
  const [fact, setFact] = useState(null);
  const [affirmation, setAffirmation] = useState(null);
  const [horoscope, setHoroscope] = useState(null);
  const [selectedSign, setSelectedSign] = useState(() => {
    const saved = localStorage.getItem('eva-zodiac-sign');
    return saved || '';
  });
  const [horoscopeLoading, setHoroscopeLoading] = useState(false);
  const [showBirthForm, setShowBirthForm] = useState(false);
  const [birthDate, setBirthDate] = useState(() => localStorage.getItem('eva-birth-date') || '');
  const [birthTime, setBirthTime] = useState(() => localStorage.getItem('eva-birth-time') || '');
  const [birthPlace, setBirthPlace] = useState(() => localStorage.getItem('eva-birth-place') || '');
  const [playingSound, setPlayingSound] = useState(null);
  const [audioEl, setAudioEl] = useState(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [journalPrompt, setJournalPrompt] = useState(() =>
    JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)]
  );

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
    // Stop current sound
    if (audioEl) {
      try { audioEl.stop(); } catch {}
      setAudioEl(null);
    }
    if (playingSound === sound.id) { setPlayingSound(null); return; }

    // Mobile fix: create context inside click handler and ensure it's resumed
    try {
      const amb = createAmbientSound(sound.id);
      // Double-check resume for iOS Safari
      if (amb.ctx && amb.ctx.state === 'suspended') {
        amb.ctx.resume().then(() => {
          setAudioEl(amb);
          setPlayingSound(sound.id);
        });
      } else {
        setAudioEl(amb);
        setPlayingSound(sound.id);
      }
    } catch (err) {
      console.warn('Sound failed:', err);
    }
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

          {/* MEME SOUNDBOARD */}
          <div className="sb-category">
            <span className="sb-cat-label">Meme Sounds 😂</span>
            <div className="sb-sounds">
              {MEME_SOUNDS.map((s) => (
                <button key={s.id} className="sb-sound-chip sb-meme-btn"
                  onClick={() => playMemeSound(s.id)}>
                  <span>{s.icon}</span> {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* SPOTIFY PLAYLISTS */}
          <div className="sb-category">
            <span className="sb-cat-label">Spotify Playlists</span>
            <div className="sb-spotify-grid">
              {[
                { name: 'Calm & Peaceful', id: '37i9dQZF1DWZd79rJ6a7lp', emoji: '🌿' },
                { name: 'Deep Sleep', id: '37i9dQZF1DWZd79rJ6a7lp', emoji: '🌙' },
                { name: 'Focus Flow', id: '37i9dQZF1DX4sWSpwq3LiO', emoji: '🎯' },
                { name: 'Motivation Boost', id: '37i9dQZF1DXdxcBWuJkbcy', emoji: '🔥' },
              ].map((pl) => (
                <div key={pl.name} className="sb-spotify-card">
                  <div className="sb-spotify-header">
                    <span>{pl.emoji}</span>
                    <span className="sb-spotify-name">{pl.name}</span>
                  </div>
                  <iframe
                    title={pl.name}
                    src={`https://open.spotify.com/embed/playlist/${pl.id}?utm_source=generator&theme=0`}
                    width="100%" height="80" frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    style={{ borderRadius: 8 }}
                  />
                </div>
              ))}
            </div>
            <p className="sb-spotify-note">Open in Spotify for full playlists</p>
          </div>

          {/* JOURNAL - Enhanced */}
          <div className="sb-category">
            <span className="sb-cat-label">Journal</span>
            <div className="sb-journal-prompt-card" style={{ borderColor: `${mode.accentColor}22` }}>
              <span className="sb-journal-prompt-label">Today's prompt</span>
              <p className="sb-journal-prompt-text">{journalPrompt}</p>
              <button className="sb-journal-prompt-new" onClick={() =>
                setJournalPrompt(JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)])
              } style={{ color: mode.accentColor }}>New prompt</button>
            </div>
            <div className="sb-journal">
              <textarea className="sb-journal-input" placeholder="Start writing..."
                value={journalEntry} onChange={(e) => setJournalEntry(e.target.value)} rows={4} />
              <div className="sb-journal-footer">
                <span className="sb-journal-count">{journalEntry.length} chars</span>
                <button className="sb-journal-save" onClick={saveJournalEntry}
                  disabled={!journalEntry.trim()} style={{ backgroundColor: mode.accentColor }}>
                  Save
                </button>
              </div>
            </div>
            {journalEntries.length > 0 && (
              <div className="sb-journal-history">
                <span className="sb-journal-history-label">Recent entries</span>
                {journalEntries.map((e, i) => (
                  <div key={i} className="sb-journal-entry">
                    <div className="sb-journal-entry-header">
                      <span className="sb-journal-date">{new Date(e.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span className="sb-journal-time">{new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
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

          {/* HOROSCOPE - Full Birth Chart */}
          <div className="sb-category">
            <span className="sb-cat-label">Horoscope</span>

            {/* If no sign saved, show birth date form prompt */}
            {!selectedSign && !showBirthForm && (
              <button className="sb-birth-prompt" onClick={() => setShowBirthForm(true)}
                style={{ borderColor: `${mode.accentColor}33` }}>
                <span style={{ fontSize: 24 }}>{'🌟'}</span>
                <div>
                  <strong>Discover your sign</strong>
                  <span>Enter your birth details for personalized readings</span>
                </div>
              </button>
            )}

            {/* Edit birth details button (when sign already saved) */}
            {selectedSign && !showBirthForm && (
              <button className="sb-edit-birth" onClick={() => setShowBirthForm(true)}
                style={{ color: mode.accentColor }}>
                Edit birth details
              </button>
            )}

            {showBirthForm && (
              <div className="sb-birth-form">
                <label>Date of Birth</label>
                <input type="date" className="sb-birth-input" value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)} />
                <label>Time of Birth (optional)</label>
                <input type="time" className="sb-birth-input" value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)} />
                <label>Place of Birth (optional)</label>
                <input type="text" className="sb-birth-input" placeholder="e.g., Mumbai, India"
                  value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} />
                <button className="sb-birth-submit" onClick={() => {
                  if (birthDate) {
                    const [y, m, d] = birthDate.split('-').map(Number);
                    const sign = getSignFromDate(m, d);
                    setSelectedSign(sign);
                    localStorage.setItem('eva-zodiac-sign', sign);
                    localStorage.setItem('eva-birth-date', birthDate);
                    if (birthTime) localStorage.setItem('eva-birth-time', birthTime);
                    if (birthPlace) localStorage.setItem('eva-birth-place', birthPlace);
                    setShowBirthForm(false);
                    fetchHoroscope(sign);
                  }
                }} style={{ backgroundColor: mode.accentColor }}>
                  Reveal My Sign
                </button>
              </div>
            )}

            {/* Sign selector grid */}
            {(selectedSign || showBirthForm) && (
              <div className="sb-zodiac-grid">
                {Object.entries(ZODIAC_DATA).map(([key, z]) => (
                  <button key={key} className={`sb-zodiac-card ${selectedSign === key ? 'active' : ''}`}
                    onClick={() => { setSelectedSign(key); localStorage.setItem('eva-zodiac-sign', key); fetchHoroscope(key); }}
                    style={selectedSign === key ? { borderColor: z.color, boxShadow: `0 0 12px ${z.color}33` } : {}}>
                    <div className="sb-zodiac-img" style={{ backgroundImage: `url(${z.image})` }}>
                      <div className="sb-zodiac-img-overlay" style={{ background: `linear-gradient(to top, ${z.color}cc, ${z.color}44)` }} />
                      <span className="sb-zodiac-symbol">{z.symbol}</span>
                    </div>
                    <span className="sb-zodiac-name">{z.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Selected sign detail card */}
            {selectedSign && ZODIAC_DATA[selectedSign] && (
              <div className="sb-zodiac-detail">
                <div className="sb-zodiac-detail-header" style={{ borderLeftColor: ZODIAC_DATA[selectedSign].color }}>
                  <span style={{ fontSize: 28 }}>{ZODIAC_DATA[selectedSign].symbol}</span>
                  <div>
                    <h4>{ZODIAC_DATA[selectedSign].name}</h4>
                    <span className="sb-zodiac-dates">{ZODIAC_DATA[selectedSign].dates}</span>
                  </div>
                </div>
                <div className="sb-zodiac-meta">
                  <div><strong>Element:</strong> {ZODIAC_DATA[selectedSign].element}</div>
                  <div><strong>Ruler:</strong> {ZODIAC_DATA[selectedSign].ruler}</div>
                  <div><strong>Lucky Color:</strong> {getLuckyColor(selectedSign)}</div>
                  <div><strong>Lucky Numbers:</strong> {getLuckyNumbers().join(', ')}</div>
                </div>
                <div className="sb-zodiac-traits">
                  {ZODIAC_DATA[selectedSign].traits.map((t) => (
                    <span key={t} className="sb-trait-chip" style={{ borderColor: `${ZODIAC_DATA[selectedSign].color}44` }}>{t}</span>
                  ))}
                </div>
                <div className="sb-zodiac-compat">
                  <strong>Compatible with:</strong> {ZODIAC_DATA[selectedSign].compatible.join(', ')}
                </div>
              </div>
            )}

            {horoscopeLoading && <p className="sb-horoscope-loading">{'🔮'} Reading the stars...</p>}
            {horoscope && !horoscopeLoading && (
              <div className="sb-horoscope-result">
                <span className="sb-horoscope-label">Today's Reading</span>
                <p>{horoscope}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
