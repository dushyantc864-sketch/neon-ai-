import React, { useState } from 'react';
import {
  Key,
  Sliders,
  Database,
  Trash2,
  Download,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  FolderSync,
  HelpCircle,
  Code,
} from 'lucide-react';
import { ModelSettings, DriveDatasetInfo, ChatSession } from '../types';
import { NEON_FINETUNE_DATASET, GEMMA_FINETUNE_PYTHON_SCRIPT } from '../data/mockData';
import { googleSignIn, logOutGoogle } from '../services/driveService';
import { User } from 'firebase/auth';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ModelSettings;
  onUpdateSettings: (newSettings: ModelSettings) => void;
  datasetInfo: DriveDatasetInfo;
  onRefreshDriveDataset: () => Promise<void>;
  driveUser: User | null;
  onClearAllChats: () => void;
  activeSession: ChatSession | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  datasetInfo,
  onRefreshDriveDataset,
  driveUser,
  onClearAllChats,
  activeSession,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const handleExportChat = () => {
    if (!activeSession) return;
    let exportText = `=====================================================\n`;
    exportText += `NEON AI CONVERSATION EXPORT\n`;
    exportText += `Title: ${activeSession.title}\n`;
    exportText += `Model: ${activeSession.model}\n`;
    exportText += `Exported: ${new Date().toLocaleString()}\n`;
    exportText += `Assistant: Neon (Your Intelligent Companion)\n`;
    exportText += `Gemma Dataset: ${settings.datasetFileName}\n`;
    exportText += `=====================================================\n\n`;

    activeSession.messages.forEach((msg, idx) => {
      const time = new Date(msg.timestamp).toLocaleTimeString();
      const sender = msg.sender === 'user' ? 'YOU' : 'NEON AI';
      exportText += `[${idx + 1}] [${sender} - ${time}]:\n${msg.text}\n\n`;
    });

    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `neon_chat_${activeSession.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualSync = async () => {
    setIsSyncingDrive(true);
    try {
      if (!driveUser) {
        await googleSignIn();
      }
      await onRefreshDriveDataset();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncingDrive(false);
    }
  };

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        id="settings-modal-content"
        className="relative w-full max-w-xl max-h-[90vh] bg-[#141820] border border-cyan-500/30 rounded-2xl shadow-[0_0_40px_rgba(0,229,255,0.2)] flex flex-col overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-[#0f131a]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Neon AI Settings</h2>
              <p className="text-xs text-slate-400">Model hyperparameters & Google Drive dataset grounding</p>
            </div>
          </div>
          <button
            id="btn-close-settings"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Settings Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Model API Key & Endpoint */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5" />
                <span>Neon Model API Connection</span>
              </label>
              <span className="text-[10px] text-slate-400">Gemma Fine-Tuned Backend</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0b0e14] border border-cyan-500/20 space-y-3">
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">
                  API Key (to connect Neon custom model)
                </label>
                <input
                  id="input-api-key"
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => onUpdateSettings({ ...settings, apiKey: e.target.value })}
                  placeholder="Enter custom model API key (e.g. sk-neon-gemma-...)"
                  className="w-full px-3 py-2 rounded-lg bg-[#181d26] border border-cyan-500/20 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">
                  Custom Inference Endpoint (Optional)
                </label>
                <input
                  id="input-custom-endpoint"
                  type="text"
                  value={settings.customEndpoint}
                  onChange={(e) => onUpdateSettings({ ...settings, customEndpoint: e.target.value })}
                  placeholder="https://your-neon-gemma-server.run.app/v1/chat/completions"
                  className="w-full px-3 py-2 rounded-lg bg-[#181d26] border border-cyan-500/20 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Temperature & Max Tokens */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Inference Parameters</span>
            </label>

            <div className="p-4 rounded-xl bg-[#0b0e14] border border-cyan-500/20 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-300 font-medium">Temperature</span>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {settings.temperature.toFixed(2)}
                  </span>
                </div>
                <input
                  id="slider-temperature"
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={settings.temperature}
                  onChange={(e) => onUpdateSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>0.0 (Precise/Deterministic)</span>
                  <span>1.0 (Creative/Fluid)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-cyan-500/10 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-300 font-medium block">Max Tokens</span>
                  <span className="text-[10px] text-slate-400">Maximum response length generation</span>
                </div>
                <input
                  id="input-max-tokens"
                  type="number"
                  min="256"
                  max="8192"
                  step="256"
                  value={settings.maxTokens}
                  onChange={(e) => onUpdateSettings({ ...settings, maxTokens: parseInt(e.target.value) || 2048 })}
                  className="w-24 px-2.5 py-1.5 rounded-lg bg-[#181d26] border border-cyan-500/20 text-cyan-300 font-mono text-xs text-right focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Dataset Used (Google Drive Reference) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>Dataset Used (Google Drive)</span>
              </label>
              <button
                id="btn-sync-drive"
                onClick={handleManualSync}
                disabled={isSyncingDrive}
                className="flex items-center space-x-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncingDrive ? 'animate-spin' : ''}`} />
                <span>{driveUser ? 'Sync Drive Metadata' : 'Connect Google Drive'}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-b from-[#0e1622] to-[#0a0f16] border border-cyan-500/40 shadow-[0_0_20px_rgba(0,229,255,0.08)] space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-cyan-300">
                      {datasetInfo.fileName}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                      Parquet
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Location:{' '}
                    <span className="text-slate-200 font-mono text-[11px]">
                      {datasetInfo.folder}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-semibold text-cyan-400">
                    {datasetInfo.sizeFormatted}
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center justify-end space-x-1 mt-0.5">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified Dataset</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-[#121824]/80 p-2.5 rounded-lg border border-cyan-500/20">
                {datasetInfo.summary}
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-400">
                <div>
                  Target Architecture:{' '}
                  <span className="text-slate-200 block font-medium">Gemma 2B/7B Instruct</span>
                </div>
                <div>
                  Tuning Method:{' '}
                  <span className="text-slate-200 block font-medium">LoRA / SFT Records</span>
                </div>
              </div>

              {/* Fine-Tuning JSON Instruction Records */}
              <div className="pt-2 border-t border-cyan-500/15 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-cyan-300">
                    Instruction Dataset Records ({NEON_FINETUNE_DATASET.length} examples)
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(NEON_FINETUNE_DATASET, null, 2));
                      alert('Fine-tuning dataset copied to clipboard!');
                    }}
                    className="text-[10px] px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition flex items-center gap-1 font-mono"
                  >
                    <Download className="w-3 h-3" />
                    <span>Copy JSON</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-[#080b10] border border-cyan-500/20 font-mono text-[10px] text-cyan-300/90 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
                  {JSON.stringify(NEON_FINETUNE_DATASET, null, 2)}
                </div>
              </div>

              {/* Gemma 4 Fine-Tuning Python Pipeline Code */}
              <div className="pt-2 border-t border-cyan-500/15 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-cyan-300">
                    Gemma 4 Fine-Tuning Script (Python)
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(GEMMA_FINETUNE_PYTHON_SCRIPT);
                      alert('Gemma 4 fine-tuning Python script copied to clipboard!');
                    }}
                    className="text-[10px] px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition flex items-center gap-1 font-mono"
                  >
                    <Code className="w-3 h-3" />
                    <span>Copy Python</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-[#080b10] border border-cyan-500/20 font-mono text-[10px] text-cyan-300/90 max-h-36 overflow-y-auto whitespace-pre leading-relaxed select-all">
                  {GEMMA_FINETUNE_PYTHON_SCRIPT}
                </pre>
              </div>

              {driveUser ? (
                <div className="flex items-center justify-between pt-2 border-t border-cyan-500/15 text-xs text-slate-400">
                  <span className="truncate">Connected as {driveUser.email}</span>
                  <button
                    onClick={logOutGoogle}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Disconnect
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* Section 4: Chat Management Actions */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Chat Management</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                id="btn-export-chat-txt"
                onClick={handleExportChat}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#181d26] hover:bg-[#202734] border border-cyan-500/30 text-xs font-semibold text-cyan-300 transition shadow-[0_0_15px_rgba(0,229,255,0.1)]"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Exported!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Export Chat as .txt</span>
                  </>
                )}
              </button>

              {!showClearConfirm ? (
                <button
                  id="btn-clear-all-chats"
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 text-xs font-semibold text-rose-300 transition"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Clear All Chats</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    id="btn-confirm-clear"
                    onClick={() => {
                      onClearAllChats();
                      setShowClearConfirm(false);
                    }}
                    className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-cyan-500/20 bg-[#0f131a] flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">Neon Model: Gemma Fine-Tune</span>
          <button
            id="btn-save-settings"
            onClick={onClose}
            className="px-5 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-xs transition shadow-[0_0_15px_rgba(0,229,255,0.4)]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
