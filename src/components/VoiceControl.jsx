import React, { useState, useRef, useCallback, useEffect } from 'react';

// Use browser's built-in speech recognition for live transcription
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function VoiceControl({
  mode,
  isRecording,
  duration,
  onStartRecording,
  onStopRecording,
  onSendText,
  sttSupported = true,
}) {
  const [textInput, setTextInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  const hasSpeechRecognition = !!SpeechRecognition;

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    const finalText = (textInput + ' ' + interimText).trim();
    if (finalText) {
      stopListening();
      onSendText(finalText);
      setTextInput('');
      setInterimText('');
    }
  };

  const startListening = useCallback(() => {
    if (!hasSpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = textInput;

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? ' ' : '') + transcript;
          setTextInput(finalTranscript);
          setInterimText('');
        } else {
          interim += transcript;
        }
      }
      if (interim) setInterimText(interim);
    };

    recognition.onend = () => {
      // Restart if still in listening mode (browser stops after silence)
      if (recognitionRef.current && isListening) {
        try { recognition.start(); } catch { }
      }
    };

    recognition.onerror = (e) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.warn('Speech recognition error:', e.error);
      }
    };

    try {
      recognition.start();
      setIsListening(true);
      // Focus the input so user can see text appearing
      inputRef.current?.focus();
    } catch { }
  }, [hasSpeechRecognition, textInput, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // prevent restart
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    // Move any interim text to final
    if (interimText) {
      setTextInput((prev) => (prev + ' ' + interimText).trim());
      setInterimText('');
    }
    setIsListening(false);
  }, [interimText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const displayValue = interimText ? textInput + (textInput ? ' ' : '') + interimText : textInput;

  return (
    <div className="voice-control">
      {/* Text input with live transcription */}
      <form className="text-input-form" onSubmit={handleTextSubmit}>
        <input
          ref={inputRef}
          type="text"
          className={`text-input ${isListening ? 'listening' : ''}`}
          placeholder={isListening ? 'Listening... speak now' : `Message Eva (${mode.name} mode)...`}
          value={displayValue}
          onChange={(e) => { setTextInput(e.target.value); setInterimText(''); }}
          style={{ borderColor: isListening ? mode.accentColor : `${mode.accentColor}33` }}
        />
        {displayValue.trim() && (
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

      {/* Mic button - now uses live transcription */}
      <div className="mic-section">
        {isListening && (
          <div className="recording-timer" style={{ color: mode.accentColor }}>
            <span className="recording-dot" />
            Listening...
          </div>
        )}

        <button
          className={`mic-btn ${isListening ? 'recording' : ''} ${!hasSpeechRecognition ? 'disabled' : ''}`}
          onClick={hasSpeechRecognition ? handleMicClick : undefined}
          disabled={!hasSpeechRecognition}
          style={{
            '--mic-color': mode.accentColor,
            '--mic-glow': mode.glowColor,
          }}
          title={hasSpeechRecognition ? (isListening ? 'Stop listening' : 'Speak - text appears in input') : 'Speech recognition not supported'}
        >
          {isListening ? (
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
          {!hasSpeechRecognition
            ? 'Use Chrome for voice'
            : isListening
            ? 'Tap to stop, edit text, then send'
            : 'Tap to speak'}
        </span>
      </div>
    </div>
  );
}
