import React, { useState, useEffect } from 'react';
import { getUsers, getConversationLogs, getErrors, getAnalyticsSummary, verifyAdminPassword } from '../services/analytics';
import { isSupabaseConfigured, SETUP_SQL } from '../services/supabase';
import { MODES } from '../utils/modes';
import { DEFAULT_VOICES } from '../services/elevenlabs';

export default function AdminDashboard({ isOpen, onClose, settings, onSaveSettings, onAddMemory, activeProfile }) {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [convos, setConvos] = useState([]);
  const [errors, setErrors] = useState([]);
  const [convoFilter, setConvoFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSQL, setShowSQL] = useState(false);

  // Config state
  const [configBrain, setConfigBrain] = useState('gemini');
  const [configVoice, setConfigVoice] = useState('bella');
  const [configGeminiKey, setConfigGeminiKey] = useState('');
  const [configOpenAIKey, setConfigOpenAIKey] = useState('');
  const [configElevenLabsKey, setConfigElevenLabsKey] = useState('');
  const [configDeepgramKey, setConfigDeepgramKey] = useState('');
  const [configWeatherKey, setConfigWeatherKey] = useState('');
  const [configAutoSpeak, setConfigAutoSpeak] = useState(true);
  const [configUseElevenLabs, setConfigUseElevenLabs] = useState(false);
  const [configUseDeepgram, setConfigUseDeepgram] = useState(false);
  const [configCreditLimit, setConfigCreditLimit] = useState(10);
  const [configAdminPassword, setConfigAdminPassword] = useState('');
  const [newMemory, setNewMemory] = useState('');
  const [configSaved, setConfigSaved] = useState(false);

  // Load settings into config state
  useEffect(() => {
    if (!isOpen || !authed || !settings) return;
    setConfigBrain(settings.aiBrain || 'gemini');
    setConfigVoice(settings.defaultVoice || 'bella');
    setConfigGeminiKey(settings.geminiApiKey || '');
    setConfigOpenAIKey(settings.openaiApiKey || process.env.REACT_APP_OPENAI_API_KEY || '');
    setConfigElevenLabsKey(settings.elevenLabsApiKey || '');
    setConfigDeepgramKey(settings.deepgramApiKey || '');
    setConfigWeatherKey(settings.openWeatherKey || process.env.REACT_APP_OPENWEATHER_API_KEY || '');
    setConfigAutoSpeak(settings.autoSpeak ?? true);
    setConfigUseElevenLabs(settings.useElevenLabs ?? false);
    setConfigUseDeepgram(settings.useDeepgram ?? false);
    setConfigCreditLimit(settings.sessionCreditLimit || 10);
  }, [isOpen, authed, settings]);

  useEffect(() => {
    if (!isOpen || !authed) return;
    setLoading(true);
    Promise.all([
      getAnalyticsSummary(), getUsers(), getConversationLogs(), getErrors(),
    ]).then(([s, u, c, e]) => {
      setSummary(s); setUsers(u); setConvos(c); setErrors(e); setLoading(false);
    }).catch(() => setLoading(false));
  }, [isOpen, authed, tab]);

  if (!isOpen) return null;

  // Login
  if (!authed) {
    return (
      <div className="settings-overlay" onClick={onClose}>
        <div className="admin-login" onClick={(e) => e.stopPropagation()}>
          <h2>Admin Dashboard</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '8px 0 16px' }}>Enter admin password</p>
          <input type="password" className="settings-input" placeholder="Password..."
            value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && verifyAdminPassword(password)) setAuthed(true); }} />
          <button className="settings-save-btn" style={{ backgroundColor: '#6c5ce7', marginTop: 12 }}
            onClick={() => { if (verifyAdminPassword(password)) setAuthed(true); }}>Login</button>
          <button className="credit-popup-close" onClick={onClose} style={{ display: 'block', margin: '12px auto 0' }}>Cancel</button>
        </div>
      </div>
    );
  }

  const handleSaveConfig = () => {
    onSaveSettings?.({
      aiBrain: configBrain,
      defaultVoice: configVoice,
      geminiApiKey: configGeminiKey,
      openaiApiKey: configOpenAIKey,
      elevenLabsApiKey: configElevenLabsKey,
      deepgramApiKey: configDeepgramKey,
      openWeatherKey: configWeatherKey,
      autoSpeak: configAutoSpeak,
      useElevenLabs: configUseElevenLabs,
      useDeepgram: configUseDeepgram,
      sessionCreditLimit: configCreditLimit,
    });
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
  };

  const handleAddMemory = () => {
    if (newMemory.trim() && activeProfile?.id) {
      onAddMemory?.(activeProfile.id, newMemory.trim());
      setNewMemory('');
    }
  };

  const filteredConvos = convoFilter
    ? convos.filter((c) => c.userName?.toLowerCase().includes(convoFilter.toLowerCase()) || c.userMessage?.toLowerCase().includes(convoFilter.toLowerCase()))
    : convos;

  const voiceOptions = Object.entries(DEFAULT_VOICES).map(([key, v]) => ({ key, ...v }));

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
        <div className="admin-header">
          <h2>Admin Control Panel</h2>
          <button className="settings-close" onClick={onClose}>&times;</button>
        </div>

        <div className="admin-tabs">
          {['overview', 'config', 'memory', 'users', 'conversations', 'errors'].map((t) => (
            <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}>
              {t === 'config' ? 'Controls' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="admin-body">
          {/* Data source */}
          {tab === 'overview' && (
            <div style={{ marginBottom: 16, padding: 10, background: isSupabaseConfigured() ? 'rgba(56,239,125,0.1)' : 'rgba(245,175,25,0.1)',
              borderRadius: 10, fontSize: 12, color: isSupabaseConfigured() ? '#38ef7d' : '#f5af19' }}>
              {isSupabaseConfigured()
                ? '\u2713 Connected to Supabase - seeing ALL users'
                : '\u26A0 Local storage only - add Supabase for multi-device'}
              {!isSupabaseConfigured() && (
                <button onClick={() => setShowSQL(!showSQL)} style={{ display: 'block', marginTop: 6, background: 'none', border: 'none', color: '#f5af19', textDecoration: 'underline', cursor: 'pointer', fontSize: 11 }}>
                  {showSQL ? 'Hide SQL' : 'Show Supabase setup SQL'}
                </button>
              )}
              {showSQL && <pre style={{ marginTop: 8, padding: 10, background: 'rgba(0,0,0,0.3)', borderRadius: 8, fontSize: 10, color: 'rgba(255,255,255,0.6)', whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto' }}>{SETUP_SQL}</pre>}
            </div>
          )}

          {loading && <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 20 }}>Loading...</p>}

          {/* OVERVIEW */}
          {tab === 'overview' && summary && (
            <div className="admin-overview">
              <div className="admin-stat-grid">
                <div className="admin-stat-card"><span className="admin-stat-num">{summary.totalUsers}</span><span className="admin-stat-label">Users</span></div>
                <div className="admin-stat-card"><span className="admin-stat-num">{summary.totalConversations}</span><span className="admin-stat-label">Conversations</span></div>
                <div className="admin-stat-card"><span className="admin-stat-num">{summary.activeToday}</span><span className="admin-stat-label">Active Today</span></div>
                <div className="admin-stat-card"><span className="admin-stat-num">{summary.totalErrors}</span><span className="admin-stat-label">Errors</span></div>
              </div>
              {summary.modeUsage && Object.keys(summary.modeUsage).length > 0 && (
                <>
                  <h3 style={{ margin: '20px 0 10px', fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Mode Usage</h3>
                  <div className="admin-mode-bars">
                    {Object.entries(summary.modeUsage).sort((a, b) => b[1] - a[1]).map(([m, count]) => (
                      <div key={m} className="admin-mode-row">
                        <span className="admin-mode-name">{m}</span>
                        <div className="admin-mode-bar-bg"><div className="admin-mode-bar-fill" style={{ width: `${(count / Math.max(...Object.values(summary.modeUsage))) * 100}%` }} /></div>
                        <span className="admin-mode-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* CONFIG / CONTROLS */}
          {tab === 'config' && (
            <div className="admin-config">
              {configSaved && <div style={{ padding: 10, background: 'rgba(56,239,125,0.1)', borderRadius: 10, color: '#38ef7d', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{'\u2713'} Settings saved!</div>}

              {/* AI Brain */}
              <div className="admin-config-section">
                <h3>AI Brain</h3>
                <p className="admin-config-hint">Choose which AI model Eva uses for thinking</p>
                <div className="admin-config-options">
                  {[
                    { id: 'gemini', name: 'Google Gemini', desc: 'Fast, free tier' },
                    { id: 'openai', name: 'OpenAI GPT-4o-mini', desc: 'High quality, paid' },
                    { id: 'auto', name: 'Auto (Gemini \u2192 OpenAI)', desc: 'Best reliability' },
                  ].map((opt) => (
                    <button key={opt.id}
                      className={`admin-config-opt ${configBrain === opt.id ? 'active' : ''}`}
                      onClick={() => setConfigBrain(opt.id)}>
                      <strong>{opt.name}</strong>
                      <span>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Voice */}
              <div className="admin-config-section">
                <h3>Default Voice</h3>
                <p className="admin-config-hint">ElevenLabs voice Eva uses (when enabled)</p>
                <select className="settings-select" value={configVoice}
                  onChange={(e) => setConfigVoice(e.target.value)}>
                  {voiceOptions.map((v) => (
                    <option key={v.key} value={v.key}>{v.name} - {v.style}</option>
                  ))}
                </select>
              </div>

              {/* API Keys */}
              <div className="admin-config-section">
                <h3>API Keys</h3>
                <div className="admin-key-grid">
                  <div>
                    <label className="admin-key-label">Gemini</label>
                    <input type="password" className="settings-input" value={configGeminiKey}
                      onChange={(e) => setConfigGeminiKey(e.target.value)} placeholder="Gemini API key..." />
                  </div>
                  <div>
                    <label className="admin-key-label">OpenAI</label>
                    <input type="password" className="settings-input" value={configOpenAIKey}
                      onChange={(e) => setConfigOpenAIKey(e.target.value)} placeholder="OpenAI API key..." />
                  </div>
                  <div>
                    <label className="admin-key-label">ElevenLabs</label>
                    <input type="password" className="settings-input" value={configElevenLabsKey}
                      onChange={(e) => setConfigElevenLabsKey(e.target.value)} placeholder="ElevenLabs key..." />
                  </div>
                  <div>
                    <label className="admin-key-label">Deepgram</label>
                    <input type="password" className="settings-input" value={configDeepgramKey}
                      onChange={(e) => setConfigDeepgramKey(e.target.value)} placeholder="Deepgram key..." />
                  </div>
                  <div>
                    <label className="admin-key-label">OpenWeather</label>
                    <input type="password" className="settings-input" value={configWeatherKey}
                      onChange={(e) => setConfigWeatherKey(e.target.value)} placeholder="Weather key..." />
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="admin-config-section">
                <h3>Features</h3>
                <label className="settings-toggle-label"><input type="checkbox" checked={configAutoSpeak} onChange={(e) => setConfigAutoSpeak(e.target.checked)} /><span className="settings-toggle-text">Eva speaks responses out loud</span></label>
                <label className="settings-toggle-label" style={{ marginTop: 8 }}><input type="checkbox" checked={configUseElevenLabs} onChange={(e) => setConfigUseElevenLabs(e.target.checked)} /><span className="settings-toggle-text">Use ElevenLabs voice (premium)</span></label>
                <label className="settings-toggle-label" style={{ marginTop: 8 }}><input type="checkbox" checked={configUseDeepgram} onChange={(e) => setConfigUseDeepgram(e.target.checked)} /><span className="settings-toggle-text">Use Deepgram for voice input</span></label>
              </div>

              {/* Credit Limit */}
              <div className="admin-config-section">
                <h3>Session Credit Limit</h3>
                <p className="admin-config-hint">Max AI calls per session for free users</p>
                <input type="number" className="settings-input" value={configCreditLimit}
                  onChange={(e) => setConfigCreditLimit(Number(e.target.value))}
                  min={1} max={100} style={{ width: 100 }} />
              </div>

              <button className="settings-save-btn" onClick={handleSaveConfig}
                style={{ backgroundColor: '#6c5ce7', marginTop: 20 }}>
                Save All Settings
              </button>
            </div>
          )}

          {/* MEMORY */}
          {tab === 'memory' && (
            <div>
              <h3 style={{ fontSize: 16, marginBottom: 12 }}>Add Memory for {activeProfile?.name || 'active user'}</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                Manually add facts Eva should remember about this user
              </p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <input className="settings-input" placeholder="e.g., User loves photography, lives in Mumbai..."
                  value={newMemory} onChange={(e) => setNewMemory(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMemory()} style={{ flex: 1 }} />
                <button className="settings-save-btn" onClick={handleAddMemory}
                  style={{ backgroundColor: '#6c5ce7', padding: '10px 20px', whiteSpace: 'nowrap' }}>
                  Add Memory
                </button>
              </div>
              <h3 style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>Current Memories</h3>
              {activeProfile?.id && (() => {
                try {
                  const mems = JSON.parse(localStorage.getItem(`eva-memory-${activeProfile.id}`)) || [];
                  return mems.length === 0
                    ? <p style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>No memories yet</p>
                    : mems.map((m, i) => (
                      <div key={i} style={{ padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 10, marginBottom: 6, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                        {'\u2022'} {m.fact}
                      </div>
                    ));
                } catch { return <p style={{ color: 'rgba(255,255,255,0.3)' }}>Error loading memories</p>; }
              })()}
            </div>
          )}

          {/* USERS */}
          {tab === 'users' && (
            <div className="admin-users">
              {users.length === 0
                ? <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 20 }}>No users yet</p>
                : <table className="admin-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Joined</th><th>Sessions</th></tr></thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={i}>
                          <td>{u.name}</td>
                          <td>{u.email || '-'}</td>
                          <td>{u.company || '-'}</td>
                          <td>{new Date(u.registeredAt || u.registered_at).toLocaleDateString()}</td>
                          <td>{u.sessionCount || u.session_count || 1}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              }
            </div>
          )}

          {/* CONVERSATIONS */}
          {tab === 'conversations' && (
            <div className="admin-convos">
              <input className="settings-input" placeholder="Search by user or message..."
                value={convoFilter} onChange={(e) => setConvoFilter(e.target.value)} style={{ marginBottom: 12 }} />
              {filteredConvos.length === 0
                ? <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 20 }}>No conversations</p>
                : filteredConvos.slice(0, 50).map((c, i) => (
                    <div key={i} className="admin-convo-card">
                      <div className="admin-convo-header">
                        <span className="admin-convo-user">{c.userName || c.user_name || 'Unknown'}</span>
                        <span className="admin-convo-meta">{c.mode} &middot; {c.aiSource || c.ai_source} &middot; {new Date(c.timestamp || c.created_at).toLocaleString()}</span>
                      </div>
                      <div className="admin-convo-msg user"><strong>User:</strong> {c.userMessage || c.user_message}</div>
                      <div className="admin-convo-msg eva"><strong>Eva:</strong> {c.evaResponse || c.eva_response}</div>
                    </div>
                  ))
              }
            </div>
          )}

          {/* ERRORS */}
          {tab === 'errors' && (
            <div>
              {errors.length === 0
                ? <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 20 }}>No errors</p>
                : errors.slice(0, 30).map((e, i) => (
                    <div key={i} className="admin-error-card">
                      <span className="admin-error-time">{new Date(e.timestamp || e.created_at).toLocaleString()}</span>
                      <p className="admin-error-msg">{e.message}</p>
                      <p className="admin-error-ctx">{e.context}</p>
                    </div>
                  ))
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
