import React, { useState, useRef, useEffect } from 'react';

const SOUNDS = [
  { id: 'rain', name: 'Rain', emoji: '🌧️', freq: [200, 400, 800], type: 'noise' },
  { id: 'thunder', name: 'Thunder', emoji: '⛈️', freq: [60, 120], type: 'rumble' },
  { id: 'ocean', name: 'Ocean', emoji: '🌊', freq: [150, 300, 600], type: 'wave' },
  { id: 'fire', name: 'Fireplace', emoji: '🔥', freq: [200, 500, 1000], type: 'crackle' },
  { id: 'wind', name: 'Wind', emoji: '💨', freq: [100, 250, 500], type: 'noise' },
  { id: 'birds', name: 'Birds', emoji: '🐦', freq: [1200, 2400, 3600], type: 'chirp' },
  { id: 'night', name: 'Night', emoji: '🦗', freq: [2000, 4000, 6000], type: 'chirp' },
  { id: 'stream', name: 'Stream', emoji: '🏞️', freq: [300, 600, 1200], type: 'water' },
];

function createSoundNode(ctx, sound) {
  const gainNode = ctx.createGain();
  gainNode.gain.value = 0;
  gainNode.connect(ctx.destination);

  // Create noise-based ambient sound
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    let val = (Math.random() * 2 - 1);
    // Shape the noise based on sound type
    if (sound.type === 'wave') val *= Math.sin(i / ctx.sampleRate * 0.3) * 0.5 + 0.5;
    if (sound.type === 'chirp') val *= Math.sin(i / ctx.sampleRate * 8) > 0.7 ? 1 : 0.05;
    if (sound.type === 'crackle') val *= Math.random() > 0.95 ? 2 : 0.3;
    if (sound.type === 'rumble') val *= 0.5;
    if (sound.type === 'water') val *= Math.sin(i / ctx.sampleRate * 2) * 0.3 + 0.7;
    data[i] = val * 0.3;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  // Add filter for character
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = sound.freq[1] || 500;
  source.connect(filter);
  filter.connect(gainNode);
  source.start();

  return { source, gain: gainNode, filter };
}

export default function SoundMixer({ isOpen, onClose, mode }) {
  const [volumes, setVolumes] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const ctxRef = useRef(null);
  const nodesRef = useRef({});

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      Object.values(nodesRef.current).forEach(n => { try { n.source.stop(); } catch {} });
      try { ctxRef.current?.close(); } catch {}
    };
  }, []);

  const ensureContext = () => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  };

  const setVolume = (soundId, vol) => {
    setVolumes(prev => ({ ...prev, [soundId]: vol }));

    const ctx = ensureContext();
    if (!nodesRef.current[soundId]) {
      const sound = SOUNDS.find(s => s.id === soundId);
      if (sound) nodesRef.current[soundId] = createSoundNode(ctx, sound);
    }
    if (nodesRef.current[soundId]) {
      nodesRef.current[soundId].gain.gain.setTargetAtTime(vol / 100, ctx.currentTime, 0.1);
    }

    const anyPlaying = Object.values({ ...volumes, [soundId]: vol }).some(v => v > 0);
    setIsPlaying(anyPlaying);
  };

  const stopAll = () => {
    Object.entries(nodesRef.current).forEach(([id, node]) => {
      node.gain.gain.setTargetAtTime(0, ctxRef.current?.currentTime || 0, 0.1);
    });
    setVolumes({});
    setIsPlaying(false);
  };

  // Presets
  const applyPreset = (preset) => {
    Object.entries(preset).forEach(([id, vol]) => setVolume(id, vol));
  };

  const PRESETS = [
    { name: 'Rainy Night', emoji: '🌧️', mix: { rain: 70, thunder: 20, wind: 15 } },
    { name: 'Beach Sunset', emoji: '🏖️', mix: { ocean: 80, wind: 20, birds: 10 } },
    { name: 'Cozy Cabin', emoji: '🏠', mix: { fire: 70, rain: 40, wind: 10 } },
    { name: 'Forest Morning', emoji: '🌲', mix: { birds: 60, stream: 50, wind: 15 } },
    { name: 'Deep Sleep', emoji: '😴', mix: { rain: 50, ocean: 30, night: 20 } },
  ];

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div className="settings-header">
          <h2>Sound Mixer</h2>
          <button className="settings-close" onClick={onClose}>&times;</button>
        </div>
        <div className="settings-body">
          {/* Presets */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {PRESETS.map(p => (
              <button key={p.name} className="vp-preset-btn" onClick={() => applyPreset(p.mix)}
                style={{ borderColor: `${mode.accentColor}33`, flex: '1 1 45%' }}>
                <span>{p.emoji}</span><span>{p.name}</span>
              </button>
            ))}
          </div>

          {/* Individual sliders */}
          {SOUNDS.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{s.emoji}</span>
              <span style={{ fontSize: 12, width: 60, color: 'rgba(255,255,255,0.5)' }}>{s.name}</span>
              <input type="range" min="0" max="100" value={volumes[s.id] || 0}
                onChange={e => setVolume(s.id, parseInt(e.target.value))}
                style={{ flex: 1, accentColor: mode.accentColor }} />
              <span style={{ fontSize: 11, width: 30, textAlign: 'right', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                {volumes[s.id] || 0}%
              </span>
            </div>
          ))}

          {isPlaying && (
            <button onClick={stopAll} style={{
              width: '100%', padding: 10, marginTop: 12, border: '1px solid #ff4444',
              borderRadius: 10, background: 'rgba(255,68,68,0.1)', color: '#ff4444',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>Stop All Sounds</button>
          )}
        </div>
      </div>
    </div>
  );
}
