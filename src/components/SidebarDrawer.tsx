import React from 'react';
import {
  Plus,
  Trash2,
  Settings,
  Info,
  MessageSquare,
  Sparkles,
  Smartphone,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { ChatSession, ModelSettings } from '../types';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onOpenFlutterCode: () => void;
  settings: ModelSettings;
  onToggleTheme: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onOpenSettings,
  onOpenAbout,
  onOpenFlutterCode,
  settings,
  onToggleTheme,
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          id="sidebar-drawer-backdrop"
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer Container */}
      <aside
        id="sidebar-drawer-container"
        className={`fixed md:static top-0 left-0 bottom-0 z-40 w-[280px] bg-[#080808] border-r border-[#222] flex flex-col transition-transform duration-300 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header */}
        <div className="p-6 flex items-center justify-between border-b border-[#1c1c1c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#00E5FF] flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.4)] shrink-0">
              <span className="text-black font-bold text-xl">N</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight text-white">Neon AI</span>
              <span className="text-[10px] text-[#00E5FF] uppercase tracking-widest font-semibold">
                Intelligent Companion
              </span>
            </div>
          </div>

          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg text-gray-400 hover:text-[#00E5FF] hover:bg-[#1a1a1a] transition"
            title="Toggle Theme"
          >
            {settings.theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>

        {/* Prominent "+ New Chat" Button */}
        <div className="px-4 py-4">
          <button
            id="btn-new-chat-sidebar"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-3 border border-[#333] hover:border-[#00E5FF] bg-[#121212] hover:bg-[#181818] px-4 py-3 rounded-xl text-sm font-medium transition-all group shadow-sm"
          >
            <span className="text-xl group-hover:text-[#00E5FF] text-[#00E5FF] transition-colors leading-none">+</span>
            <span className="text-white group-hover:text-white">New Chat</span>
          </button>
        </div>

        {/* Flutter Codebase Badge */}
        <div className="px-4 mb-2">
          <button
            id="btn-sidebar-flutter-code"
            onClick={() => {
              onOpenFlutterCode();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#141414] hover:bg-[#1a1a1a] border border-[#262626] hover:border-[#00E5FF]/50 text-xs transition group"
          >
            <span className="flex items-center gap-2 text-gray-300 group-hover:text-white">
              <Smartphone className="w-4 h-4 text-[#00E5FF]" />
              <span className="font-medium">Flutter Code (iOS/Android)</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#00E5FF] transition-colors" />
          </button>
        </div>

        {/* Chat History Header */}
        <div className="px-6 pt-2 pb-2">
          <h3 className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">
            Recent Chats
          </h3>
        </div>

        {/* Chat History List */}
        <div className="flex-1 px-4 overflow-y-auto space-y-1.5">
          {sessions.map((session) => {
            const isSelected = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                id={`chat-session-item-${session.id}`}
                className={`group p-3 rounded-lg text-sm flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#1a1a1a] border-l-2 border-[#00E5FF] text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a]'
                }`}
                onClick={() => {
                  onSelectSession(session.id);
                  onClose();
                }}
              >
                <div className="flex items-center gap-3 truncate flex-1 pr-2">
                  <span className={`text-base shrink-0 ${isSelected ? 'opacity-90' : 'opacity-50'}`}>💬</span>
                  <span className="truncate text-sm font-medium">{session.title}</span>
                </div>

                <button
                  id={`btn-delete-chat-${session.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-500 hover:text-red-400 hover:bg-[#252525] transition"
                  title="Delete Chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Dataset Reference Tag */}
        <div className="p-3 mx-4 my-2 rounded-xl bg-[#121212] border border-[#222] text-[11px] space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#00E5FF] font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Gemma Dataset</span>
            </span>
            <span className="font-mono text-[10px] text-gray-400">48.6 MB</span>
          </div>
          <p className="text-[10px] text-gray-500 truncate">
            My Drive &gt; Google AI Studio
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#222] space-y-1 bg-[#080808]">
          <div
            id="btn-sidebar-settings"
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1a1a1a] cursor-pointer text-sm text-gray-300 transition-colors"
          >
            <span className="text-lg">⚙️</span>
            <span className="font-medium">Settings</span>
          </div>

          <div
            id="btn-sidebar-about"
            onClick={() => {
              onOpenAbout();
              onClose();
            }}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1a1a1a] cursor-pointer text-sm text-gray-300 transition-colors"
          >
            <span className="text-lg">ℹ️</span>
            <span className="font-medium">About Neon</span>
          </div>
        </div>
      </aside>
    </>
  );
};
