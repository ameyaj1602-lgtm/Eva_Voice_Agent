import React, { useState } from 'react';

export default function ProfileSelector({
  profiles,
  activeProfile,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
  mode,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    if (newName.trim()) {
      onCreateProfile(newName.trim());
      setNewName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="profile-selector">
      <button
        className="profile-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{ borderColor: `${mode.accentColor}33` }}
      >
        <div
          className="profile-avatar-small"
          style={{ background: mode.gradient }}
        >
          {activeProfile?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <span className="profile-name">
          {activeProfile ? activeProfile.name : 'Select Profile'}
        </span>
        <span className={`profile-arrow ${isOpen ? 'up' : ''}`}>&#9662;</span>
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          {profiles.map((p) => (
            <div
              key={p.id}
              className={`profile-option ${p.id === activeProfile?.id ? 'active' : ''}`}
            >
              <button
                className="profile-option-btn"
                onClick={() => {
                  onSelectProfile(p);
                  setIsOpen(false);
                }}
              >
                <div
                  className="profile-avatar-small"
                  style={{ background: mode.gradient }}
                >
                  {p.name[0].toUpperCase()}
                </div>
                <div className="profile-option-info">
                  <span className="profile-option-name">{p.name}</span>
                  <span className="profile-option-date">
                    Since {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
              {profiles.length > 1 && (
                <button
                  className="profile-delete-btn"
                  onClick={() => onDeleteProfile(p.id)}
                  title="Delete profile"
                >
                  &times;
                </button>
              )}
            </div>
          ))}

          {isCreating ? (
            <div className="profile-create-form">
              <input
                type="text"
                className="profile-create-input"
                placeholder="Your name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
                style={{ borderColor: `${mode.accentColor}44` }}
              />
              <button
                className="profile-create-confirm"
                onClick={handleCreate}
                style={{ backgroundColor: mode.accentColor }}
              >
                &#10003;
              </button>
              <button
                className="profile-create-cancel"
                onClick={() => setIsCreating(false)}
              >
                &times;
              </button>
            </div>
          ) : (
            <button
              className="profile-add-btn"
              onClick={() => setIsCreating(true)}
              style={{ color: mode.accentColor }}
            >
              + New Profile
            </button>
          )}
        </div>
      )}
    </div>
  );
}
