// Smart greeting system - makes Eva feel alive and personal

function getMoodLog() {
  try { return JSON.parse(localStorage.getItem('eva-mood-log')) || []; } catch { return []; }
}
function getStreak() {
  try { return JSON.parse(localStorage.getItem('eva-streak')) || { current: 0, best: 0 }; } catch { return { current: 0, best: 0 }; }
}
function getLastVisit() {
  return localStorage.getItem('eva-last-visit-time');
}
function setLastVisit() {
  localStorage.setItem('eva-last-visit-time', Date.now().toString());
}

export function getSmartGreeting(userName) {
  const name = userName || 'friend';
  const hour = new Date().getHours();
  const streak = getStreak();
  const moods = getMoodLog();
  const lastVisit = getLastVisit();
  const daysSinceVisit = lastVisit ? Math.floor((Date.now() - parseInt(lastVisit)) / 86400000) : 0;

  setLastVisit();

  // Time-based greeting
  let timeGreeting;
  if (hour < 5) timeGreeting = 'Still up?';
  else if (hour < 9) timeGreeting = 'Good morning';
  else if (hour < 12) timeGreeting = 'Hey there';
  else if (hour < 17) timeGreeting = 'Good afternoon';
  else if (hour < 21) timeGreeting = 'Good evening';
  else timeGreeting = 'Good night';

  // Absence detection
  if (daysSinceVisit >= 3) {
    const msgs = [
      `${timeGreeting}, ${name}! I missed you. It's been ${daysSinceVisit} days. How have you been?`,
      `${name}! You're back. I was thinking about you. Everything okay?`,
      `Hey ${name}... ${daysSinceVisit} days away. I hope you're doing alright. I'm here now.`,
    ];
    return { text: msgs[Math.floor(Math.random() * msgs.length)], type: 'missed', daysSinceVisit };
  }

  // Streak celebration
  if (streak.current === 3) return { text: `${timeGreeting}, ${name}! 3 days in a row. You're building something beautiful.`, type: 'streak' };
  if (streak.current === 7) return { text: `${timeGreeting}, ${name}! ONE WEEK STREAK! You showed up every single day. I'm proud of you.`, type: 'streak' };
  if (streak.current === 14) return { text: `${timeGreeting}, ${name}! Two weeks straight. This isn't luck — this is who you are now.`, type: 'streak' };
  if (streak.current === 30) return { text: `${timeGreeting}, ${name}! 30 DAYS. A full month. You've changed. Can you feel it?`, type: 'streak' };

  // Mood-based (if they logged yesterday as low)
  const recent = moods.slice(-1)[0];
  if (recent && recent.value <= 2) {
    const yesterday = new Date(recent.date).toDateString() === new Date(Date.now() - 86400000).toDateString();
    if (yesterday) {
      return { text: `${timeGreeting}, ${name}. Yesterday was tough. How are you feeling today?`, type: 'checkin' };
    }
  }

  // Late night
  if (hour >= 23 || hour < 4) {
    const lateNight = [
      `Hey ${name}... can't sleep? I'm here. Want to talk or just sit together?`,
      `${name}, it's late. Your mind must be racing. Let's slow it down together.`,
      `Still awake, ${name}? Tell me what's on your mind. No rush.`,
    ];
    return { text: lateNight[Math.floor(Math.random() * lateNight.length)], type: 'latenight' };
  }

  // Default warm greetings
  const defaults = [
    `${timeGreeting}, ${name}! How's your heart today?`,
    `${timeGreeting}, ${name}. I'm glad you're here. What do you need right now?`,
    `${timeGreeting}, ${name}! Ready to take care of yourself today?`,
    `Hey ${name}! What's one word that describes how you're feeling?`,
    `${timeGreeting}, ${name}. Whatever brought you here, I'm listening.`,
  ];

  return { text: defaults[Math.floor(Math.random() * defaults.length)], type: 'default' };
}

// Quick mood options for welcome screen
export const QUICK_MOODS = [
  { emoji: '😊', label: 'Good', value: 4, color: '#38ef7d', suggestion: 'companion' },
  { emoji: '😌', label: 'Calm', value: 4, color: '#4ecdc4', suggestion: 'calm' },
  { emoji: '😔', label: 'Low', value: 2, color: '#7c83ff', suggestion: 'therapist' },
  { emoji: '😤', label: 'Stressed', value: 2, color: '#f5576c', suggestion: 'calm' },
  { emoji: '😴', label: 'Tired', value: 3, color: '#b794f6', suggestion: 'lullaby' },
  { emoji: '🤔', label: 'Lost', value: 3, color: '#e2b714', suggestion: 'philosopher' },
  { emoji: '😢', label: 'Sad', value: 1, color: '#7c83ff', suggestion: 'therapist' },
  { emoji: '🔥', label: 'Pumped', value: 5, color: '#f5af19', suggestion: 'motivation' },
];
