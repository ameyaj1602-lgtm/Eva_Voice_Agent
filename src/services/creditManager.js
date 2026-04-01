// Credit Manager - Controls API usage across all services
// Tracks per-session and per-day usage to minimize costs

const UNLOCK_PASSWORD = 'UNLOCK';

const LIMITS = {
  free: {
    aiCalls: 10,         // Gemini/OpenAI calls per session
    ttsCalls: 5,         // ElevenLabs TTS per session
    sttCalls: 5,         // Deepgram STT per session
    totalCalls: 20,      // Total API calls per session
    dailyAiCalls: 30,    // AI calls per day
    dailyTtsCalls: 15,   // TTS per day
  },
  unlimited: {
    aiCalls: Infinity,
    ttsCalls: Infinity,
    sttCalls: Infinity,
    totalCalls: Infinity,
    dailyAiCalls: Infinity,
    dailyTtsCalls: Infinity,
  },
};

class CreditManager {
  constructor() {
    this.session = { ai: 0, tts: 0, stt: 0, total: 0 };
    this.unlocked = false;
    this.listeners = new Set();

    // Load daily usage from localStorage
    const today = new Date().toDateString();
    try {
      const saved = JSON.parse(localStorage.getItem('eva-daily-usage'));
      if (saved?.date === today) {
        this.daily = saved;
      } else {
        this.daily = { date: today, ai: 0, tts: 0 };
      }
    } catch {
      this.daily = { date: today, ai: 0, tts: 0 };
    }
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  _notify() {
    this.listeners.forEach((fn) => fn(this.getStatus()));
  }

  _saveDaily() {
    localStorage.setItem('eva-daily-usage', JSON.stringify(this.daily));
  }

  // Check if password unlocks unlimited
  tryUnlock(password) {
    if (password === UNLOCK_PASSWORD) {
      this.unlocked = true;
      this._notify();
      return true;
    }
    return false;
  }

  lock() {
    this.unlocked = false;
    this._notify();
  }

  isUnlocked() {
    return this.unlocked;
  }

  getLimits() {
    return this.unlocked ? LIMITS.unlimited : LIMITS.free;
  }

  // Check if a specific call type is allowed
  canUse(type) {
    if (this.unlocked) return true;
    const limits = LIMITS.free;

    switch (type) {
      case 'ai':
        return this.session.ai < limits.aiCalls &&
               this.daily.ai < limits.dailyAiCalls &&
               this.session.total < limits.totalCalls;
      case 'tts':
        return this.session.tts < limits.ttsCalls &&
               this.daily.tts < limits.dailyTtsCalls &&
               this.session.total < limits.totalCalls;
      case 'stt':
        return this.session.stt < limits.sttCalls &&
               this.session.total < limits.totalCalls;
      default:
        return this.session.total < limits.totalCalls;
    }
  }

  // Record a usage
  use(type) {
    this.session[type] = (this.session[type] || 0) + 1;
    this.session.total += 1;

    if (type === 'ai') this.daily.ai += 1;
    if (type === 'tts') this.daily.tts += 1;
    this._saveDaily();
    this._notify();
  }

  // Get remaining credits
  getRemaining(type) {
    if (this.unlocked) return Infinity;
    const limits = LIMITS.free;
    switch (type) {
      case 'ai': return Math.max(0, limits.aiCalls - this.session.ai);
      case 'tts': return Math.max(0, limits.ttsCalls - this.session.tts);
      case 'stt': return Math.max(0, limits.sttCalls - this.session.stt);
      case 'total': return Math.max(0, limits.totalCalls - this.session.total);
      default: return 0;
    }
  }

  // Full status object
  getStatus() {
    const limits = this.getLimits();
    return {
      unlocked: this.unlocked,
      session: { ...this.session },
      daily: { ...this.daily },
      remaining: {
        ai: this.unlocked ? '∞' : Math.max(0, limits.aiCalls - this.session.ai),
        tts: this.unlocked ? '∞' : Math.max(0, limits.ttsCalls - this.session.tts),
        stt: this.unlocked ? '∞' : Math.max(0, limits.sttCalls - this.session.stt),
        total: this.unlocked ? '∞' : Math.max(0, limits.totalCalls - this.session.total),
      },
      limits: {
        ai: limits.aiCalls === Infinity ? '∞' : limits.aiCalls,
        tts: limits.ttsCalls === Infinity ? '∞' : limits.ttsCalls,
        stt: limits.sttCalls === Infinity ? '∞' : limits.sttCalls,
        total: limits.totalCalls === Infinity ? '∞' : limits.totalCalls,
      },
    };
  }

  // Reset session (e.g., on page refresh)
  resetSession() {
    this.session = { ai: 0, tts: 0, stt: 0, total: 0 };
    this._notify();
  }
}

// Singleton
const creditManager = new CreditManager();
export default creditManager;
