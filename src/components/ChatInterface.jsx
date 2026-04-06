import React, { useRef, useEffect, useState } from 'react';
import { getConversationStarters } from '../utils/conversationStarters';
import { useTypingAnimation } from '../hooks/useTypingAnimation';

const REACTIONS = ['\u2764\uFE0F', '\u{1F602}', '\u{1F622}', '\u{1F525}', '\u{1F44F}', '\u{1F917}'];

function TypingMessage({ content, mode }) {
  const { displayText } = useTypingAnimation(content, 20, true);
  return <p>{displayText}<span className="typing-cursor" style={{ backgroundColor: mode.accentColor }}>|</span></p>;
}

function relativeTime(ts) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatInterface({ messages, mode, isTyping, onReact, onSendStarter, onRetry, onSpeakAgain, onDelete }) {
  const bottomRef = useRef(null);
  const [activeReaction, setActiveReaction] = useState(null);
  const [animatingId, setAnimatingId] = useState(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Track the latest assistant message for typing animation
  useEffect(() => {
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.role === 'assistant') {
        setAnimatingId(last.id);
        const timer = setTimeout(() => setAnimatingId(null), last.content.length * 20 + 500);
        return () => clearTimeout(timer);
      }
    }
  }, [messages]);

  const handleReaction = (msgId, emoji) => {
    onReact?.(msgId, emoji);
    setActiveReaction(null);
  };

  if (messages.length === 0 && !isTyping) {
    const starters = getConversationStarters(mode.id);
    return (
      <div className="chat-empty">
        <p className="chat-empty-text" style={{ color: mode.accentColor }}>
          {mode.emoji} Hey there, I'm Eva
        </p>
        <p className="chat-empty-sub">Try one of these to get started:</p>
        <div className="chat-starters">
          {starters.slice(0, 3).map((s, i) => (
            <button key={i} className="chat-starter-btn"
              onClick={() => onSendStarter?.(s)}
              style={{ borderColor: `${mode.accentColor}33` }}>
              {s}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-messages">
      {messages.map((msg) => (
        <div key={msg.id} className={`chat-message ${msg.role}`}>
          {msg.role === 'assistant' && (
            <div className="chat-avatar-mini" style={{ background: mode.gradient }}>
              <span>E</span>
            </div>
          )}
          <div className="chat-bubble-wrapper">
            <div
              className={`chat-bubble ${msg.role}`}
              style={msg.role === 'assistant' ? { borderColor: `${mode.accentColor}33` } : {}}
              onDoubleClick={() => setActiveReaction(activeReaction === msg.id ? null : msg.id)}
            >
              {msg.role === 'assistant' && msg.id === animatingId ? (
                <TypingMessage content={msg.content} mode={mode} />
              ) : (
                <p>{msg.content}</p>
              )}
              <div className="chat-meta">
                <span className="chat-time">{relativeTime(msg.timestamp)}</span>
                {msg.role === 'assistant' && (
                  <div className="chat-actions">
                    <button className="chat-action-btn" title="Copy"
                      onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(msg.content); }}>
                      📋
                    </button>
                    <button className="chat-action-btn" title="Speak again"
                      onClick={(e) => { e.stopPropagation(); onSpeakAgain?.(msg.content); }}>
                      🔊
                    </button>
                  </div>
                )}
              </div>
            </div>

            {msg.reaction && <div className="chat-reaction-badge">{msg.reaction}</div>}

            {activeReaction === msg.id && (
              <div className="reaction-picker">
                {REACTIONS.map((emoji) => (
                  <button key={emoji} className="reaction-btn"
                    onClick={() => handleReaction(msg.id, emoji)}>
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="chat-message assistant">
          <div className="chat-avatar-mini" style={{ background: mode.gradient }}>
            <span>E</span>
          </div>
          <div className="chat-bubble-wrapper">
            <div className="chat-bubble assistant typing">
              <div className="typing-dots">
                <span style={{ backgroundColor: mode.accentColor }} />
                <span style={{ backgroundColor: mode.accentColor }} />
                <span style={{ backgroundColor: mode.accentColor }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
