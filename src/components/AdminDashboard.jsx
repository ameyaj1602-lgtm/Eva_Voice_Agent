import React, { useState, useEffect } from 'react';
import { getUsers, getConversationLogs, getErrors, getAnalyticsSummary, verifyAdminPassword } from '../services/analytics';

export default function AdminDashboard({ isOpen, onClose }) {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [convos, setConvos] = useState([]);
  const [errors, setErrors] = useState([]);
  const [convoFilter, setConvoFilter] = useState('');

  useEffect(() => {
    if (!isOpen || !authed) return;
    setSummary(getAnalyticsSummary());
    setUsers(getUsers());
    setConvos(getConversationLogs().reverse());
    setErrors(getErrors().reverse());
  }, [isOpen, authed, tab]);

  if (!isOpen) return null;

  if (!authed) {
    return (
      <div className="settings-overlay" onClick={onClose}>
        <div className="admin-login" onClick={(e) => e.stopPropagation()}>
          <h2>Admin Dashboard</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '8px 0 16px' }}>
            Enter admin password to view analytics
          </p>
          <input type="password" className="settings-input" placeholder="Password..."
            value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && verifyAdminPassword(password)) setAuthed(true); }} />
          <button className="settings-save-btn" style={{ backgroundColor: '#6c5ce7', marginTop: 12 }}
            onClick={() => { if (verifyAdminPassword(password)) setAuthed(true); }}>
            Login
          </button>
          <button className="credit-popup-close" onClick={onClose} style={{ display: 'block', margin: '12px auto 0' }}>Cancel</button>
        </div>
      </div>
    );
  }

  const filteredConvos = convoFilter
    ? convos.filter((c) => c.userName?.toLowerCase().includes(convoFilter.toLowerCase()) || c.userMessage?.toLowerCase().includes(convoFilter.toLowerCase()))
    : convos;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
        <div className="admin-header">
          <h2>Admin Dashboard</h2>
          <button className="settings-close" onClick={onClose}>&times;</button>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {['overview', 'users', 'conversations', 'errors'].map((t) => (
            <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="admin-body">
          {/* OVERVIEW */}
          {tab === 'overview' && summary && (
            <div className="admin-overview">
              <div className="admin-stat-grid">
                <div className="admin-stat-card">
                  <span className="admin-stat-num">{summary.totalUsers}</span>
                  <span className="admin-stat-label">Total Users</span>
                </div>
                <div className="admin-stat-card">
                  <span className="admin-stat-num">{summary.totalConversations}</span>
                  <span className="admin-stat-label">Conversations</span>
                </div>
                <div className="admin-stat-card">
                  <span className="admin-stat-num">{summary.activeToday}</span>
                  <span className="admin-stat-label">Active Today</span>
                </div>
                <div className="admin-stat-card">
                  <span className="admin-stat-num">{summary.totalErrors}</span>
                  <span className="admin-stat-label">Errors</span>
                </div>
              </div>
              <h3 style={{ margin: '20px 0 10px', fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Mode Usage</h3>
              <div className="admin-mode-bars">
                {Object.entries(summary.modeUsage).sort((a, b) => b[1] - a[1]).map(([mode, count]) => (
                  <div key={mode} className="admin-mode-row">
                    <span className="admin-mode-name">{mode}</span>
                    <div className="admin-mode-bar-bg">
                      <div className="admin-mode-bar-fill" style={{
                        width: `${(count / Math.max(...Object.values(summary.modeUsage))) * 100}%`
                      }} />
                    </div>
                    <span className="admin-mode-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* USERS */}
          {tab === 'users' && (
            <div className="admin-users">
              {users.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 20 }}>No users yet</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Company</th><th>Joined</th><th>Sessions</th></tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.name}</td>
                        <td>{u.email || '-'}</td>
                        <td>{u.company || '-'}</td>
                        <td>{new Date(u.registeredAt).toLocaleDateString()}</td>
                        <td>{u.sessionCount || 1}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* CONVERSATIONS */}
          {tab === 'conversations' && (
            <div className="admin-convos">
              <input className="settings-input" placeholder="Filter by user or message..."
                value={convoFilter} onChange={(e) => setConvoFilter(e.target.value)}
                style={{ marginBottom: 12 }} />
              {filteredConvos.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 20 }}>No conversations logged yet</p>
              ) : (
                filteredConvos.slice(0, 50).map((c) => (
                  <div key={c.id} className="admin-convo-card">
                    <div className="admin-convo-header">
                      <span className="admin-convo-user">{c.userName || 'Unknown'}</span>
                      <span className="admin-convo-meta">{c.mode} &middot; {c.aiSource} &middot; {new Date(c.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="admin-convo-msg user">
                      <strong>User:</strong> {c.userMessage}
                    </div>
                    <div className="admin-convo-msg eva">
                      <strong>Eva:</strong> {c.evaResponse}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ERRORS */}
          {tab === 'errors' && (
            <div className="admin-errors">
              {errors.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 20 }}>No errors - nice!</p>
              ) : (
                errors.slice(0, 30).map((e, i) => (
                  <div key={i} className="admin-error-card">
                    <span className="admin-error-time">{new Date(e.timestamp).toLocaleString()}</span>
                    <p className="admin-error-msg">{e.message}</p>
                    <p className="admin-error-ctx">{e.context}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
