import React, { useRef, useEffect, useState } from 'react';

const REACTIONS = ['\u2764\uFE0F', '\u{1F602}', '\u{1F622}', '\u{1F525}', '\u{1F44F}', '\u{1F917}'];

export default function ChatInterface({ messages, mode, isTyping, onReact }) {
  const bottomRef = useRef(null);
  const [activeReaction, setActiveReaction] = useState(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleReaction = (msgId, emoji) => {
    onReact?.(msgId, emoji);
    setActiveReaction(null);
  };

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="chat-empty">
        <p className="chat-empty-text" style={{ color: mode.accentColor }}>
          {mode.emoji} Hey there, I'm Eva
        </p>
        <p className="chat-empty-sub">
          Tap the mic or type a message to start talking
        </p>
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
              style={
                msg.role === 'assistant'
                  ? { borderColor: `${mode.accentColor}33` }
                  : {}
              }
              onDoubleClick={() =>
                setActiveReaction(activeReaction === msg.id ? null : msg.id)
              }
            >
              <p>{msg.content}</p>
              <span className="chat-time">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {/* Reaction display */}
            {msg.reaction && (
              <div className="chat-reaction-badge">{msg.reaction}</div>
            )}

            {/* Reaction picker */}
            {activeReaction === msg.id && (
              <div className="reaction-picker">
                {REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    className="reaction-btn"
                    onClick={() => handleReaction(msg.id, emoji)}
                  >
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
