import React, { useState } from 'react';

export default function CreditLimitPopup({ isOpen, onClose, creditStatus, onUnlock, type }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleUnlock = () => {
    const success = onUnlock(password);
    if (success) {
      setPassword('');
      setError('');
      onClose();
    } else {
      setError('Wrong password');
      setTimeout(() => setError(''), 2000);
    }
  };

  const typeLabel = type === 'ai' ? 'AI responses' : type === 'tts' ? 'voice responses' : type === 'stt' ? 'voice recordings' : 'API calls';

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="credit-popup" onClick={(e) => e.stopPropagation()}>
        <div className="credit-popup-icon">{'🔒'}</div>
        <h2 className="credit-popup-title">Session Limit Reached</h2>
        <p className="credit-popup-desc">
          You've used all your free {typeLabel} for this session.
        </p>

        <div className="credit-popup-stats">
          <div className="credit-stat">
            <span className="credit-stat-label">AI Responses</span>
            <span className="credit-stat-value">{creditStatus.session.ai} / {creditStatus.limits.ai}</span>
          </div>
          <div className="credit-stat">
            <span className="credit-stat-label">Voice (TTS)</span>
            <span className="credit-stat-value">{creditStatus.session.tts} / {creditStatus.limits.tts}</span>
          </div>
          <div className="credit-stat">
            <span className="credit-stat-label">Voice (STT)</span>
            <span className="credit-stat-value">{creditStatus.session.stt} / {creditStatus.limits.stt}</span>
          </div>
          <div className="credit-stat">
            <span className="credit-stat-label">Total</span>
            <span className="credit-stat-value">{creditStatus.session.total} / {creditStatus.limits.total}</span>
          </div>
        </div>

        <div className="credit-popup-unlock">
          <p className="credit-unlock-hint">Enter password to unlock unlimited access:</p>
          <div className="credit-unlock-row">
            <input
              type="password"
              className="credit-unlock-input"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            />
            <button className="credit-unlock-btn" onClick={handleUnlock}>
              Unlock
            </button>
          </div>
          {error && <p className="credit-unlock-error">{error}</p>}
        </div>

        <button className="credit-popup-close" onClick={onClose}>
          Continue with limited access
        </button>
      </div>
    </div>
  );
}
