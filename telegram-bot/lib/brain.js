// Eva's brain, server-side. Same layered prompt as the web app
// (personality -> therapy frameworks -> mode guidelines -> dynamic tail),
// same gpt-4o-mini, same cost shape.

import {
  buildEvaPrompt, buildTherapyPrompt, getTherapyContext, MODES,
  detectLanguage, languageDirective, sanitize,
} from './evaSource.js';
import { getStage, gapNote } from './relationship.js';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';
const CREATIVE_MODES = ['storyteller', 'dream', 'lullaby'];

function systemPrompt(mode, chat, latestUserMessage, previousVisit) {
  const { name, facts } = chat;
  // Static first: identical bytes across every message in a conversation, so
  // OpenAI's automatic prompt caching can reuse this whole prefix at half price.
  let prompt = buildEvaPrompt(mode?.systemPrompt || '', mode?.id);
  prompt += buildTherapyPrompt('', mode?.id);

  if (CREATIVE_MODES.includes(mode?.id)) {
    prompt += '\nWrite 3-4 rich paragraphs. Be vivid and immersive.';
  } else if (mode?.id === 'silence') {
    prompt += '\nMAX 1-2 sentences. Often just one word.';
  }
  // No generic length rule for ordinary modes: the closeness stage at the end
  // of this prompt owns length, and a fixed "2-4 sentences, end with ONE
  // question" here quietly flattened every stage back to the same shape.

  // Channel rules close the static block. Deliberately short: the personality
  // file above already carries the voice, and piling on more prose here just
  // destabilised it. The two things that actually needed fixing — language and
  // scare quotes — are handled deterministically instead of by persuasion.
  prompt += `

CHANNEL: Telegram. You are texting, not writing.

LENGTH — a text message, not an email. One paragraph, never two, never a blank
line. The exact sentence count is set by HOW WELL YOU KNOW THIS PERSON below;
that rule wins over any instinct to be thorough. If you are about to add a
second thought, cut it instead.

No markdown, no asterisks, no bullets, no headings. Lowercase is fine. Write
like a person on their phone, not an assistant composing a reply.`;

  // Dynamic tail last, so the cacheable prefix above stays byte-identical.
  if (name) prompt += `\n\nThe user's name is ${name}. Use it naturally — don't overuse it.`;
  if (facts?.length) {
    prompt += '\n\nThings you remember about this user (use them to make the conversation feel personal):\n';
    for (const fact of facts) prompt += `- ${fact}\n`;
  }
  if (latestUserMessage) {
    const context = getTherapyContext(latestUserMessage);
    if (context) prompt += context;
    // Detected in code, not left to the model. Asking it to infer the language
    // lost to the personality file's English examples about half the time;
    // stating the answer outright is reliable, and it re-decides every message.
    prompt += languageDirective(latestUserMessage);
  }
  // Closeness goes LAST — after the language rule, after everything. The
  // personality file is ~2000 words of warm reflective listener, and a polite
  // note in the middle of the tail lost to it every time. This is positioned
  // and worded as an override because that is what it has to be.
  const stage = getStage(chat);
  prompt += `

=== HOW WELL YOU KNOW THIS PERSON: ${stage.label} ===
This section OVERRIDES the response-style guidance earlier in this prompt.
Where they conflict, follow this.

${stage.tone}`;

  const gap = gapNote(previousVisit);
  if (gap) prompt += `\n\n${gap}`;

  return prompt;
}

async function callOpenAI(messages, maxTokens, apiKey) {
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.9, max_tokens: maxTokens }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || null;
}

export async function reply(chat, userText, apiKey, { previousVisit = null } = {}) {
  const mode = MODES[chat.mode] || MODES.companion || Object.values(MODES)[0];
  const messages = [
    { role: 'system', content: systemPrompt(mode, chat, userText, previousVisit) },
    ...chat.history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userText },
  ];
  // Creative modes genuinely need room; otherwise the closeness stage sets the
  // budget, so a terse old-friend reply cannot sprawl even if the model tries.
  const maxTokens = CREATIVE_MODES.includes(mode?.id) ? 500 : getStage(chat).maxTokens;
  return sanitize(await callOpenAI(messages, maxTokens, apiKey));
}

// Pull durable facts out of the recent conversation. Runs occasionally, not
// every turn — this is what makes "you mentioned your Japan trip" possible
// without replaying the whole history on every message.
export async function extractFacts(chat, apiKey) {
  const transcript = chat.history
    .map((m) => `${m.role === 'user' ? 'User' : 'Eva'}: ${m.content}`)
    .join('\n');
  if (!transcript) return [];

  const instruction = 'Extract durable facts about the USER from this conversation — '
    + 'things worth remembering weeks later (job, relationships, places, plans, '
    + 'ongoing worries, preferences). Ignore passing moods and anything Eva said about herself. '
    + 'Reply with a JSON array of short strings, at most 5. If nothing is worth keeping, reply [].';

  try {
    const raw = await callOpenAI([
      { role: 'system', content: instruction },
      { role: 'user', content: transcript },
    ], 200, apiKey);
    const match = raw?.match(/\[[\s\S]*\]/);
    if (!match) return [];
    const parsed = JSON.parse(match[0]);
    return Array.isArray(parsed) ? parsed.filter((f) => typeof f === 'string') : [];
  } catch (err) {
    console.error('[brain] fact extraction failed:', err.message);
    return [];
  }
}

export { MODES, detectLanguage, sanitize };
