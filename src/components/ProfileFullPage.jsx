import React, { useState, useEffect, useRef } from 'react';
import { getMemory, clearMemory } from '../services/storage';
import { saveVoiceSample, getVoiceSample, deleteVoiceSample, testClonedVoice } from '../services/voiceClone';
import { createVoiceModel, fishTTS } from '../services/fishAudio';

function getMoodLog() {
  try { return JSON.parse(localStorage.getItem('eva-mood-log')) || []; } catch { return []; }
}
function getStreakData() {
  try { return JSON.parse(localStorage.getItem('eva-streak')) || { dates: [], current: 0, best: 0 }; } catch { return { dates: [], current: 0, best: 0 }; }
}
function getGratitudeEntries() {
  try { return JSON.parse(localStorage.getItem('eva-gratitude')) || []; } catch { return []; }
}

export default function ProfileFullPage({ profile, mode, settings, onBack, onSaveSettings }) {
  const [tab, setTab] = useState('overview');
  const [memories, setMemories] = useState([]);
  const [streak, setStreak] = useState({ current: 0, best: 0, dates: [] });
  const [moods, setMoods] = useState([]);
  const [gratitudeCount, setGratitudeCount] = useState(0);

  // Voice clone state
  const [cloneName, setCloneName] = useState('');
  const [cloneFiles, setCloneFiles] = useState([]);
  const [isCloning, setIsCloning] = useState(false);
  const [cloneResult, setCloneResult] = useState(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordedBlobs, setRecordedBlobs] = useState([]);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (!profile) return;
    setMemories(getMemory(profile.id));
    setStreak(getStreakData());
    setMoods(getMoodLog());
    setGratitudeCount(getGratitudeEntries().length);
  }, [profile]);

  if (!profile) return null;

  const initial = profile.name?.[0]?.toUpperCase() || '?';
  const joinDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';
  const totalChats = Object.keys(localStorage).filter(k => k.startsWith(`eva-chats-${profile.id}`)).length;
  const last7Moods = moods.slice(-7);
  const clonedVoices = settings?.clonedVoices || {};

  // Voice recording
  const startRecordingVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlobs((prev) => [...prev, blob]);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setIsRecordingVoice(true);
    } catch { }
  };

  const stopRecordingVoice = () => {
    mediaRecorderRef.current?.stop();
    setIsRecordingVoice(false);
  };

  const handleCloneVoice = async () => {
    if (!cloneName.trim()) return;

    const allFiles = [...cloneFiles, ...recordedBlobs.map((b, i) => new File([b], `recording-${i}.webm`, { type: 'audio/webm' }))];
    if (allFiles.length === 0) { setCloneResult({ type: 'error', msg: 'Upload or record at least one audio sample' }); return; }

    setIsCloning(true);
    setCloneResult(null);

    const audioBlob = allFiles[0] instanceof File ? allFiles[0] : new Blob([allFiles[0]], { type: 'audio/webm' });
    const voiceName = cloneName.trim();

    // Always save locally first (for Nymbo XTTS fallback)
    await saveVoiceSample(voiceName, audioBlob);

    // Try Fish Audio model creation (best quality)
    const fishKey = settings?.fishAudioApiKey;
    if (fishKey) {
      setCloneResult({ type: 'info', msg: 'Creating voice model on Fish Audio (best quality)...' });
      const result = await createVoiceModel(fishKey, voiceName, audioBlob);
      if (result.success) {
        onSaveSettings?.({
          fishAudioModelId: result.modelId,
          clonedVoices: { ...clonedVoices, [voiceName]: { type: 'fish', name: voiceName, modelId: result.modelId } },
        });
        setCloneResult({ type: 'success', msg: `Voice "${voiceName}" created on Fish Audio! Eva will speak exactly like you.` });
        setCloneName(''); setCloneFiles([]); setRecordedBlobs([]);
        setIsCloning(false);
        return;
      }
      // Fish Audio failed, continue to fallback
      setCloneResult({ type: 'info', msg: 'Fish Audio unavailable, saving for XTTS fallback...' });
    }

    // Save with HF/XTTS type as fallback
    onSaveSettings?.({
      clonedVoices: { ...clonedVoices, [voiceName]: { type: 'hf', name: voiceName, sampleKey: `voice-${voiceName}` } },
    });
    setCloneResult({ type: 'success', msg: `Voice "${voiceName}" saved! Using XTTS voice cloning (free, slower). Add Fish Audio key in Admin for best quality.` });
    setCloneName(''); setCloneFiles([]); setRecordedBlobs([]);
    setIsCloning(false);
  };

  const handleTestVoice = async (voiceName) => {
    const voiceData = clonedVoices[voiceName];
    const testText = 'Hello! This is Eva speaking in your cloned voice. How does it sound?';

    // 1. Try Fish Audio (best quality)
    if (voiceData?.type === 'fish' && voiceData.modelId && settings?.fishAudioApiKey) {
      setCloneResult({ type: 'info', msg: 'Testing via Fish Audio (high quality)...' });
      const audioUrl = await fishTTS(settings.fishAudioApiKey, testText, voiceData.modelId);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
        setCloneResult({ type: 'success', msg: 'Playing Fish Audio voice clone!' });
        return;
      }
      setCloneResult({ type: 'info', msg: 'Fish Audio unavailable, trying XTTS...' });
    }

    // 2. Try Nymbo XTTS (free, slower)
    const sample = await getVoiceSample(voiceName);
    if (sample?.blob) {
      setCloneResult({ type: 'info', msg: 'Testing via XTTS (free, takes 30-90 seconds)...' });
      const audioUrl = await testClonedVoice(voiceName, testText);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
        setCloneResult({ type: 'success', msg: 'Playing XTTS voice clone!' });
        return;
      }
    }

    // 3. Nothing worked
    setCloneResult({ type: 'error', msg: 'Voice test failed. Add Fish Audio API key in Admin for reliable cloning, or try again later.' });
  };

  const handleDeleteVoice = (voiceName) => {
    deleteVoiceSample(voiceName);
    const updated = { ...clonedVoices };
    delete updated[voiceName];
    onSaveSettings?.({ clonedVoices: updated });
  };

  const TabBtn = ({ id, label }) => (
    <button className={`pf-tab ${tab === id ? 'active' : ''}`}
      onClick={() => setTab(id)}
      style={tab === id ? { color: mode.accentColor, borderBottomColor: mode.accentColor } : {}}>
      {label}
    </button>
  );

  return (
    <div className="pf-page" style={{ background: 'linear-gradient(180deg, #1a1520, #1f1428, #0d0d1a)' }}>
      {/* Header */}
      <div className="pf-header" style={{ background: mode.gradient }}>
        <button className="pf-back" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="pf-hero">
          <div className="pf-avatar">{initial}</div>
          <h1 className="pf-name">{profile.name}</h1>
          {profile.email && <p className="pf-email">{profile.email}</p>}
          {profile.company && <p className="pf-company">{profile.company}</p>}
          <p className="pf-since">Member since {joinDate}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="pf-tabs">
        <TabBtn id="overview" label="Overview" />
        <TabBtn id="memories" label="Memories" />
        <TabBtn id="mood" label="Mood" />
        <TabBtn id="voice" label="My Voice" />
      </div>

      {/* Content */}
      <div className="pf-content">
        {/* OVERVIEW */}
        {tab === 'overview' && (
          <>
            <div className="pf-stats">
              {[
                { icon: '\uD83D\uDD25', num: streak.current, label: 'Day Streak' },
                { icon: '\uD83C\uDFC6', num: streak.best, label: 'Best Streak' },
                { icon: '\uD83D\uDCAC', num: totalChats, label: 'Mode Chats' },
                { icon: '\uD83E\uDDE0', num: memories.length, label: 'Memories' },
                { icon: '\uD83D\uDE4F', num: gratitudeCount, label: 'Gratitude' },
                { icon: '\uD83D\uDCCA', num: moods.length, label: 'Mood Logs' },
              ].map((s, i) => (
                <div key={i} className="pf-stat-card">
                  <span className="pf-stat-icon">{s.icon}</span>
                  <span className="pf-stat-num" style={{ color: mode.accentColor }}>{s.num}</span>
                  <span className="pf-stat-label">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Week streak */}
            <div className="pf-week-section">
              <h3>This Week</h3>
              <div className="pf-week">
                {Array.from({ length: 7 }, (_, i) => {
                  const d = new Date(Date.now() - (6 - i) * 86400000);
                  const active = streak.dates?.includes(d.toDateString());
                  return (
                    <div key={i} className={`pf-day ${active ? 'active' : ''}`}
                      style={active ? { backgroundColor: mode.accentColor } : {}}>
                      {d.toLocaleDateString([], { weekday: 'narrow' })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cloned voices list */}
            {Object.keys(clonedVoices).length > 0 && (
              <div className="pf-week-section">
                <h3>My Cloned Voices</h3>
                <div className="pf-cloned-list">
                  {Object.entries(clonedVoices).map(([vname, data]) => (
                    <div key={vname} className="pf-cloned-item">
                      <span>{'🎤'} {typeof data === 'object' ? data.name : vname}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* MEMORIES */}
        {tab === 'memories' && (
          <>
            <p className="pf-section-hint">Things Eva remembers about you</p>
            {memories.length === 0
              ? <p className="pf-empty">Chat with Eva and she'll start remembering things about you.</p>
              : <div className="pf-memory-list">
                  {memories.map((m, i) => (
                    <div key={i} className="pf-memory-item">
                      <span className="pf-memory-dot" style={{ backgroundColor: mode.accentColor }} />
                      <span>{m.fact}</span>
                    </div>
                  ))}
                </div>
            }
            {memories.length > 0 && (
              <button className="pf-danger-btn" onClick={() => { clearMemory(profile.id); setMemories([]); }}>
                Clear all memories
              </button>
            )}
          </>
        )}

        {/* MOOD */}
        {tab === 'mood' && (
          <>
            {/* Log mood inline */}
            {!(() => { const today = new Date().toDateString(); return moods.some((m) => new Date(m.date).toDateString() === today); })() ? (
              <div className="pf-mood-log">
                <p className="pf-section-hint">How are you feeling right now?</p>
                <div className="pf-mood-options">
                  {[
                    { emoji: '😁', label: 'Great', value: 5, color: '#38ef7d' },
                    { emoji: '😊', label: 'Good', value: 4, color: '#4ecdc4' },
                    { emoji: '😐', label: 'Okay', value: 3, color: '#f5af19' },
                    { emoji: '😔', label: 'Low', value: 2, color: '#fcb69f' },
                    { emoji: '😢', label: 'Bad', value: 1, color: '#f5576c' },
                  ].map((m) => (
                    <button key={m.value} className="pf-mood-opt" onClick={() => {
                      const log = getMoodLog();
                      log.push({ ...m, date: Date.now() });
                      localStorage.setItem('eva-mood-log', JSON.stringify(log.slice(-30)));
                      setMoods(log);
                    }} style={{ '--mood-c': m.color }}>
                      <span style={{ fontSize: 28 }}>{m.emoji}</span>
                      <span className="pf-mood-opt-label">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="pf-section-hint" style={{ color: mode.accentColor, textAlign: 'center', padding: 16 }}>
                ✅ You've logged your mood today!
              </p>
            )}

            <h3 style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', margin: '24px 0 12px' }}>Your mood over time</h3>
            {last7Moods.length === 0
              ? <p className="pf-empty">Log your first mood above to start tracking!</p>
              : <div className="pf-mood-chart">
                  {last7Moods.map((entry, i) => (
                    <div key={i} className="pf-mood-col">
                      <div className="pf-mood-bar" style={{
                        height: `${entry.value * 20}%`,
                        backgroundColor: entry.color || mode.accentColor,
                      }} />
                      <span className="pf-mood-emoji">{entry.emoji}</span>
                      <span className="pf-mood-day">{new Date(entry.date).toLocaleDateString([], { weekday: 'short' })}</span>
                    </div>
                  ))}
                </div>
            }
          </>
        )}

        {/* MY VOICE */}
        {tab === 'voice' && (
          <>
            <div className="pf-voice-intro">
              <h3>Clone Any Voice</h3>
              <p>Upload audio or record your voice. Eva will speak in that voice. Clone a loved one's voice, your own, or anyone.</p>
              <p className="pf-voice-note">100% free voice cloning using XTTS-v2 AI. Takes 30-90 seconds to generate. Upload MP3/WAV under 10MB.</p>
            </div>

            {/* Voice name */}
            <div className="pf-voice-field">
              <label>Voice Name</label>
              <input className="settings-input" placeholder="e.g., Mom's Voice, My Voice, Friend..."
                value={cloneName} onChange={(e) => setCloneName(e.target.value)} />
            </div>

            {/* Upload files */}
            <div className="pf-voice-field">
              <label>Upload Audio File</label>
              <label className="pf-upload-area">
                <input type="file" accept="audio/*" style={{ display: 'none' }}
                  onChange={(e) => setCloneFiles(Array.from(e.target.files))} />
                <span>{cloneFiles.length > 0 ? `${cloneFiles[0].name} (${(cloneFiles[0].size / 1024 / 1024).toFixed(1)}MB)` : 'Click to upload MP3, WAV, M4A (max 10MB)'}</span>
              </label>
            </div>

            {/* Or record */}
            <div className="pf-voice-field">
              <label>Or Record Here</label>
              <div className="pf-record-row">
                <button className={`pf-record-btn ${isRecordingVoice ? 'recording' : ''}`}
                  onClick={isRecordingVoice ? stopRecordingVoice : startRecordingVoice}
                  style={{ borderColor: mode.accentColor }}>
                  {isRecordingVoice ? '\u23F9 Stop Recording' : '\uD83C\uDFA4 Start Recording'}
                </button>
                {recordedBlobs.length > 0 && (
                  <span className="pf-record-count">{recordedBlobs.length} recording(s)</span>
                )}
              </div>
              <p className="pf-voice-note">Record at least 10 seconds of clear speech.</p>
            </div>

            {/* Clone button */}
            <button className="pf-clone-btn" onClick={handleCloneVoice}
              disabled={isCloning || !cloneName.trim() || (cloneFiles.length === 0 && recordedBlobs.length === 0)}
              style={{ backgroundColor: mode.accentColor }}>
              {isCloning ? 'Saving Voice...' : 'Save Voice'}
            </button>

            {cloneResult && (
              <div className={`pf-clone-result ${cloneResult.type === 'info' ? 'info' : cloneResult.type}`}>
                {cloneResult.msg}
              </div>
            )}

            {/* Saved voices */}
            {Object.keys(clonedVoices).length > 0 && (
              <div className="pf-existing-voices">
                <h4>Your Saved Voices</h4>
                {Object.entries(clonedVoices).map(([vname, data]) => (
                  <div key={vname} className="pf-cloned-item">
                    <span>{'🎤'} {typeof data === 'object' ? data.name : vname}</span>
                    <div className="pf-cloned-actions">
                      <button className="pf-test-btn" onClick={() => handleTestVoice(vname)}
                        style={{ color: mode.accentColor, borderColor: mode.accentColor }}>
                        Test
                      </button>
                      <button className="pf-delete-voice-btn" onClick={() => handleDeleteVoice(vname)}>
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
