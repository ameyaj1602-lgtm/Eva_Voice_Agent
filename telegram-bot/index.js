// Eva on Telegram.
//
// Same brain as the web app, but running here on the server, which fixes the
// web app's two structural problems at once: the API keys never reach a
// browser, and memory outlives the user's browser cache.
//
// Long polling, so there is no webhook, no public URL and no hosting to set up
// — `npm start` on any machine with the tokens is a working bot.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { reply, extractFacts, MODES } from './lib/brain.js';
import { synthesize } from './lib/voice.js';
import * as memory from './lib/memory.js';
import { describe as describeRelationship } from './lib/relationship.js';

const here = dirname(fileURLToPath(import.meta.url));

// Load .env from this folder, falling back to the web app's .env.local so the
// keys you already set up keep working without being copied around.
async function loadEnv() {
  for (const file of [join(here, '.env'), join(here, '..', '.env.local')]) {
    let text;
    try { text = await readFile(file, 'utf8'); } catch { continue; }
    for (const line of text.split('\n')) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!match) continue;
      const [, rawKey, rawValue] = match;
      // The web app prefixes everything with REACT_APP_; accept both spellings.
      const key = rawKey.replace(/^REACT_APP_/, '');
      const value = rawValue.trim().replace(/^["']|["']$/g, '');
      if (value && !process.env[key]) process.env[key] = value;
    }
  }
}
await loadEnv();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const SARVAM_KEY = process.env.SARVAM_API_KEY;
const API = `https://api.telegram.org/bot${TOKEN}`;

const FACT_EXTRACT_EVERY = 6;   // user turns between memory passes
const VOICE_CHAR_LIMIT = 600;   // past this, a voice note is a chore to listen to

if (!TOKEN) {
  console.error('\nTELEGRAM_BOT_TOKEN missing.\n'
    + 'Open Telegram, message @BotFather, send /newbot, and paste the token it gives you\n'
    + `into ${join(here, '.env')} as TELEGRAM_BOT_TOKEN=...\n`);
  process.exit(1);
}
if (!OPENAI_KEY) {
  console.error('\nOPENAI_API_KEY missing — Eva has no brain without it.\n');
  process.exit(1);
}

async function tg(method, payload) {
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`${method}: ${data.description}`);
  return data.result;
}

async function sendVoiceNote(chatId, ogg, caption) {
  const form = new FormData();
  form.append('chat_id', String(chatId));
  form.append('voice', new Blob([ogg], { type: 'audio/ogg' }), 'eva.ogg');
  if (caption) form.append('caption', caption.slice(0, 1024));
  const res = await fetch(`${API}/sendVoice`, { method: 'POST', body: form });
  const data = await res.json();
  if (!data.ok) throw new Error(`sendVoice: ${data.description}`);
  return data.result;
}

const MODE_LIST = Object.values(MODES)
  .map((m) => `/${m.id} — ${m.name || m.id}`)
  .join('\n');

