// Eva's personality, modes and therapy knowledge live in ../../src/utils/.
// Those files are ESM, but the web app's package.json has no "type": "module",
// so Node would read them as CommonJS and choke on `export`.
//
// They import nothing, so we can read the text and hand it to Node as a data
// URL module. The bot therefore uses the LIVE personality files — edit Eva in
// the web app and the bot picks it up on restart. No copies, no drift.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const UTILS = join(here, '..', '..', 'src', 'utils');

async function loadEsm(filename) {
  const source = await readFile(join(UTILS, filename), 'utf8');
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
}

const [personality, modes, therapy, therapyBase, language] = await Promise.all([
  loadEsm('evaPersonality.js'),
  loadEsm('modes.js'),
  loadEsm('therapyKnowledge.js'),
  loadEsm('therapyKnowledgeBase.js'),
  loadEsm('language.js'),
]);

export const { buildEvaPrompt } = personality;
export const { MODES, DEFAULT_MODE } = modes;
export const { buildTherapyPrompt } = therapy;
export const { getTherapyContext } = therapyBase;
export const { detectLanguage, languageDirective, sanitize } = language;
