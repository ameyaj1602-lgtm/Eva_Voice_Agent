import React, { useState, useEffect, useCallback } from 'react';

const PATTERNS = {
  calm: { inhale: 4, hold: 4, exhale: 6, name: '4-4-6 Calming' },
  box: { inhale: 4, hold: 4, exhale: 4, name: '4-4-4 Box Breathing' },
  sleep: { inhale: 4, hold: 7, exhale: 8, name: '4-7-8 Sleep' },
};

export default function BreathingExercise({ isOpen, onClose, mode }) {
  const [phase, setPhase] = useState('idle'); // idle, inhale, hold, exhale
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [pattern, setPattern] = useState('calm');
  const [isRunning, setIsRunning] = useState(false);

  const p = PATTERNS[pattern];

  const resetExercise = useCallback(() => {
    setPhase('idle');
    setCount(0);
    setCycles(0);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setCount((prev) => {
        const maxCount =
          phase === 'inhale' ? p.inhale :
          phase === 'hold' ? p.hold :
          phase === 'exhale' ? p.exhale : 0;

        if (prev >= maxCount) {
          if (phase === 'inhale') setPhase('hold');
          else if (phase === 'hold') setPhase('exhale');
          else if (phase === 'exhale') {
            setCycles((c) => c + 1);
            setPhase('inhale');
          }
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, phase, p]);

  const startExercise = () => {
    setPhase('inhale');
    setCount(0);
    setCycles(0);
    setIsRunning(true);
  };

  if (!isOpen) return null;

  const circleScale =
    phase === 'inhale' ? 1 + (count / p.inhale) * 0.5 :
    phase === 'hold' ? 1.5 :
    phase === 'exhale' ? 1.5 - (count / p.exhale) * 0.5 : 1;

  const phaseText =
    phase === 'inhale' ? 'Breathe In' :
    phase === 'hold' ? 'Hold' :
    phase === 'exhale' ? 'Breathe Out' : 'Ready';

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="breathing-modal" onClick={(e) => e.stopPropagation()}>
        <button className="settings-close breathing-close" onClick={onClose}>&times;</button>

        <div className="breathing-content">
          <h2 className="breathing-title">Breathing Exercise</h2>

          <div className="breathing-patterns">
            {Object.entries(PATTERNS).map(([key, val]) => (
              <button key={key}
                className={`breathing-pattern-btn ${pattern === key ? 'active' : ''}`}
                onClick={() => { setPattern(key); resetExercise(); }}
                style={pattern === key ? { borderColor: mode.accentColor, color: mode.accentColor } : {}}>
                {val.name}
              </button>
            ))}
          </div>

          <div className="breathing-circle-container">
            <div className="breathing-circle" style={{
              transform: `scale(${circleScale})`,
              background: mode.gradient,
              boxShadow: `0 0 ${40 * circleScale}px ${mode.glowColor}`,
            }}>
              <span className="breathing-phase">{phaseText}</span>
              {isRunning && <span className="breathing-count">{count}</span>}
            </div>
          </div>

          <p className="breathing-cycles">Cycles: {cycles}</p>

          {!isRunning ? (
            <button className="breathing-start-btn" onClick={startExercise}
              style={{ backgroundColor: mode.accentColor }}>
              Start Breathing
            </button>
          ) : (
            <button className="breathing-start-btn" onClick={resetExercise}
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              Stop
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
