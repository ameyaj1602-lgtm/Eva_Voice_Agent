import React, { useState } from 'react';
import { getAIResponse } from '../services/ai';
import { MODES } from '../utils/modes';

// Multi-Agent: Get 3 perspectives on one question
const AGENTS = [
  { id: 'therapist', name: 'Therapist Eva', emoji: '💜', desc: 'Emotional angle', modeId: 'therapist' },
  { id: 'motivation', name: 'Coach Eva', emoji: '🔥', desc: 'Action steps', modeId: 'motivation' },
  { id: 'philosopher', name: 'Philosopher Eva', emoji: '🧠', desc: 'Deeper meaning', modeId: 'philosopher' },
];

export default function MultiAgentPanel({ isOpen, onClose, mode, settings, userName }) {
  const [question, setQuestion] = useState('');
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState({});

  if (!isOpen) return null;

  const askAll = async () => {
    if (!question.trim()) return;
    setResponses({});

    // Fire all 3 in parallel
    AGENTS.forEach(async (agent) => {
      setLoading(prev => ({ ...prev, [agent.id]: true }));
      try {
        const agentMode = MODES[agent.modeId];
        const messages = [{ role: 'user', content: question, id: 1, timestamp: Date.now() }];
        const { text } = await getAIResponse(messages, agentMode, settings.geminiApiKey, { userName });
        setResponses(prev => ({ ...prev, [agent.id]: text }));
      } catch {
        setResponses(prev => ({ ...prev, [agent.id]: 'Could not generate response.' }));
      }
      setLoading(prev => ({ ...prev, [agent.id]: false }));
    });
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560, maxHeight: '90vh' }}>
        <div className="settings-header">
          <h2>3 Perspectives</h2>
          <button className="settings-close" onClick={onClose}>&times;</button>
        </div>
        <div className="settings-body" style={{ overflowY: 'auto' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
            Ask one question. Get three different perspectives — emotional, practical, and philosophical.
          </p>

          <div style={{ display: 'flex', gap: 8 }}>
            <input className="settings-input" placeholder="What's been on your mind?"
              value={question} onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && askAll()} style={{ flex: 1 }} />
            <button onClick={askAll} disabled={!question.trim()}
              style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: mode.accentColor, color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: question.trim() ? 1 : 0.3 }}>
              Ask
            </button>
          </div>

          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {AGENTS.map(agent => (
              <div key={agent.id} style={{
                padding: 16, background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{agent.emoji}</span>
                  <div>
                    <strong style={{ fontSize: 14 }}>{agent.name}</strong>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 8 }}>{agent.desc}</span>
                  </div>
                </div>
                {loading[agent.id] ? (
                  <div style={{ display: 'flex', gap: 4, padding: 8 }}>
                    <span className="typing-dots"><span style={{ backgroundColor: mode.accentColor, width: 6, height: 6, borderRadius: '50%', display: 'inline-block', animation: 'typingBounce 1.4s infinite' }} /></span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>thinking...</span>
                  </div>
                ) : responses[agent.id] ? (
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{responses[agent.id]}</p>
                ) : (
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Waiting for question...</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
