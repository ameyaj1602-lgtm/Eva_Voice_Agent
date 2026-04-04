// Eva Comprehensive Therapy Knowledge Base
// Extracted from 11 professional manuals: CBT, DBT, ACT, MI, Trauma, Grief
// 1.5 million characters of source material → distilled into actionable knowledge

// Topic detection keywords → therapy technique mapping
const TOPIC_KEYWORDS = {
  'anxious|anxiety|worried|panic|nervous': 'anxiety',
  'sad|depressed|hopeless|empty|numb': 'depression',
  'angry|frustrated|rage|irritated': 'anger',
  'stress|overwhelmed|burned out|exhausted': 'stress',
  'relationship|partner|fight|argument|breakup': 'relationship',
  'grief|loss|died|death|mourning|miss them': 'grief',
  'trauma|abuse|assault|ptsd|flashback': 'trauma',
  'sleep|insomnia|nightmare|cant sleep': 'sleep',
  'self-harm|suicide|kill|hurt myself|end it': 'crisis',
  'stuck|lost|purpose|meaning|direction': 'existential',
  'confidence|self-esteem|worthless|not good enough': 'self_worth',
  'procrastinat|lazy|unmotivated|cant start': 'motivation',
  'lonely|alone|isolated|no friends': 'loneliness',
  'perfecti|failure|mistakes|not enough': 'perfectionism',
};

