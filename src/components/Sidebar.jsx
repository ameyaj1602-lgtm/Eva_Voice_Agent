import React, { useState, useEffect } from 'react';
import { getRandomQuote, getRandomAdvice, getRandomJoke, getRandomFact, getRandomAffirmation, getWeather, getHoroscope, HOROSCOPE_SIGNS } from '../services/freeApis';

const AMBIENT_SOUNDS = [
  { id: 'rain', name: 'Rain', emoji: '\u{1F327}\uFE0F', url: 'https://cdn.pixabay.com/audio/2022/10/30/audio_93a4d7aa82.mp3' },
  { id: 'ocean', name: 'Ocean Waves', emoji: '\u{1F30A}', url: 'https://cdn.pixabay.com/audio/2024/11/04/audio_4956b20543.mp3' },
  { id: 'fire', name: 'Fireplace', emoji: '\u{1F525}', url: 'https://cdn.pixabay.com/audio/2024/06/12/audio_81e0a05188.mp3' },
  { id: 'birds', name: 'Birds', emoji: '\u{1F426}', url: 'https://cdn.pixabay.com/audio/2022/03/09/audio_c610e1599c.mp3' },
  { id: 'lofi', name: 'Lo-Fi Beats', emoji: '\u{1F3B5}', url: 'https://cdn.pixabay.com/audio/2024/09/26/audio_24af1e4195.mp3' },
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
    if (audioEl) { audioEl.pause(); setAudioEl(null); }
    if (playingSound === sound.id) { setPlayingSound(null); return; }
    const audio = new Audio(sound.url);
    audio.loop = true;
    audio.volume = 0.4;
    audio.play().catch(() => {});
    setAudioEl(audio);
    setPlayingSound(sound.id);
  };

  useEffect(() => { return () => { if (audioEl) audioEl.pause(); }; }, [audioEl]);

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