async function handleCommand(chatId, text, chat) {
  const [rawCmd, ...rest] = text.slice(1).split(/\s+/);
  const cmd = rawCmd.toLowerCase().split('@')[0];
  const arg = rest.join(' ').trim();

  if (cmd === 'start') {
    await memory.update(chatId, { mode: 'companion' });
    await tg('sendMessage', {
      chat_id: chatId,
      text: 'Hey. I\'m Eva.\n\nJust talk to me like you\'d text a friend — Hinglish, '
        + 'half-sentences, whatever. I remember what you tell me.\n\n'
        + '/voice — sun‑ne ke liye, padhne ke bajaye\n/modes — meri alag alag vibes\n'
        + '/me — jo mujhe yaad hai\n/forget — sab bhool jao',
    });
    return true;
  }

  if (cmd === 'modes') {
    await tg('sendMessage', { chat_id: chatId, text: `Abhi: ${chat.mode}\n\n${MODE_LIST}` });
    return true;
  }

  if (cmd === 'voice') {
    if (!SARVAM_KEY) {
      await tg('sendMessage', { chat_id: chatId, text: 'Voice set up nahi hai — SARVAM_API_KEY missing.' });
      return true;
    }
    const on = !chat.voice;
    await memory.update(chatId, { voice: on });
    await tg('sendMessage', { chat_id: chatId, text: on ? 'Ab main bolungi 🎧' : 'Wapas text pe.' });
    return true;
  }

  if (cmd === 'me') {
    const facts = chat.facts.length
      ? chat.facts.map((f) => `• ${f}`).join('\n')
      : 'Abhi tak kuch khaas nahi. Baat karo, yaad rakhungi.';
    await tg('sendMessage', {
      chat_id: chatId,
      text: `${chat.name ? `Naam: ${chat.name}\n` : ''}${describeRelationship(chat)}\n\n${facts}`,
    });
    return true;
  }

  if (cmd === 'forget') {
    await memory.forget(chatId);
    await tg('sendMessage', { chat_id: chatId, text: 'Sab bhula diya. Shuru se?' });
    return true;
  }

  if (cmd === 'name') {
    if (!arg) {
      await tg('sendMessage', { chat_id: chatId, text: 'Aise: /name AJ' });
      return true;
    }
    await memory.update(chatId, { name: arg.slice(0, 40) });
    await tg('sendMessage', { chat_id: chatId, text: `Theek hai, ${arg.slice(0, 40)}.` });
    return true;
  }

  if (MODES[cmd]) {
    await memory.update(chatId, { mode: cmd });
    await tg('sendMessage', { chat_id: chatId, text: `${MODES[cmd].name || cmd} mode. Bolo.` });
    return true;
  }

  return false;
}

async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();
  if (!text) return;

  const { chat: stamped, previousVisit } = await memory.touch(chatId);
  let chat = stamped;

  // First contact: borrow the Telegram first name so Eva isn't a stranger.
  if (!chat.name && msg.from?.first_name) {
    chat = await memory.update(chatId, { name: msg.from.first_name });
  }

  if (text.startsWith('/') && await handleCommand(chatId, text, chat)) return;

  await tg('sendChatAction', { chat_id: chatId, action: 'typing' });

  let answer;
  try {
    answer = await reply(chat, text, OPENAI_KEY, { previousVisit });
  } catch (err) {
    console.error('[brain]', err.message);
    await tg('sendMessage', { chat_id: chatId, text: 'Dimaag thoda atak gaya. Phir se bolo?' });
    return;
  }
  if (!answer) return;

  await memory.addTurn(chatId, 'user', text);
  chat = await memory.addTurn(chatId, 'assistant', answer);

  // Voice when asked for, but never let a TTS failure swallow the reply.
  let sentAsVoice = false;
  if (chat.voice && SARVAM_KEY && answer.length <= VOICE_CHAR_LIMIT) {
    try {
      await tg('sendChatAction', { chat_id: chatId, action: 'record_voice' });
      const ogg = await synthesize(answer, SARVAM_KEY);
      if (ogg) {
        await sendVoiceNote(chatId, ogg, answer);
        sentAsVoice = true;
      }
    } catch (err) {
      console.error('[voice]', err.message);
    }
  }
  if (!sentAsVoice) await tg('sendMessage', { chat_id: chatId, text: answer });

  // Memory pass, off the critical path so the user never waits for it.
  if (chat.userTurns > 0 && chat.userTurns % FACT_EXTRACT_EVERY === 0) {
    extractFacts(chat, OPENAI_KEY)
      .then((facts) => facts.length && memory.addFacts(chatId, facts))
      .then((updated) => updated && console.log(`[memory] ${chatId}: ${updated.facts.length} facts`))
      .catch((err) => console.error('[memory]', err.message));
  }
}

async function main() {
  const me = await tg('getMe', {});
  console.log(`Eva is live as @${me.username}`);
  console.log(`Voice: ${SARVAM_KEY ? 'on (/voice to toggle)' : 'off — no SARVAM_API_KEY'}`);
  console.log('Open Telegram and message the bot. Ctrl+C to stop.\n');

  let offset = 0;
  for (;;) {
    try {
      const updates = await tg('getUpdates', { offset, timeout: 30, allowed_updates: ['message'] });
      for (const update of updates) {
        offset = update.update_id + 1;
        if (update.message) handleMessage(update.message).catch((e) => console.error('[handler]', e.message));
      }
    } catch (err) {
      console.error('[poll]', err.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
