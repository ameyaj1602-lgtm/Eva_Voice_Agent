// Memory Intelligence - pattern detection, weekly reflections, personality profiling

function getMoodLog() {
  try { return JSON.parse(localStorage.getItem('eva-mood-log')) || []; } catch { return []; }
}

function getChatLogs() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('eva-chats-'));
  let allMessages = [];
  keys.forEach(k => {
    try {
      const msgs = JSON.parse(localStorage.getItem(k)) || [];
      allMessages = allMessages.concat(msgs);
    } catch { }
  });
  return allMessages;
}

// Analyze mood patterns
export function analyzeMoodPatterns() {
  const moods = getMoodLog();
  if (moods.length < 3) return null;

  const last7 = moods.slice(-7);
  const avgMood = last7.reduce((s, m) => s + m.value, 0) / last7.length;

  // Time-of-day analysis
  const byHour = {};
  moods.forEach(m => {
    const hour = new Date(m.date).getHours();
    const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    if (!byHour[period]) byHour[period] = [];
    byHour[period].push(m.value);
  });

  const avgByPeriod = {};
  Object.entries(byHour).forEach(([period, values]) => {
    avgByPeriod[period] = values.reduce((s, v) => s + v, 0) / values.length;
  });

  // Find lowest period
  let lowestPeriod = null;
  let lowestAvg = 6;
  Object.entries(avgByPeriod).forEach(([period, avg]) => {
    if (avg < lowestAvg) { lowestAvg = avg; lowestPeriod = period; }
  });

  // Trend: improving or declining?
  const firstHalf = last7.slice(0, Math.ceil(last7.length / 2));
  const secondHalf = last7.slice(Math.ceil(last7.length / 2));
  const firstAvg = firstHalf.reduce((s, m) => s + m.value, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((s, m) => s + m.value, 0) / secondHalf.length;
  const trend = secondAvg > firstAvg + 0.3 ? 'improving' : secondAvg < firstAvg - 0.3 ? 'declining' : 'stable';

  // Count low moods
  const lowCount = last7.filter(m => m.value <= 2).length;

  return {
    avgMood: Math.round(avgMood * 10) / 10,
    trend,
    lowestPeriod,
    lowCount,
    totalLogs: moods.length,
    insights: generateInsights({ avgMood, trend, lowestPeriod, lowCount }),
  };
}

function generateInsights({ avgMood, trend, lowestPeriod, lowCount }) {
  const insights = [];

  if (lowCount >= 3) {
    insights.push(`You felt low ${lowCount} times this week. That's tough. Would you like to explore what's happening?`);
  }

  if (lowestPeriod === 'evening') {
    insights.push('Your mood tends to dip in the evenings. A wind-down routine might help.');
  } else if (lowestPeriod === 'morning') {
    insights.push('Mornings seem hardest for you. Try starting the day with Eva\'s breathing exercise.');
  }

  if (trend === 'improving') {
    insights.push('Your mood is trending upward! Whatever you\'re doing, keep it up.');
  } else if (trend === 'declining') {
    insights.push('Your mood has been dipping lately. Want to try a Guided Journey to address this?');
  }

  if (avgMood >= 4) {
    insights.push('You\'re doing well overall! Your average mood is above 4/5.');
  }

  return insights;
}

// Generate weekly reflection
export function generateWeeklyReflection() {
  const patterns = analyzeMoodPatterns();
  const moods = getMoodLog();
  const last7 = moods.filter(m => Date.now() - m.date < 7 * 86400000);

  if (last7.length < 2) return null;

  const emojiCounts = {};
  last7.forEach(m => {
    emojiCounts[m.emoji] = (emojiCounts[m.emoji] || 0) + 1;
  });
  const topEmoji = Object.entries(emojiCounts).sort((a, b) => b[1] - a[1])[0];

  return {
    weekOf: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    moodLogs: last7.length,
    avgMood: patterns?.avgMood,
    trend: patterns?.trend,
    topEmoji: topEmoji?.[0],
    topEmojiCount: topEmoji?.[1],
    insights: patterns?.insights || [],
    lowestPeriod: patterns?.lowestPeriod,
  };
}

// Simple personality profiling based on usage patterns
export function getPersonalityProfile() {
  const moods = getMoodLog();
  const messages = getChatLogs().filter(m => m.role === 'user');

  const profile = {
    expressiveness: 'unknown', // how much they share
    moodVariability: 'unknown', // stable vs volatile
    preferredTime: 'unknown',
    topModes: [],
  };

  // Expressiveness: avg message length
  if (messages.length >= 5) {
    const avgLen = messages.reduce((s, m) => s + (m.content?.length || 0), 0) / messages.length;
    profile.expressiveness = avgLen > 100 ? 'high' : avgLen > 40 ? 'medium' : 'brief';
  }

  // Mood variability
  if (moods.length >= 5) {
    const values = moods.slice(-10).map(m => m.value);
    const variance = values.reduce((s, v) => {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      return s + Math.pow(v - mean, 2);
    }, 0) / values.length;
    profile.moodVariability = variance > 2 ? 'volatile' : variance > 0.8 ? 'moderate' : 'stable';
  }

  // Preferred usage time
  if (messages.length >= 3) {
    const hours = messages.map(m => new Date(m.timestamp).getHours());
    const avgHour = hours.reduce((s, h) => s + h, 0) / hours.length;
    profile.preferredTime = avgHour < 12 ? 'morning' : avgHour < 17 ? 'afternoon' : 'evening';
  }

  return profile;
}
