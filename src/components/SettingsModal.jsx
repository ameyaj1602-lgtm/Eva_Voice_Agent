import React, { useState, useEffect } from 'react';
import { getUsage } from '../services/elevenlabs';

export default function SettingsModal({
  isOpen, onClose, mode, settings, onSave,
  voices, selectedVoice, onVoiceChange, onOpenCloneModal,
}) {
  const [apiKey, setApiKey] = useState(settings.geminiApiKey || '');
  const [elevenLabsKey, setElevenLabsKey] = useState(settings.elevenLabsApiKey || '');
  const [deepgramKey, setDeepgramKey] = useState(settings.deepgramApiKey || '');
  const [autoSpeak, setAutoSpeak] = useState(settings.autoSpeak ?? true);
  const [useElevenLabs, setUseElevenLabs] = useState(settings.useElevenLabs ?? false);
  const [useDeepgram, setUseDeepgram] = useState(settings.useDeepgram ?? false);
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    if (isOpen && elevenLabsKey) {
      getUsage(elevenLabsKey).then(setUsage);
    }
  }, [isOpen, elevenLabsKey]);

  useEffect(() => {
    if (isOpen) {
      setApiKey(settings.geminiApiKey || '');
      setElevenLabsKey(settings.elevenLabsApiKey || '');
      setDeepgramKey(settings.deepgramApiKey || '');
      setAutoSpeak(settings.autoSpeak ?? true);
      setUseElevenLabs(settings.useElevenLabs ?? false);
      setUseDeepgram(settings.useDeepgram ?? false);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      geminiApiKey: apiKey,
      elevenLabsApiKey: elevenLabsKey,
      deepgramApiKey: deepgramKey,
      autoSpeak,
      useElevenLabs: useElevenLabs && !!elevenLabsKey,
      useDeepgram: useDeepgram && !!deepgramKey,
    });
    onClose();
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="settings-close" onClick={onClose}>&times;</button>
        </div>

        <div className="settings-body">
          {/* Gemini AI */}
          <div className="settings-section">
            <h3>AI Brain (Gemini)</h3>
            <p className="settings-hint">Free tier: 15 req/min. Get key from aistudio.google.com/apikey</p>
            <input type="password" className="settings-input" placeholder="Gemini API key..."
              value={apiKey} onChange={(e) => setApiKey(e.target.value)}
              style={{ borderColor: `${mode.accentColor}44` }} />
            <span className={`settings-status ${apiKey ? 'connected' : ''}`}>
              {apiKey ? '\u2713 Connected' : 'Not set - offline responses'}
            </span>
          </div>

          {/* Deepgram STT */}
          <div className="settings-section">
            <h3>Deepgram (Speech-to-Text)</h3>
            <p className="settings-hint">Free tier: $200 credit. Get key from deepgram.com</p>
            <input type="password" className="settings-input" placeholder="Deepgram API key..."
              value={deepgramKey} onChange={(e) => setDeepgramKey(e.target.value)}
              style={{ borderColor: `${mode.accentColor}44` }} />
            {deepgramKey && (
              <label className="settings-toggle-label" style={{ marginTop: 8 }}>
                <input type="checkbox" checked={useDeepgram} onChange={(e) => setUseDeepgram(e.target.checked)} />
                <span className="settings-toggle-text">Use Deepgram for voice transcription</span>
              </label>
            )}
            <span className={`settings-status ${deepgramKey ? 'connected' : ''}`}>
              {deepgramKey ? '\u2713 Connected' : 'Not set - voice recording only'}
            </span>
          </div>

          {/* ElevenLabs TTS */}
          <div className="settings-section">
            <h3>ElevenLabs (Text-to-Speech)</h3>
            <p className="settings-hint">Free tier: 10k chars/mo. Get key from elevenlabs.io</p>
            <input type="password" className="settings-input" placeholder="ElevenLabs API key..."
              value={elevenLabsKey} onChange={(e) => setElevenLabsKey(e.target.value)}
              style={{ borderColor: `${mode.accentColor}44` }} />
            {elevenLabsKey && (
              <>
                <label className="settings-toggle-label" style={{ marginTop: 8 }}>
                  <input type="checkbox" checked={useElevenLabs} onChange={(e) => setUseElevenLabs(e.target.checked)} />
                  <span className="settings-toggle-text">Use ElevenLabs voices (premium)</span>
                </label>
                {usage && (
                  <div className="usage-bar-container">
                    <div className="usage-bar">
                      <div className="usage-bar-fill" style={{
                        width: `${(usage.characterCount / usage.characterLimit) * 100}%`,
                        backgroundColor: mode.accentColor,
                      }} />
                    </div>
                    <span className="usage-text">
                      {usage.remaining.toLocaleString()} chars remaining ({usage.tier})
                    </span>
                  </div>
                )}
                <button className="settings-test-btn" onClick={() => onOpenCloneModal?.()}
                  style={{ backgroundColor: mode.accentColor, marginTop: 8 }}>
                  Clone a Voice
                </button>
              </>
            )}
            <span className={`settings-status ${elevenLabsKey ? 'connected' : ''}`}>
              {elevenLabsKey ? '\u2713 Connected' : 'Not set - using browser voice'}
            </span>
          </div>

          {/* Browser voice fallback */}
          <div className="settings-section">
            <h3>Browser Voice (Fallback)</h3>
            <select className="settings-select" value={selectedVoice?.name || ''}
              onChange={(e) => {
                const voice = voices.find((v) => v.name === e.target.value);
                if (voice) onVoiceChange(voice);
              }} style={{ borderColor: `${mode.accentColor}44` }}>
              {voices.map((v) => (
                <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
              ))}
            </select>
          </div>

          {/* Auto-speak */}
          <div className="settings-section">
            <label className="settings-toggle-label">
              <input type="checkbox" checked={autoSpeak} onChange={(e) => setAutoSpeak(e.target.checked)} />
              <span className="settings-toggle-text">Eva speaks responses out loud</span>
            </label>
          </div>
        </div>

        <div className="settings-footer">
          <button className="settings-save-btn" onClick={handleSave}
            style={{ backgroundColor: mode.accentColor }}>Save Settings</button>
        </div>
      </div>
    </div>
  );
}
