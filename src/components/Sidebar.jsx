import React, { useState, useEffect } from 'react';
import { getRandomQuote, getRandomAdvice, getRandomJoke, getRandomFact, getRandomAffirmation, getWeather, getHoroscope, HOROSCOPE_SIGNS } from '../services/freeApis';

// Web Audio API generated ambient sounds (always works, no CORS issues)
function createAmbientSound(type) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const nodes = [];

  if (type === 'rain' || type === 'ocean') {
    // White/brown noise
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = type === 'rain' ? 'highpass' : 'lowpass';
    filter.frequency.value = type === 'rain' ? 800 : 300;
    const gain = ctx.createGain();
    gain.gain.value = type === 'rain' ? 0.15 : 0.2;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    nodes.push(source);
  } else if (type === 'fire') {
    // Crackling noise
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (Math.random() > 0.97 ? 1 : 0.1);
    const source = ctx.createBufferSource();
    source.buffer = buffer; source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass'; filter.frequency.value = 600; filter.Q.value = 0.5;
    const gain = ctx.createGain();
    gain.gain.value = 0.25;
    source.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    source.start();
    nodes.push(source);
  } else if (type === 'birds') {
    // Chirping oscillators
    const chirp = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 2000 + Math.random() * 2000;
      gain.gain.value = 0;
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start();
      const loop = () => {
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
        gain.gain.linearRampToValueAtTime(0, now + 0.15);
        osc.frequency.setValueAtTime(2000 + Math.random() * 2000, now);
        setTimeout(loop, 500 + Math.random() * 2000);
      };
      loop();
      nodes.push(osc);
    };
    chirp(); chirp(); chirp();
  } else if (type === 'lofi') {
    // Simple chord progression
    const freqs = [261.6, 329.6, 392.0]; // C major
    freqs.forEach((f) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = f;
      gain.gain.value = 0.06;
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start();
      nodes.push(osc);
    });
  }

  return { ctx, nodes, stop: () => { nodes.forEach(n => { try { n.stop(); } catch {} }); ctx.close(); } };
}

const AMBIENT_SOUNDS = [
  { id: 'rain', name: 'Rain', emoji: '\u{1F327}\uFE0F' },
  { id: 'ocean', name: 'Ocean Waves', emoji: '\u{1F30A}' },
  { id: 'fire', name: 'Fireplace', emoji: '\u{1F525}' },
  { id: 'birds', name: 'Birds', emoji: '\u{1F426}' },
  { id: 'lofi', name: 'Lo-Fi Beats', emoji: '\u{1F3B5}' },
];

