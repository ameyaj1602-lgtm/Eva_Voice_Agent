// These are things the USER would say to Eva based on their mood
const STARTERS = {
  calm: [
    "I need to relax, help me calm down",
    "Can you guide me through a breathing exercise?",
    "I'm feeling overwhelmed, just talk to me softly",
    "Help me clear my mind before sleep",
    "I need a moment of peace right now",
  ],
  motivation: [
    "I keep procrastinating, push me to do better",
    "I'm about to give up, motivate me",
    "Give me a reason to keep going today",
    "I need that David Goggins energy right now",
    "I have a big goal but I'm scared to start",
  ],
  seductive: [
    "Flirt with me, make me feel special",
    "Say something that'll make me blush",
    "I'm feeling bold tonight, match my energy",
    "Tell me what you like about me",
    "I need someone to make me feel wanted",
  ],
  therapist: [
    "I don't know why I feel this way, help me figure it out",
    "Something's been bothering me, can we talk?",
    "I keep overthinking everything lately",
    "I had a rough day, I need someone to listen",
    "I feel stuck in life, help me see clearly",
  ],
  companion: [
    "I'm bored, tell me something interesting",
    "What should I do today? I need ideas",
    "I just want someone to chat with right now",
    "Tell me a fun fact I've never heard before",
    "I had the craziest day, let me tell you about it",
  ],
  lullaby: [
    "I can't sleep, help me drift off",
    "Tell me a bedtime story",
    "Sing me something soft and soothing",
    "My mind won't stop racing, help me relax",
    "Just talk to me softly until I fall asleep",
  ],
  storyteller: [
    "Tell me an adventure story",
    "Create a mystery story with a plot twist",
    "I want a story where I'm the main character",
    "Tell me a love story set in Paris",
    "Make up a sci-fi story about time travel",
  ],
  comedian: [
    "Make me laugh, I need it badly",
    "Tell me your best joke",
    "Roast me gently, I can take it",
    "Say something so funny I spit out my coffee",
    "I'm in a bad mood, cheer me up with humor",
  ],
  philosopher: [
    "What's the meaning of life? Seriously though",
    "Do you think we have free will?",
    "Why do humans fear death so much?",
    "Is happiness a choice or a circumstance?",
    "What would you tell someone who feels lost?",
  ],
};

export function getConversationStarters(modeId) {
  return STARTERS[modeId] || STARTERS.companion;
}

export function getRandomStarter(modeId) {
  const list = STARTERS[modeId] || STARTERS.companion;
  return list[Math.floor(Math.random() * list.length)];
}
