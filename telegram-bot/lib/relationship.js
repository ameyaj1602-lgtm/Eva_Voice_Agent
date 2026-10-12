// How close Eva is to this person, and what that does to her tone.
//
// Closeness needs BOTH conversation volume AND elapsed days. Volume alone lets
// someone speedrun intimacy in one long night, which reads as fake the next
// morning; days alone would promote someone who sent four messages in a month.
// A stage opens only when both thresholds are met.

// Each stage carries a hard shape, not a mood. "Be warmer" got ignored —
// sentence counts, an explicit question rule and a token cap do not.
const STAGES = [
  {
    id: 'stranger',
    label: 'just met',
    minTurns: 0,
    minDays: 0,
    maxTokens: 200,
    tone: `You have just met this person.
LENGTH: 2 to 4 sentences. ALWAYS end with a question — you are still learning who they are.
DO: be warm but a little careful. Ask rather than assume. Explain yourself fully.
DON'T: use nicknames, tease them, reference anything they have not told you, or guess how they feel.`,
  },
  {
    id: 'warming',
    label: 'getting to know you',
    minTurns: 12,
    minDays: 1,
    maxTokens: 160,
    tone: `You have talked a fair bit now.
LENGTH: 2 to 3 sentences. Usually end with a question, but not every single time.
DO: bring up something they mentioned earlier without being asked. Tease lightly if they tease first.
DON'T: over-explain. You can skip the setup and get to the thought.`,
  },
  {
    id: 'close',
    label: 'close',
    minTurns: 50,
    minDays: 5,
    maxTokens: 110,
    tone: `You know this person well.
LENGTH: 1 to 2 short sentences. NEVER more than one question, and often zero —
a reaction on its own is a complete reply.
DO: react first, like a friend would. Tease them. Pick up old threads unprompted. Say it when you
think they are dodging something.
DON'T: write therapy-speak, summarise their feelings back to them, or ask a question just to fill space.`,
  },
  {
    id: 'closest',
    label: 'old friend',
    minTurns: 150,
    minDays: 21,
    maxTokens: 60,
    tone: `You two go back a long way.
LENGTH: often ONE line. Sometimes three words. Never more than two sentences.
QUESTIONS: at most one, and most messages need none at all. A reaction is a
complete reply between old friends — "again?" on its own is fine. Stacking
questions is what strangers do to keep a conversation alive; you do not need to.
DO: full shorthand — half-sentences land. Be blunt. Call out patterns you have watched for weeks.
You are allowed to be unimpressed: "again?", "told you", "of course he did".
DON'T: set up context, soften things, or ask how it makes them feel. The closeness is earned, so
honesty does not read as cold.`,
  },
];

const DAY = 24 * 60 * 60 * 1000;

export function daysSince(timestamp) {
  if (!timestamp) return 0;
  return Math.floor((Date.now() - timestamp) / DAY);
}

export function getStage(chat) {
  const turns = chat?.userTurns || 0;
  const days = daysSince(chat?.firstSeen);
  // Walk forward and keep the last stage whose thresholds are both satisfied.
  let stage = STAGES[0];
  for (const candidate of STAGES) {
    if (turns >= candidate.minTurns && days >= candidate.minDays) stage = candidate;
  }
  return stage;
}

export function nextStage(chat) {
  const current = getStage(chat);
  const index = STAGES.findIndex((s) => s.id === current.id);
  return STAGES[index + 1] || null;
}

// A gap in contact is worth noticing out loud — it is the kind of thing a real
// friend registers, and it costs nothing to detect.
// Takes the PREVIOUS visit time, not chat.lastSeen — by the time a reply is
// being built, lastSeen has already been stamped to now.
export function gapNote(previousVisit) {
  const away = daysSince(previousVisit);
  if (!previousVisit) return null;
  if (away >= 14) return `It has been about ${away} days since they last messaged you. Acknowledge the gap once, warmly, without guilt-tripping them. Then move on.`;
  if (away >= 3) return `They have not messaged in ${away} days. You can note it lightly in passing — do not make a thing of it.`;
  return null;
}

export function describe(chat) {
  const stage = getStage(chat);
  const next = nextStage(chat);
  const turns = chat?.userTurns || 0;
  const days = daysSince(chat?.firstSeen);
  let text = `${stage.label} — ${turns} messages over ${days} ${days === 1 ? 'day' : 'days'}`;
  if (next) {
    const needTurns = Math.max(0, next.minTurns - turns);
    const needDays = Math.max(0, next.minDays - days);
    const parts = [];
    if (needTurns) parts.push(`${needTurns} more messages`);
    if (needDays) parts.push(`${needDays} more ${needDays === 1 ? 'day' : 'days'}`);
    if (parts.length) text += `\nnext: ${next.label} (${parts.join(' + ')})`;
  }
  return text;
}

export { STAGES };
