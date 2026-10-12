# Eva on Telegram

Eva's brain, running server-side, reachable from Telegram. No signup, no app
install — the user just messages the bot.

## Why this exists

The web app has two structural problems that a bot fixes for free:

- **API keys leak.** A `REACT_APP_*` key is compiled into the browser bundle,
  so anyone can read it with devtools. Here the keys stay on the server.
- **Memory dies.** The web app keeps memories in `localStorage` — gone when the
  cache clears, and never follows the user to another device. Here they live on
  disk, so Eva can genuinely say "kal jo baat hui thi".

## Setup

1. Open Telegram, message **@BotFather**, send `/newbot`, follow the prompts.
2. Copy the token it gives you into `telegram-bot/.env`:

   ```
   TELEGRAM_BOT_TOKEN=123456:ABC-your-token-here
   ```

   `OPENAI_API_KEY` and `SARVAM_API_KEY` are read from the web app's
   `../.env.local` automatically (the `REACT_APP_` prefix is stripped), so you
   only need to add them here if you want the bot to use different ones.

3. `npm start`

Long polling, so there is no webhook, no public URL and no hosting to set up.
Any machine with the tokens runs a working bot.

## Commands

| Command | Does |
|---|---|
| `/start` | intro |
| `/voice` | toggle voice notes (Sarvam TTS → Ogg/Opus) |
| `/modes` | list Eva's 13 modes |
| `/calm`, `/companion`, `/therapist`, … | switch mode |
| `/me` | what Eva remembers about you |
| `/name AJ` | set your name |
| `/forget` | wipe this chat's memory |

## How it fits the web app

`lib/evaSource.js` loads `../src/utils/{evaPersonality,modes,therapyKnowledge,
therapyKnowledgeBase}.js` at runtime and hands them to Node as data-URL modules
— they are ESM but the web app's `package.json` has no `"type": "module"`, so a
plain import would be parsed as CommonJS and fail on `export`.

The upshot: **there is one copy of Eva's personality.** Edit it in the web app
and the bot picks it up on restart. Nothing is duplicated here.

What the bot adds on top, in `lib/brain.js`:

- **Language locking.** `detectLanguage()` decides Hinglish vs English in code
  and states the answer in the prompt. Asking the model to infer it lost to the
  personality file's English examples about half the time.
- **Quote stripping.** The personality file says to "mirror THEIR exact words",
  which the model renders as scare quotes — *you're feeling 'thak gaya'*.
  `sanitize()` removes them deterministically; no prompt wording did.
- **Texting length.** One paragraph, one question, no markdown.

## Relationship progression

Eva opens up as the relationship earns it. A stage unlocks only when BOTH
thresholds are met — volume alone would let someone speedrun intimacy in one
long night, and days alone would promote someone who sent four messages in a
month.

| Stage | Needs | Shape |
|---|---|---|
| just met | — | 2-4 sentences, always ends with a question, no teasing |
| getting to know you | 12 msgs + 1 day | 2-3 sentences, brings up past threads |
| close | 50 msgs + 5 days | 1-2 sentences, max one question, teases, pushes back |
| old friend | 150 msgs + 21 days | often one line, usually no question, blunt |

Measured over three prompts per stage, average reply length runs
**192 → 143 → 100 → 98 characters**. The first three steps separate cleanly;
`close` and `old friend` land in the same length band and differ in register
rather than length.

`/me` shows the current stage and what the next one needs.

Two implementation notes, both learned the hard way:

- The stage block is the **last** thing in the prompt and says outright that it
  overrides earlier style guidance. Placed mid-prompt it lost every time to the
  ~2000-word warm-listener personality above it.
- There is deliberately **no generic length rule** for ordinary modes. A fixed
  "2-4 sentences, end with ONE question" in the static block silently flattened
  every stage back to the same shape.

A gap in contact is noticed too: 3+ days gets a light mention, 14+ gets a warm
acknowledgement. Neither guilt-trips — that was a deliberate choice, not an
oversight, and `gapNote()` in `lib/relationship.js` is where you would change it.

## Memory

`data/memory.json`, one record per chat: name, mode, voice toggle, up to 50
facts, last 12 turns. Facts are extracted by a cheap background call every 6
user turns, off the critical path so nobody waits for it.

Each record also carries `firstSeen` / `lastSeen`, which drive the relationship
stage and gap detection.

`lib/memory.js` is the only file that touches storage — swapping in Supabase
(already wired in the web app at `src/services/supabase.js`, just missing keys)
means rewriting that one file.

## Cost

Same shape as the web app: `gpt-4o-mini`, ~2k-token cached system prefix,
roughly $0.0002 per message, plus one extraction call every 6 turns. Sarvam
bills per character and only runs when `/voice` is on.
