import React, { useState, useCallback, useEffect, useRef } from 'react';
import Avatar from './components/Avatar';
import ModeSelector from './components/ModeSelector';
import ChatInterface from './components/ChatInterface';
import VoiceControl from './components/VoiceControl';
import SettingsModal from './components/SettingsModal';
import ProfileSelector from './components/ProfileSelector';
import VoiceCloneModal from './components/VoiceCloneModal';
import WelcomeScreen from './components/WelcomeScreen';
import { useVoiceRecorder } from './hooks/useVoiceRecorder';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { getAIResponse } from './services/ai';
import { synthesizeSpeech, DEFAULT_VOICES, MODE_VOICE_MAP } from './services/elevenlabs';
import { transcribeAudio } from './services/deepgram';
import {
  getProfiles, saveProfile, deleteProfile,
  getActiveProfileId, setActiveProfileId,
  getChatHistory, saveChatHistory, clearChatHistory,
  getMemory, addMemory,
} from './services/storage';
import { MODES, DEFAULT_MODE } from './utils/modes';
import './styles/welcome.css';
import './App.css';

// API keys from .env (fallback to settings/localStorage)
const ENV_ELEVENLABS_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY || '';
const ENV_DEEPGRAM_KEY = process.env.REACT_APP_DEEPGRAM_API_KEY || '';
const ENV_GEMINI_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';

let messageId = 0;

