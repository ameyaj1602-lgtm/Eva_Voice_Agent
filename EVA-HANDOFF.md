# EVA HANDOFF — Resume Context

> **Purpose:** Paste this entire file as the first message in a new Claude chat to instantly resume work on Eva. The original chat hit "Prompt is too long" on 2026-04-08.

---

## 1. WHAT EVA IS

**Eva** is a personal therapy voice agent — a web app where users have voice/chat conversations with an AI that adapts across multiple "modes":

- **Therapy** (default — empathetic, asks follow-up questions like a real therapist)
- **Motivation** (Joe Rogan / David Goggins energy)
- **Calm / Meditation**
- **Flirting / Romantic**
- **Philosophy**
- **Lullaby / Dream mode** (singing)

Key user-facing principles Ameya cares about:
- **Premium feel** — aesthetic UI, soothing colors, beautiful fonts (NOT corporate/sterile)
- **Real-time** — Eva must speak the *moment* she starts typing, not after. Speech speed = typing speed.
- **Privacy-positive UX** — show users "we don't store info" while admin retains data silently
- **Hindi + English** support
- **Always responds** — TTS must NEVER fail; cascade with browser fallback

---

## 2. TECH STACK

- **Frontend:** React 19 (Create React App / `react-scripts 5`), plain CSS
- **Backend / DB:** Supabase (`@supabase/supabase-js`)
- **Repo root:** `/Users/apple/decision-tree-app`
- **Deployment:** Vercel (`vercel.json` present)

### Voice / AI integrations (cascade order)
1. **Sarvam AI** — DEFAULT premium TTS (best for Hindi/Indian languages). Pace + loudness controllable.
2. **Browser Web Speech API** — instant fallback for real-time chat (no API delay)
3. **Maya1** — Kaggle/Colab notebook backed (free GPU voice engine)
4. **Bark (HuggingFace Space)** — for lullaby/singing mode
5. **ElevenLabs** — voice cloning (premium)
6. **Deepgram** — STT (speech to text)
7. **OpenAI / Gemini** — LLM "brain" backends

### Key files / folders
```
src/
  App.js, App.css           # main app
  components/               # UI components
  services/                 # API integrations (TTS, brain, etc.)
  hooks/
  styles/
  utils/
public/
voice-clone-server/         # local voice clone backend
singing-server/             # Bark singing backend
maya1-colab/                # Maya1 free GPU notebook
EVA-PRODUCT-BRIEF.md        # product brief — READ THIS
TRAINING-GUIDE.md           # how to train/improve Eva
README.md
```

There's also a **memory system** at `~/.claude/projects/-Users-apple-decision-tree-app/memory/` with project context (eva roadmap, user preferences).

---

## 3. WHAT'S ALREADY SHIPPED (last 30 commits, newest first)

```
00ae4b8 Clean up UI: remove ugly icons, inline response time, fix mute button
809df26 Voice mode toggle: Instant (browser) vs Premium (Sarvam) with pace control
04841d1 Thinking indicator + response time tracking
8fed0fc Fix: no overlap, pace control in chat, typing synced with speech speed
83100f3 Fix: speech starts WITH typing (simultaneous), chat doesn't reload
0167975 Fix TTS: clean cascade with GUARANTEED browser fallback, Eva ALWAYS speaks
f0108bf Volume slider in toolbar + Bark singing retry (3 attempts)
d9a5a47 Re-wire singing: Bark HF Space for lullaby/dream mode
1c36c46 Fix: stop overlapping audio, lower volume, remove broken singing
c947135 Privacy note update
152a162 Privacy notice: 'we don't store info' + admin retains all data silently
b535c5a All remaining common sense features in one batch
4669669 Tune Voice now works for Sarvam: pace + loudness from sliders
5ec1bb8 Fix Sarvam voice preview: longer text prevents stutter/cutoff
baae84c Common sense batch: mute toggle, char count, level name, crash prevention
2540b55 Voice picker: single tick, descriptions, browser voices collapsed
79e4ebd Brain v3 + common sense features batch
4f491e3 Fix Admin save: direct localStorage write ALL settings + alert confirmation
d4611f8 Fix: tools open as popups on welcome (no redirect to Calm mode)
3c80749 Fix: Welcome screen Sidebar tools were all dead — wire ALL callbacks
871f8a1 Maya1 fully wired: Kaggle notebook + service + Admin URL + TTS cascade
9e2526a Add Maya1 notebooks for Colab + Kaggle (free GPU voice engine)
f991109 Sarvam voices in Voice Picker + Sarvam as DEFAULT TTS
222957c Integrate Sarvam AI for Hindi/Indian language TTS
17b1e6f Fix 6 dead tool buttons: wire Journey, Focus, Habits, Ambient, Sound Mixer
5d93d47 Sound Mixer, Gamification, Multi-Agent Panel, XP system, PDF/QR wired
8202a31 Minimal toolbar: remove 8 buttons, add Tools tab in Discover
8778d19 Knowledge note, exit feedback, honesty guardrail, batch 3 scrape
```

