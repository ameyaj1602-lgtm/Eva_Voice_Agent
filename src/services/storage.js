// Local storage based persistence (works offline, no account needed)
// Can be swapped to Supabase later for multi-device sync

const STORAGE_KEYS = {
  PROFILES: 'eva-profiles',
  ACTIVE_PROFILE: 'eva-active-profile',
  SETTINGS: 'eva-settings',
};

// ---- Profile Management ----

export function getProfiles() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES)) || [];
  } catch {
    return [];
  }
}

export function saveProfile(profile) {
  const profiles = getProfiles();
  const index = profiles.findIndex((p) => p.id === profile.id);
  if (index >= 0) {
    profiles[index] = { ...profiles[index], ...profile, updatedAt: Date.now() };
  } else {
    profiles.push({
      ...profile,
      id: profile.id || crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  return profiles;
}

export function deleteProfile(profileId) {
  const profiles = getProfiles().filter((p) => p.id !== profileId);
  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  // Also delete chat history for this profile
  localStorage.removeItem(`eva-chats-${profileId}`);
  localStorage.removeItem(`eva-memory-${profileId}`);
  return profiles;
}

export function getActiveProfileId() {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE) || null;
}

export function setActiveProfileId(profileId) {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, profileId);
}

// ---- Chat History ----

export function getChatHistory(profileId, modeId) {
  try {
    const key = `eva-chats-${profileId}-${modeId}`;
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

export function saveChatHistory(profileId, modeId, messages) {
  const key = `eva-chats-${profileId}-${modeId}`;
  // Keep last 100 messages per mode
  const trimmed = messages.slice(-100);
  localStorage.setItem(key, JSON.stringify(trimmed));
}

export function clearChatHistory(profileId, modeId) {
  const key = `eva-chats-${profileId}-${modeId}`;
  localStorage.removeItem(key);
}

// ---- Memory (things Eva remembers about the user) ----

export function getMemory(profileId) {
  try {
    return JSON.parse(localStorage.getItem(`eva-memory-${profileId}`)) || [];
  } catch {
    return [];
  }
}

export function addMemory(profileId, fact) {
  const memories = getMemory(profileId);
  memories.push({
    id: crypto.randomUUID(),
    fact,
    createdAt: Date.now(),
  });
  // Keep last 50 memories
  const trimmed = memories.slice(-50);
  localStorage.setItem(`eva-memory-${profileId}`, JSON.stringify(trimmed));
  return trimmed;
}

export function clearMemory(profileId) {
  localStorage.removeItem(`eva-memory-${profileId}`);
}
