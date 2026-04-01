const AFFIRMATIONS = [
  "You are worthy of love and kindness, especially from yourself.",
  "Today is a new beginning. Breathe it in.",
  "You are stronger than you think, braver than you believe.",
  "The world needs your light. Don't dim it for anyone.",
  "You don't have to be perfect to be amazing.",
  "Every day may not be good, but there is good in every day.",
  "You are allowed to take up space in this world.",
  "Your feelings are valid. All of them.",
  "You are doing the best you can, and that is enough.",
  "Be gentle with yourself. You're doing a great job.",
  "The storm will pass. You are the sky, not the weather.",
  "You deserve rest without guilt.",
  "Your story matters. Your voice matters. You matter.",
  "Growth is not always loud. Sometimes it's the quiet moments.",
  "You are not behind. You are exactly where you need to be.",
  "Let go of what you can't control. Embrace what you can.",
  "Today, choose yourself. You are worth choosing.",
  "Healing is not linear. Be patient with your journey.",
  "You bring something to this world that no one else can.",
  "It's okay to not be okay. That's where growth begins.",
  "You are a masterpiece and a work in progress at the same time.",
  "Your potential is infinite. Don't let anyone tell you otherwise.",
  "Breathe. You survived 100% of your worst days so far.",
  "Happiness is not a destination. It's a way of traveling.",
  "You are loved more than you know.",
  "Stars can't shine without darkness. Your time will come.",
  "Today, I choose peace over perfection.",
  "You are not your mistakes. You are your lessons.",
  "The universe is conspiring in your favor.",
  "Trust the timing of your life.",
];

export function getDailyAffirmation() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  return AFFIRMATIONS[dayOfYear % AFFIRMATIONS.length];
}
