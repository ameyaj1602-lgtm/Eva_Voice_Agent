// Analytics & Data Collection Service
// Stores user data + conversation logs for admin viewing
// Currently uses localStorage - swap to Supabase for production

const ADMIN_PASSWORD = 'EVAADMIN2024';
const STORAGE_KEYS = {
  USERS: 'eva-analytics-users',
  CONVERSATIONS: 'eva-analytics-conversations',
  ERRORS: 'eva-analytics-errors',
};

// --- User Registration Data ---
export function registerUser(userData) {
  const users = getUsers();
  const existing = users.find((u) => u.id === userData.id);
  if (existing) {
    Object.assign(existing, userData, { lastSeen: Date.now() });
  } else {
    users.push({
      ...userData,
      registeredAt: Date.now(),
      lastSeen: Date.now(),
      sessionCount: 1,
    });
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function updateUserSession(userId) {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.lastSeen = Date.now();
    user.sessionCount = (user.sessionCount || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
}

export function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
  } catch { return []; }
}

// --- Conversation Logging ---
export function logConversation(userId, userName, mode, userMessage, evaResponse, source) {
  const logs = getConversationLogs();
  logs.push({
    id: Date.now(),
    userId,
    userName,
    mode,
    userMessage,
    evaResponse,
    aiSource: source, // gemini / openai / offline
    timestamp: Date.now(),
  });
  // Keep last 500 conversations
  const trimmed = logs.slice(-500);
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(trimmed));
}

export function getConversationLogs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)) || [];
  } catch { return []; }
}

// --- Error Logging ---
export function logError(error, context) {
  const errors = getErrors();
  errors.push({
    message: error?.message || String(error),
    context,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
  });
  const trimmed = errors.slice(-100);
  localStorage.setItem(STORAGE_KEYS.ERRORS, JSON.stringify(trimmed));
}

export function getErrors() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ERRORS)) || [];
  } catch { return []; }
}

// --- Admin Auth ---
export function verifyAdminPassword(password) {
  return password === ADMIN_PASSWORD;
}

// --- Analytics Summary ---
export function getAnalyticsSummary() {
  const users = getUsers();
  const convos = getConversationLogs();
  const errors = getErrors();

  const modeUsage = {};
  convos.forEach((c) => {
    modeUsage[c.mode] = (modeUsage[c.mode] || 0) + 1;
  });

  const sourceUsage = {};
  convos.forEach((c) => {
    sourceUsage[c.aiSource] = (sourceUsage[c.aiSource] || 0) + 1;
  });

  return {
    totalUsers: users.length,
    totalConversations: convos.length,
    totalErrors: errors.length,
    modeUsage,
    sourceUsage,
    activeToday: users.filter((u) =>
      new Date(u.lastSeen).toDateString() === new Date().toDateString()
    ).length,
  };
}
