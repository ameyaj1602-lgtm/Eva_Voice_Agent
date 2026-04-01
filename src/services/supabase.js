import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

let supabase = null;

export function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabase;
}

export function isSupabaseConfigured() {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

// ==========================================
//  USERS
// ==========================================
export async function registerUserDB(userData) {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from('users')
      .upsert({
        id: userData.id,
        name: userData.name,
        email: userData.email || null,
        company: userData.company || null,
        registered_at: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        session_count: 1,
      }, { onConflict: 'id' })
      .select();
    if (error) console.warn('Supabase user error:', error.message);
    return data;
  } catch (err) {
    console.warn('Supabase registerUser failed:', err.message);
    return null;
  }
}

export async function updateUserSessionDB(userId) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    // First get current count
    const { data: existing } = await sb
      .from('users')
      .select('session_count')
      .eq('id', userId)
      .single();

    await sb
      .from('users')
      .update({
        last_seen: new Date().toISOString(),
        session_count: (existing?.session_count || 0) + 1,
      })
      .eq('id', userId);
  } catch (err) {
    console.warn('Supabase updateSession failed:', err.message);
  }
}

export async function getUsersDB() {
  const sb = getSupabase();
  if (!sb) return [];
  try {
    const { data, error } = await sb
      .from('users')
      .select('*')
      .order('registered_at', { ascending: false })
      .limit(200);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Supabase getUsers failed:', err.message);
    return [];
  }
}

// ==========================================
//  CONVERSATIONS
// ==========================================
export async function logConversationDB(userId, userName, mode, userMessage, evaResponse, aiSource) {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { error } = await sb
      .from('conversations')
      .insert({
        user_id: userId,
        user_name: userName,
        mode,
        user_message: userMessage,
        eva_response: evaResponse,
        ai_source: aiSource,
        created_at: new Date().toISOString(),
      });
    if (error) console.warn('Supabase conversation error:', error.message);
  } catch (err) {
    console.warn('Supabase logConversation failed:', err.message);
  }
}

export async function getConversationsDB(limit = 100, searchQuery = '') {
  const sb = getSupabase();
  if (!sb) return [];
  try {
    let query = sb
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (searchQuery) {
      query = query.or(`user_message.ilike.%${searchQuery}%,eva_response.ilike.%${searchQuery}%,user_name.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Supabase getConversations failed:', err.message);
    return [];
  }
}

// ==========================================
//  ERRORS
// ==========================================
export async function logErrorDB(message, context) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb
      .from('errors')
      .insert({
        message,
        context,
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString(),
      });
  } catch (err) {
    console.warn('Supabase logError failed:', err.message);
  }
}

export async function getErrorsDB(limit = 50) {
  const sb = getSupabase();
  if (!sb) return [];
  try {
    const { data, error } = await sb
      .from('errors')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Supabase getErrors failed:', err.message);
    return [];
  }
}

// ==========================================
//  ANALYTICS SUMMARY
// ==========================================
export async function getAnalyticsSummaryDB() {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const [usersRes, convosRes, errorsRes] = await Promise.all([
      sb.from('users').select('id, last_seen', { count: 'exact' }),
      sb.from('conversations').select('mode, ai_source', { count: 'exact' }),
      sb.from('errors').select('id', { count: 'exact' }),
    ]);

    const users = usersRes.data || [];
    const convos = convosRes.data || [];
    const today = new Date().toDateString();

    const modeUsage = {};
    convos.forEach((c) => { modeUsage[c.mode] = (modeUsage[c.mode] || 0) + 1; });

    const sourceUsage = {};
    convos.forEach((c) => { sourceUsage[c.ai_source] = (sourceUsage[c.ai_source] || 0) + 1; });

    return {
      totalUsers: usersRes.count || users.length,
      totalConversations: convosRes.count || convos.length,
      totalErrors: errorsRes.count || 0,
      modeUsage,
      sourceUsage,
      activeToday: users.filter((u) =>
        new Date(u.last_seen).toDateString() === today
      ).length,
    };
  } catch (err) {
    console.warn('Supabase analytics failed:', err.message);
    return null;
  }
}

// ==========================================
//  SQL to create tables (run this in Supabase SQL editor)
// ==========================================
export const SETUP_SQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  session_count INTEGER DEFAULT 1
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  user_name TEXT,
  mode TEXT,
  user_message TEXT,
  eva_response TEXT,
  ai_source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Errors table
CREATE TABLE IF NOT EXISTS errors (
  id BIGSERIAL PRIMARY KEY,
  message TEXT,
  context TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security but allow all for anon key (since this is admin-viewed)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON errors FOR ALL USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_errors_created_at ON errors(created_at DESC);
`;
