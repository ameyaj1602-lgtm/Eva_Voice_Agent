import React, { useState, useEffect, useRef } from 'react';

const SCENES = [
  { id: 'rain', name: 'Rainy Night', emoji: '🌧️', bg: '#0a1628', sounds: ['rain'], breathe: true },
  { id: 'ocean', name: 'Ocean Waves', emoji: '🌊', bg: '#0f2027', sounds: ['ocean'], breathe: true },
  { id: 'forest', name: 'Forest Morning', emoji: '🌿', bg: '#0a2010', sounds: ['forest'], breathe: false },
  { id: 'fire', name: 'Fireplace', emoji: '🔥', bg: '#1a0a05', sounds: ['fire'], breathe: true },
  { id: 'space', name: 'Deep Space', emoji: '🌌', bg: '#050510', sounds: [], breathe: true },
];

export default function AmbientMode({ isOpen, onClose, mode }) {
  const [scene, setScene] = useState(SCENES[0]);
  const [breathePhase, setBreathePhase] = useState('inhale');
  const [breatheCount, setBreatheCount] = useState(4);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);
  const breatheRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    // Timer
    intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(intervalRef.current);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !scene.breathe) return;
    // Breathing cycle: inhale 4s → hold 4s → exhale 6s
    const phases = [
      { name: 'inhale', duration: 4000 },
      { name: 'hold', duration: 4000 },
      { name: 'exhale', duration: 6000 },
    ];
    let phaseIdx = 0;
    const cycle = () => {
      setBreathePhase(phases[phaseIdx].name);
      let count = phases[phaseIdx].duration / 1000;
      setBreatheCount(count);
      const countDown = setInterval(() => {
        count--;
        setBreatheCount(count);
      }, 1000);
      breatheRef.current = setTimeout(() => {
        clearInterval(countDown);
        phaseIdx = (phaseIdx + 1) % phases.length;
        cycle();
      }, phases[phaseIdx].duration);
    };
    cycle();
    return () => { clearTimeout(breatheRef.current); };
  }, [isOpen, scene]);

  if (!isOpen) return null;

  const mins = Math.floor(timer / 60);
  const secs = timer % 60;

  return (
    <div className="ambient-overlay" style={{ background: scene.bg }} onClick={onClose}>
      <div className="ambient-content" onClick={e => e.stopPropagation()}>
        {/* Scene selector */}
        <div className="ambient-scenes">
          {SCENES.map(s => (
            <button key={s.id} className={`ambient-scene-btn ${scene.id === s.id ? 'active' : ''}`}
              onClick={() => setScene(s)} style={scene.id === s.id ? { borderColor: mode.accentColor } : {}}>
              <span>{s.emoji}</span>
              <span>{s.name}</span>
            </button>
          ))}
        </div>

        {/* Breathing circle */}
        {scene.breathe && (
          <div className="ambient-breathe">
            <div className={`ambient-circle ${breathePhase}`} style={{ borderColor: mode.accentColor }}>
              <span className="ambient-phase">{breathePhase}</span>
              <span className="ambient-count">{breatheCount}</span>
            </div>
          </div>
        )}

        {/* Timer */}
        <div className="ambient-timer">
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>

        <p className="ambient-hint">Tap anywhere to exit</p>
      </div>
    </div>
  );
}
