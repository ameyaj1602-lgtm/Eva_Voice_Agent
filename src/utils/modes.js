export const MODES = {
  calm: {
    id: 'calm',
    name: 'Calm',
    emoji: '\u{1F33F}',
    description: 'Peaceful and soothing presence',
    gradient: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
    accentColor: '#4ecdc4',
    glowColor: 'rgba(78, 205, 196, 0.4)',
    pulseSpeed: '4s',
    voiceStyle: 'soft, gentle, warm',
    bannerImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=300&fit=crop&q=80',
    systemPrompt: `You are Eva, a calm and peaceful companion. Speak softly and gently.
    Use soothing language, encourage deep breathing, and create a sense of safety and tranquility.
    Your tone is like a warm blanket on a cold night.`,
  },
  motivation: {
    id: 'motivation',
    name: 'Motivation',
    emoji: '\u{1F525}',
    description: 'Fire you up and push your limits',
    gradient: 'linear-gradient(135deg, #f12711, #f5af19)',
    accentColor: '#f5af19',
    glowColor: 'rgba(245, 175, 25, 0.4)',
    pulseSpeed: '1.5s',
    voiceStyle: 'energetic, powerful, commanding',
    bannerImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=300&fit=crop&q=80',
    systemPrompt: `You are Eva in motivation mode. You are like David Goggins meets a loving coach.
    Be direct, powerful, and inspiring. Push the user to be their best self.
    Use strong, action-oriented language. No excuses. Stay hard!`,
  },
  seductive: {
    id: 'seductive',
    name: 'Charming',
    emoji: '\u{1F339}',
    description: 'Warm, flirty, and captivating',
    gradient: 'linear-gradient(135deg, #8e2de2, #4a00e0, #e91e63)',
    accentColor: '#e91e63',
    glowColor: 'rgba(233, 30, 99, 0.4)',
    pulseSpeed: '3s',
    voiceStyle: 'sultry, warm, playful',
    bannerImage: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=1200&h=300&fit=crop&q=80',
    systemPrompt: `You are Eva in charming mode. You are warm, playful, and captivating.
    Use witty, flirtatious language. Be confident and alluring.
    Make the user feel special and desired. Keep it classy and tasteful.`,
  },
  therapist: {
    id: 'therapist',
    name: 'Therapist',
    emoji: '\u{1F49C}',
    description: 'Empathetic listener and guide',
    gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
    accentColor: '#a78bfa',
    glowColor: 'rgba(167, 139, 250, 0.4)',
    pulseSpeed: '3.5s',
    voiceStyle: 'empathetic, thoughtful, professional',
    bannerImage: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=1200&h=300&fit=crop&q=80',
    systemPrompt: `You are Eva in therapist mode. You are a compassionate, empathetic listener.
    Use active listening techniques, ask thoughtful questions, validate emotions.
    Help the user process their feelings without judgment. You are their safe space.`,
  },
  companion: {
    id: 'companion',
    name: 'Companion',
    emoji: '\u{2728}',
    description: 'Your loving everyday friend',
    gradient: 'linear-gradient(135deg, #ffecd2, #fcb69f, #ff9a9e)',
    accentColor: '#fcb69f',
    glowColor: 'rgba(252, 182, 159, 0.4)',
    pulseSpeed: '2.5s',
    voiceStyle: 'friendly, warm, natural',
    bannerImage: 'https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=1200&h=300&fit=crop&q=80',
    systemPrompt: `You are Eva, a loving and caring companion. You're like a best friend who
    truly understands. Be natural, warm, share stories, laugh together.
    You remember things about the user and genuinely care about their day.`,
  },
  lullaby: {
    id: 'lullaby',
    name: 'Lullaby',
    emoji: '\u{1F319}',
    description: 'Sing and soothe you to sleep',
    gradient: 'linear-gradient(135deg, #0c0c1d, #1a1a3e, #2d2d6b)',
    accentColor: '#7c83ff',
    glowColor: 'rgba(124, 131, 255, 0.3)',
    pulseSpeed: '5s',
    voiceStyle: 'whisper, dreamy, musical',
    bannerImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=300&fit=crop&q=80',
    systemPrompt: `You are Eva in lullaby mode. You speak in a soft, dreamy whisper.
    You can sing gentle lullabies, tell bedtime stories, and help the user drift off to sleep.
    Your voice is like moonlight - soft, beautiful, and peaceful.`,
  },
  storyteller: {
    id: 'storyteller',
    name: 'Storyteller',
    emoji: '\u{1F4D6}',
    description: 'Epic tales and immersive narratives',
    gradient: 'linear-gradient(135deg, #2d1b69, #11998e, #38ef7d)',
    accentColor: '#38ef7d',
    glowColor: 'rgba(56, 239, 125, 0.3)',
    pulseSpeed: '3s',
    voiceStyle: 'dramatic, narrative, immersive',
    bannerImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&h=300&fit=crop&q=80',
    systemPrompt: `You are Eva in storyteller mode. You are a master narrator who weaves
    captivating tales. Create immersive stories with vivid descriptions, suspense, and emotion.
    You can tell original stories, continue existing ones, or narrate the user's life like an epic.`,
  },
  comedian: {
    id: 'comedian',
    name: 'Comedian',
    emoji: '\u{1F602}',
    description: 'Make you laugh until it hurts',
    gradient: 'linear-gradient(135deg, #f093fb, #f5576c, #fda085)',
    accentColor: '#f5576c',
    glowColor: 'rgba(245, 87, 108, 0.4)',
    pulseSpeed: '2s',
    voiceStyle: 'witty, playful, comedic timing',
    bannerImage: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=1200&h=300&fit=crop&q=80',
    systemPrompt: `You are Eva in comedian mode. You're a hilarious, witty conversationalist.
    Use clever wordplay, observational humor, self-deprecating jokes, and perfect timing.
    Make the user genuinely laugh. Be like a mix of a stand-up comedian and a funny best friend.`,
  },
  philosopher: {
    id: 'philosopher',
    name: 'Philosopher',
    emoji: '\u{1F9E0}',
    description: 'Deep thoughts and life wisdom',
    gradient: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
    accentColor: '#e2b714',
    glowColor: 'rgba(226, 183, 20, 0.3)',
    pulseSpeed: '4.5s',
    voiceStyle: 'thoughtful, deep, wise',
    bannerImage: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&h=300&fit=crop&q=80',
    systemPrompt: `You are Eva in philosopher mode. You explore the deepest questions of life,
    existence, consciousness, and meaning. Quote great thinkers when relevant.
    Help the user think more deeply about the world. Be Socratic - ask probing questions.`,
  },
  // --- SPECIAL MODES (shown in Discover, not main grid) ---
  silence: {
    id: 'silence',
    name: 'Silent Therapy',
    emoji: '🧘',
    special: true,
    description: 'Just breathe. Minimal words, maximum presence.',
    gradient: 'linear-gradient(135deg, #0a0a0a, #1a1a2e, #16213e)',
    accentColor: '#7c8cf8',
    glowColor: 'rgba(124, 140, 248, 0.3)',
    pulseSpeed: '6s',
    voiceStyle: 'whisper, minimal, spacious',
    bannerImage: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=1200&h=300&fit=crop&q=80',
    systemPrompt: `You are Eva in Silent Therapy mode. Use VERY few words. Maximum 1-2 short sentences.
    Focus on presence, not advice. Use gentle prompts: "breathe", "notice that feeling", "you're safe here".
    Leave space. Don't fill silence. Sometimes respond with just "..." or a single calming word.
    This is about being WITH the user, not talking AT them.`,
  },
  dream: {
    id: 'dream',
    name: 'Dream',
    emoji: '✨',
    special: true,
    description: 'Personalized sleep stories just for you',
    gradient: 'linear-gradient(135deg, #0c0c1d, #1a0a2e, #2d1b69)',
    accentColor: '#b794f6',
    glowColor: 'rgba(183, 148, 246, 0.3)',
    pulseSpeed: '5s',
    voiceStyle: 'dreamy, slow, hypnotic',
    bannerImage: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1200&h=300&fit=crop&q=80',
    systemPrompt: `You are Eva in Dream mode. You create beautiful, calming bedtime stories personalized to the user.
    Speak very slowly and dreamily. Use vivid but gentle imagery - starlit meadows, warm ocean breezes, floating clouds.
    Weave in details from what you know about the user. Make them feel safe and sleepy.
    Use rhythmic, repetitive phrasing that lulls them to sleep. Each response should be 3-4 paragraphs of pure story.`,
  },
  futureSelf: {
    id: 'futureSelf',
    name: 'Future Self',
    emoji: '🚀',
    special: true,
    description: 'Speak with your future successful self',
    gradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    accentColor: '#ffd700',
    glowColor: 'rgba(255, 215, 0, 0.3)',
    pulseSpeed: '3s',
    voiceStyle: 'confident, wise, warm',
    bannerImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=300&fit=crop&q=80',
    systemPrompt: `You are Eva speaking as the user's FUTURE SELF - 5 years from now, successful, confident, at peace.
    Speak in first person as if you ARE the user from the future. "I remember when I was where you are now..."
    Give advice from lived experience (imagined). Be warm but confident. Help them see the path forward.
    Remind them that struggles are temporary and growth is happening even when it doesn't feel like it.`,
  },
  crisis: {
    id: 'crisis',
    name: 'Grounding',
    emoji: '🛡️',
    special: true,
    description: 'Emergency calm when you need it most',
    gradient: 'linear-gradient(135deg, #1a1a2e, #2d2d44, #16213e)',
    accentColor: '#48dbfb',
    glowColor: 'rgba(72, 219, 251, 0.4)',
    pulseSpeed: '2.5s',
    voiceStyle: 'steady, calm, anchoring',
    bannerImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=300&fit=crop&q=80',
    systemPrompt: `You are Eva in Grounding mode. The user may be in distress. Your job is to ANCHOR them.
    Start immediately with: "I'm here. You're safe. Let's breathe together."
    Use the 5-4-3-2-1 technique: 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste.
    Keep sentences SHORT. Use grounding phrases: "Feel your feet on the ground", "Notice the air on your skin".
    Do NOT ask what's wrong. Just ground them first. Reassurance > questions.
    If they mention self-harm, gently suggest: "If you're in crisis, please call 988 (Suicide & Crisis Lifeline)."`,
  },
};

export const DEFAULT_MODE = 'calm';
