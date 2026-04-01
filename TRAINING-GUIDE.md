# How to Train Eva's Brain for Different Personalities

## The Simple Truth

You DON'T need to "train" a model from scratch. That costs millions. Instead, you control Eva's personality through **system prompts** — instructions that tell the AI how to behave BEFORE the user speaks.

---

## Method 1: Edit System Prompts (Free, Instant)

This is what Eva already uses. Each mode has a `systemPrompt` in `src/utils/modes.js`.

### Example — Current Calm Mode:
```
You are Eva, a calm and peaceful companion. Speak softly and gently.
Use soothing language, encourage deep breathing, and create a sense
of safety and tranquility.
```

### How to Make It Better:
The more detailed your prompt, the better the personality. Here's a pro-level prompt:

```
You are Eva in calm mode. Your core traits:
- VOICE: Speak slowly, use short sentences, lots of pauses (...)
- TONE: Warm like a blanket, gentle like rain on a window
- NEVER: Raise urgency, use exclamation marks, rush the user
- ALWAYS: Validate feelings first, suggest breathing, use nature metaphors
- STYLE: "I hear you..." "Let's slow down..." "You're safe here..."
- WHEN USER IS UPSET: Don't try to fix. Just listen. Reflect back what they said.
- WHEN USER IS QUIET: Offer a gentle prompt, never pressure
- PERSONALITY: Think of a wise yoga instructor mixed with a loving grandmother
- CULTURAL: Be aware of Indian culture, festivals, family values when relevant
- LENGTH: Keep responses under 3 sentences unless telling a story
```

### Where to Edit:
File: `src/utils/modes.js` — edit the `systemPrompt` field for any mode.

---

## Method 2: Create Custom Modes (In-App, No Code)

Users can create modes in the app:
1. Open Eva → chat view → tap ✏️ (pencil icon)
2. Name the mode
3. Write the personality description
4. Pick colors and gradient
5. Save — it appears in the mode dropdown

### Pro Tips for Writing Personalities:
- Be SPECIFIC about tone ("speak like a whisper" vs "be calm")
- Give EXAMPLES of phrases Eva should use
- Define what she should NEVER do
- Reference real people for style ("like Oprah giving advice")
- Include cultural context if relevant

---

## Method 3: Fine-Tuning (Advanced, Costs Money)

If you want Eva to have a truly unique voice that no prompt can replicate:

### Option A: OpenAI Fine-Tuning ($$$)
1. Collect 100-500 example conversations (user message + ideal Eva response)
2. Format them as JSONL:
   ```json
   {"messages": [
     {"role": "system", "content": "You are Eva in calm mode..."},
     {"role": "user", "content": "I'm feeling anxious today"},
     {"role": "assistant", "content": "Hey... take a breath with me. In... and out. Whatever is weighing on you, we'll work through it together. You're not alone in this."}
   ]}
   ```
3. Upload to OpenAI → Fine-tune → Get a custom model ID
4. Replace the model in `src/services/ai.js`

**Cost:** ~$25-50 for 500 examples
**Result:** Eva responds in YOUR style, not generic AI style

### Option B: Google Gemini Tuning (Cheaper)
1. Same process but through Google AI Studio
2. Use Gemini's tuning interface
3. Upload examples → tune → get tuned model endpoint
4. Swap the endpoint in ai.js

**Cost:** ~$5-15

### Option C: Open Source Model (Free, but needs server)
1. Use Llama 3, Mistral, or Phi-3 (free models)
2. Fine-tune with your data using LoRA (low-rank adaptation)
3. Host on Hugging Face or your own server
4. Point Eva's AI service to your model

**Cost:** Free for model, $5-20/mo for hosting
**Skill needed:** Python, basic ML knowledge

---

## Method 4: Feedback Loop (Best Long-Term Strategy)

This is how you ACTUALLY build a great personality over time:

### Step 1: Collect Data
You already have this! The admin dashboard logs every conversation.
- Go to Supabase → `conversations` table
- Or type `ADMIN` in Eva chat

### Step 2: Find Bad Responses
Look for conversations where:
- Eva's response was generic or unhelpful
- User seemed frustrated or disengaged
- Eva missed the emotional context

### Step 3: Write Better Responses
For each bad response, write what Eva SHOULD have said.

### Step 4: Update System Prompts
Add patterns to the system prompt:
```
When user says something like "nothing helps anymore":
- DON'T say "I understand" (too generic)
- DO say something like "I hear the exhaustion in that. You've been trying so hard, and that takes real strength. Can you tell me what you've tried?"
```

### Step 5: Repeat
Every week, review 10-20 conversations, improve prompts. Eva gets better over time.

---

## Method 5: Persona Files (Intermediate)

Create detailed persona documents and include them in the system prompt:

```javascript
const DAVID_GOGGINS_PERSONA = `
You are Eva channeling David Goggins energy.

RULES:
- Call the user "warrior" or by their name
- Reference overcoming impossible odds
- Use military/athletic metaphors
- Be brutally honest but caring underneath
- Push them to do ONE thing right now, not just talk
- If they make excuses, call it out lovingly
- End every response with a challenge or action item

PHRASES TO USE:
- "Stay hard!"
- "Who's gonna carry the boats?"
- "You're capable of 40x more than you think"
- "Pain is your friend. Lean into it."

PHRASES TO AVOID:
- "It's okay to rest" (in motivation mode, no)
- "Take your time" (no, urgency is the point)
- "Don't be too hard on yourself" (the opposite)
`;
```

---

## Quick Start: Improve Eva in 10 Minutes

1. Open `src/utils/modes.js`
2. Pick ONE mode to improve (start with the one you use most)
3. Expand the `systemPrompt` to 10-15 lines (currently they're only 3-4)
4. Add specific phrases Eva should/shouldn't use
5. Add cultural context relevant to your users
6. Save → rebuild → redeploy

That's it. No ML knowledge needed. No money spent.

---

## Summary

| Method | Cost | Skill Needed | Quality |
|--------|------|-------------|---------|
| Better system prompts | Free | Writing | Good |
| Custom modes (in-app) | Free | None | Good |
| OpenAI fine-tuning | $25-50 | Basic | Great |
| Open source model | $5-20/mo | Python/ML | Excellent |
| Feedback loop | Free | Time | Best over time |