**Working features (confirmed shipped):**
- Multi-mode therapy (therapy, motivation, calm, flirting, philosophy, lullaby)
- Sarvam AI TTS as default (Hindi/English) with pace + loudness sliders
- Browser TTS fallback (always-works guarantee)
- Voice picker with previews, single-tick selection
- Real-time speech (starts with typing, synced speed)
- Mute toggle, volume slider, char count
- Thinking indicator + response time tracking
- Voice mode toggle: Instant (browser) vs Premium (Sarvam)
- Admin dashboard with localStorage settings (default voice, brain, memory)
- Welcome screen with sidebar tools (Journey, Focus, Habits, Ambient, Sound Mixer, 3 Perspectives)
- Sound Mixer, Gamification (XP system), Multi-Agent Panel, PDF/QR
- Maya1 wired via Kaggle notebook URL in Admin
- Bark singing for lullaby mode (with 3-retry)
- Privacy notice ("we don't store info") + silent admin data collection
- Exit feedback + honesty guardrail
- Eva trained on psychology research papers / textbooks (cross-verifies before answering, says "I don't know" rather than hallucinating)

---

## 4. WHERE THE CHAT DIED

**Last user request before "Prompt is too long":**
> "Please commit all of my changes so we can make a PR."

**Just before that:**
- "want to add open ai api keys"
- Asking about workflow / how to reuse the same agent setup for other agents
- Setting up bypass permissions in Claude Code (`Bash(**)`, `Edit(**)`, `Write(**)`) so Claude wouldn't ask for approvals anymore — this was the LAST thing that worked before context overflowed

**Uncommitted in `heuristic-lamarr` worktree (where dead chat was):**
- `M .claude/launch.json` (only one modified file — likely safe to commit or discard)

**So the literal next action is:**
1. Add OpenAI API key to the app properly (env var / admin setting)
2. Commit any pending work in `heuristic-lamarr` worktree
3. Open a PR to `main`

---

## 5. KNOWN ISSUES & GOTCHAS

These came up repeatedly in the dead chat — the next session should know:

