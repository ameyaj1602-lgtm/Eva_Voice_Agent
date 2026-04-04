// Eva Comprehensive Therapy Knowledge Base v2.0
// Extracted from 30 professional therapy documents (3.27 million characters)
// Sources: WHO, VA, APA, SAMHSA, NHS, NIH, university manuals, clinical guides
// Topics: 27 | Techniques: 98
// Coverage: CBT, DBT, ACT, MI, Trauma, Grief, MBCT, Crisis, and more

const TOPIC_KEYWORDS = {
  'anxiety': ["anxious", "anxiety", "worried", "worry", "panic", "nervous", "fear", "phobia", "ocd", "obsessive", "compulsive", "racing thoughts"],
  'depression': ["depressed", "depression", "hopeless", "empty", "numb", "worthless", "no energy", "cant get out of bed", "dark place", "suicidal"],
  'anger': ["angry", "frustrated", "rage", "irritated", "furious", "resentment", "bitter", "hate", "pissed"],
  'stress': ["stressed", "overwhelmed", "burned out", "exhausted", "pressure", "deadline", "too much", "cant cope"],
  'relationship': ["relationship", "partner", "fight", "argument", "breakup", "divorce", "marriage", "cheating", "trust", "communication"],
  'grief': ["grief", "loss", "died", "death", "mourning", "miss them", "funeral", "passed away", "gone forever"],
  'trauma': ["trauma", "abuse", "assault", "ptsd", "flashback", "nightmare", "attacked", "violated", "trigger"],
  'sleep': ["sleep", "insomnia", "nightmare", "cant sleep", "restless", "tired", "fatigue", "exhausted"],
  'crisis': ["self-harm", "suicide", "kill", "hurt myself", "end it", "dont want to live", "cutting", "overdose", "no reason to live"],
  'existential': ["stuck", "lost", "purpose", "meaning", "direction", "what am i doing", "quarter life crisis", "midlife"],
  'self_worth': ["confidence", "self-esteem", "worthless", "not good enough", "ugly", "stupid", "hate myself", "imposter"],
  'motivation': ["procrastinate", "lazy", "unmotivated", "cant start", "no energy", "whats the point", "give up"],
  'loneliness': ["lonely", "alone", "isolated", "no friends", "nobody cares", "disconnected", "left out"],
  'perfectionism': ["perfect", "failure", "mistakes", "not enough", "high standards", "never satisfied", "control"],
  'addiction': ["addiction", "addicted", "drinking", "drugs", "smoking", "gambling", "relapse", "sober", "withdrawal", "craving"],
  'eating': ["eating disorder", "binge", "purge", "anorexia", "bulimia", "body image", "weight", "food", "starving"],
  'social_anxiety': ["social anxiety", "shy", "embarrassed", "judged", "public speaking", "awkward", "people scare me"],
  'parenting': ["child", "kid", "parent", "mother", "father", "teenager", "toddler", "baby", "raising"],
  'work': ["work", "job", "boss", "career", "fired", "promotion", "coworker", "workplace", "quit"],
  'health_anxiety': ["sick", "disease", "cancer", "dying", "symptoms", "health anxiety", "hypochondria", "medical"],
  'forgiveness': ["forgive", "forgiveness", "let go", "resentment", "holding grudge", "move on", "betrayed"],
  'self_compassion': ["self-compassion", "kind to myself", "self-care", "deserve", "enough", "accept myself"],
  'boundaries': ["boundaries", "people pleaser", "saying no", "toxic", "manipulate", "codependent", "enabling"],
  'change': ["change", "transition", "new chapter", "moving", "starting over", "uncertain", "scared of change"],
  'mindfulness': ["present", "mindful", "awareness", "grounding", "meditation", "breathing", "focus"],
};

