import React, { useState, useEffect, useRef } from 'react';

const MODES = [
  { name: 'Focus', minutes: 25, color: '#f5576c' },
  { name: 'Short Break', minutes: 5, color: '#38ef7d' },
  { name: 'Long Break', minutes: 15, color: '#4ecdc4' },
];

export default function PomodoroTimer({ isOpen, onClose, mode }) {
  const [pomMode, setPomMode] = useState(0);
  const [seconds, setSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => setSeconds(s => s - 1), 1000);
    } else if (seconds === 0) {
      // Session complete
      setIsRunning(false);
      if (pomMode === 0) setSessions(s => s + 1);
      // Auto-switch to break
      const next = pomMode === 0 ? (sessions > 0 && sessions % 4 === 3 ? 2 : 1) : 0;
      setPomMode(next);
      setSeconds(MODES[next].minutes * 60);
      // Play notification sound
      try { new Audio('data:audio/wav;base64,UklGRl9vT19teleHNlcklI...').play(); } catch {}
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, seconds, pomMode, sessions]);

  if (!isOpen) return null;

  const current = MODES[pomMode];
  const totalSeconds = current.minutes * 60;
  const progress = ((totalSeconds - seconds) / totalSeconds) * 100;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const reset = () => { setIsRunning(false); setSeconds(current.minutes * 60); };
  const switchMode = (i) => { setIsRunning(false); setPomMode(i); setSeconds(MODES[i].minutes * 60); };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className="settings-header">
          <h2>Pomodoro</h2>
          <button className="settings-close" onClick={onClose}>&times;</button>
        </div>
        <div className="settings-body" style={{ textAlign: 'center', padding: '24px' }}>
          {/* Mode tabs */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
            {MODES.map((m, i) => (
              <button key={m.name} onClick={() => switchMode(i)}
                style={{
                  padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  background: pomMode === i ? m.color : 'rgba(255,255,255,0.08)',
                  color: '#fff', fontSize: 12, fontWeight: 600,
                }}>
                {m.name}
              </button>
            ))}
          </div>

          {/* Timer circle */}
          <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 24px' }}>
            <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              <circle cx="100" cy="100" r="90" fill="none" stroke={current.color} strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 90}`} strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 48, fontWeight: 700, fontFamily: 'monospace', color: '#fff' }}>
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{current.name}</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => setIsRunning(!isRunning)}
              style={{ padding: '12px 32px', borderRadius: 14, border: 'none', background: current.color, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button onClick={reset}
              style={{ padding: '12px 20px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer' }}>
              Reset
            </button>
          </div>

          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 16 }}>
            Sessions today: {sessions} | Stay focused, you got this
          </p>
        </div>
      </div>
    </div>
  );
}
