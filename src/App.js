import React, { useState, useCallback, useEffect, useRef } from 'react';
import Avatar from './components/Avatar';
import ModeSelector from './components/ModeSelector';
import ChatInterface from './components/ChatInterface';
import VoiceControl from './components/VoiceControl';
import SettingsModal from './components/SettingsModal';
import ProfileSelector from './components/ProfileSelector';
import VoiceCloneModal from './components/VoiceCloneModal';
import WelcomeScreen from './components/WelcomeScreen';
import BreathingExercise from './components/BreathingExercise';
import MoodTracker from './components/MoodTracker';
import CustomModeCreator from './components/CustomModeCreator';
import GratitudeJournal from './components/GratitudeJournal';
import TimerModal from './components/TimerModal';
import StreakTracker, { recordVisit } from './components/StreakTracker';
import ChatSearch from './components/ChatSearch';
import { useToast } from './components/Toast';
import { useVoiceRecorder } from './hooks/useVoiceRecorder';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { getAIResponse } from './services/ai';
import { synthesizeSpeech, DEFAULT_VOICES, MODE_VOICE_MAP } from './services/elevenlabs';
import { speakWithClonedVoice } from './services/voiceClone';
import { fishTTS } from './services/fishAudio';
import { transcribeAudio } from './services/deepgram';
import { detectEmotionLocal } from './services/hume';
import creditManager from './services/creditManager';
import CreditLimitPopup from './components/CreditLimitPopup';
import AdminDashboard from './components/AdminDashboard';
import ProfileFullPage from './components/ProfileFullPage';
import FeedbackForm from './components/FeedbackForm';
import JourneyModal from './components/JourneyModal';
import './styles/profile.css';
import VoicePicker from './components/VoicePicker';
import Sidebar from './components/Sidebar';
import './styles/sidebar.css';
import { registerUser, updateUserSession, logConversation, logError } from './services/analytics';
import {
  getProfiles, saveProfile, deleteProfile,
  getActiveProfileId, setActiveProfileId,
  getChatHistory, saveChatHistory, clearChatHistory,
  getMemory, addMemory,
} from './services/storage';
import { MODES, DEFAULT_MODE } from './utils/modes';
import { exportChatAsText } from './utils/exportChat';
import './App.css';
import './styles/welcome.css';
import './styles/features.css';

const ENV_ELEVENLABS_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY || '';
const ENV_DEEPGRAM_KEY = process.env.REACT_APP_DEEPGRAM_API_KEY || '';
const ENV_GEMINI_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
const ENV_FISH_AUDIO_KEY = process.env.REACT_APP_FISH_AUDIO_API_KEY || '';

let messageId = Date.now(); // unique seed to avoid collisions

