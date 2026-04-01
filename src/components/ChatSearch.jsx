import React, { useState } from 'react';

export default function ChatSearch({ isOpen, onClose, messages, mode }) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const results = query.trim().length >= 2
    ? messages.filter((m) =>
        m.content?.toLowerCase().includes(query.toLowerCase())
      ).slice(-20)
    : [];

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Search Chats</h2>
          <button className="settings-close" onClick={onClose}>&times;</button>
        </div>
        <div className="settings-body">
          <input className="settings-input" placeholder="Search messages..."
            value={query} onChange={(e) => setQuery(e.target.value)} autoFocus
            style={{ borderColor: `${mode.accentColor}44` }} />

          <div style={{ marginTop: 16, maxHeight: 350, overflowY: 'auto' }}>
            {query.trim().length >= 2 && results.length === 0 && (
              <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 20 }}>
                No messages found
              </p>
            )}
            {results.map((msg) => (
              <div key={msg.id} style={{
                padding: 12, marginBottom: 8,
                background: 'rgba(255,255,255,0.04)', borderRadius: 12,
                borderLeft: `3px solid ${msg.role === 'assistant' ? mode.accentColor : 'rgba(255,255,255,0.2)'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: mode.accentColor, fontWeight: 600 }}>
                    {msg.role === 'assistant' ? 'Eva' : 'You'}
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                    {new Date(msg.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
                  {msg.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
