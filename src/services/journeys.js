// Guided Journeys - structured multi-day self-improvement plans
// Each journey has daily tasks, check-ins, and progress tracking

export const JOURNEYS = {
  anxiety: {
    id: 'anxiety',
    title: 'Calm Your Anxiety',
    emoji: '🌿',
    duration: 5,
    description: 'A 5-day guided journey to understand and manage your anxiety',
    color: '#4ecdc4',
    days: [
      {
        title: 'Awareness',
        intro: 'Today we begin by simply noticing. No fixing, no judging — just observing what anxiety feels like in your body.',
        tasks: [
          { id: 'a1', text: 'Take 3 deep breaths right now', type: 'action' },
          { id: 'a2', text: 'Write down: Where do you feel anxiety in your body?', type: 'journal' },
          { id: 'a3', text: 'Do Eva\'s 4-7-8 breathing exercise', type: 'breathe' },
        ],
        reflection: 'What did you notice about your anxiety today? No right answers.',
      },
      {
        title: 'Triggers',
        intro: 'Today we explore what triggers your anxiety. Understanding triggers is the first step to managing them.',
        tasks: [
          { id: 'b1', text: 'List 3 situations that made you anxious this week', type: 'journal' },
          { id: 'b2', text: 'For each trigger, rate it 1-10', type: 'journal' },
          { id: 'b3', text: '5-minute meditation with Eva', type: 'timer' },
        ],
        reflection: 'Which trigger surprised you the most? Why?',
      },
      {
        title: 'Grounding',
        intro: 'Today you learn grounding — a powerful technique to bring yourself back when anxiety spikes.',
        tasks: [
          { id: 'c1', text: '5-4-3-2-1 exercise: Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste', type: 'action' },
          { id: 'c2', text: 'Practice box breathing (4-4-4-4)', type: 'breathe' },
          { id: 'c3', text: 'Write a letter to your anxious self — be kind', type: 'journal' },
        ],
        reflection: 'How did grounding feel? Did it shift anything?',
      },
      {
        title: 'Reframing',
        intro: 'Today we challenge anxious thoughts. Not every thought is true — let\'s examine them.',
        tasks: [
          { id: 'd1', text: 'Write one anxious thought you had today', type: 'journal' },
          { id: 'd2', text: 'Ask: Is this thought 100% true? What evidence do I have?', type: 'journal' },
          { id: 'd3', text: 'Rewrite it as a balanced thought', type: 'journal' },
        ],
        reflection: 'How does the reframed thought feel compared to the original?',
      },
      {
        title: 'Your Toolkit',
        intro: 'Final day. You now have tools: breathing, grounding, reframing. Let\'s build your personal anxiety toolkit.',
        tasks: [
          { id: 'e1', text: 'Pick your favorite breathing technique', type: 'action' },
          { id: 'e2', text: 'Write your personal grounding mantra', type: 'journal' },
          { id: 'e3', text: 'Create an "emergency calm" plan for when anxiety hits', type: 'journal' },
        ],
        reflection: 'How do you feel now compared to Day 1? Celebrate your progress.',
      },
    ],
  },
  confidence: {
    id: 'confidence',
    title: 'Build Unshakable Confidence',
    emoji: '🔥',
    duration: 5,
    description: 'A 5-day journey to build real, lasting self-confidence',
    color: '#f5576c',
    days: [
      {
        title: 'Your Foundation',
        intro: 'Confidence isn\'t about being perfect. It\'s about trusting yourself. Today we find your foundation.',
        tasks: [
          { id: 'f1', text: 'Write 5 things you\'re genuinely good at', type: 'journal' },
          { id: 'f2', text: 'Ask Eva to hype you up in Motivation mode', type: 'action' },
          { id: 'f3', text: 'Stand in a power pose for 2 minutes', type: 'action' },
        ],
        reflection: 'What strengths did you discover that you usually overlook?',
      },
      {
        title: 'The Inner Critic',
        intro: 'That voice saying "you\'re not good enough"? Let\'s meet it, understand it, and quiet it.',
        tasks: [
          { id: 'g1', text: 'Write down what your inner critic says most often', type: 'journal' },
          { id: 'g2', text: 'Give your inner critic a silly name', type: 'journal' },
          { id: 'g3', text: 'Write a response to it: "Thanks, but I\'ve got this"', type: 'journal' },
        ],
        reflection: 'How does it feel to talk back to your inner critic?',
      },
      {
        title: 'Small Wins',
        intro: 'Confidence grows from evidence. Today we create small wins.',
        tasks: [
          { id: 'h1', text: 'Do one thing that slightly scares you today', type: 'action' },
          { id: 'h2', text: 'Compliment a stranger or colleague', type: 'action' },
          { id: 'h3', text: 'Write about how the small win felt', type: 'journal' },
        ],
        reflection: 'What did you learn about yourself from today\'s challenge?',
      },
      {
        title: 'Your Story',
        intro: 'The story you tell yourself about who you are shapes everything. Let\'s rewrite it.',
        tasks: [
          { id: 'i1', text: 'Write "I am..." followed by 10 positive truths', type: 'journal' },
          { id: 'i2', text: 'Record yourself saying these affirmations (use My Voice)', type: 'action' },
          { id: 'i3', text: 'Visualize your most confident self for 5 minutes', type: 'timer' },
        ],
        reflection: 'How does your new story feel? What shifted?',
      },
      {
        title: 'Walk The Walk',
        intro: 'Final day. Confidence is a practice, not a destination. Let\'s set you up for life.',
        tasks: [
          { id: 'j1', text: 'Set one bold goal for next week', type: 'journal' },
          { id: 'j2', text: 'Create a daily confidence ritual (2 minutes)', type: 'journal' },
          { id: 'j3', text: 'Celebrate: write a letter to your future confident self', type: 'journal' },
        ],
        reflection: 'You showed up for 5 days. That itself is confidence. How do you feel?',
      },
    ],
  },
  sleep: {
    id: 'sleep',
    title: 'Sleep Better Tonight',
    emoji: '🌙',
    duration: 7,
    description: 'A 7-day journey to improve your sleep quality',
    color: '#6c5ce7',
    days: [
      {
        title: 'Sleep Audit',
        intro: 'Let\'s understand your current sleep patterns. No judgment — just awareness.',
        tasks: [
          { id: 'k1', text: 'What time did you go to bed and wake up last 3 nights?', type: 'journal' },
          { id: 'k2', text: 'Rate your sleep quality 1-10 for each night', type: 'journal' },
          { id: 'k3', text: 'Put your phone on silent 30 min before bed tonight', type: 'action' },
        ],
        reflection: 'What patterns do you notice in your sleep?',
      },
      {
        title: 'Wind Down Ritual',
        intro: 'Your body needs a signal that it\'s time to sleep. Let\'s create that signal.',
        tasks: [
          { id: 'l1', text: 'Try Eva\'s Lullaby mode for 10 minutes before bed', type: 'action' },
          { id: 'l2', text: 'No screens 1 hour before bed (use a book instead)', type: 'action' },
          { id: 'l3', text: 'Write tomorrow\'s to-do list to empty your mind', type: 'journal' },
        ],
        reflection: 'How did the wind-down routine feel?',
      },
      { title: 'Body Relaxation', intro: 'Progressive muscle relaxation helps release physical tension.', tasks: [{ id: 'm1', text: 'Do Eva\'s breathing exercise before bed', type: 'breathe' }, { id: 'm2', text: 'Tense and release each muscle group (toes to head)', type: 'action' }, { id: 'm3', text: 'Listen to ambient rain sounds for 10 min', type: 'action' }], reflection: 'Which body areas held the most tension?' },
      { title: 'Sleep Environment', intro: 'Your bedroom should be a sleep sanctuary.', tasks: [{ id: 'n1', text: 'Make your room slightly cooler tonight', type: 'action' }, { id: 'n2', text: 'Remove or cover all light sources', type: 'action' }, { id: 'n3', text: 'Rate your sleep environment 1-10, note improvements', type: 'journal' }], reflection: 'What one change made the biggest difference?' },
      { title: 'Mind Clearing', intro: 'Racing thoughts are the #1 sleep killer. Let\'s quiet them.', tasks: [{ id: 'o1', text: 'Brain dump: write everything on your mind', type: 'journal' }, { id: 'o2', text: '10-minute meditation with Eva', type: 'timer' }, { id: 'o3', text: 'Try the 4-7-8 breathing technique in bed', type: 'breathe' }], reflection: 'Did the brain dump help? What came up?' },
      { title: 'Consistency', intro: 'Same bedtime + same wake time = better sleep. Even weekends.', tasks: [{ id: 'p1', text: 'Set a fixed bedtime alarm for tonight', type: 'action' }, { id: 'p2', text: 'Wake up at the same time tomorrow (no snooze)', type: 'action' }, { id: 'p3', text: 'Track: how many hours did you sleep?', type: 'journal' }], reflection: 'How did a consistent schedule feel?' },
      { title: 'Your Sleep System', intro: 'Final day. You now have a complete sleep system.', tasks: [{ id: 'q1', text: 'Write your ideal bedtime routine (step by step)', type: 'journal' }, { id: 'q2', text: 'Pick your favorite technique from the week', type: 'journal' }, { id: 'q3', text: 'Commit: "I will do this every night for 2 weeks"', type: 'action' }], reflection: 'How has your sleep changed since Day 1?' },
    ],
  },
};

