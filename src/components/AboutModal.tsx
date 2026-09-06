import React from 'react';
import {
  Sparkles,
  Database,
  Cpu,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Code,
  CheckCircle2,
} from 'lucide-react';
import { DriveDatasetInfo } from '../types';
import { NEON_FINETUNE_DATASET, GEMMA_FINETUNE_PYTHON_SCRIPT } from '../data/mockData';

export const AboutModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  datasetInfo: DriveDatasetInfo;
  onOpenFlutterCode: () => void;
}> = ({ isOpen, onClose, datasetInfo, onOpenFlutterCode }) => {
  if (!isOpen) return null;

  return (
    <div
      id="about-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        id="about-modal-content"
        className="relative w-full max-w-lg bg-[#141820] border border-cyan-500/30 rounded-2xl shadow-[0_0_40px_rgba(0,229,255,0.25)] flex flex-col overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" />

        <div className="p-6 overflow-y-auto max-h-[85vh] space-y-6">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center text-center space-y-3 pt-2">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shadow-[0_0_30px_rgba(0,229,255,0.5)]">
                <div className="w-full h-full bg-[#121212] rounded-[14px] flex items-center justify-center overflow-hidden">
                  <img
                    src="/neon_logo.svg"
                    alt="Neon AI"
                    className="w-14 h-14 object-contain"
                    onError={(e) => {
                      // Fallback icon
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center text-black font-bold text-[10px] shadow-[0_0_10px_#00E5FF]">
                ⚡
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-400">
                NEON AI
              </h1>
              <p className="text-xs font-medium text-cyan-400/90 tracking-widest uppercase mt-0.5">
                Your Intelligent Companion
              </p>
              <p className="text-xs text-slate-400 mt-2 max-w-xs">
                Next-generation mobile AI client powered by Google's Gemma fine-tuning architecture.
              </p>
            </div>
          </div>

          {/* Model & Dataset Details */}
          <div className="p-4 rounded-xl bg-[#0b0e14] border border-cyan-500/25 space-y-3">
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
              <Database className="w-4 h-4" />
              <span>Dataset Grounding & Source</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-cyan-500/10">
                <span className="text-slate-400">Dataset File</span>
                <span className="font-mono text-cyan-300 font-medium">{datasetInfo.fileName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cyan-500/10">
                <span className="text-slate-400">Drive Location</span>
                <span className="text-slate-200">{datasetInfo.folder}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cyan-500/10">
                <span className="text-slate-400">Dataset Size</span>
                <span className="font-mono text-cyan-400">{datasetInfo.sizeFormatted}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Base Model</span>
                <span className="text-slate-200">Google Gemma 2B / 7B (Instruction LoRA)</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed bg-[#111722] p-2.5 rounded-lg border border-cyan-500/15">
              The dataset contains targeted multi-turn instruction pairs, reasoning chains, and code benchmarks that formulate Neon's personality, accuracy, and domain intelligence.
            </p>

            {/* Fine-Tuning Sample Records */}
            <div className="pt-2 border-t border-cyan-500/15 space-y-2">
              <span className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider block">
                Sample Instruction Tuning Examples
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-[11px]">
                {NEON_FINETUNE_DATASET.map((item, idx) => (
                  <div key={idx} className="p-2 rounded bg-[#121824] border border-cyan-500/10 space-y-1">
                    <div className="text-cyan-400 font-mono text-[10px]">Input: "{item.input}"</div>
                    <div className="text-slate-300 text-[10px] line-clamp-2">{item.output}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gemma Fine-Tuning Python Script */}
            <div className="pt-2 border-t border-cyan-500/15 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider">
                  Gemma 4 Fine-Tuning Script (Python)
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(GEMMA_FINETUNE_PYTHON_SCRIPT);
                    alert('Gemma 4 fine-tuning Python script copied to clipboard!');
                  }}
                  className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition font-mono"
                >
                  Copy Python Code
                </button>
              </div>
              <pre className="p-2.5 rounded bg-[#070a0f] border border-cyan-500/15 font-mono text-[10px] text-cyan-300/90 max-h-32 overflow-y-auto whitespace-pre leading-relaxed select-all">
                {GEMMA_FINETUNE_PYTHON_SCRIPT}
              </pre>
            </div>
          </div>

          {/* Mobile Technical Stack */}
          <div className="space-y-2.5">
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Stack (iOS & Android)</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#0e131b] border border-cyan-500/15 flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Flutter 3.19+ (Dart)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0e131b] border border-cyan-500/15 flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Provider State</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0e131b] border border-cyan-500/15 flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Hive Offline Storage</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0e131b] border border-cyan-500/15 flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>HTTP Inference API</span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              id="btn-view-flutter-code-from-about"
              onClick={() => {
                onClose();
                onOpenFlutterCode();
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs transition shadow-[0_0_20px_rgba(0,229,255,0.35)]"
            >
              <Code className="w-4 h-4" />
              <span>Inspect & Export Flutter Mobile Source Code</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-cyan-500/20 bg-[#0f131a] flex items-center justify-between">
          <span className="text-[11px] text-slate-500">© Neon AI • Powered by Gemma</span>
          <button
            onClick={onClose}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
