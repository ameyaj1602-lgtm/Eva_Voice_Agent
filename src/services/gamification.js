// Eva Gamification System - XP, Levels, Achievements
const STORAGE_KEY = 'eva-gamification';

const LEVELS = [
  { level: 1, name: 'Seedling', xp: 0, emoji: '🌱' },
  { level: 2, name: 'Sprout', xp: 50, emoji: '🌿' },
  { level: 3, name: 'Bloom', xp: 150, emoji: '🌸' },
  { level: 4, name: 'Tree', xp: 300, emoji: '🌳' },
  { level: 5, name: 'Forest', xp: 500, emoji: '🌲' },
  { level: 6, name: 'Mountain', xp: 800, emoji: '⛰️' },
  { level: 7, name: 'Star', xp: 1200, emoji: '⭐' },
  { level: 8, name: 'Galaxy', xp: 1800, emoji: '🌌' },
  { level: 9, name: 'Universe', xp: 2500, emoji: '✨' },
  { level: 10, name: 'Enlightened', xp: 3500, emoji: '🧘' },
];

const ACHIEVEMENTS = [
  { id: 'first_chat', name: 'First Words', desc: 'Had your first conversation', emoji: '💬', xp: 10 },
  { id: 'streak_3', name: 'Getting Started', desc: '3-day streak', emoji: '🔥', xp: 20 },
  { id: 'streak_7', name: 'One Week Strong', desc: '7-day streak', emoji: '💪', xp: 50 },
  { id: 'streak_30', name: 'Monthly Master', desc: '30-day streak', emoji: '🏆', xp: 200 },
  { id: 'mood_10', name: 'Self-Aware', desc: 'Logged mood 10 times', emoji: '📊', xp: 30 },
  { id: 'journal_5', name: 'Dear Diary', desc: 'Wrote 5 journal entries', emoji: '📝', xp: 30 },
  { id: 'journey_1', name: 'Path Walker', desc: 'Completed a guided journey', emoji: '🧭', xp: 100 },
  { id: 'modes_5', name: 'Explorer', desc: 'Tried 5 different modes', emoji: '🗺️', xp: 40 },
  { id: 'breathe_10', name: 'Deep Breather', desc: 'Did 10 breathing exercises', emoji: '🫁', xp: 30 },
  { id: 'night_owl', name: 'Night Owl', desc: 'Chatted past midnight', emoji: '🦉', xp: 15 },
  { id: 'early_bird', name: 'Early Bird', desc: 'Chatted before 6am', emoji: '🐦', xp: 15 },
  { id: 'habit_week', name: 'Habit Builder', desc: 'Completed all habits for 7 days', emoji: '✅', xp: 80 },
  { id: 'feedback', name: 'Community Voice', desc: 'Left feedback', emoji: '💜', xp: 20 },
];

// XP rewards for actions
const XP_REWARDS = {
  chat_message: 2,
  mood_log: 5,
  journal_entry: 10,
  breathing: 8,
  meditation: 10,
  habit_check: 3,
  journey_task: 15,
  journey_reflection: 20,
  streak_day: 5,
  feedback: 15,
};

function getData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { xp: 0, achievements: [], modesUsed: [], history: [] }; }
  catch { return { xp: 0, achievements: [], modesUsed: [], history: [] }; }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function awardXP(action) {
  const data = getData();
  const xp = XP_REWARDS[action] || 1;
  data.xp += xp;
  data.history.push({ action, xp, time: Date.now() });
  if (data.history.length > 200) data.history = data.history.slice(-200);
  saveData(data);
  return { xpGained: xp, totalXP: data.xp, level: getLevel(data.xp) };
}

export function getLevel(xp) {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.xp) current = level;
    else break;
  }
  const nextIdx = LEVELS.findIndex(l => l.level === current.level) + 1;
  const next = LEVELS[nextIdx] || null;
  const progress = next ? ((xp - current.xp) / (next.xp - current.xp)) * 100 : 100;
  return { ...current, nextLevel: next, progress: Math.round(progress), totalXP: xp };
}

export function unlockAchievement(achievementId) {
  const data = getData();
  if (data.achievements.includes(achievementId)) return null;
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) return null;
  data.achievements.push(achievementId);
  data.xp += achievement.xp;
  saveData(data);
  return achievement;
}

export function trackModeUsed(modeId) {
  const data = getData();
  if (!data.modesUsed.includes(modeId)) {
    data.modesUsed.push(modeId);
    saveData(data);
    if (data.modesUsed.length >= 5) return unlockAchievement('modes_5');
  }
  return null;
}

export function getPlayerStats() {
  const data = getData();
  return {
    xp: data.xp,
    level: getLevel(data.xp),
    achievements: data.achievements.map(id => ACHIEVEMENTS.find(a => a.id === id)).filter(Boolean),
    unlockedCount: data.achievements.length,
    totalAchievements: ACHIEVEMENTS.length,
    modesUsed: data.modesUsed.length,
    todayXP: data.history.filter(h => new Date(h.time).toDateString() === new Date().toDateString()).reduce((s, h) => s + h.xp, 0),
  };
}

export { LEVELS, ACHIEVEMENTS };
