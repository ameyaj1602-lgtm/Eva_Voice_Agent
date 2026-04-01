import React, { useRef, useEffect, useState } from 'react';
import { getConversationStarters } from '../utils/conversationStarters';
import { useTypingAnimation } from '../hooks/useTypingAnimation';

const REACTIONS = ['\u2764\uFE0F', '\u{1F602}', '\u{1F622}', '\u{1F525}', '\u{1F44F}', '\u{1F917}'];

function TypingMessage({ content, mode }) {
  const { displayText } = useTypingAnimation(content, 20, true);
  return <p>{displayText}<span className="typing-cursor" style={{ backgroundColor: mode.accentColor }}>|</span></p>;
}

export default function ChatInterface({ messages, mode, isTyping, onReact, onSendStarter }) {
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
              <span className="chat-time">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
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