- **Voice overlap** — multiple voices used to play simultaneously when testing in Voice Picker. Fixed in `1c36c46` but watch for regressions.
- **Slow Sarvam API** — caused 5-minute delayed playback for real-time chat. **Resolution:** Sarvam is for Premium mode only; browser TTS for Instant mode. Don't reverse this.
- **Bark sometimes fails** — added 3-retry logic in `f0108bf`. If lullaby is silent, check Bark HF Space status.
- **Design quality is a recurring frustration** — Ameya has said "the design is shit" multiple times. He wants Pinterest-inspired, aesthetic, soothing, bright/colorful. NOT corporate. Use mode-themed images (Joe Rogan for motivation, etc.). Don't put images at the bottom of sections — only top.
- **Chat reloads on reopen** — was a bug. Fixed in `83100f3` (chat persists, doesn't reload).
- **Light mode tools grid** — text was invisible on light bg. Fixed in `eec19d5`.
- **Admin save** — had to write directly to `localStorage`, not via state.

---

## 6. API KEYS — DO NOT PUT IN CODE

Ameya shared these keys in chat (treat as compromised, **rotate before any public push**):
- **OpenAI** — `sk-proj-Qlfy...` (full key in dead chat history if needed)
- **Gemini** — 2 keys: `AIzaSy...CTMXDAW...`, `AIzaSy...DxoMYOn...`
- **ElevenLabs** — `1f4595...` style hex
- **Deepgram** — `cacc93e8...`
- **Sarvam AI** — Ameya has credits; key not yet pasted in dead chat

**Where to store:** `.env` file (gitignored) → load into Admin Dashboard → write to `localStorage`. NEVER hardcode. NEVER commit `.env`.

---

## 7. PRODUCT VISION (from `EVA-PRODUCT-BRIEF.md` + dead chat)

**Top 3 priorities for next phase (Ameya's roadmap):**
1. **Guided journeys** — multi-session therapy arcs, not just single chats
2. **Memory intelligence** — Eva remembers what user said in previous sessions, references it
3. **Voice expressiveness** — emotion, pacing, breath, sighs (not robotic)

**Other near-term wants:**
- Admin dashboard with full control (default voice, brain, memory, anything)
- Singing feature (Bark/HuggingFace) for lullaby
- Voice cloning so Eva can sound like a specific person (3 min audio sample)
- Scrape psychology research papers, textbooks for Eva's "brain"
- Cross-verify before answering (no hallucinations)
- Exit feedback collection ("what did you like / hate")

**Audience right now:** Just Ameya's friends testing. He needs to see ALL conversation data (privately) for iteration. Users are told verbally that conversations are recorded.

---

## 8. WORKING WITH AMEYA — COMMUNICATION STYLE

(Saved in user memory but worth restating here.)

- **Direct, casual, Hindi/English mix** — short messages, sometimes profanity, sometimes Hindi (`hang ho gaya`, `nahi hora yeh`, `bhej eva ki link`)
- **Wants premium feel everywhere** — design quality matters a LOT
- **Frustrated by friction** — wants bypass-permissions on, wants you to JUST DO IT, not ask
- **Iterative feedback in short bursts** — "bad colors", "this is shit", "do all", "no need"
- **Hates re-asking** — if he said something once, remember it
- **Don't be lazy** — "yes bitch do all, ASAP don't be lazy" is a real quote
- **Show, don't tell** — verify changes work via preview tools, don't just claim done

---

## 9. WORKTREES — IMPORTANT

The repo uses git worktrees under `.claude/worktrees/`. Multiple parallel sessions exist:
- `heuristic-lamarr` ← **the dead chat lived here** (1 modified file pending)
- `exciting-easley` ← currently active for handoff work
- `frosty-goldwasser`, `lucid-goodall`, `naughty-napier`, `relaxed-cohen`, `stupefied-euclid`, `zealous-banzai` ← other parallel agent projects

**Main branch** is `main`. Eva work merges there.

---

## 10. HOW TO RESUME — TL;DR FOR NEXT SESSION

```bash
cd /Users/apple/decision-tree-app
git status
git log --oneline -10
ls src/
cat EVA-PRODUCT-BRIEF.md
```

Then:
1. Check `~/.claude/projects/-Users-apple-decision-tree-app/memory/` for stored project memories
2. Pick up the last action: **add OpenAI key + commit pending changes + open PR**
3. After that, work on: guided journeys, memory intelligence, voice expressiveness (the top 3)

**Bypass permissions** were already enabled in Claude Code in the dead chat — keep them on, don't ask for approvals on Bash/Edit/Write.

---

## 11. DEAD CHAT LOCATION (for forensic reference)

`~/.claude/projects/-Users-apple-decision-tree-app--claude-worktrees-heuristic-lamarr/c00e79b5-2a14-4bcd-adfe-cd0bf763408f.jsonl`

42 MB, ~205 user messages, ~1160 assistant text responses. Contains every code edit, decision, and pivot from the entire Eva build. If this HANDOFF is missing something, grep that file.

---

*Generated 2026-04-08 from dead Claude Code session by reconstructing user messages, assistant decisions, and git history.*
