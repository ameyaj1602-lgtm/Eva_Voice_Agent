import React, { useState, useRef } from 'react';
import { saveVoiceSample } from '../services/voiceClone';

export default function VoiceCloneModal({ isOpen, onClose, mode, apiKey, onVoiceCloned }) {
  const [name, setName] = useState('');
  const [files, setFiles] = useState([]);
  const [isCloning, setIsCloning] = useState(false);
  const [result, setResult] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  if (!isOpen) return null;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setIsRecording(true);
    } catch { }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleClone = async () => {
    if (!name.trim()) return;
    const audioBlob = files[0] || recordedBlob;
    if (!audioBlob) return;

    setIsCloning(true);
    setResult(null);

    try {
      const saved = await saveVoiceSample(name.trim(), audioBlob);
      if (saved) {
        setResult({ type: 'success', message: `Voice "${name}" saved! Eva will use this voice when speaking.` });
        onVoiceCloned?.(saved.key, name.trim());
        setTimeout(() => {
          onClose();
          setName(''); setFiles([]); setRecordedBlob(null); setResult(null);
        }, 2000);
      } else {
        setResult({ type: 'error', message: 'Failed to save voice sample.' });
      }
    } catch (err) {
      setResult({ type: 'error', message: err.message });
    }
    setIsCloning(false);
  };

  const hasAudio = files.length > 0 || recordedBlob;

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
              Capture someone's voice forever. Upload an audio sample of a loved one,
              a friend, or yourself - Eva will speak in their voice.
            </p>
            <p className="settings-hint" style={{ color: '#4ecdc4' }}>
              100% free using open-source AI (XTTS-v2). No paid plan needed.
            </p>
          </div>

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
            <h3>Upload Audio</h3>
            <p className="settings-hint">
              Upload an MP3, WAV, or M4A file with at least 30 seconds of clear speech.
            </p>
            <label className="file-upload-label" style={{ borderColor: `${mode.accentColor}44` }}>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setFiles(Array.from(e.target.files))}
                className="file-upload-input"
              />
              <span className="file-upload-text">
                {files.length > 0 ? `${files[0].name}` : 'Choose an audio file...'}
              </span>
            </label>
          </div>

          <div className="settings-section">
            <h3>Or Record</h3>
            <button
              className={`pf-record-btn ${isRecording ? 'recording' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
              style={{ borderColor: mode.accentColor, marginBottom: 8 }}
            >
              {isRecording ? '\u23F9 Stop Recording' : '\uD83C\uDFA4 Start Recording'}
            </button>
            {recordedBlob && <p className="settings-hint" style={{ color: '#4ecdc4' }}>Recording captured!</p>}
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
            disabled={!name.trim() || !hasAudio || isCloning}
            style={{ backgroundColor: mode.accentColor }}
          >
            {isCloning ? 'Saving Voice...' : 'Save Voice'}
          </button>
        </div>
      </div>
    </div>
  );
}
