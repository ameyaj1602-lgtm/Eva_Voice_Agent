import React, { useState, useEffect } from 'react';

// Shows ONCE on first visit — what Eva knows and can do
export function KnowledgeNote({ mode, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('eva-knowledge-note-seen');
    if (!seen) setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem('eva-knowledge-note-seen', 'true');
    setVisible(false);
    onClose?.();
  };

  return (
    <div className="knowledge-note" style={{ borderColor: `${mode.accentColor}33` }}>
      <div className="kn-header">
        <span className="kn-icon">🧠</span>
        <h3>What Eva Knows</h3>
        <button className="kn-close" onClick={dismiss}>&times;</button>
      </div>
      <p className="kn-text">
        Eva is trained on <strong>40+ professional therapy manuals</strong> including:
      </p>
      <div className="kn-sources">
        <span>CBT (Cognitive Behavioral Therapy)</span>
        <span>DBT (Dialectical Behavior Therapy)</span>
        <span>ACT (Acceptance & Commitment Therapy)</span>
        <span>Motivational Interviewing</span>
        <span>Trauma-Informed Care</span>
        <span>Grief & Bereavement Counseling</span>
        <span>Mindfulness-Based Cognitive Therapy</span>
        <span>WHO Mental Health Guidelines</span>
        <span>Crisis Intervention Protocols</span>
      </div>
      <p className="kn-text" style={{ marginTop: 12 }}>
        Sources include <strong>WHO, APA, VA, NHS, NIH, and SAMHSA</strong> clinical manuals — the same materials used to train real therapists.
      </p>
      <p className="kn-disclaimer">
        Eva is your supportive companion, not a replacement for professional therapy. She'll always be honest — if she's unsure about something, she'll tell you.
      </p>
      <button className="kn-got-it" onClick={dismiss} style={{ backgroundColor: mode.accentColor }}>
        Got it, let's talk
      </button>
    </div>
  );
}

// Exit feedback prompt — shows when user tries to leave
export function ExitFeedback({ isOpen, onClose, onSubmit, mode }) {
  const [rating, setRating] = useState(0);
  const [liked, setLiked] = useState('');
  const [improve, setImprove] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const feedback = {
      rating, liked, improve,
      date: Date.now(),
      sessionLength: Math.round((Date.now() - (parseInt(localStorage.getItem('eva-session-start')) || Date.now())) / 60000),
    };
    // Save to localStorage
    try {
      const all = JSON.parse(localStorage.getItem('eva-exit-feedback') || '[]');
      all.push(feedback);
      localStorage.setItem('eva-exit-feedback', JSON.stringify(all.slice(-50)));
    } catch {}
    onSubmit?.(feedback);
    setSubmitted(true);
    setTimeout(onClose, 2000);
  };

  if (submitted) {
    return (
      <div className="exit-fb-overlay">
        <div className="exit-fb-card">
          <span style={{ fontSize: 48 }}>💜</span>
          <h3>Thank you, really.</h3>
          <p>Your feedback helps Eva become a better companion for everyone. See you next time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exit-fb-overlay" onClick={onClose}>
      <div className="exit-fb-card" onClick={e => e.stopPropagation()}>
        <div className="exit-fb-header">
          <h3>Before you go...</h3>
          <button className="exit-fb-close" onClick={onClose}>&times;</button>
        </div>

        <p className="exit-fb-intro">
          Your honest feedback is how Eva learns to be a better companion. Every response she gives tomorrow is shaped by what you tell us today.
        </p>

        {/* Star rating */}
        <div className="exit-fb-stars">
          <p>How was your session?</p>
          <div className="exit-fb-star-row">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} className={`exit-fb-star ${rating >= n ? 'filled' : ''}`}
                onClick={() => setRating(n)}
                style={rating >= n ? { color: mode.accentColor } : {}}>
                {rating >= n ? '★' : '☆'}
              </button>
            ))}
          </div>
        </div>

        {/* What they liked */}
        <div className="exit-fb-field">
          <label>What did Eva do well?</label>
          <textarea placeholder="She made me feel heard..." value={liked}
            onChange={e => setLiked(e.target.value)} rows={2} />
        </div>

        {/* What to improve */}
        <div className="exit-fb-field">
          <label>What should she do better?</label>
          <textarea placeholder="Be more specific, ask deeper questions..." value={improve}
            onChange={e => setImprove(e.target.value)} rows={2} />
        </div>

        <p className="exit-fb-note">
          This feedback directly trains Eva to become more therapist-like. We want her to be your personal companion who truly understands you — remembers your patterns, asks the right questions, and grows with you over time.
        </p>

        <div className="exit-fb-actions">
          <button className="exit-fb-skip" onClick={onClose}>Skip</button>
          <button className="exit-fb-submit" onClick={handleSubmit}
            style={{ backgroundColor: mode.accentColor }}>
            Send Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
