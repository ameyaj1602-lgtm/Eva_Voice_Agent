// Analytics & Data Collection Service
// Uses Supabase (cloud) as primary, localStorage as fallback
// All data visible in Admin Dashboard

import {
  isSupabaseConfigured,
  registerUserDB, updateUserSessionDB, getUsersDB,
  logConversationDB, getConversationsDB,
  logErrorDB, getErrorsDB,
  getAnalyticsSummaryDB,
} from './supabase';

const ADMIN_PASSWORD = 'EVAADMIN2024';
const STORAGE_KEYS = {
  USERS: 'eva-analytics-users',
  CONVERSATIONS: 'eva-analytics-conversations',
  ERRORS: 'eva-analytics-errors',
};

const cloudEnabled = () => isSupabaseConfigured();

// --- User Registration ---
export async function registerUser(userData) {
  // Always save locally
  const users = getLocalUsers();
  const existing = users.find((u) => u.id === userData.id);
  if (existing) {
    Object.assign(existing, userData, { lastSeen: Date.now() });
  } else {
    users.push({ ...userData, registeredAt: Date.now(), lastSeen: Date.now(), sessionCount: 1 });
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

  // Also save to cloud
  if (cloudEnabled()) await registerUserDB(userData);
}

export async function updateUserSession(userId) {
  // Local
  const users = getLocalUsers();
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.lastSeen = Date.now();
    user.sessionCount = (user.sessionCount || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
  // Cloud
  if (cloudEnabled()) await updateUserSessionDB(userId);
}

export async function getUsers() {
  if (cloudEnabled()) {
    const cloudUsers = await getUsersDB();
    if (cloudUsers.length > 0) return cloudUsers;
  }
  return getLocalUsers();
}

function getLocalUsers() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || []; }
  catch { return []; }
}

// --- Conversation Logging ---
export async function logConversation(userId, userName, mode, userMessage, evaResponse, source) {
  // Local
  const logs = getLocalConversations();
  logs.push({ id: Date.now(), userId, userName, mode, userMessage, evaResponse, aiSource: source, timestamp: Date.now() });
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(logs.slice(-500)));

  // Cloud
  if (cloudEnabled()) await logConversationDB(userId, userName, mode, userMessage, evaResponse, source);
}

export async function getConversationLogs(searchQuery = '') {
  if (cloudEnabled()) {
    const cloudConvos = await getConversationsDB(100, searchQuery);
    if (cloudConvos.length > 0) return cloudConvos.map((c) => ({
      id: c.id,
      userId: c.user_id,
      userName: c.user_name,
      mode: c.mode,
      userMessage: c.user_message,
      evaResponse: c.eva_response,
      aiSource: c.ai_source,
      timestamp: new Date(c.created_at).getTime(),
    }));
  }
  const local = getLocalConversations();
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    return local.filter((c) =>
      c.userName?.toLowerCase().includes(q) ||
      c.userMessage?.toLowerCase().includes(q) ||
      c.evaResponse?.toLowerCase().includes(q)
    );
  }
  return local;
}

function getLocalConversations() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)) || []; }
  catch { return []; }
}

// --- Error Logging ---
export async function logError(error, context) {
  const msg = error?.message || String(error);
  // Local
  const errors = getLocalErrors();
  errors.push({ message: msg, context, timestamp: Date.now(), userAgent: navigator.userAgent });
  localStorage.setItem(STORAGE_KEYS.ERRORS, JSON.stringify(errors.slice(-100)));

  // Cloud
  if (cloudEnabled()) await logErrorDB(msg, context);
}

export async function getErrors() {
  if (cloudEnabled()) {
    const cloudErrors = await getErrorsDB();
    if (cloudErrors.length > 0) return cloudErrors.map((e) => ({
      message: e.message,
      context: e.context,
      timestamp: new Date(e.created_at).getTime(),
      userAgent: e.user_agent,
    }));
  }
  return getLocalErrors();
}

function getLocalErrors() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.ERRORS)) || []; }
  catch { return []; }
}

// --- Admin Auth ---
export function verifyAdminPassword(password) {
  return password === ADMIN_PASSWORD;
}

// --- Analytics Summary ---
export async function getAnalyticsSummary() {
  if (cloudEnabled()) {
    const cloudSummary = await getAnalyticsSummaryDB();
    if (cloudSummary) return cloudSummary;
  }

  // Fallback to local
  const users = getLocalUsers();
  const convos = getLocalConversations();
  const errors = getLocalErrors();

  const modeUsage = {};
  convos.forEach((c) => { modeUsage[c.mode] = (modeUsage[c.mode] || 0) + 1; });

  const sourceUsage = {};
  convos.forEach((c) => { sourceUsage[c.aiSource] = (sourceUsage[c.aiSource] || 0) + 1; });

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
