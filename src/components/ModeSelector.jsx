import React, { useState } from 'react';
import { MODES } from '../utils/modes';

export default function ModeSelector({ currentMode, onModeChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const modes = Object.values(MODES);

  return (
    <div className={`mode-selector ${isExpanded ? 'expanded' : ''}`}>
      <button
        className="mode-toggle-btn"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ borderColor: currentMode.accentColor }}
      >
        <span className="mode-toggle-emoji">{currentMode.emoji}</span>
        <span className="mode-toggle-name">{currentMode.name}</span>
        <span className={`mode-toggle-arrow ${isExpanded ? 'up' : ''}`}>&#9662;</span>
      </button>

      {isExpanded && (
        <div className="mode-options">
          {modes.map((mode) => (
            <button
              key={mode.id}
              className={`mode-option ${mode.id === currentMode.id ? 'active' : ''}`}
              onClick={() => {
                onModeChange(mode);
                setIsExpanded(false);
              }}
              style={{
                '--mode-accent': mode.accentColor,
                '--mode-glow': mode.glowColor,
              }}
            >
              <span className="mode-option-emoji">{mode.emoji}</span>
              <div className="mode-option-info">
                <span className="mode-option-name">{mode.name}</span>
                <span className="mode-option-desc">{mode.description}</span>
              </div>
              {mode.id === currentMode.id && (
                <span className="mode-option-check">&#10003;</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