export default function Sidebar({ isOpen, onClose, mode, settings }) {
  const [activePanel, setActivePanel] = useState(null);
  const [quote, setQuote] = useState(null);
  const [advice, setAdvice] = useState(null);
  const [joke, setJoke] = useState(null);
  const [fact, setFact] = useState(null);
  const [affirmation, setAffirmation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [horoscope, setHoroscope] = useState(null);
  const [selectedSign, setSelectedSign] = useState('aries');
  const [playingSound, setPlayingSound] = useState(null);
  const [audioEl, setAudioEl] = useState(null);
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('eva-font-size') || '14'));
  const [voiceSpeed, setVoiceSpeed] = useState(() => parseFloat(localStorage.getItem('eva-voice-speed') || '1.0'));

  useEffect(() => {
    document.documentElement.style.setProperty('--chat-font-size', `${fontSize}px`);
    localStorage.setItem('eva-font-size', String(fontSize));
  }, [fontSize]);

  useEffect(() => { localStorage.setItem('eva-voice-speed', String(voiceSpeed)); }, [voiceSpeed]);

  const fetchQuote = async () => { setQuote(await getRandomQuote()); };
  const fetchAdvice = async () => { setAdvice(await getRandomAdvice()); };
  const fetchJoke = async () => { setJoke(await getRandomJoke()); };
  const fetchFact = async () => { setFact(await getRandomFact()); };
  const fetchAffirmation = async () => { setAffirmation(await getRandomAffirmation()); };

  const fetchWeather = async () => {
    const key = settings?.openWeatherKey || process.env.REACT_APP_OPENWEATHER_API_KEY;
    if (!key) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => { setWeather(await getWeather(key, pos.coords.latitude, pos.coords.longitude)); },
        async () => { setWeather(await getWeather(key, 19.076, 72.8777)); }
      );
    }
  };

  const fetchHoroscope = async (sign) => {
    setSelectedSign(sign);
    setHoroscope(await getHoroscope(sign));
  };

  const toggleSound = (sound) => {
    if (audioEl) { audioEl.stop(); setAudioEl(null); }
    if (playingSound === sound.id) { setPlayingSound(null); return; }
    const amb = createAmbientSound(sound.id);
    setAudioEl(amb);
    setPlayingSound(sound.id);
  };

  useEffect(() => { return () => { if (audioEl) audioEl.stop(); }; }, [audioEl]);

  if (!isOpen) return null;

  const Item = ({ emoji, label, onClick, active }) => (
    <button className={`sb-item ${active ? 'active' : ''}`} onClick={onClick}
      style={active ? { color: mode.accentColor, borderLeftColor: mode.accentColor } : {}}>
      <span className="sb-item-emoji">{emoji}</span>
      <span className="sb-item-label">{label}</span>
    </button>
  );

  return (
    <>
      <div className="sb-overlay" onClick={onClose} />
      <div className="sb" style={{ '--sb-accent': mode.accentColor }}>
        <div className="sb-header">
          <h2 className="sb-title">{'✨'} Discover</h2>
          <button className="settings-close" onClick={onClose}>&times;</button>
        </div>

        <div className="sb-body">
          {/* AMBIENT SOUNDS */}
          <div className="sb-category">
            <span className="sb-cat-label">Ambient Sounds</span>
            <div className="sb-sounds">
              {AMBIENT_SOUNDS.map((s) => (
                <button key={s.id} className={`sb-sound-btn ${playingSound === s.id ? 'playing' : ''}`}
                  onClick={() => toggleSound(s)}
                  style={playingSound === s.id ? { borderColor: mode.accentColor, background: `${mode.accentColor}15` } : {}}>
                  <span>{s.emoji}</span>
                  <span className="sb-sound-name">{s.name}</span>
                  {playingSound === s.id && <span className="sb-sound-playing">{'\u25B6'}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* DISCOVER - FREE APIS */}
          <div className="sb-category">
            <span className="sb-cat-label">Inspiration</span>

            <Item emoji="💡" label="Random Quote" active={activePanel === 'quote'}
              onClick={() => { setActivePanel(activePanel === 'quote' ? null : 'quote'); fetchQuote(); }} />
            {activePanel === 'quote' && quote && (
              <div className="sb-panel">
                <p className="sb-panel-text">"{quote.text}"</p>
                <p className="sb-panel-sub">— {quote.author}</p>
                <button className="sb-panel-btn" onClick={fetchQuote} style={{ color: mode.accentColor }}>New Quote</button>
              </div>
            )}

            <Item emoji="🎯" label="Life Advice" active={activePanel === 'advice'}
              onClick={() => { setActivePanel(activePanel === 'advice' ? null : 'advice'); fetchAdvice(); }} />
            {activePanel === 'advice' && advice && (
              <div className="sb-panel">
                <p className="sb-panel-text">{advice}</p>
                <button className="sb-panel-btn" onClick={fetchAdvice} style={{ color: mode.accentColor }}>New Advice</button>
              </div>
            )}

            <Item emoji="✨" label="Affirmation" active={activePanel === 'affirm'}
              onClick={() => { setActivePanel(activePanel === 'affirm' ? null : 'affirm'); fetchAffirmation(); }} />
            {activePanel === 'affirm' && affirmation && (
              <div className="sb-panel">
                <p className="sb-panel-text">{affirmation}</p>
                <button className="sb-panel-btn" onClick={fetchAffirmation} style={{ color: mode.accentColor }}>New Affirmation</button>
              </div>
            )}
          </div>

          <div className="sb-category">
            <span className="sb-cat-label">Fun</span>

            <Item emoji="😂" label="Random Joke" active={activePanel === 'joke'}
              onClick={() => { setActivePanel(activePanel === 'joke' ? null : 'joke'); fetchJoke(); }} />
            {activePanel === 'joke' && joke && (
              <div className="sb-panel">
                <p className="sb-panel-text">{joke}</p>
                <button className="sb-panel-btn" onClick={fetchJoke} style={{ color: mode.accentColor }}>Another Joke</button>
              </div>
            )}

            <Item emoji="🧪" label="Fun Fact" active={activePanel === 'fact'}
              onClick={() => { setActivePanel(activePanel === 'fact' ? null : 'fact'); fetchFact(); }} />
            {activePanel === 'fact' && fact && (
              <div className="sb-panel">
                <p className="sb-panel-text">{fact}</p>
                <button className="sb-panel-btn" onClick={fetchFact} style={{ color: mode.accentColor }}>New Fact</button>
              </div>
            )}
          </div>

          <div className="sb-category">
            <span className="sb-cat-label">Daily</span>

            <Item emoji="🌤️" label="Weather Mood" active={activePanel === 'weather'}
              onClick={() => { setActivePanel(activePanel === 'weather' ? null : 'weather'); fetchWeather(); }} />
            {activePanel === 'weather' && weather && (
              <div className="sb-panel">
                <p className="sb-panel-text">{weather.mood?.emoji} {weather.temp}°C in {weather.city}</p>
                <p className="sb-panel-sub">{weather.description} — {weather.mood?.text}</p>
              </div>
            )}

            <Item emoji="♈" label="Horoscope" active={activePanel === 'horoscope'}
              onClick={() => { setActivePanel(activePanel === 'horoscope' ? null : 'horoscope'); fetchHoroscope(selectedSign); }} />
            {activePanel === 'horoscope' && (
              <div className="sb-panel">
                <div className="sb-signs">
                  {HOROSCOPE_SIGNS.map((s) => (
                    <button key={s} className={`sb-sign ${selectedSign === s ? 'active' : ''}`}
                      onClick={() => fetchHoroscope(s)}
                      style={selectedSign === s ? { color: mode.accentColor, borderColor: mode.accentColor } : {}}>
                      {s.charAt(0).toUpperCase() + s.slice(1, 3)}
                    </button>
                  ))}
                </div>
                {horoscope && <p className="sb-panel-text" style={{ marginTop: 10 }}>{horoscope}</p>}
              </div>
            )}
          </div>

          {/* ACCESSIBILITY */}
          <div className="sb-category">
            <span className="sb-cat-label">Accessibility</span>
            <div className="sb-slider-row">
              <span className="sb-slider-label">Font Size: {fontSize}px</span>
              <input type="range" min="12" max="22" value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))} className="sb-slider" />
            </div>
            <div className="sb-slider-row">
              <span className="sb-slider-label">Voice Speed: {voiceSpeed}x</span>
              <input type="range" min="0.5" max="2.0" step="0.1" value={voiceSpeed}
                onChange={(e) => setVoiceSpeed(Number(e.target.value))} className="sb-slider" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
