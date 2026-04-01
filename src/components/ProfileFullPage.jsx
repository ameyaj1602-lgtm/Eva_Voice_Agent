import React, { useState, useEffect, useRef } from 'react';
import { getMemory, clearMemory } from '../services/storage';
import { saveVoiceSample, getVoiceSample, getVoiceSamples, deleteVoiceSample, testClonedVoice, HF_VOICES, speakWithHFVoice } from '../services/voiceClone';

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

    try {
      // Save voice sample locally (instant, no API call needed)
      const audioBlob = allFiles[0] instanceof File ? allFiles[0] : new Blob([allFiles[0]], { type: 'audio/webm' });
      const saved = await saveVoiceSample(cloneName.trim(), audioBlob);

      if (saved) {
        onSaveSettings?.({
          clonedVoices: { ...clonedVoices, [cloneName.trim()]: { type: 'hf', name: cloneName.trim(), sampleKey: saved.key } },
        });
        setCloneResult({ type: 'success', msg: `Voice "${cloneName}" saved! Eva will use this voice sample when speaking.` });
        setCloneName(''); setCloneFiles([]); setRecordedBlobs([]);
      } else {
        setCloneResult({ type: 'error', msg: 'Failed to save voice sample. Please try again.' });
      }
    } catch (err) {
      setCloneResult({ type: 'error', msg: 'Error saving voice sample: ' + err.message });
    }
    setIsCloning(false);
  };

  const handleTestVoice = async (voiceName) => {
    // Check if we have the audio sample saved
    const sample = await getVoiceSample(voiceName);
    if (!sample?.blob) {
      setCloneResult({ type: 'error', msg: `No audio sample found for "${voiceName}". Please re-upload or record the voice again.` });
      // Remove the stale entry
      const updated = { ...clonedVoices };
      delete updated[voiceName];
      onSaveSettings?.({ clonedVoices: updated });
      return;
    }
    setCloneResult({ type: 'info', msg: 'Testing voice... this may take 30-60 seconds on first use.' });
    const audioUrl = await testClonedVoice(voiceName, 'Hello! This is Eva speaking in your cloned voice. How does it sound?');
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
      setCloneResult({ type: 'success', msg: 'Playing test audio!' });
    } else {
      setCloneResult({ type: 'error', msg: 'Voice cloning server error. The HF Space may be sleeping - visit huggingface.co/spaces/Ameyabro/Eva_Voice_Cloner to wake it, then try again.' });
    }
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
              <h3>Choose Eva's Voice</h3>
              <p>Pick from 16+ high-quality neural voices across 10 languages. Eva will speak in your chosen voice - free and unlimited.</p>
              <p className="pf-voice-note">Powered by neural AI. Tap any voice to preview it.</p>
            </div>

            {/* Voice grid */}
            <div className="pf-voice-grid">
              {Object.entries(HF_VOICES).map(([id, label]) => {
                const isSelected = clonedVoices?.default?.hfVoice === id;
                return (
                  <button key={id} className={`pf-voice-card ${isSelected ? 'selected' : ''}`}
                    style={isSelected ? { borderColor: mode.accentColor, background: `${mode.accentColor}15` } : {}}
                    onClick={async () => {
                      // Set as default voice
                      onSaveSettings?.({
                        clonedVoices: { ...clonedVoices, default: { type: 'hf', hfVoice: id, name: label } },
                      });
                      setCloneResult({ type: 'info', msg: `Playing "${label}"...` });
                      const url = await speakWithHFVoice('Hello! I am Eva, your personal voice companion.', id);
                      if (url) {
                        new Audio(url).play();
                        setCloneResult({ type: 'success', msg: `"${label}" set as Eva's voice!` });
                      } else {
                        setCloneResult({ type: 'error', msg: 'Voice server error. Try again.' });
                      }
                    }}>
                    <span className="pf-voice-icon">{'🎤'}</span>
                    <span className="pf-voice-label">{label}</span>
                    {isSelected && <span className="pf-voice-check" style={{ color: mode.accentColor }}>&#10003;</span>}
                  </button>
                );
              })}
            </div>

            {cloneResult && (
              <div className={`pf-clone-result ${cloneResult.type === 'info' ? 'info' : cloneResult.type}`}>
                {cloneResult.msg}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
