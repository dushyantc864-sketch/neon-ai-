import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  Download,
  FolderTree,
  FileCode,
  Smartphone,
  Terminal,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { FLUTTER_FILES } from '../data/flutterProjectData';

export const FlutterCodeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [selectedKey, setSelectedKey] = useState<string>('chatScreen');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentFile = FLUTTER_FILES[selectedKey] || FLUTTER_FILES.chatScreen;

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.split('/').pop() || 'file.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllZipNotice = () => {
    // Combine all files into a single bundle text file
    let fullBundle = `// NEON AI FLUTTER PROJECT CODEBASE ARCHIVE\n// Generated for Dushyant Chauhan\n// Assistant Name: Neon | Model: Gemma Fine-Tuned (Google Drive Dataset)\n\n`;
    Object.values(FLUTTER_FILES).forEach(f => {
      fullBundle += `\n/* ========================================================================\n   FILE: ${f.path}\n   DESCRIPTION: ${f.description}\n   ======================================================================== */\n\n${f.code}\n\n`;
    });
    handleDownloadFile('neon_ai_complete_flutter_project.txt', fullBundle);
  };

  return (
    <div
      id="flutter-code-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        id="flutter-code-modal-content"
        className="relative w-full max-w-5xl h-[88vh] bg-[#12161c] border border-[#00E5FF]/40 rounded-2xl shadow-[0_0_50px_rgba(0,229,255,0.25)] flex flex-col overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-[#0d1117]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 p-[2px] shadow-[0_0_15px_rgba(0,229,255,0.4)]">
              <div className="w-full h-full bg-[#121212] rounded-[10px] flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-cyan-400 tracking-wide">
                  Complete Flutter (iOS & Android) Codebase
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  Production Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dart & Flutter source code with Provider, Hive, Google Drive dataset sync & Neon model API
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              id="btn-download-all-code"
              onClick={handleDownloadAllZipNotice}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition shadow-[0_0_15px_rgba(0,229,255,0.3)]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download All (.txt)</span>
            </button>
            <button
              id="btn-close-code-modal"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body: Sidebar File Explorer + Code Editor */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Explorer Sidebar */}
          <div className="w-64 border-r border-cyan-500/20 bg-[#0f141c] flex flex-col">
            <div className="p-3 border-b border-cyan-500/10 flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                <FolderTree className="w-3.5 h-3.5" />
                <span>Project Files</span>
              </span>
              <span className="text-[10px] text-slate-500">8 Files</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {Object.entries(FLUTTER_FILES).map(([key, file]) => {
                const isSelected = selectedKey === key;
                return (
                  <button
                    key={key}
                    id={`file-item-${key}`}
                    onClick={() => setSelectedKey(key)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition flex items-center space-x-2 ${
                      isSelected
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,229,255,0.15)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="truncate">{file.path}</span>
                  </button>
                );
              })}
            </div>

            {/* Google Drive Training Reference Note in sidebar */}
            <div className="p-3 m-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-slate-300">
              <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Dataset Grounding</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Fine-tuned on your Google Drive dataset in <span className="text-cyan-300">Google AI Studio</span> folder.
              </p>
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col bg-[#0b0f15] overflow-hidden">
            <div className="px-5 py-3 border-b border-cyan-500/15 bg-[#0e131b] flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-cyan-300 font-semibold">{currentFile.path}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{currentFile.description}</div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  id="btn-copy-code-file"
                  onClick={() => handleCopy(currentFile.code, selectedKey)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition border border-slate-700"
                >
                  {copiedKey === selectedKey ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
                <button
                  id="btn-download-single-file"
                  onClick={() => handleDownloadFile(currentFile.path, currentFile.code)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-[#0a0d13]">
              <pre className="text-xs font-mono text-slate-300 leading-relaxed tab-4">
                <code>{currentFile.code}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-2.5 bg-[#0d1117] border-t border-cyan-500/20 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tested on Flutter 3.19+ (iOS & Android)</span>
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline text-slate-400">
              State: Provider | DB: Hive (Offline) | Model: Gemma / Neon Fine-Tuned
            </span>
          </div>
          <span className="text-cyan-400 font-mono text-[11px]">Neon AI v1.0</span>
        </div>
      </div>
    </div>
  );
};
