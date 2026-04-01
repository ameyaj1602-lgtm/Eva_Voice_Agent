import React, { useState, useEffect, useRef, useCallback } from 'react';

const PRESETS = {
  meditation: [
    { label: '5 min', seconds: 300 },
    { label: '10 min', seconds: 600 },
    { label: '15 min', seconds: 900 },
    { label: '20 min', seconds: 1200 },
  ],
  sleep: [
    { label: '15 min', seconds: 900 },
    { label: '30 min', seconds: 1800 },
    { label: '45 min', seconds: 2700 },
    { label: '1 hour', seconds: 3600 },
  ],
  pomodoro: [
    { label: 'Focus 25m', seconds: 1500, type: 'focus' },
    { label: 'Break 5m', seconds: 300, type: 'break' },
    { label: 'Long Break 15m', seconds: 900, type: 'break' },
  ],
};

export default function TimerModal({ isOpen, onClose, mode, timerType = 'meditation' }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const intervalRef = useRef(null);

  const stopTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          // Play bell sound
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.value = 528; // healing frequency
            osc.type = 'sine';
            gain.gain.value = 0.3;
            osc.start(); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
            setTimeout(() => { osc.stop(); ctx.close(); }, 2500);
          } catch {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, stopTimer]);

  useEffect(() => { if (!isOpen) stopTimer(); }, [isOpen, stopTimer]);

  if (!isOpen) return null;

  const startTimer = (seconds) => {
    setTotalTime(seconds);
    setTimeLeft(seconds);
    setIsRunning(true);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  const title = timerType === 'sleep' ? 'Sleep Timer' : timerType === 'pomodoro' ? 'Pomodoro' : 'Meditation Timer';
  const presets = PRESETS[timerType] || PRESETS.meditation;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="breathing-modal" onClick={(e) => e.stopPropagation()}>
        <button className="settings-close breathing-close" onClick={onClose}>&times;</button>
        <h2 className="breathing-title">{title}</h2>

        {!isRunning && timeLeft === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
            {presets.map((p) => (
              <button key={p.label} className="breathing-start-btn"
                onClick={() => startTimer(p.seconds)}
                style={{ backgroundColor: mode.accentColor, width: '80%' }}>
                {p.label}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            {/* Progress ring */}
            <div style={{ position: 'relative', width: 180, height: 180, margin: '20px auto' }}>
              <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                <circle cx="90" cy="90" r="80" fill="none" stroke={mode.accentColor} strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 80}`}
                  strokeDashoffset={`${2 * Math.PI * 80 * (1 - progress / 100)}`}
                  strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 36, fontWeight: 300, color: '#fff' }}>
                  {mins}:{secs.toString().padStart(2, '0')}
                </span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                  {isRunning ? 'remaining' : 'done!'}
                </span>
              </div>
            </div>

            <button className="breathing-start-btn"
              onClick={isRunning ? stopTimer : () => { setTimeLeft(0); setTotalTime(0); }}
              style={{ backgroundColor: isRunning ? 'rgba(255,255,255,0.1)' : mode.accentColor }}>
              {isRunning ? 'Stop' : 'Done'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
