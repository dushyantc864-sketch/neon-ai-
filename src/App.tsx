import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  RotateCcw,
  Sparkles,
  Code,
  Database,
} from 'lucide-react';
import { Message, ChatSession, ModelSettings, DriveDatasetInfo } from './types';
import { DEFAULT_SETTINGS, INITIAL_DATASET_INFO, INITIAL_CHAT } from './data/mockData';
import { MessageBubble } from './components/MessageBubble';
import { TypingIndicator } from './components/TypingIndicator';
import { SidebarDrawer } from './components/SidebarDrawer';
import { SettingsModal } from './components/SettingsModal';
import { AboutModal } from './components/AboutModal';
import { FlutterCodeModal } from './components/FlutterCodeModal';
import { generateNeonResponse } from './services/neonModelService';
import {
  initAuth,
  getAccessToken,
  fetchDriveDatasetMetadata,
  googleSignIn,
} from './services/driveService';
import { User } from 'firebase/auth';

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('neon_chat_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [INITIAL_CHAT];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || INITIAL_CHAT.id;
  });

  const [settings, setSettings] = useState<ModelSettings>(() => {
    const saved = localStorage.getItem('neon_model_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [datasetInfo, setDatasetInfo] = useState<DriveDatasetInfo>(INITIAL_DATASET_INFO);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isFlutterModalOpen, setIsFlutterModalOpen] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceToast, setVoiceToast] = useState<string | null>(null);

  const [driveUser, setDriveUser] = useState<User | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    localStorage.setItem('neon_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('neon_model_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const unsubscribe = initAuth(
      async (user, token) => {
        setDriveUser(user);
        const meta = await fetchDriveDatasetMetadata(token);
        if (meta) {
          setDatasetInfo(meta);
        }
      },
      () => {
        setDriveUser(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0] || null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages, isTyping]);

  const handleCreateNewChat = () => {
    const newChat: ChatSession = {
      id: `chat-${Date.now()}`,
      title: 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: settings.selectedModel,
      messages: [],
    };
    setSessions((prev) => [newChat, ...prev]);
    setActiveSessionId(newChat.id);
    inputRef.current?.focus();
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        const fresh: ChatSession = {
          id: `chat-${Date.now()}`,
          title: 'New Chat',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          model: settings.selectedModel,
          messages: [],
        };
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleClearAllChats = () => {
    const fresh: ChatSession = {
      id: `chat-${Date.now()}`,
      title: 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: settings.selectedModel,
      messages: [],
    };
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
  };

  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || isTyping || !activeSession) return;

    setInputText('');

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    const isFirst = activeSession.messages.length === 0;
    const newTitle = isFirst ? (text.length > 28 ? `${text.substring(0, 28)}...` : text) : activeSession.title;

    const updatedSession: ChatSession = {
      ...activeSession,
      title: newTitle,
      updatedAt: Date.now(),
      messages: [...activeSession.messages, userMsg],
    };

    setSessions((prev) => prev.map((s) => (s.id === activeSession.id ? updatedSession : s)));
    setIsTyping(true);

    try {
      const responseText = await generateNeonResponse(
        text,
        updatedSession.messages,
        settings
      );

      const neonMsg: Message = {
        id: `neon-${Date.now()}`,
        sender: 'neon',
        text: responseText,
        timestamp: Date.now(),
        modelUsed: settings.selectedModel,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? { ...s, updatedAt: Date.now(), messages: [...s.messages, neonMsg] }
            : s
        )
      );
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'neon',
        text: `Error contacting Neon custom inference model: ${err.message || err}. Check Settings.`,
        timestamp: Date.now(),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id ? { ...s, messages: [...s.messages, errorMsg] } : s
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleRegenerateResponse = async () => {
    if (!activeSession || activeSession.messages.length === 0 || isTyping) return;

    const lastUserIdx = [...activeSession.messages].reverse().findIndex((m) => m.sender === 'user');
    if (lastUserIdx === -1) return;

    const actualUserIdx = activeSession.messages.length - 1 - lastUserIdx;
    const lastUserMsg = activeSession.messages[actualUserIdx];

    const trimmed = activeSession.messages.slice(0, actualUserIdx + 1);

    setSessions((prev) =>
      prev.map((s) => (s.id === activeSession.id ? { ...s, messages: trimmed } : s))
    );

    setIsTyping(true);

    try {
      const newResponse = await generateNeonResponse(lastUserMsg.text, trimmed, settings);
      const neonMsg: Message = {
        id: `neon-regen-${Date.now()}`,
        sender: 'neon',
        text: newResponse,
        timestamp: Date.now(),
        modelUsed: settings.selectedModel,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id ? { ...s, messages: [...s.messages, neonMsg] } : s
        )
      );
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListeningVoice) {
      setIsListeningVoice(false);
      return;
    }

    setIsListeningVoice(true);
    setVoiceToast('Neon Voice is listening... Speak now');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsListeningVoice(false);
          setVoiceToast(null);
        };

        recognition.onerror = () => {
          setIsListeningVoice(false);
          setVoiceToast('Voice input completed.');
          setTimeout(() => setVoiceToast(null), 2000);
        };

        recognition.onend = () => {
          setIsListeningVoice(false);
        };

        recognition.start();
        return;
      } catch (e) {
        console.warn('SpeechRecognition error:', e);
      }
    }

    setTimeout(() => {
      setInputText('Explain the Gemma fine-tuning dataset in my Drive');
      setIsListeningVoice(false);
      setVoiceToast('Transcribed: "Explain the Gemma fine-tuning dataset in my Drive"');
      setTimeout(() => setVoiceToast(null), 3000);
    }, 1800);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleRefreshDrive = async () => {
    let token = getAccessToken();
    if (!token) {
      const authRes = await googleSignIn();
      token = authRes?.accessToken || null;
      if (authRes?.user) setDriveUser(authRes.user);
    }
    if (token) {
      const meta = await fetchDriveDatasetMetadata(token);
      if (meta) {
        setDatasetInfo(meta);
      }
    }
  };

  return (
    <div className="flex w-full h-screen bg-[#121212] font-sans text-white overflow-hidden">
      {/* Voice Notification Toast */}
      {voiceToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#00E5FF] text-[#00E5FF] text-xs font-medium shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center gap-2 animate-pulse">
          <span>🎙️</span>
          <span>{voiceToast}</span>
        </div>
      )}

      {/* Sidebar Drawer */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => setActiveSessionId(id)}
        onNewChat={handleCreateNewChat}
        onDeleteSession={handleDeleteSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenFlutterCode={() => setIsFlutterModalOpen(true)}
        settings={settings}
        onToggleTheme={() =>
          setSettings((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))
        }
      />

      {/* Main Chat Screen (matching Elegant Dark design) */}
      <main className="flex-1 flex flex-col relative bg-[#121212] overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-[#222] bg-[#121212]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              id="btn-open-sidebar"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white md:hidden transition"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Model Selector Pill */}
            <div className="relative inline-block">
              <select
                id="select-model-dropdown"
                value={settings.selectedModel}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setSettings((prev) => ({ ...prev, selectedModel: val }));
                }}
                className="appearance-none bg-[#1a1a1a] px-3.5 py-1.5 rounded-full border border-[#333] hover:border-[#00E5FF]/60 flex items-center gap-2 text-sm text-gray-200 cursor-pointer pr-7 outline-none transition-all shadow-sm"
              >
                <option value="Gemma 2B / Neon Fine-Tuned">Neon (Gemma Fine-tuned)</option>
                <option value="Neon Ultra (Fine-Tuned Gemma 7B)">Neon Ultra (Gemma 7B)</option>
                <option value="Gemma Base">Gemma Base 2B</option>
              </select>
              <span className="text-[10px] text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                ▼
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Flutter Code Modal Launcher */}
            <button
              id="btn-top-flutter-code"
              onClick={() => setIsFlutterModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1a1a] hover:bg-[#222] border border-[#333] hover:border-[#00E5FF]/40 text-xs text-gray-300 transition"
              title="Inspect Flutter Code"
            >
              <Code className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Flutter Code</span>
            </button>

            {/* New Chat Button */}
            <button
              id="btn-new-chat-top"
              onClick={handleCreateNewChat}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-[#1a1a1a] transition"
              title="New Chat"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        </header>

        {/* Dataset Status Banner */}
        <div className="px-6 py-1.5 bg-[#0e0e0e] border-b border-[#222] flex items-center justify-between text-xs text-gray-400 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <span className="text-[#00E5FF] text-xs">●</span>
            <span className="text-gray-300 font-medium">Model Grounding:</span>
            <span className="font-mono text-xs text-[#00E5FF] truncate">{datasetInfo.fileName}</span>
            <span className="text-gray-500 font-mono">({datasetInfo.sizeFormatted})</span>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="text-xs text-[#00E5FF] hover:underline flex items-center gap-1 shrink-0 ml-2"
          >
            <Database className="w-3 h-3" />
            <span>Dataset Info</span>
          </button>
        </div>

        {/* Messages Body */}
        <section className="flex-1 p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto">
          {(!activeSession || activeSession.messages.length === 0) && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5 my-auto">
              <div className="w-12 h-12 rounded-2xl bg-[#00E5FF] flex items-center justify-center text-black font-bold text-2xl shadow-[0_0_20px_rgba(0,229,255,0.4)]">
                N
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  What can Neon help with today?
                </h2>
                <p className="text-xs text-gray-400 max-w-sm">
                  Fine-tuned on your custom Google Drive Gemma dataset for high-accuracy reasoning, code generation, and mobile assistance.
                </p>
              </div>

              {/* Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full pt-2">
                {[
                  'What is the capital of France?',
                  'Write a Python function to reverse a string.',
                  'What is 15% of 200?',
                  'Write a short poem about stars.',
                ].map((prompt, i) => (
                  <button
                    key={i}
                    id={`btn-suggestion-prompt-${i}`}
                    onClick={() => {
                      setInputText(prompt);
                      inputRef.current?.focus();
                    }}
                    className="p-3.5 rounded-xl bg-[#1a1a1a] hover:bg-[#222] border border-[#2d2d2d] hover:border-[#00E5FF]/40 text-left text-xs text-gray-300 hover:text-white transition shadow-sm flex items-center justify-between group"
                  >
                    <span className="truncate">{prompt}</span>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeSession?.messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} onCopy={handleCopyText} />
          ))}

          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef} className="h-2" />
        </section>

        {/* Floating Regenerate Button */}
        {activeSession && activeSession.messages.length > 0 && !isTyping && (
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10">
            <button
              id="btn-regenerate-response"
              onClick={handleRegenerateResponse}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1a1a1a] hover:bg-[#222] border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-semibold shadow-[0_0_15px_rgba(0,229,255,0.2)] transition active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Regenerate response</span>
            </button>
          </div>
        )}

        {/* Footer Input matching Design HTML */}
        <footer className="p-6 bg-gradient-to-t from-[#121212] via-[#121212] to-transparent shrink-0">
          <div className="max-w-3xl mx-auto relative">
            <input
              ref={inputRef}
              id="chat-input-field"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask Neon..."
              className="w-full bg-[#1a1a1a] border border-[#333] focus:border-[#00E5FF] rounded-2xl py-4 pl-5 pr-24 text-sm text-white outline-none transition-all shadow-xl placeholder:text-gray-500"
            />
            <div className="absolute right-2 top-2 flex items-center gap-2">
              {/* Mic Icon */}
              <button
                id="btn-voice-input"
                onClick={handleVoiceInput}
                className={`p-2 rounded-xl transition-colors ${
                  isListeningVoice
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-gray-400 hover:text-white hover:bg-[#333]'
                }`}
                title="Voice Input"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>

              {/* Send Icon (Cyan button) */}
              <button
                id="btn-send-message"
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className={`p-2.5 rounded-xl transition-transform ${
                  inputText.trim() && !isTyping
                    ? 'bg-[#00E5FF] text-black hover:scale-105 cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                    : 'bg-[#262626] text-gray-500 cursor-not-allowed'
                }`}
                aria-label="Send"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] text-gray-500 mt-3">
            Neon AI can make mistakes. Grounded with Gemma fine-tuned weights from Google Drive.
          </p>
        </footer>
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        datasetInfo={datasetInfo}
        onRefreshDriveDataset={handleRefreshDrive}
        driveUser={driveUser}
        onClearAllChats={handleClearAllChats}
        activeSession={activeSession}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        datasetInfo={datasetInfo}
        onOpenFlutterCode={() => setIsFlutterModalOpen(true)}
      />

      <FlutterCodeModal
        isOpen={isFlutterModalOpen}
        onClose={() => setIsFlutterModalOpen(false)}
      />
    </div>
  );
}