function App() {
  const [currentMode, setCurrentMode] = useState(MODES[DEFAULT_MODE]);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeakingState, setIsSpeakingState] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // prevent duplicate sends
  const [showSettings, setShowSettings] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [showCustomMode, setShowCustomMode] = useState(false);
  const [showGratitude, setShowGratitude] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timerType, setTimerType] = useState('meditation');
  const [showStreak, setShowStreak] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showJourney, setShowJourney] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [creditLimitType, setCreditLimitType] = useState('ai');
  const [creditStatus, setCreditStatus] = useState(creditManager.getStatus());
  const [showAdmin, setShowAdmin] = useState(false);
  const [onboardingEmail, setOnboardingEmail] = useState('');
  const [onboardingCompany, setOnboardingCompany] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingName, setOnboardingName] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [customModes, setCustomModes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('eva-custom-modes')) || {}; } catch { return {}; }
  });

  const audioRef = useRef(null);
  const messagesRef = useRef(messages); // avoid stale closure
  const toast = useToast();

  const [settings, setSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('eva-settings')) || {};
      return {
        geminiApiKey: saved.geminiApiKey || ENV_GEMINI_KEY,
        elevenLabsApiKey: saved.elevenLabsApiKey || ENV_ELEVENLABS_KEY,
        deepgramApiKey: saved.deepgramApiKey || ENV_DEEPGRAM_KEY,
        useElevenLabs: saved.useElevenLabs ?? !!ENV_ELEVENLABS_KEY,
        useDeepgram: saved.useDeepgram ?? !!ENV_DEEPGRAM_KEY,
        fishAudioApiKey: saved.fishAudioApiKey || ENV_FISH_AUDIO_KEY,
        autoSpeak: saved.autoSpeak ?? true,
        ...saved,
      };
    } catch { return { autoSpeak: true }; }
  });

  const { isRecording, duration, volume, startRecording, stopRecording } = useVoiceRecorder();
  const { isSpeaking: browserSpeaking, voices, selectedVoice, setSelectedVoice, speak: browserSpeak, stop: stopBrowserSpeaking } = useSpeechSynthesis();

  const isSpeaking = isSpeakingState || browserSpeaking;

  // Keep messagesRef in sync
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Record streak visit
  useEffect(() => { recordVisit(); }, []);

  // Subscribe to credit changes
  useEffect(() => {
    return creditManager.subscribe((status) => setCreditStatus(status));
  }, []);

  // Initialize profiles
  useEffect(() => {
    const existing = getProfiles();
    if (existing.length === 0) { setShowOnboarding(true); return; }
    setProfiles(existing);
    const activeId = getActiveProfileId();
    const active = existing.find((p) => p.id === activeId) || existing[0];
    setActiveProfile(active);
    if (active) {
      setActiveProfileId(active.id);
      updateUserSession(active.id);
    }
  }, []);

  // Load chat history
  useEffect(() => {
    if (activeProfile) {
      const history = getChatHistory(activeProfile.id, currentMode.id);
      setMessages(history);
      messageId = Date.now();
    }
  }, [activeProfile, currentMode]);

  // Persist settings
  useEffect(() => { localStorage.setItem('eva-settings', JSON.stringify(settings)); }, [settings]);

  // Persist messages (debounced)
  useEffect(() => {
    if (!activeProfile || messages.length === 0) return;
    const t = setTimeout(() => saveChatHistory(activeProfile.id, currentMode.id, messages), 500);
    return () => clearTimeout(t);
  }, [messages, activeProfile, currentMode]);

  // --- Helpers ---
  const addMessage = useCallback((role, content) => {
    const msg = { id: ++messageId, role, content, timestamp: Date.now() };
    setMessages((prev) => [...prev, msg]);
    return msg;
  }, []);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsSpeakingState(false);
    stopBrowserSpeaking();
    // Also stop typing/processing when user stops speaking
    setIsTyping(false);
    setIsProcessing(false);
  }, [stopBrowserSpeaking]);

  // --- TTS (Cascading: Fish Audio → Nymbo XTTS → ElevenLabs → Browser) ---
  const speakResponse = useCallback(async (text) => {
    const fishKey = settings.fishAudioApiKey;
    const fishModelId = settings.fishAudioModelId;
    const elKey = settings.elevenLabsApiKey;
    const voices = settings.clonedVoices || {};
    const clonedData = voices[currentMode.name] || voices['default'] || Object.values(voices).find(v => v?.type === 'hf');

    // 1. Fish Audio (best quality, has credits?)
    if (fishKey && fishModelId) {
      setIsSpeakingState(true);
      try {
        const audioUrl = await fishTTS(fishKey, text, fishModelId);
        if (audioUrl) {
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          audio.onended = () => setIsSpeakingState(false);
          audio.onerror = () => { setIsSpeakingState(false); browserSpeak(text, currentMode.id); };
          await audio.play();
          return;
        }
      } catch { /* fall through */ }
      setIsSpeakingState(false);
    }

    // 2. Nymbo XTTS voice clone (free, slow ~60s, needs saved voice sample)
    if (clonedData && typeof clonedData === 'object' && clonedData.type === 'hf') {
      // Don't block chat - try in background, use browser TTS immediately
      browserSpeak(text, currentMode.id);
      return;
    }

    // 3. ElevenLabs (paid, uses credits)
    if (settings.useElevenLabs && elKey && creditManager.canUse('tts')) {
      creditManager.use('tts');
      const voiceKey = MODE_VOICE_MAP[currentMode.id] || 'bella';
      const voiceId = DEFAULT_VOICES[voiceKey]?.id;
      if (voiceId) {
        setIsSpeakingState(true);
        try {
          const audioUrl = await synthesizeSpeech(text, elKey, voiceId);
          if (audioUrl) {
            const audio = new Audio(audioUrl);
            audioRef.current = audio;
            audio.onended = () => setIsSpeakingState(false);
            audio.onerror = () => { setIsSpeakingState(false); browserSpeak(text, currentMode.id); };
            await audio.play();
            return;
          }
        } catch { /* fall through */ }
        setIsSpeakingState(false);
      }
    }

    // 4. Browser TTS (always works, free, instant)
    browserSpeak(text, currentMode.id);
  }, [settings, currentMode, browserSpeak]);

  // --- AI Response ---
  const getEvaResponse = useCallback(async (userText, currentMessages) => {
    if (isProcessing) return;

    // Credit check for AI
    if (!creditManager.canUse('ai')) {
      setCreditLimitType('ai');
      setShowCreditPopup(true);
      return;
    }

    setIsProcessing(true);
    setIsTyping(true);
    creditManager.use('ai');

    try {
      const memories = activeProfile ? getMemory(activeProfile.id) : [];
      const { text: response, source } = await getAIResponse(
        currentMessages, currentMode, settings.geminiApiKey,
        { userName: activeProfile?.name, memories }
      );

      addMessage('assistant', response);

      // Log conversation for admin dashboard
      logConversation(activeProfile?.id, activeProfile?.name, currentMode.id, userText, response, source);

      if (source === 'offline') {
        toast.warning?.('Using offline responses - add API key in Settings');
      }

      if (activeProfile && settings.geminiApiKey) {
        extractMemories(userText, activeProfile.id);
      }

      // Emotion detection - suggest mode switch
      const { emotion, suggestedMode, confidence } = detectEmotionLocal(userText);
      if (suggestedMode && suggestedMode !== currentMode.id && confidence >= 0.7) {
        const modeName = (allModes[suggestedMode] || MODES[suggestedMode])?.name;
        if (modeName) {
          toast(`Feeling ${emotion.toLowerCase()}? Try ${modeName} mode`);
        }
      }

      if (settings.autoSpeak) speakResponse(response);
    } catch (err) {
      addMessage('assistant', "I'm having trouble thinking right now. Try again?");
      toast.error?.('AI response failed');
      logError(err, `getEvaResponse - mode: ${currentMode.id}`);
    } finally {
      setIsTyping(false);
      setIsProcessing(false);
    }
  }, [currentMode, settings, activeProfile, addMessage, speakResponse, isProcessing, toast]);

  const extractMemories = (text, profileId) => {
    if (!text || !profileId) return;
    const triggers = [
      { pattern: /my name is ([\w\s]+?)(?:\.|,|!|\?|$)/i, extract: (m) => `Name: ${m[1].trim()}` },
      { pattern: /i(?:'m| am) (\d+) years? old/i, extract: (m) => `Age: ${m[1]}` },
      { pattern: /i love ([\w\s]+?)(?:\.|,|!|\?|$)/i, extract: (m) => `Loves: ${m[1].trim()}` },
      { pattern: /i(?:'m| am) from ([\w\s]+?)(?:\.|,|!|\?|$)/i, extract: (m) => `From: ${m[1].trim()}` },
      { pattern: /i work (?:at|in|as) ([\w\s]+?)(?:\.|,|!|\?|$)/i, extract: (m) => `Work: ${m[1].trim()}` },
    ];
    for (const t of triggers) {
      const match = text.match(t.pattern);
      if (match?.[1]) addMemory(profileId, t.extract(match));
    }
  };

  // --- Send Text ---
  const handleSendText = useCallback((text) => {
    if (isProcessing || !text.trim()) return;

    // Check for UNLOCK password
    if (text.trim().toUpperCase() === 'UNLOCK') {
      const success = creditManager.tryUnlock('UNLOCK');
      if (success) {
        addMessage('user', text);
        addMessage('assistant', 'Unlimited access activated! All credit limits removed for this session. Enjoy!');
        toast.success?.('Unlimited access unlocked!');
      }
      return;
    }

    // Check for ADMIN command
    if (text.trim().toUpperCase() === 'ADMIN') {
      setShowAdmin(true);
      return;
    }

    // Check for LOCK command
    if (text.trim().toUpperCase() === 'LOCK') {
      creditManager.lock();
      addMessage('user', text);
      addMessage('assistant', 'Credits locked again. Free tier limits are back.');
      toast?.('Credits locked');
      return;
    }

    stopSpeaking();
    addMessage('user', text);
    const updated = [...messagesRef.current, { role: 'user', content: text }];
    getEvaResponse(text, updated);
  }, [addMessage, getEvaResponse, stopSpeaking, isProcessing]);

  // --- Voice Recording ---
  const handleStartRecording = useCallback(async () => {
    stopSpeaking();
    try { await startRecording(); }
    catch { toast.error?.('Microphone access denied. Check browser permissions.'); }
  }, [startRecording, stopSpeaking, toast]);

  const handleStopRecording = useCallback(async () => {
    const blob = await stopRecording();
    if (!blob) return;

    const dgKey = settings.deepgramApiKey;
    if (settings.useDeepgram && dgKey) {
      if (!creditManager.canUse('stt')) {
        setCreditLimitType('stt');
        setShowCreditPopup(true);
        return;
      }
      creditManager.use('stt');
      setIsTyping(true);
      const transcript = await transcribeAudio(blob, dgKey);
      setIsTyping(false);
      if (transcript?.trim()) {
        addMessage('user', transcript);
        const updated = [...messagesRef.current, { role: 'user', content: transcript }];
        getEvaResponse(transcript, updated);
      } else {
        toast.error?.('Could not transcribe audio. Try speaking louder or closer to mic.');
      }
    } else {
      toast.warning?.('Voice transcription needs Deepgram key. Using text input for now.');
    }
  }, [stopRecording, settings, addMessage, getEvaResponse, toast]);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (showWelcome || showOnboarding || showSettings) return;
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        if (isRecording) handleStopRecording();
        else handleStartRecording();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isRecording, handleStartRecording, handleStopRecording, showWelcome, showOnboarding, showSettings]);

  // --- Reactions ---
  const handleReaction = useCallback((msgId, emoji) => {
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, reaction: emoji } : m)));
  }, []);

  // --- Mode ---
  const handleModeChange = useCallback((mode) => {
    stopSpeaking();
    setCurrentMode(mode);
  }, [stopSpeaking]);

  // --- Settings ---
  const handleSaveSettings = useCallback((s) => setSettings((prev) => ({ ...prev, ...s })), []);

  // --- Profiles ---
  const handleCreateProfile = useCallback((name, email, company) => {
    const id = crypto.randomUUID();
    const p = { id, name, email, company };
    const updated = saveProfile(p);
    setProfiles(updated);
    const created = updated.find((x) => x.id === id);
    if (created) { setActiveProfile(created); setActiveProfileId(created.id); }
    // Register for analytics
    registerUser({ id, name, email, company });
    setShowOnboarding(false);
  }, []);

  const handleSelectProfile = useCallback((p) => { setActiveProfile(p); setActiveProfileId(p.id); }, []);

  const handleDeleteProfile = useCallback((id) => {
    const updated = deleteProfile(id);
    setProfiles(updated);
    if (activeProfile?.id === id) {
      const next = updated[0] || null;
      setActiveProfile(next);
      if (next) setActiveProfileId(next.id);
    }
  }, [activeProfile]);

  const handleClearChat = useCallback(() => {
    if (!activeProfile) return;
    clearChatHistory(activeProfile.id, currentMode.id);
    setMessages([]);
    toast.success?.('Chat cleared');
  }, [activeProfile, currentMode, toast]);

  const handleExportChat = useCallback(() => {
    if (messages.length === 0) { toast.warning?.('No messages to export'); return; }
    exportChatAsText(messages, currentMode.name, activeProfile?.name);
    toast.success?.('Chat exported');
  }, [messages, currentMode, activeProfile, toast]);

  const handleCreateCustomMode = useCallback((modeData) => {
    const updated = { ...customModes, [modeData.id]: modeData };
    setCustomModes(updated);
    localStorage.setItem('eva-custom-modes', JSON.stringify(updated));
    toast.success?.(`${modeData.name} mode created!`);
  }, [customModes, toast]);

  const handleVoiceCloned = useCallback((voiceId, name) => {
    setSettings((prev) => ({ ...prev, clonedVoices: { ...(prev.clonedVoices || {}), [name]: voiceId } }));
    toast.success?.(`Voice "${name}" cloned successfully!`);
  }, [toast]);

  // Merge modes
  const allModes = { ...MODES, ...customModes };

  // --- ONBOARDING ---
  if (showOnboarding) {
    return (
      <div className="eva-app" style={{ background: '#0d0d1a' }}>
        <div className="onboarding">
          <div className="onboarding-avatar">
            <div className="avatar-core" style={{ background: MODES.calm.gradient, boxShadow: `0 0 60px ${MODES.calm.glowColor}`, width: 120, height: 120, animationDuration: '3s' }}>
              <div className="avatar-face">
                <div className="avatar-eyes">
                  <div className="avatar-eye left" style={{ backgroundColor: MODES.calm.accentColor }}><div className="avatar-pupil" /></div>
                  <div className="avatar-eye right" style={{ backgroundColor: MODES.calm.accentColor }}><div className="avatar-pupil" /></div>
                </div>
                <div className="avatar-mouth" style={{ borderColor: MODES.calm.accentColor }} />
              </div>
            </div>
          </div>
          <h1 className="onboarding-title">Hey, I'm Eva</h1>
          <p className="onboarding-sub">Your personal companion. Tell me a bit about yourself.</p>
          <form className="onboarding-form" onSubmit={(e) => {
            e.preventDefault();
            if (onboardingName.trim()) handleCreateProfile(onboardingName.trim(), onboardingEmail.trim(), onboardingCompany.trim());
          }}>
            <input type="text" className="onboarding-input" placeholder="Your name *" value={onboardingName} onChange={(e) => setOnboardingName(e.target.value)} autoFocus />
            <input type="email" className="onboarding-input" placeholder="Email (optional)" value={onboardingEmail} onChange={(e) => setOnboardingEmail(e.target.value)} />
            <input type="text" className="onboarding-input" placeholder="Company / Work (optional)" value={onboardingCompany} onChange={(e) => setOnboardingCompany(e.target.value)} />
            <button type="submit" className="onboarding-btn" disabled={!onboardingName.trim()} style={{ backgroundColor: '#6c5ce7' }}>Let's Go</button>
          </form>
        </div>
      </div>
    );
  }

  // --- WELCOME ---
  // --- FULL PAGE PROFILE (check FIRST, before welcome) ---
  if (showProfile) {
    return <ProfileFullPage profile={activeProfile} mode={currentMode} settings={settings}
      onBack={() => setShowProfile(false)}
      onSaveSettings={handleSaveSettings} />;
  }

  if (showWelcome) {
    return (
      <>
        <WelcomeScreen userName={activeProfile?.name}
          onSelectMode={(id) => { setCurrentMode(allModes[id] || MODES[DEFAULT_MODE]); setShowWelcome(false); }}
          onSelectFeeling={(id) => { setCurrentMode(allModes[id] || MODES[DEFAULT_MODE]); setShowWelcome(false); }}
          onOpenSidebar={() => setShowSidebar(true)}
          onOpenProfile={() => setShowProfile(true)} />
        <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} mode={currentMode} settings={settings} lightMode={localStorage.getItem('eva-theme') === 'light'} />
      </>
    );
  }

  // --- MAIN CHAT ---
  return (
    <div className="eva-app" style={{ background: currentMode.gradient }}>
      <div className="bg-shapes">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="bg-shape" style={{ '--shape-color': currentMode.accentColor, '--delay': `${i * 3}s`, '--size': `${120 + i * 60}px`, '--x': `${15 + i * 20}%`, '--y': `${20 + (i % 2) * 30}%` }} />
        ))}
      </div>

      {/* Mode banner - image only at top */}
      {currentMode.bannerImage && (
        <div className="mode-banner" style={{ backgroundImage: `url(${currentMode.bannerImage})` }}>
          <div className="mode-banner-overlay" style={{ background: currentMode.gradient }} />
          <div className="mode-banner-content">
            <span className="mode-banner-emoji">{currentMode.emoji}</span>
            <div>
              <h2 className="mode-banner-name">{currentMode.name} Mode</h2>
              <p className="mode-banner-desc">{currentMode.description}</p>
            </div>
          </div>
        </div>
      )}

      <header className="eva-header">
        <div className="header-left">
          <button className="home-btn" onClick={() => setShowWelcome(true)} title="Home" style={{ color: currentMode.accentColor }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </button>
          <h1 className="eva-title" style={{ color: currentMode.accentColor }}>Eva</h1>
          <ProfileSelector profiles={profiles} activeProfile={activeProfile} onSelectProfile={handleSelectProfile} onCreateProfile={handleCreateProfile} onDeleteProfile={handleDeleteProfile} mode={currentMode} />
        </div>
        <div className="header-right">
          <div className={`credit-bar ${creditStatus.unlocked ? 'unlocked' : ''}`}
            onClick={() => setShowCreditPopup(true)} title="Credits">
            <span className={`credit-bar-dot ${creditStatus.unlocked ? 'green' : creditStatus.remaining.total > 10 ? 'green' : creditStatus.remaining.total > 3 ? 'yellow' : 'red'}`} />
            <span>{creditStatus.unlocked ? '\u221E' : creditStatus.remaining.total}</span>
          </div>
          <button className="toolbar-labeled" onClick={() => setShowSearch(true)}>
            <span>{'🔍'}</span><span className="toolbar-text">Search</span>
          </button>
          <button className="toolbar-labeled" onClick={() => setShowBreathing(true)}>
            <span>{'🫁'}</span><span className="toolbar-text">Breathe</span>
          </button>
          <button className="toolbar-labeled" onClick={() => { setTimerType('meditation'); setShowTimer(true); }}>
            <span>{'⏱️'}</span><span className="toolbar-text">Timer</span>
          </button>
          <button className="toolbar-labeled" onClick={() => setShowJourney(true)}>
            <span>{'🧭'}</span><span className="toolbar-text">Journey</span>
          </button>
          <button className="toolbar-labeled" onClick={() => setShowStreak(true)}>
            <span>{'🔥'}</span><span className="toolbar-text">Streak</span>
          </button>
          <VoicePicker voices={voices} selectedVoice={selectedVoice} onVoiceChange={setSelectedVoice} mode={currentMode} clonedVoices={settings.clonedVoices} />
          <button className="toolbar-labeled" onClick={() => setShowSidebar(true)}>
            <span>{'✨'}</span><span className="toolbar-text">Discover</span>
          </button>
          <ModeSelector currentMode={currentMode} onModeChange={handleModeChange} allModes={allModes} />
        </div>
      </header>

      {!settings.geminiApiKey && (
        <div className="status-bar warning">
          <span>{'⚠️'} Offline mode - </span>
          <button className="status-link" onClick={() => setShowSettings(true)} style={{ color: currentMode.accentColor }}>Add API key for real AI</button>
        </div>
      )}

      <main className="eva-main">
        <div className="avatar-section">
          <Avatar mode={currentMode} isListening={isRecording} isSpeaking={isSpeaking} volume={volume} />
        </div>
        <div className="chat-section">
          {isRecording && <div className="interim-transcript" style={{ color: currentMode.accentColor }}>{'🎙️'} Recording... speak now</div>}
          <ChatInterface messages={messages} mode={currentMode} isTyping={isTyping} onReact={handleReaction} onSendStarter={handleSendText} />
        </div>
      </main>

      <footer className="eva-footer">
        {isSpeaking && (
          <button className="stop-speaking-btn" onClick={stopSpeaking}
            style={{ backgroundColor: currentMode.accentColor }}>
            &#9724; Stop Speaking
          </button>
        )}
        <VoiceControl mode={currentMode} isRecording={isRecording} duration={duration}
          onStartRecording={handleStartRecording} onStopRecording={handleStopRecording}
          onSendText={handleSendText} sttSupported={true} />
      </footer>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} mode={currentMode} settings={settings} onSave={handleSaveSettings}
        voices={voices} selectedVoice={selectedVoice} onVoiceChange={setSelectedVoice}
        onOpenCloneModal={() => { setShowSettings(false); setShowCloneModal(true); }} />
      <VoiceCloneModal isOpen={showCloneModal} onClose={() => setShowCloneModal(false)} mode={currentMode} apiKey={settings.elevenLabsApiKey} onVoiceCloned={handleVoiceCloned} />
      <BreathingExercise isOpen={showBreathing} onClose={() => setShowBreathing(false)} mode={currentMode} />
      <MoodTracker isOpen={showMoodTracker} onClose={() => setShowMoodTracker(false)} mode={currentMode} />
      <CustomModeCreator isOpen={showCustomMode} onClose={() => setShowCustomMode(false)} onCreateMode={handleCreateCustomMode} />
      <GratitudeJournal isOpen={showGratitude} onClose={() => setShowGratitude(false)} mode={currentMode} />
      <TimerModal isOpen={showTimer} onClose={() => setShowTimer(false)} mode={currentMode} timerType={timerType} />
      <StreakTracker isOpen={showStreak} onClose={() => setShowStreak(false)} mode={currentMode} />
      <ChatSearch isOpen={showSearch} onClose={() => setShowSearch(false)} messages={messages} mode={currentMode} />
      <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} mode={currentMode} settings={settings}
        onOpenBreathing={() => setShowBreathing(true)}
        onOpenTimer={() => { setTimerType('meditation'); setShowTimer(true); }}
        onOpenMoodTracker={() => setShowMoodTracker(true)}
        onOpenGratitude={() => setShowGratitude(true)}
        onOpenStreak={() => setShowStreak(true)}
        onOpenSearch={() => setShowSearch(true)}
        onOpenProfile={() => setShowProfile(true)}
        onOpenFeedback={() => setShowFeedback(true)}
        onOpenCustomMode={() => setShowCustomMode(true)}
        onOpenSettings={() => setShowSettings(true)}
        onExportChat={handleExportChat}
      />
      <JourneyModal isOpen={showJourney} onClose={() => setShowJourney(false)} mode={currentMode}
        onOpenBreathing={() => { setShowJourney(false); setShowBreathing(true); }}
        onOpenTimer={() => { setShowJourney(false); setTimerType('meditation'); setShowTimer(true); }} />
      <FeedbackForm isOpen={showFeedback} onClose={() => setShowFeedback(false)} profile={activeProfile} mode={currentMode} />
      <AdminDashboard isOpen={showAdmin} onClose={() => setShowAdmin(false)}
        settings={settings} onSaveSettings={handleSaveSettings}
        onAddMemory={(profileId, fact) => { addMemory(profileId, fact); }}
        activeProfile={activeProfile} />
      <CreditLimitPopup isOpen={showCreditPopup} onClose={() => setShowCreditPopup(false)}
        creditStatus={creditStatus} type={creditLimitType}
        onUnlock={(pw) => creditManager.tryUnlock(pw)} />
    </div>
  );
}

export default App;
