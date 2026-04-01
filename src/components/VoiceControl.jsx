import React from 'react';

export default function VoiceControl({
  mode,
  isRecording,
  duration,
  onStartRecording,
  onStopRecording,
  onSendText,
  sttSupported = true,
}) {
  const [textInput, setTextInput] = React.useState('');

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim()) {
      onSendText(textInput.trim());
      setTextInput('');
    }
  };

  return (
    <div className="voice-control">
      {/* Text input */}
      <form className="text-input-form" onSubmit={handleTextSubmit}>
        <input
          type="text"
          className="text-input"
          placeholder={`Message Eva (${mode.name} mode)...`}
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          style={{ borderColor: `${mode.accentColor}33` }}
        />
        {textInput.trim() && (
          <button
            type="submit"
            className="send-btn"
            style={{ backgroundColor: mode.accentColor }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        )}
      </form>

      {/* Mic button */}
      <div className="mic-section">
        {isRecording && (
          <div className="recording-timer" style={{ color: mode.accentColor }}>
            <span className="recording-dot" />
            {formatDuration(duration)}
          </div>
        )}

        <button
          className={`mic-btn ${isRecording ? 'recording' : ''} ${!sttSupported ? 'disabled' : ''}`}
          onClick={sttSupported ? (isRecording ? onStopRecording : onStartRecording) : undefined}
          disabled={!sttSupported}
          style={{
            '--mic-color': mode.accentColor,
            '--mic-glow': mode.glowColor,
          }}
          title={sttSupported ? '' : 'Speech recognition not supported in this browser. Use Chrome for best results.'}
        >
          {isRecording ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </button>

        <span className="mic-hint">
          {!sttSupported
            ? 'Use Chrome for voice'
            : isRecording
            ? 'Listening... tap to stop'
            : 'Tap to speak'}
        </span>
      </div>
    </div>
  );
}
