import React, { useState } from 'react';
import { cloneVoice } from '../services/elevenlabs';

export default function VoiceCloneModal({ isOpen, onClose, mode, apiKey, onVoiceCloned }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [isCloning, setIsCloning] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleClone = async () => {
    if (!name.trim() || files.length === 0) return;

    setIsCloning(true);
    setResult(null);

    const res = await cloneVoice(apiKey, name.trim(), description.trim(), files);

    setIsCloning(false);

    if (res.success) {
      setResult({ type: 'success', message: `Voice "${name}" created successfully!` });
      onVoiceCloned?.(res.voiceId, name);
      setTimeout(() => {
        onClose();
        setName('');
        setDescription('');
        setFiles([]);
        setResult(null);
      }, 2000);
    } else {
      setResult({ type: 'error', message: res.error });
    }
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal voice-clone-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Clone a Voice</h2>
          <button className="settings-close" onClick={onClose}>&times;</button>
        </div>

        <div className="settings-body">
          <div className="clone-intro">
            <p className="clone-intro-text">
              Capture someone's voice forever. Upload audio samples of a loved one,
              a friend, or yourself - Eva will speak in their voice.
            </p>
            <p className="settings-hint">
              Requires ElevenLabs paid plan ($5/mo). Upload 1-25 audio clips,
              each at least 30 seconds. Cleaner audio = better clone.
            </p>
          </div>

          {!apiKey && (
            <div className="clone-warning">
              Add your ElevenLabs API key in Settings first.
            </div>
          )}

          <div className="settings-section">
            <h3>Voice Name</h3>
            <input
              type="text"
              className="settings-input"
              placeholder="e.g., Mom's Voice, My Best Friend..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ borderColor: `${mode.accentColor}44` }}
            />
          </div>

          <div className="settings-section">
            <h3>Description (optional)</h3>
            <input
              type="text"
              className="settings-input"
              placeholder="e.g., Warm, gentle voice with slight accent..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ borderColor: `${mode.accentColor}44` }}
            />
          </div>

          <div className="settings-section">
            <h3>Audio Samples</h3>
            <p className="settings-hint">
              Upload MP3, WAV, or M4A files. More samples = better quality.
            </p>
            <label className="file-upload-label" style={{ borderColor: `${mode.accentColor}44` }}>
              <input
                type="file"
                accept="audio/*"
                multiple
                onChange={handleFileChange}
                className="file-upload-input"
              />
              <span className="file-upload-text">
                {files.length > 0
                  ? `${files.length} file${files.length > 1 ? 's' : ''} selected`
                  : 'Choose audio files...'}
              </span>
            </label>
          </div>

          {result && (
            <div className={`clone-result ${result.type}`}>
              {result.message}
            </div>
          )}
        </div>

        <div className="settings-footer">
          <button
            className="settings-save-btn"
            onClick={handleClone}
            disabled={!apiKey || !name.trim() || files.length === 0 || isCloning}
            style={{ backgroundColor: mode.accentColor }}
          >
            {isCloning ? 'Cloning Voice...' : 'Clone Voice'}
          </button>
        </div>
      </div>
    </div>
  );
}