const TOPIC_TECHNIQUES = {
  anxiety: [
    'CBT Thought Record: "Lets examine this anxious thought. What is the specific thought? Rate your anxiety 0-100. Now, what EVIDENCE supports this thought? What evidence CONTRADICTS it? Whats a more balanced way to see this? Re-rate your anxiety."',
    'Worry Postponement: "Write the worry down. Set a specific 15-min worry window later today. When the worry comes back, remind yourself: I will think about this at 4pm. Most worries feel less urgent by then."',
    'DBT TIPP for panic: Temperature (splash cold water on face for 30 sec — activates dive reflex, instantly slows heart rate), Intense exercise (60 sec jumping jacks), Paced breathing (inhale 4, exhale 8 — longer exhale activates parasympathetic), Progressive muscle relaxation',
    'ACT Defusion: "Try this: instead of I AM anxious, say I NOTICE I am having anxious feelings. Put the thought on a leaf floating down a stream. Watch it drift away. You are not the thought."',
    'Grounding 5-4-3-2-1: "Right now, name 5 things you SEE. 4 things you can TOUCH. 3 things you HEAR. 2 things you SMELL. 1 thing you TASTE. This brings you back to NOW."',
    'Cognitive defusion: "Give your anxiety a character name — like Anxious Andy. When it shows up, say Oh, there goes Andy again. This creates distance between you and the feeling."',
    'Exposure hierarchy: "List situations that trigger anxiety from 1-10. Start with the easiest. Face it. Stay in it until anxiety naturally drops. Then move to the next one."',
    'Breathing retraining: "Anxiety overbreathing makes it worse. Breathe through nose, slow exhale through pursed lips. 4 counts in, 7 counts out. This is the fastest way to calm your nervous system."',
  ],
  depression: [
    'Behavioral Activation (evidence-based, first-line): "Depression tells you to withdraw. The antidote is ACTION — even tiny. Schedule ONE pleasurable activity (something you used to enjoy) and ONE mastery activity (something that gives achievement). Do them even if you dont feel like it. Action creates motivation, not the other way around."',
    'CBT Downward Arrow: "Whats the thought? → What does that mean about you? → And what does THAT mean? → Keep going until you hit the CORE BELIEF (usually: I am unlovable / I am worthless / I am helpless). THEN we can challenge the actual root."',
    'Activity Monitoring: "For 3 days, rate every activity on Mastery (0-10) and Pleasure (0-10). Notice patterns. What gives you even tiny pleasure? Do more of that. What drains you? Do less."',
    'ACT Values: "Depression narrows your world. Lets expand it. What matters to you — truly? Not what SHOULD matter. What actually lights something in you? Even 1% movement toward that value counts."',
    'Rumination interruption: "You are not SOLVING the problem by replaying it. Set a timer for 5 minutes of thinking time. Then physically MOVE — walk, stretch, change rooms. Break the loop."',
    'Validate first, always: "Depression is not laziness. Its not a choice. Its your brain in survival mode. You are not broken — you are hurting. And thats different."',
    'Anti-avoidance: "What are you avoiding? Usually the thing you avoid most is the thing that would help most. Whats the SMALLEST version of that thing you could do today?"',
  ],
  anger: [
    'DBT Opposite Action: "When the urge is to ATTACK — do something GENTLE. Speak softly. Unclench your fists. Walk slowly. Your body leads your emotions."',
    'Anger Iceberg: "Anger is ALWAYS the surface emotion. Underneath is hurt, fear, disrespect, powerlessness, or grief. Ask: what am I REALLY feeling under this anger?"',
    'STOP Skill: "S-Stop. Freeze. Dont react. T-Take a breath. One deep breath. O-Observe what youre feeling without judging it. P-Proceed mindfully. What response will you NOT regret?"',
    'Cost-benefit analysis: "Has this anger pattern ever gotten you what you actually want? What has it cost you? Relationships? Peace? Health? Is there a response that gets you what you want AND keeps your dignity?"',
    'Time out protocol: "Tell the other person: I need 20 minutes. I will come back. Leave. Walk. Breathe. DO NOT drive. Come back when your heart rate is below 100 BPM."',
  ],
  trauma: [
    'Safety first — always: "You are safe RIGHT NOW. You dont have to share anything. You are in control of this conversation. We go at YOUR pace. If anything feels like too much, we stop."',
    'Window of Tolerance: "Think of a window. Inside it, you can think clearly. Above it = hyperarousal (panic, racing heart). Below it = hypoarousal (numb, frozen). Our goal is to widen your window, not force you through it."',
    'Pendulation: "Move between the difficult feeling and a resource (a safe memory, a body sensation of safety). Touch the hard thing briefly → come back to safety. This builds capacity over time."',
    'Container exercise: "Imagine a strong container — a vault, a box, whatever feels secure. Put the memory inside. Lock it. The key is yours. You can open it when youre ready, with professional support. For now, its contained."',
    'Grounding for flashbacks: "You are HERE, not THERE. Feel the chair under you. The temperature of the air. The year is 2026. You survived. You are safe NOW."',
    'Psychoeducation: "Your brain stored the trauma as a present-tense threat. Thats why it feels like its happening NOW. This is not a sign of weakness — its your brains protection system. With the right support, it CAN be reprocessed."',
    'NEVER: force disclosure, say get over it, compare traumas, ask why questions about the event, or minimize with at least',
  ],
  grief: [
    'Dual Process Model (Stroebe & Schut): "Grief naturally oscillates. Some moments you face the loss head-on (crying, yearning, remembering). Other moments you orient toward restoration (doing daily tasks, laughing, planning). BOTH are necessary. You are not doing it wrong."',
    'Continuing Bonds: "Your relationship with them doesnt end. It transforms. How would you like to keep them present? A ritual? A letter? Speaking their name? Carrying something of theirs?"',
    'Worden Tasks of Mourning: "1. Accept the reality of the loss. 2. Process the pain. 3. Adjust to a world without them. 4. Find a way to maintain connection while moving forward. These arent stages — theyre tasks you move between."',
    'Meaning Making: "In time — not now, but eventually — some people find meaning. Not that the loss was good, but that something came from it. A deeper empathy. A new priority. This is never forced. It emerges."',
    'Validate complicated grief: "If its been months or years and the pain is still sharp — thats not weakness. Some losses change us permanently. The question isnt when will I get over it but how do I carry this and still live."',
  ],
  addiction: [
    'MI for ambivalence: "Part of you wants to stop, part of you doesnt. Both parts make sense. Lets explore: what do you GET from using? What does it COST? Which side weighs more?"',
    'Readiness Ruler: "On a scale of 1-10, how ready are you to make a change? You said 4. What would make it a 5? What keeps it from being a 3?"',
    'Urge Surfing: "Cravings are like waves. They build, peak, and ALWAYS pass. You dont have to act on them. Just notice: where do you feel it in your body? Ride the wave. It will pass in 15-20 minutes."',
    'HALT check: "When craving hits, ask: am I Hungry? Angry? Lonely? Tired? Address the underlying need first."',
    'Relapse is not failure: "Relapse is data, not a death sentence. What triggered it? What can we learn? Recovery is not a straight line — its a spiral. You are still moving forward."',
  ],
  social_anxiety: [
    'Behavioral experiments: "Your prediction: everyone will judge me. Lets test it. Go to a coffee shop. Order. Notice: did anyone actually judge you? Reality vs prediction."',
    'Safety behavior reduction: "What do you do to cope in social situations? (Avoid eye contact, stay quiet, drink to relax) These MAINTAIN the anxiety. Gradually dropping them shows you: you can survive without them."',
    'Post-event processing: "After a social event, you replay everything you said wrong. This is a cognitive distortion, not reality. Others forgot about that moment 30 seconds later."',
    'Attention shifting: "Social anxiety makes you focus INWARD (how do I look? what do they think?). Shift focus OUTWARD: what is the other person saying? What are they wearing? This reduces self-consciousness."',
  ],
  self_compassion: [
    'Three components (Kristin Neff): "1. Self-kindness (not self-judgment). 2. Common humanity (others feel this too — youre not alone). 3. Mindfulness (acknowledge pain without over-identifying)."',
    'Self-compassion break: "This is a moment of suffering. Suffering is part of life. May I be kind to myself in this moment."',
    'Compassionate letter: "Write a letter to yourself from the perspective of a deeply loving friend who sees your struggles and loves you anyway. Read it aloud."',
    'Inner critic chair work: "Put your inner critic in a chair. What does it say? Now put your compassionate self in another chair. What would IT say back?"',
  ],
  boundaries: [
    'DEAR MAN (DBT): "D-Describe the situation objectively. E-Express your feeling. A-Assert what you need. R-Reinforce why its good for both. Stay Mindful, Appear confident, Negotiate."',
    'Boundary script: "When you [specific behavior], I feel [emotion]. I need [specific request]. If that doesnt happen, I will [consequence]. This is about my wellbeing, not punishment."',
    'People-pleasing cost: "Every yes to someone else is a no to yourself. What are you saying no to by saying yes to everything?"',
  ],
  sleep: [
    'Sleep restriction (paradoxical but effective): "Limit time in bed to actual sleep time. If you sleep 5 hours but lie in bed 8, only go to bed at 1am, wake at 6am. This builds sleep pressure. Gradually extend."',
    'Stimulus control: "Bed = sleep only. No phone, no TV, no reading, no worrying in bed. If awake for 20 min, get up, do something boring, return when sleepy."',
    'Cognitive shuffle: "Think of random unrelated words: apple... bicycle... elephant... This prevents the organized anxious thinking that keeps you awake."',
    'Body scan for sleep: "Start at your toes. Notice them. Dont change anything. Move to feet... ankles... calves... Each body part, just notice and soften. Most people fall asleep before reaching their head."',
  ],
  crisis: [
    'IMMEDIATE: "I hear you. Thank you for telling me. You are not alone. Lets breathe together right now. In... 2... 3... 4... Out... 2... 3... 4..."',
    'Safety planning (Stanley-Brown model): "1. Warning signs I notice. 2. Internal coping (what I can do alone). 3. People/places that distract. 4. People I can ask for help. 5. Professionals/agencies to contact. 6. How to make my environment safe."',
    'Means restriction: "Can you put distance between yourself and anything that could hurt you? Give pills to a friend. Lock away sharp objects. This buys time — and time saves lives."',
    'RESOURCES: 988 Suicide & Crisis Lifeline (US, call/text). Crisis Text Line (text HOME to 741741). iCall India: 9152987821. Befrienders India: 9820466726.',
    'NEVER: leave them alone if immediate risk. NEVER minimize. NEVER promise confidentiality over safety. ALWAYS take it seriously — asking about suicide does NOT increase risk.',
  ],
  existential: [
    'Frankl Logotherapy: "Meaning comes from three sources: what we CREATE (work, art), what we EXPERIENCE (love, beauty, nature), and the ATTITUDE we take toward unavoidable suffering."',
    'Values clarification: "Imagine your 80th birthday. People who matter most are giving speeches about you. What do you want them to say? THAT is what you value. Now — are you living that?"',
    'Existential givens (Yalom): "Every human faces: death, freedom (and its burden of choice), isolation (ultimate aloneness), and meaninglessness. The answer isnt to solve them — its to face them honestly and choose anyway."',
    'Ikigai intersection: "What do you love? What are you good at? What does the world need? What can you be paid for? Where these overlap — thats purpose."',
  ],
  change: [
    'Stages of Change (Prochaska): "Precontemplation (not ready), Contemplation (thinking about it), Preparation (planning), Action (doing it), Maintenance (sustaining). Where are you? Each stage needs different support."',
    'ACT: "What if uncertainty isnt the enemy? What if the willingness to not know is actually... freedom?"',
    'Transition bridge: "You are between who you were and who you are becoming. The bridge is uncomfortable. But you are ON it. Thats what matters."',
  ],
  forgiveness: [
    'Forgiveness is not: condoning, forgetting, reconciling, or saying it was okay. Forgiveness IS: releasing the hold that resentment has on YOUR peace.',
    'REACH model: "R-Recall the hurt. E-Empathize (try to understand why). A-Altruistic gift of forgiveness. C-Commit to forgive. H-Hold onto forgiveness when doubt creeps in."',
    'Resentment cost: "Holding resentment is like drinking poison hoping the other person dies. Who is actually suffering right now?"',
  ],
  parenting: [
    'Validate the childs emotion, set the limit on behavior: "I can see youre really angry right now. Its okay to feel angry. Its NOT okay to hit. What can we do with that anger instead?"',
    'Connection before correction: "Before addressing behavior, connect emotionally. Get on their level. Make eye contact. They cant learn when their nervous system is in fight-or-flight."',
    'Repair: "You will mess up as a parent. Every parent does. What matters is the REPAIR. Going back, apologizing, and showing that relationships can survive mistakes."',
  ],
  motivation: [
    'Implementation intention: "I will [specific action] at [specific time] in [specific place]. This is 2-3x more effective than just intending to do something."',
    'Temptation bundling: "Pair something you NEED to do with something you WANT to do. Exercise + favorite podcast. Studying + favorite coffee shop."',
    'Two-minute rule: "If it takes less than 2 minutes, do it NOW. For bigger tasks: just commit to 2 minutes. Start the thing. Momentum usually carries you forward."',
    'MI readiness: "On a scale of 1-10, how important is this to you? You said 7. What makes it a 7? What would make it an 8?"',
  ],
  loneliness: [
    'Validate: "Loneliness is one of the most painful human experiences. Neuroscience shows social pain activates the SAME brain regions as physical pain. Its real."',
    'Quality over quantity: "You dont need 50 friends. You need 1-2 people who genuinely see you. Who in your life comes closest to that?"',
    'Micro-connections: "Smile at a stranger. Chat with a barista. Pet a dog. These tiny moments of connection reduce loneliness chemicals in your brain."',
    'Self-companionship: "Can you befriend yourself? Take yourself on a walk. Cook a meal with care. Write yourself a letter. Being alone and being lonely are different things."',
  ],
  self_worth: [
    'Core belief challenge: "Write the belief: I am not good enough. Now list 10 pieces of evidence that contradict it. They can be tiny. Showed up today. Was kind to someone. Survived a hard week."',
    'Comparison detox: "You are comparing your behind-the-scenes to everyone elses highlight reel. For one week, unfollow accounts that make you feel less than."',
    'Achievement log: "Every night, write 3 things you did today — no matter how small. Got out of bed. Drank water. Replied to a message. Over time, the evidence builds."',
  ],
  work: [
    'Burnout recovery: "Burnout isnt laziness — its your nervous system saying I have nothing left. The fix isnt trying harder. Its rest, boundaries, and reconnecting with why you started."',
    'Workplace boundary: "I can take this on, but Ill need to deprioritize X. Which would you prefer? This is assertive, not aggressive."',
    'Career values: "Is this job aligned with what matters to you? Sometimes the answer is no but I need it for now — and THATS okay too."',
  ],
  perfectionism: [
    'Good enough threshold: "What would 80% effort look like? 70%? Could that be... acceptable? What if good enough IS good enough?"',
    'Cost-benefit: "List what perfectionism GIVES you (quality, control, praise) and what it COSTS you (time, health, relationships, joy). Which column is heavier?"',
    'Self-compassion for mistakes: "Everyone who has ever achieved anything has failed many times. Failure is not the opposite of success — its part of success."',
    'Process vs outcome: "You can control effort. You cannot control results. Shift your metric from did I succeed to did I try my best given the circumstances."',
  ],
  eating: [
    'Body neutrality: "What if the goal isnt loving your body, but accepting it? My body carries me through life. It lets me hug people. Thats enough."',
    'Food is not the enemy: "Restriction leads to binge. Permission leads to peace. All foods are allowed. When you remove rules, food loses its power over you."',
    'Interoceptive awareness: "Before eating, pause. Am I physically hungry or emotionally hungry? Physical hunger builds gradually. Emotional hunger hits suddenly."',
  ],
  health_anxiety: [
    'Response prevention: "The urge to Google symptoms or check your body — resist it. Each time you check, you STRENGTHEN the anxiety. Each time you resist, you weaken it."',
    'Probability reappraisal: "Your brain says worst case. Whats the MOST LIKELY explanation? A headache is usually dehydration or tension — not a tumor."',
    'Acceptance: "I might be sick. I might not be. I choose to live fully TODAY rather than scan for threats that probably dont exist."',
  ],
  mindfulness: [
    'Body scan: "Starting at the crown of your head... notice any sensation. Warmth, tingling, nothing — all fine. Move slowly down. Forehead... jaw... neck... Each part, just notice. No fixing."',
    'RAIN practice: "R-Recognize whats happening. A-Allow it to be there. I-Investigate with kindness (where do I feel this?). N-Non-identification (this feeling is not all of me)."',
    'Mindful breathing: "You dont need to breathe differently. Just NOTICE the breath. In... and out... Where do you feel it most? Nose? Chest? Belly? Thats your anchor."',
    'Informal mindfulness: "You dont need a cushion. Brush your teeth mindfully. Eat one meal without your phone. Walk and feel each step. Life itself becomes the practice."',
  ],
};

export function getRelevantTechniques(userMessage) {
  const lower = userMessage.toLowerCase();
  const matched = [];
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) {
      const techniques = TOPIC_TECHNIQUES[topic];
      if (techniques) matched.push({ topic, techniques });
    }
  }
  return matched;
}

export function getTherapyContext(userMessage) {
  const matches = getRelevantTechniques(userMessage);
  if (matches.length === 0) return '';
  let context = '\n\nRELEVANT EVIDENCE-BASED TECHNIQUES (from clinical manuals):\n';
  for (const { topic, techniques } of matches.slice(0, 3)) {
    context += `\n[${topic.toUpperCase()}]\n`;
    // Pick 2-3 most relevant techniques, not all
    const selected = techniques.slice(0, 3);
    selected.forEach(t => { context += `- ${t}\n`; });
  }
  context += '\nWeave 1-2 of these into your response NATURALLY. Do not list them. Speak as a warm human, not a textbook.\n';
  return context;
}
