import React, { useState, useEffect } from 'react';
import { getMemory, clearMemory } from '../services/storage';

function getMoodLog() {
  try { return JSON.parse(localStorage.getItem('eva-mood-log')) || []; } catch { return []; }
}

function getStreakData() {
  try { return JSON.parse(localStorage.getItem('eva-streak')) || { dates: [], current: 0, best: 0 }; } catch { return { dates: [], current: 0, best: 0 }; }
}

function getGratitudeEntries() {
  try { return JSON.parse(localStorage.getItem('eva-gratitude')) || []; } catch { return []; }
}

export default function ProfilePage({ isOpen, onClose, profile, mode }) {
  const [memories, setMemories] = useState([]);
  const [streak, setStreak] = useState({ current: 0, best: 0, dates: [] });
  const [moods, setMoods] = useState([]);
  const [gratitudeCount, setGratitudeCount] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isOpen || !profile) return;
    setMemories(getMemory(profile.id));
    setStreak(getStreakData());
    setMoods(getMoodLog());
    setGratitudeCount(getGratitudeEntries().length);
  }, [isOpen, profile]);

  if (!isOpen || !profile) return null;

  const initial = profile.name?.[0]?.toUpperCase() || '?';
  const joinDate = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';
  const totalChats = Object.keys(localStorage).filter(k => k.startsWith(`eva-chats-${profile.id}`)).length;
  const last7Moods = moods.slice(-7);

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header with avatar */}
        <div className="profile-header" style={{ background: mode.gradient }}>
          <button className="settings-close profile-close" onClick={onClose}>&times;</button>
          <div className="profile-avatar-large">
            <span>{initial}</span>
          </div>
          <h2 className="profile-name-large">{profile.name}</h2>
          {profile.email && <p className="profile-email">{profile.email}</p>}
          {profile.company && <p className="profile-company">{profile.company}</p>}
          <p className="profile-joined">Member since {joinDate}</p>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          {['overview', 'memories', 'mood'].map((t) => (
            <button key={t} className={`profile-tab ${activeTab === t ? 'active' : ''}`}
              onClick={() => setActiveTab(t)}
              style={activeTab === t ? { color: mode.accentColor, borderBottomColor: mode.accentColor } : {}}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="profile-body">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="profile-overview">
              <div className="profile-stats-grid">
                <div className="profile-stat-card">
                  <span className="profile-stat-icon">{'🔥'}</span>
                  <span className="profile-stat-num" style={{ color: mode.accentColor }}>{streak.current}</span>
                  <span className="profile-stat-label">Day Streak</span>
                </div>
                <div className="profile-stat-card">
                  <span className="profile-stat-icon">{'🏆'}</span>
                  <span className="profile-stat-num" style={{ color: mode.accentColor }}>{streak.best}</span>
                  <span className="profile-stat-label">Best Streak</span>
                </div>
                <div className="profile-stat-card">
                  <span className="profile-stat-icon">{'💬'}</span>
                  <span className="profile-stat-num" style={{ color: mode.accentColor }}>{totalChats}</span>
                  <span className="profile-stat-label">Mode Chats</span>
                </div>
                <div className="profile-stat-card">
                  <span className="profile-stat-icon">{'🧠'}</span>
                  <span className="profile-stat-num" style={{ color: mode.accentColor }}>{memories.length}</span>
                  <span className="profile-stat-label">Memories</span>
                </div>
                <div className="profile-stat-card">
                  <span className="profile-stat-icon">{'🙏'}</span>
                  <span className="profile-stat-num" style={{ color: mode.accentColor }}>{gratitudeCount}</span>
                  <span className="profile-stat-label">Gratitude Entries</span>
                </div>
                <div className="profile-stat-card">
                  <span className="profile-stat-icon">{'📊'}</span>
                  <span className="profile-stat-num" style={{ color: mode.accentColor }}>{moods.length}</span>
                  <span className="profile-stat-label">Mood Logs</span>
                </div>
              </div>

              {/* Streak calendar (last 7 days) */}
              <div className="profile-streak-row">
                <h3>This Week</h3>
                <div className="profile-week">
                  {Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(Date.now() - (6 - i) * 86400000);
                    const active = streak.dates?.includes(d.toDateString());
                    return (
                      <div key={i} className={`profile-day ${active ? 'active' : ''}`}
                        style={active ? { backgroundColor: mode.accentColor } : {}}>
                        <span className="profile-day-label">
                          {d.toLocaleDateString([], { weekday: 'narrow' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* MEMORIES */}
          {activeTab === 'memories' && (
            <div className="profile-memories">
              {memories.length === 0 ? (
                <p className="profile-empty">Eva hasn't learned anything about you yet. Chat more and she'll remember!</p>
              ) : (
                <>
                  <p className="profile-memories-hint">Things Eva remembers about you:</p>
                  <div className="profile-memory-list">
                    {memories.map((m, i) => (
                      <div key={i} className="profile-memory-item">
                        <span className="profile-memory-dot" style={{ backgroundColor: mode.accentColor }} />
                        <span>{m.fact}</span>
                      </div>
                    ))}
                  </div>
                  <button className="profile-clear-btn" onClick={() => {
                    clearMemory(profile.id);
                    setMemories([]);
                  }}>Clear all memories</button>
                </>
              )}
            </div>
          )}

          {/* MOOD HISTORY */}
          {activeTab === 'mood' && (
            <div className="profile-mood">
              {last7Moods.length === 0 ? (
                <p className="profile-empty">No mood data yet. Use the mood tracker to start logging!</p>
              ) : (
                <div className="profile-mood-chart">
                  {last7Moods.map((entry, i) => (
                    <div key={i} className="profile-mood-col">
                      <div className="profile-mood-bar" style={{
                        height: `${entry.value * 20}%`,
                        backgroundColor: entry.color || mode.accentColor,
                      }} />
                      <span className="profile-mood-emoji">{entry.emoji}</span>
                      <span className="profile-mood-day">
                        {new Date(entry.date).toLocaleDateString([], { weekday: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