// Journey progress management (localStorage)
const STORAGE_KEY = 'eva-journeys';

export function getJourneyProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}

export function saveJourneyProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function startJourney(journeyId) {
  const progress = getJourneyProgress();
  progress[journeyId] = {
    startedAt: Date.now(),
    currentDay: 0,
    completedTasks: {},
    reflections: {},
    completed: false,
  };
  saveJourneyProgress(progress);
  return progress[journeyId];
}

export function completeTask(journeyId, taskId) {
  const progress = getJourneyProgress();
  if (!progress[journeyId]) return;
  if (!progress[journeyId].completedTasks) progress[journeyId].completedTasks = {};
  progress[journeyId].completedTasks[taskId] = Date.now();
  saveJourneyProgress(progress);
}

export function saveReflection(journeyId, day, text) {
  const progress = getJourneyProgress();
  if (!progress[journeyId]) return;
  if (!progress[journeyId].reflections) progress[journeyId].reflections = {};
  progress[journeyId].reflections[day] = { text, savedAt: Date.now() };

  // Advance to next day if all tasks done
  const journey = JOURNEYS[journeyId];
  if (journey) {
    const dayData = journey.days[day];
    const allDone = dayData?.tasks.every(t => progress[journeyId].completedTasks[t.id]);
    if (allDone) {
      progress[journeyId].currentDay = Math.min(day + 1, journey.days.length - 1);
      if (day >= journey.days.length - 1) progress[journeyId].completed = true;
    }
  }
  saveJourneyProgress(progress);
}

export function getActiveJourneys() {
  const progress = getJourneyProgress();
  return Object.entries(progress)
    .filter(([, p]) => !p.completed)
    .map(([id, p]) => ({ ...JOURNEYS[id], progress: p }));
}
