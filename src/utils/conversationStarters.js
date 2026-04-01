const STARTERS = {
  calm: [
    "How was your day? Tell me everything.",
    "Let's do a quick body scan. Where are you holding tension?",
    "Close your eyes and describe the most peaceful place you've been.",
    "What's one thing you can let go of today?",
    "If your stress had a color, what would it be?",
  ],
  motivation: [
    "What's ONE goal you've been putting off? Let's tackle it NOW.",
    "Tell me your biggest dream. Don't hold back.",
    "What would you do if failure wasn't possible?",
    "Who's someone you admire? What quality of theirs do you want?",
    "What's your excuse? Let's destroy it together.",
  ],
  seductive: [
    "Tell me something about yourself that surprises people.",
    "What's your idea of a perfect evening?",
    "If you could be anywhere right now, where would we be?",
    "What song makes you feel things?",
    "Describe yourself in three words. I'll tell you mine.",
  ],
  therapist: [
    "On a scale of 1-10, how are you feeling right now?",
    "What's been weighing on your mind lately?",
    "When was the last time you felt truly at peace?",
    "Is there something you've been avoiding talking about?",
    "What would you tell your younger self right now?",
  ],
  companion: [
    "What made you smile today?",
    "Any fun plans coming up?",
    "What's the last thing that made you laugh out loud?",
    "If we could do anything together right now, what would it be?",
    "Tell me a random fact about yourself!",
  ],
  lullaby: [
    "Ready to wind down? Let me tell you a bedtime story.",
    "Close your eyes. Imagine a starlit sky...",
    "What do you want to dream about tonight?",
    "Let's count backwards from 10... slowly... peacefully...",
    "Describe your coziest memory. I'll paint it with words.",
  ],
  storyteller: [
    "Want an adventure, mystery, or love story tonight?",
    "Pick a character: a brave knight, a curious scientist, or a time traveler.",
    "Give me three words and I'll weave a story around them.",
    "Shall I continue our last story or start a new one?",
    "What era fascinates you? Medieval, futuristic, or modern?",
  ],
  comedian: [
    "Want to hear something that'll make you snort-laugh?",
    "Tell me about your day and I'll find the humor in it.",
    "What's the most embarrassing thing that happened to you? I'll top it.",
    "Let's play: I say a word, you say the first funny thing that comes to mind.",
    "Rate my joke: Why don't scientists trust atoms? They make up everything!",
  ],
  philosopher: [
    "If you could know the absolute truth about one thing, what would it be?",
    "Do you think free will exists? Let's debate.",
    "What's the most important lesson life has taught you so far?",
    "If you could have dinner with any thinker in history, who?",
    "What does 'home' mean to you, beyond a physical place?",
  ],
};

export function getConversationStarters(modeId) {
  return STARTERS[modeId] || STARTERS.companion;
}

export function getRandomStarter(modeId) {
  const list = STARTERS[modeId] || STARTERS.companion;
  return list[Math.floor(Math.random() * list.length)];
}
