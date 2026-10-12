// Per-chat memory. The web app keeps this in localStorage, which dies with the
// browser cache and never follows the user to another device. Here it lives on
// disk, so Eva can genuinely say "kal humne jo baat ki thi".
//
// A JSON file is fine for one bot on one machine. The shape below is
// deliberately flat so swapping in Supabase later is a change to this file only.

import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(here, '..', 'data');
const STORE = join(DATA_DIR, 'memory.json');

const MAX_FACTS = 50;      // matches the web app's cap
const MAX_HISTORY = 12;    // turns kept verbatim; older ones survive as facts

let cache = null;
let writeQueue = Promise.resolve();

async function load() {
  if (cache) return cache;
  try {
    cache = JSON.parse(await readFile(STORE, 'utf8'));
  } catch {
    cache = {};
  }
  return cache;
}

// Serialised write-then-rename: a crash mid-write can't leave a truncated file.
function persist() {
  writeQueue = writeQueue.then(async () => {
    await mkdir(DATA_DIR, { recursive: true });
    const tmp = `${STORE}.tmp`;
    await writeFile(tmp, JSON.stringify(cache, null, 2));
    await rename(tmp, STORE);
  }).catch((err) => console.error('[memory] write failed:', err.message));
  return writeQueue;
}

function blank() {
  return {
    name: null, mode: 'companion', voice: false,
    facts: [], history: [], userTurns: 0,
    firstSeen: null, lastSeen: null,
  };
}

export async function getChat(chatId) {
  const all = await load();
  if (!all[chatId]) all[chatId] = blank();
  return all[chatId];
}

export async function update(chatId, patch) {
  const chat = await getChat(chatId);
  Object.assign(chat, patch);
  await persist();
  return chat;
}

// Stamp contact times. firstSeen anchors how long Eva has known them; lastSeen
// is read before it is overwritten, so a returning user can be greeted as one.
export async function touch(chatId) {
  const chat = await getChat(chatId);
  const previousVisit = chat.lastSeen;
  const now = Date.now();
  if (!chat.firstSeen) chat.firstSeen = now;
  chat.lastSeen = now;
  await persist();
  return { chat, previousVisit };
}

export async function addTurn(chatId, role, content) {
  const chat = await getChat(chatId);
  chat.history.push({ role, content });
  if (chat.history.length > MAX_HISTORY) chat.history = chat.history.slice(-MAX_HISTORY);
  if (role === 'user') chat.userTurns += 1;
  await persist();
  return chat;
}

export async function addFacts(chatId, facts) {
  const chat = await getChat(chatId);
  const seen = new Set(chat.facts.map((f) => f.toLowerCase()));
  for (const fact of facts) {
    const clean = String(fact).trim();
    if (clean && !seen.has(clean.toLowerCase())) {
      chat.facts.push(clean);
      seen.add(clean.toLowerCase());
    }
  }
  if (chat.facts.length > MAX_FACTS) chat.facts = chat.facts.slice(-MAX_FACTS);
  await persist();
  return chat;
}

export async function forget(chatId) {
  const all = await load();
  all[chatId] = blank();
  await persist();
}