function App() {
  const [currentMode, setCurrentMode] = useState(MODES[DEFAULT_MODE]);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeakingState, setIsSpeakingState] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingName, setOnboardingName] = useState('');
  const audioRef = useRef(null);

  const [settings, setSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('eva-settings')) || {};
      return {
        ...saved,
        geminiApiKey: saved.geminiApiKey || ENV_GEMINI_KEY,
        elevenLabsApiKey: saved.elevenLabsApiKey || ENV_ELEVENLABS_KEY,
        deepgramApiKey: saved.deepgramApiKey || ENV_DEEPGRAM_KEY,
        useElevenLabs: saved.useElevenLabs ?? !!ENV_ELEVENLABS_KEY,
        useDeepgram: saved.useDeepgram ?? !!ENV_DEEPGRAM_KEY,
        autoSpeak: saved.autoSpeak ?? true,
      };
    } catch {
      return {
        geminiApiKey: ENV_GEMINI_KEY,
        elevenLabsApiKey: ENV_ELEVENLABS_KEY,
        deepgramApiKey: ENV_DEEPGRAM_KEY,
        useElevenLabs: !!ENV_ELEVENLABS_KEY,
        useDeepgram: !!ENV_DEEPGRAM_KEY,
        autoSpeak: true,
      };
    }
  });

  const {
    isRecording,
    duration,
    volume,
    startRecording,
    stopRecording,
  } = useVoiceRecorder();

  const {
    isSpeaking: browserSpeaking,
    voices,
    selectedVoice,
    setSelectedVoice,
    speak: browserSpeak,
    stop: stopBrowserSpeaking,
  } = useSpeechSynthesis();

  const isSpeaking = isSpeakingState || browserSpeaking;

  // Initialize profiles
  useEffect(() => {
    const existing = getProfiles();
    if (existing.length === 0) {
      setShowOnboarding(true);
    } else {
      setProfiles(existing);
      const activeId = getActiveProfileId();
      const active = existing.find((p) => p.id === activeId) || existing[0];
      setActiveProfile(active);
      setActiveProfileId(active.id);
    }
  }, []);

  // Load chat history when profile or mode changes
  useEffect(() => {
    if (activeProfile) {
      const history = getChatHistory(activeProfile.id, currentMode.id);
      setMessages(history);
      messageId = history.length;
    }
  }, [activeProfile, currentMode]);

  useEffect(() => {
    localStorage.setItem('eva-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (activeProfile && messages.length > 0) {
      saveChatHistory(activeProfile.id, currentMode.id, messages);
    }
  }, [messages, activeProfile, currentMode]);

  const addMessage = useCallback((role, content) => {
    const msg = { id: ++messageId, role, content, timestamp: Date.now() };
    setMessages((prev) => [...prev, msg]);
    return msg;
  }, []);

  // --- TTS: ElevenLabs (primary) or browser (fallback) ---
  const speakResponse = useCallback(async (text) => {
    const elKey = settings.elevenLabsApiKey;
    if (settings.useElevenLabs && elKey) {
      const voiceKey = MODE_VOICE_MAP[currentMode.id] || 'bella';
      const voiceId = DEFAULT_VOICES[voiceKey]?.id;
      if (voiceId) {
        setIsSpeakingState(true);
        const audioUrl = await synthesizeSpeech(text, elKey, voiceId);
        if (audioUrl) {
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          audio.onended = () => setIsSpeakingState(false);
          audio.onerror = () => {
            setIsSpeakingState(false);
            browserSpeak(text, currentMode.id); // fallback
          };
          audio.play().catch(() => {
            setIsSpeakingState(false);
            browserSpeak(text, currentMode.id);
          });
          return;
        }
      }
    }
    // Fallback to browser TTS
    browserSpeak(text, currentMode.id);
  }, [settings, currentMode, browserSpeak]);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeakingState(false);
    stopBrowserSpeaking();
  }, [stopBrowserSpeaking]);

  // --- AI Response ---
  const getEvaResponse = useCallback(async (userText, allMessages) => {
    setIsTyping(true);
    const messagesForAI = [...allMessages, { role: 'user', content: userText }];
    const memories = activeProfile ? getMemory(activeProfile.id) : [];

    const response = await getAIResponse(messagesForAI, currentMode, settings.geminiApiKey, {
      userName: activeProfile?.name,
      memories,
    });

    setIsTyping(false);
    addMessage('assistant', response);

    // Auto-extract memories
    if (settings.geminiApiKey && activeProfile) {
      extractAndSaveMemory(userText, activeProfile.id);
    }

    if (settings.autoSpeak) {
      speakResponse(response);
    }
  }, [currentMode, settings, addMessage, speakResponse, activeProfile]);

  const extractAndSaveMemory = (text, profileId) => {
    const memoryTriggers = [
      { pattern: /my name is (\w+)/i, extract: (m) => `User's name is ${m[1]}` },
      { pattern: /i(?:'m| am) (\d+) years? old/i, extract: (m) => `User is ${m[1]} years old` },
      { pattern: /i love (\w[\w\s]{2,20})/i, extract: (m) => `User loves ${m[1]}` },
      { pattern: /i(?:'m| am) from ([\w\s]+)/i, extract: (m) => `User is from ${m[1]}` },
      { pattern: /i work (?:at|in|as) ([\w\s]+)/i, extract: (m) => `User works as/at ${m[1]}` },
      { pattern: /my (?:favorite|fav) (\w+) is ([\w\s]+)/i, extract: (m) => `User's favorite ${m[1]} is ${m[2]}` },
    ];
    for (const trigger of memoryTriggers) {
      const match = text.match(trigger.pattern);
      if (match) addMemory(profileId, trigger.extract(match));
    }
  };

  // --- Send text message ---
  const handleSendText = useCallback((text) => {
    stopSpeaking();
    addMessage('user', text);
    getEvaResponse(text, messages);
  }, [addMessage, getEvaResponse, messages, stopSpeaking]);

  // --- Voice: Record -> Deepgram STT -> AI -> ElevenLabs TTS ---
  const handleStartRecording = useCallback(() => {
    stopSpeaking();
    startRecording();
  }, [startRecording, stopSpeaking]);

  const handleStopRecording = useCallback(async () => {
    const blob = await stopRecording();
    if (!blob) return;

    const dgKey = settings.deepgramApiKey;
    if (settings.useDeepgram && dgKey) {
      // Use Deepgram for transcription
      addMessage('user', '[Transcribing voice...]');
      const transcript = await transcribeAudio(blob, dgKey);
      if (transcript) {
        // Replace the placeholder message
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.content === '[Transcribing voice...]') {
            updated[lastIdx] = { ...updated[lastIdx], content: transcript };
          }
          return updated;
        });
        getEvaResponse(transcript, messages);
      } else {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.content === '[Transcribing voice...]') {
            updated[lastIdx] = { ...updated[lastIdx], content: '[Could not transcribe - try again]' };
          }
          return updated;
        });
      }
    } else {
      // Fallback: just note it was a voice message
      addMessage('user', '[Voice message - enable Deepgram for transcription]');
    }
  }, [stopRecording, settings, addMessage, getEvaResponse, messages]);

  // --- Reactions ---
  const handleReaction = useCallback((msgId, emoji) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, reaction: emoji } : m))
    );
  }, []);

  // --- Mode change ---
  const handleModeChange = useCallback((mode) => {
    stopSpeaking();
    setCurrentMode(mode);
  }, [stopSpeaking]);

  const handleSaveSettings = useCallback((newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // --- Profile management ---
  const handleCreateProfile = useCallback((name) => {
    const newProfile = { id: crypto.randomUUID(), name };
    const updated = saveProfile(newProfile);
    setProfiles(updated);
    const created = updated.find((p) => p.name === name);
    setActiveProfile(created);
    setActiveProfileId(created.id);
    setShowOnboarding(false);
  }, []);

  const handleSelectProfile = useCallback((profile) => {
    setActiveProfile(profile);
    setActiveProfileId(profile.id);
  }, []);

  const handleDeleteProfile = useCallback((profileId) => {
    const updated = deleteProfile(profileId);
    setProfiles(updated);
    if (activeProfile?.id === profileId) {
      const next = updated[0] || null;
      setActiveProfile(next);
      if (next) setActiveProfileId(next.id);
    }
  }, [activeProfile]);

  const handleClearChat = useCallback(() => {
    if (activeProfile) {
      clearChatHistory(activeProfile.id, currentMode.id);
      setMessages([]);
      messageId = 0;
    }
  }, [activeProfile, currentMode]);

  // --- Onboarding ---
  if (showOnboarding) {
    return (
      <div className="eva-app" style={{ background: MODES.calm.gradient }}>
        <div className="onboarding">
          <div className="onboarding-avatar">
            <div className="avatar-core" style={{
              background: MODES.calm.gradient,
              boxShadow: `0 0 60px ${MODES.calm.glowColor}`,
              width: 120, height: 120, animationDuration: '3s',
            }}>
              <div className="avatar-face">
                <div className="avatar-eyes">
                  <div className="avatar-eye left" style={{ backgroundColor: MODES.calm.accentColor }}>
                    <div className="avatar-pupil" />
                  </div>
                  <div className="avatar-eye right" style={{ backgroundColor: MODES.calm.accentColor }}>
                    <div className="avatar-pupil" />
                  </div>
                </div>
                <div className="avatar-mouth" style={{ borderColor: MODES.calm.accentColor }} />
              </div>
            </div>
          </div>
          <h1 className="onboarding-title">Hey, I'm Eva</h1>
          <p className="onboarding-sub">Your personal voice companion. What should I call you?</p>
          <form className="onboarding-form" onSubmit={(e) => {
            e.preventDefault();
            if (onboardingName.trim()) handleCreateProfile(onboardingName.trim());
          }}>
            <input type="text" className="onboarding-input" placeholder="Enter your name..."
              value={onboardingName} onChange={(e) => setOnboardingName(e.target.value)} autoFocus />
            <button type="submit" className="onboarding-btn" disabled={!onboardingName.trim()}
              style={{ backgroundColor: MODES.calm.accentColor }}>Let's Go</button>
          </form>
        </div>
      </div>
    );
  }

  // Show welcome screen
  if (showWelcome) {
    return (
      <WelcomeScreen
        userName={activeProfile?.name}
        onSelectMode={(modeId) => {
          setCurrentMode(MODES[modeId]);
          setShowWelcome(false);
        }}
        onSelectFeeling={(modeId) => {
          setCurrentMode(MODES[modeId]);
          setShowWelcome(false);
        }}
      />
    );
  }

  return (
    <div className="eva-app" style={{ background: currentMode.gradient }}>
      <div className="bg-shapes">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="bg-shape" style={{
            '--shape-color': currentMode.accentColor,
            '--delay': `${i * 2}s`, '--size': `${100 + i * 60}px`,
            '--x': `${10 + i * 15}%`, '--y': `${20 + (i % 3) * 25}%`,
          }} />
        ))}
      </div>

      <header className="eva-header">
        <div className="header-left">
          <button className="home-btn" onClick={() => setShowWelcome(true)} title="Home"
            style={{ color: currentMode.accentColor }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </button>
          <h1 className="eva-title" style={{ color: currentMode.accentColor }}>Eva</h1>
          <ProfileSelector profiles={profiles} activeProfile={activeProfile}
            onSelectProfile={handleSelectProfile} onCreateProfile={handleCreateProfile}
            onDeleteProfile={handleDeleteProfile} mode={currentMode} />
        </div>
        <div className="header-right">
          <button className="clear-chat-btn" onClick={handleClearChat} title="Clear chat"
            style={{ color: currentMode.accentColor }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
            </svg>
          </button>
          <button className="settings-btn" onClick={() => setShowSettings(true)} title="Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          <ModeSelector currentMode={currentMode} onModeChange={handleModeChange} />
        </div>
      </header>

      {!settings.geminiApiKey && (
        <div className="status-bar">
          <span>Offline mode - </span>
          <button className="status-link" onClick={() => setShowSettings(true)}
            style={{ color: currentMode.accentColor }}>
            Add free Gemini API key for real AI
          </button>
        </div>
      )}

      <main className="eva-main">
        <div className="avatar-section">
          <Avatar mode={currentMode} isListening={isRecording} isSpeaking={isSpeaking} volume={volume} />
        </div>
        <div className="chat-section">
          {isRecording && (
            <div className="interim-transcript" style={{ color: currentMode.accentColor }}>
              Recording... speak now
            </div>
          )}
          <ChatInterface messages={messages} mode={currentMode} isTyping={isTyping} onReact={handleReaction} />
        </div>
      </main>

      <footer className="eva-footer">
        <VoiceControl mode={currentMode} isRecording={isRecording} duration={duration}
          onStartRecording={handleStartRecording} onStopRecording={handleStopRecording}
          onSendText={handleSendText} sttSupported={true} />
      </footer>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)}
        mode={currentMode} settings={settings} onSave={handleSaveSettings}
        voices={voices} selectedVoice={selectedVoice} onVoiceChange={setSelectedVoice}
        onOpenCloneModal={() => { setShowSettings(false); setShowCloneModal(true); }} />

      <VoiceCloneModal isOpen={showCloneModal} onClose={() => setShowCloneModal(false)}
        mode={currentMode} apiKey={settings.elevenLabsApiKey}
        onVoiceCloned={(voiceId, name) => console.log('Cloned:', name, voiceId)} />
    </div>
  );
}

export default App;