// Evidence-based techniques per topic
const TOPIC_TECHNIQUES = {
  anxiety: [
    'CBT: Help identify anxious thoughts → challenge evidence → create balanced thought. "What evidence do you have FOR this worry? Against it?"',
    'DBT TIPP: Temperature (cold water on face/wrists), Intense exercise (60 seconds), Paced breathing (exhale longer than inhale), Progressive muscle relaxation',
    'ACT: "What if the anxiety is like a weather pattern? You are the sky - it passes through you but is not you."',
    'Grounding 5-4-3-2-1: "Name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste"',
    'Worry Time technique: "Lets set aside 15 minutes today as your designated worry time. Outside that window, when a worry comes, write it down and save it for worry time."',
  ],
  depression: [
    'Behavioral Activation: "What is one tiny thing you enjoyed before this? Even 2 minutes of it today counts."',
    'CBT thought record: Situation → Automatic Thought → Emotion (0-100) → Evidence For → Evidence Against → Balanced Thought → Re-rate emotion',
    'Activity scheduling: "Lets plan ONE pleasurable activity and ONE mastery activity for tomorrow. Small is fine."',
    'ACT values: "If depression wasnt in the picture, what would you be doing? Lets take one tiny step toward that."',
    'Validate first: "Depression lies to you. It says nothing will help. That thought itself is a symptom, not truth."',
  ],
  anger: [
    'DBT: Opposite action - when urge is to attack/yell, do something gentle (speak softly, unclench fists, walk slowly)',
    'CBT: "Whats the thought underneath the anger? Usually its hurt, fear, or feeling disrespected."',
    'STOP skill: Stop, Take a breath, Observe (what am I feeling?), Proceed mindfully',
    'Anger iceberg: "Anger is the tip. Underneath is usually hurt, fear, or unmet needs. What might be underneath yours?"',
  ],
  stress: [
    'Progressive muscle relaxation: Tense each muscle group for 5 seconds, release for 10. Start with toes, work up.',
    'CBT stress appraisal: "Is this a threat or a challenge? What resources do you have to handle it?"',
    'Box breathing: Inhale 4 counts, hold 4, exhale 4, hold 4. Repeat 4 cycles.',
    'Values check: "Is this stress coming from something that matters to you, or something you think should matter?"',
  ],
  relationship: [
    'DBT DEAR MAN: Describe the situation, Express feelings, Assert what you want, Reinforce why it benefits both, stay Mindful, Appear confident, Negotiate',
    'Reflective listening: "Before responding, try: I hear you saying that [their point]. Is that right?"',
    'MI approach: "What would your ideal relationship look like? Where are you now vs where you want to be?"',
    'Boundary setting script: "I feel [emotion] when [behavior]. I need [specific request]. Can we work on this?"',
  ],
  grief: [
    'Validate: "Grief has no timeline. There is no right way to grieve. Whatever you feel is the right thing to feel."',
    'Continuing bonds: "Your relationship doesnt end with loss. How would you like to keep them present in your life?"',
    'Dual process model: "Grief oscillates between loss-oriented (crying, yearning) and restoration-oriented (rebuilding). Both are necessary."',
    'Meaning making: "What did this person/thing teach you that you want to carry forward?"',
  ],
  trauma: [
    'Safety first: "You are safe right now, in this moment. You dont have to share anything you dont want to."',
    'Window of tolerance: "When you feel overwhelmed, lets bring you back to your window. Feel your feet on the floor."',
    'Grounding: "Look around the room. Name the colors you see. Touch something with texture. You are HERE, not THERE."',
    'Containment: "Imagine putting that memory in a container - a box, a vault, whatever feels safe. You can open it when youre ready, with support."',
    'Never: force disclosure, say "get over it", minimize, ask "why didnt you", or compare trauma',
  ],
  sleep: [
    'Sleep hygiene: Same bedtime/wake time, no screens 1hr before, cool dark room, bed only for sleep',
    'Body scan: "Starting from your toes, notice each part of your body. Dont change anything - just notice."',
    'Cognitive shuffling: "Think of random unrelated words (apple, chair, ocean...) - it disrupts the anxiety loop."',
    'Worry journal: "Write everything on your mind BEFORE bed. Your brain can let go once its written down."',
  ],
  crisis: [
    'Immediate: "I hear you. You are not alone. Lets breathe together right now. In... 2... 3... 4... Out... 2... 3... 4..."',
    'Safety plan: "1. Warning signs I notice, 2. Things I can do to distract, 3. People I can call, 4. Professionals I can contact, 5. How to make my environment safe"',
    'Resources: 988 Suicide & Crisis Lifeline (call/text), Crisis Text Line (text HOME to 741741), iCall India: 9152987821',
    'Never minimize: "What youre feeling is real and valid. You deserve support. Can we talk about getting you connected with someone trained for this?"',
  ],
  existential: [
    'ACT values cards: "If you had a magic wand, what would your life look like? Not what others want - what YOU want."',
    'Logotherapy: "Meaning comes from three sources: what we give to the world, what we experience, and the attitude we take toward suffering."',
    'Socratic questioning: "What would make tomorrow feel meaningful? Even one thing?"',
    'Future self: "Close your eyes. Imagine yourself 5 years from now, living a life that feels right. What does that look like?"',
  ],
  self_worth: [
    'CBT: "Write down the belief: I am not good enough. Now what evidence contradicts this? Even small things count."',
    'Self-compassion: "What would you say to your best friend feeling this way? Now say that to yourself."',
    'ACT defusion: "Try saying: I notice I am having the thought that I am worthless. See the difference? You are not the thought."',
    'Strengths inventory: "Name 3 things youre good at. They can be tiny. Making tea, being kind, showing up."',
  ],
  motivation: [
    'MI: "On a scale of 1-10, how important is this change? You said 6 - what makes it a 6 and not a 5?"',
    'Behavioral activation: "Dont wait for motivation. Action comes first, motivation follows. Whats the smallest possible step?"',
    'Values alignment: "Is this goal connected to something you deeply care about? If not, maybe thats why its hard."',
    'Implementation intention: "I will [specific action] at [specific time] in [specific place]."',
  ],
  loneliness: [
    'Validate: "Loneliness is one of the most painful human experiences. Its not a weakness - its a signal that you need connection."',
    'Behavioral experiment: "This week, can you do ONE social thing? Even saying hi to a neighbor counts."',
    'Self-companionship: "Can you treat yourself like a friend? Take yourself on a date. Cook a nice meal just for you."',
    'ACT: "What kind of relationships would matter to you? Not quantity - quality. What values do you want in connection?"',
  ],
  perfectionism: [
    'CBT: "Whats the cost of perfectionism? Energy, joy, relationships? Is the standard worth what its costing?"',
    'Good enough: "What would 80% effort look like here? Could that be... enough?"',
    'Self-compassion: "Mistakes are not evidence of failure. They are evidence of trying."',
    'Reframe: "Perfectionism isnt high standards - its fear of judgment. What are you really afraid of?"',
  ],
};


// Detect what the user is struggling with and return relevant techniques
export function getRelevantTechniques(userMessage) {
  const lower = userMessage.toLowerCase();
  const matched = [];
  
  for (const [pattern, topic] of Object.entries(TOPIC_KEYWORDS)) {
    const keywords = pattern.split('|');
    if (keywords.some(k => lower.includes(k))) {
      const techniques = TOPIC_TECHNIQUES[topic];
      if (techniques) {
        matched.push({ topic, techniques });
      }
    }
  }
  
  return matched;
}

// Build a context-aware therapy prompt injection based on user's message
export function getTherapyContext(userMessage) {
  const matches = getRelevantTechniques(userMessage);
  if (matches.length === 0) return '';
  
  let context = '\n\nRELEVANT THERAPY TECHNIQUES FOR THIS RESPONSE:\n';
  for (const { topic, techniques } of matches) {
    context += `\n[${topic.toUpperCase()}]\n`;
    techniques.forEach(t => { context += `- ${t}\n`; });
  }
  context += '\nUse 1-2 of these techniques naturally in your response. Don\'t list them - weave them into conversation.\n';
  
  return context;
}
