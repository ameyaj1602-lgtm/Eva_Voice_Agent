import React, { useState } from 'react';
import { logConversation } from '../services/analytics';

export default function FeedbackForm({ isOpen, onClose, profile, mode }) {
  const [rating, setRating] = useState(0);
  const [favoriteMode, setFavoriteMode] = useState('');
  const [realFeel, setRealFeel] = useState(0);
  const [usedVoice, setUsedVoice] = useState('');
  const [wishFeature, setWishFeature] = useState('');
  const [useDaily, setUseDaily] = useState('');
  const [openFeedback, setOpenFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const feedback = {
      rating,
      favoriteMode,
      realFeel,
      usedVoice,
      wishFeature,
      useDaily,
      openFeedback,
      profileName: profile?.name,
      profileEmail: profile?.email,
      timestamp: Date.now(),
    };

    // Save to analytics (goes to Supabase if configured)
    logConversation(
      profile?.id,
      profile?.name,
      'feedback',
      JSON.stringify(feedback),
      'Feedback submitted',
      'feedback'
    );

    // Also save locally
    try {
      const existing = JSON.parse(localStorage.getItem('eva-feedback') || '[]');
      existing.push(feedback);
      localStorage.setItem('eva-feedback', JSON.stringify(existing));
    } catch {}

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="settings-overlay" onClick={onClose}>
        <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
          <div className="feedback-thanks">
            <span style={{ fontSize: 48 }}>{'💜'}</span>
            <h2>Thank you!</h2>
            <p>Your feedback helps Eva become better for everyone.</p>
            <button className="settings-save-btn" onClick={onClose}
              style={{ backgroundColor: mode.accentColor, marginTop: 20 }}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const modes = ['Calm', 'Motivation', 'Charming', 'Therapist', 'Companion', 'Lullaby', 'Storyteller', 'Comedian', 'Philosopher'];

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Share Your Feedback</h2>
          <button className="settings-close" onClick={onClose}>&times;</button>
        </div>

        <div className="feedback-body">
          {/* Q1: First impression */}
          <div className="feedback-q">
            <p className="feedback-label">First impression of Eva? (1 = confused, 5 = amazed)</p>
            <div className="feedback-stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} className={`feedback-star ${rating >= n ? 'active' : ''}`}
                  onClick={() => setRating(n)}
                  style={rating >= n ? { color: mode.accentColor } : {}}>
                  {rating >= n ? '\u2605' : '\u2606'}
                </button>
              ))}
            </div>
          </div>

          {/* Q2: Favorite mode */}
          <div className="feedback-q">
            <p className="feedback-label">Which mode did you like most?</p>
            <div className="feedback-chips">
              {modes.map((m) => (
                <button key={m} className={`feedback-chip ${favoriteMode === m ? 'active' : ''}`}
                  onClick={() => setFavoriteMode(m)}
                  style={favoriteMode === m ? { borderColor: mode.accentColor, color: mode.accentColor } : {}}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Q3: Did responses feel real */}
          <div className="feedback-q">
            <p className="feedback-label">Did Eva feel like a real person? (1 = robotic, 5 = real)</p>
            <div className="feedback-stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} className={`feedback-star ${realFeel >= n ? 'active' : ''}`}
                  onClick={() => setRealFeel(n)}
                  style={realFeel >= n ? { color: mode.accentColor } : {}}>
                  {realFeel >= n ? '\u2605' : '\u2606'}
                </button>
              ))}
            </div>
          </div>

          {/* Q4: Used voice */}
          <div className="feedback-q">
            <p className="feedback-label">Did you use voice (mic) to talk to Eva?</p>
            <div className="feedback-chips">
              {['Yes, loved it', 'Yes, was okay', 'No, prefer typing', "Didn't work"].map((opt) => (
                <button key={opt} className={`feedback-chip ${usedVoice === opt ? 'active' : ''}`}
                  onClick={() => setUsedVoice(opt)}
                  style={usedVoice === opt ? { borderColor: mode.accentColor, color: mode.accentColor } : {}}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Q5: Wish feature */}
          <div className="feedback-q">
            <p className="feedback-label">What's ONE feature you wish Eva had?</p>
            <input className="settings-input" placeholder="Type your idea..."
              value={wishFeature} onChange={(e) => setWishFeature(e.target.value)} />
          </div>

          {/* Q6: Use daily */}
          <div className="feedback-q">
            <p className="feedback-label">Would you use Eva daily?</p>
            <div className="feedback-chips">
              {['Yes, definitely', 'Maybe', 'No'].map((opt) => (
                <button key={opt} className={`feedback-chip ${useDaily === opt ? 'active' : ''}`}
                  onClick={() => setUseDaily(opt)}
                  style={useDaily === opt ? { borderColor: mode.accentColor, color: mode.accentColor } : {}}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Q7: Open feedback */}
          <div className="feedback-q">
            <p className="feedback-label">Anything else you want to tell us?</p>
            <textarea className="settings-input" style={{ minHeight: 80, resize: 'vertical' }}
              placeholder="Your thoughts..."
              value={openFeedback} onChange={(e) => setOpenFeedback(e.target.value)} />
          </div>
        </div>

        <div className="settings-footer">
          <button className="settings-save-btn" onClick={handleSubmit}
            style={{ backgroundColor: mode.accentColor }}>
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
