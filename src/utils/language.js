// Language handling shared by the web app and the Telegram bot.
//
// Self-contained on purpose: no imports, so the bot can load this file at
// runtime as a data-URL module (see telegram-bot/lib/evaSource.js) and both
// sides stay on one copy of the logic.

// Devanagari is unambiguous. For Roman script we look at function words, which
// are far better markers than content words. Words that are also ordinary
// English — to, me, the, ho, kar, hi, main — are deliberately excluded; they
// flipped plain English sentences to Hinglish.
const DEVANAGARI = /[ऀ-ॿ]/;
const HINGLISH_MARKERS = /\b(hai|hain|hoon|kya|kaise|kyun|kaun|kab|kahan|kitna|mein|toh|yeh|woh|aur|nahi|nai|haan|accha|acha|theek|thik|karo|karna|raha|rahi|rahe|tha|thi|yaar|bhai|abhi|bohot|bahut|thoda|matlab|phir|sab|apna|mera|tera|tumhara|mujhe|tujhe|tum|hum|kuch|koi|gaya|gayi|wala|wali|kaam|baat|pata|lagta|liye|ke|ki|ka|se|par|pe|bhi|na|sirf|zyada|jaa|jaise|kyunki|lekin|magar)\b/i;

export function detectLanguage(text) {
  if (!text) return 'english';
  if (DEVANAGARI.test(text)) return 'hinglish';
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  if (words.length < 2) return 'english';
  const hits = words.filter((w) => HINGLISH_MARKERS.test(w)).length;
  // Two markers, or a quarter of the sentence — one stray word shouldn't flip it.
  return hits >= 2 || hits / words.length > 0.25 ? 'hinglish' : 'english';
}

// Binary and checkable. "Reply in Hinglish" produced English with a stray
// "yaar" in it about half the time; a hard sentence-level rule does not.
// Belongs at the very END of a system prompt — placed mid-prompt it loses to
// the personality file's English examples.
export function languageDirective(userMessage) {
  return detectLanguage(userMessage) === 'hinglish'
    ? '\n\nTHE USER WROTE IN HINGLISH. Write your ENTIRE reply in Hinglish — Hindi '
      + 'grammar and sentence structure, Roman letters. Not one complete sentence in '
      + 'English. Everyday English nouns Indians genuinely use while speaking Hindi '
      + '(office, meeting, boss, pressure, plan) are fine; English sentences are not.'
    : '\n\nTHE USER WROTE IN ENGLISH. Write your entire reply in English. No Hindi words.';
}

// evaPersonality tells Eva to "mirror THEIR exact words back", which the model
// renders as scare quotes — you're feeling 'thak gaya'. Stripping them here is
// deterministic; no prompt wording was. Long quotes are left alone, since those
// are the user actually quoting someone.
export function sanitize(text) {
  if (!text) return text;
  return text
    .replace(/(^|[\s(])['"‘“]([^'"‘’“”\n]{1,30})['"’”]([\s,.!?)]|$)/g, '$1$2$3')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .trim();
}
