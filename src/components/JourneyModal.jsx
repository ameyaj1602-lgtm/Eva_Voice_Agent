import React, { useState, useEffect } from 'react';
import { JOURNEYS, getJourneyProgress, startJourney, completeTask, saveReflection } from '../services/journeys';

export default function JourneyModal({ isOpen, onClose, mode, onOpenBreathing, onOpenTimer }) {
  const [view, setView] = useState('list'); // 'list' | 'active'
  const [activeId, setActiveId] = useState(null);
  const [progress, setProgress] = useState({});
  const [reflection, setReflection] = useState('');

  useEffect(() => {
    if (isOpen) setProgress(getJourneyProgress());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStart = (id) => {
    startJourney(id);
    setProgress(getJourneyProgress());
    setActiveId(id);
    setView('active');
  };

  const handleResume = (id) => {
    setActiveId(id);
    setView('active');
  };

  const handleTask = (taskId, type) => {
    completeTask(activeId, taskId);
    setProgress(getJourneyProgress());
    if (type === 'breathe') onOpenBreathing?.();
    if (type === 'timer') onOpenTimer?.();
  };

  const handleReflection = () => {
    if (!reflection.trim()) return;
    const p = progress[activeId];
    saveReflection(activeId, p.currentDay, reflection.trim());
    setReflection('');
    setProgress(getJourneyProgress());
  };

  const journey = activeId ? JOURNEYS[activeId] : null;
  const jp = activeId ? progress[activeId] : null;
  const currentDay = jp?.currentDay || 0;
  const dayData = journey?.days?.[currentDay];

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal journey-modal" onClick={e => e.stopPropagation()}
        style={{ maxWidth: 520, maxHeight: '90vh' }}>
        <div className="settings-header">
          <h2>{view === 'list' ? 'Guided Journeys' : journey?.title}</h2>
          <button className="settings-close" onClick={() => { if (view === 'active') { setView('list'); } else { onClose(); } }}>
            {view === 'active' ? '\u2190' : '\u00D7'}
          </button>
        </div>

        <div className="settings-body" style={{ overflowY: 'auto' }}>
          {/* JOURNEY LIST */}
          {view === 'list' && (
            <div className="journey-list">
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 16 }}>
                Structured multi-day plans to help you grow. Pick a journey and commit.
              </p>
              {Object.values(JOURNEYS).map((j) => {
                const p = progress[j.id];
                const isActive = p && !p.completed;
                const isCompleted = p?.completed;
                const dayNum = p ? p.currentDay + 1 : 0;
                return (
                  <div key={j.id} className="journey-card" style={{ borderColor: `${j.color}33` }}>
                    <div className="journey-card-top">
                      <span className="journey-emoji">{j.emoji}</span>
                      <div className="journey-info">
                        <h3 style={{ color: j.color }}>{j.title}</h3>
                        <p>{j.description}</p>
                        <span className="journey-duration">{j.duration} days</span>
                      </div>
                    </div>
                    {isCompleted ? (
                      <div className="journey-done">Completed</div>
                    ) : isActive ? (
                      <div className="journey-active-row">
                        <div className="journey-progress-bar">
                          <div className="journey-progress-fill" style={{ width: `${(dayNum / j.duration) * 100}%`, backgroundColor: j.color }} />
                        </div>
                        <span className="journey-day-label">Day {dayNum}/{j.duration}</span>
                        <button className="journey-resume-btn" onClick={() => handleResume(j.id)}
                          style={{ backgroundColor: j.color }}>Continue</button>
                      </div>
                    ) : (
                      <button className="journey-start-btn" onClick={() => handleStart(j.id)}
                        style={{ backgroundColor: j.color }}>Start Journey</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ACTIVE JOURNEY DAY VIEW */}
          {view === 'active' && journey && dayData && (
            <div className="journey-day">
              {/* Progress dots */}
              <div className="journey-dots">
                {journey.days.map((_, i) => (
                  <div key={i} className={`journey-dot ${i < currentDay ? 'done' : i === currentDay ? 'current' : ''}`}
                    style={i <= currentDay ? { backgroundColor: journey.color } : {}}>
                    {i + 1}
                  </div>
                ))}
              </div>

              <h3 className="journey-day-title" style={{ color: journey.color }}>
                Day {currentDay + 1}: {dayData.title}
              </h3>
              <p className="journey-day-intro">{dayData.intro}</p>

              {/* Tasks */}
              <div className="journey-tasks">
                {dayData.tasks.map((task) => {
                  const isDone = !!jp.completedTasks?.[task.id];
                  return (
                    <button key={task.id}
                      className={`journey-task ${isDone ? 'done' : ''}`}
                      onClick={() => !isDone && handleTask(task.id, task.type)}
                      style={isDone ? { borderColor: journey.color } : {}}>
                      <span className="journey-task-check" style={isDone ? { backgroundColor: journey.color } : {}}>
                        {isDone ? '✓' : ''}
                      </span>
                      <span className={`journey-task-text ${isDone ? 'done' : ''}`}>{task.text}</span>
                      {task.type === 'breathe' && <span className="journey-task-badge">Breathe</span>}
                      {task.type === 'timer' && <span className="journey-task-badge">Timer</span>}
                    </button>
                  );
                })}
              </div>

              {/* Reflection */}
              <div className="journey-reflection">
                <h4>Today's Reflection</h4>
                <p className="journey-reflection-prompt">{dayData.reflection}</p>
                {jp.reflections?.[currentDay] ? (
                  <div className="journey-reflection-saved">
                    <p>{jp.reflections[currentDay].text}</p>
                    <span className="journey-reflection-date">
                      {new Date(jp.reflections[currentDay].savedAt).toLocaleDateString()}
                    </span>
                  </div>
                ) : (
                  <>
                    <textarea className="journey-reflection-input" rows={3}
                      placeholder="Write your reflection..."
                      value={reflection} onChange={e => setReflection(e.target.value)} />
                    <button className="journey-reflection-btn"
                      onClick={handleReflection}
                      disabled={!reflection.trim()}
                      style={{ backgroundColor: journey.color }}>
                      Save & Complete Day {currentDay + 1}
                    </button>
                  </>
                )}
              </div>

              {jp.completed && (
                <div className="journey-complete-banner" style={{ borderColor: journey.color }}>
                  <span style={{ fontSize: 32 }}>{journey.emoji}</span>
                  <h3 style={{ color: journey.color }}>Journey Complete!</h3>
                  <p>You showed up for {journey.duration} days. That takes real commitment. Be proud of yourself.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
