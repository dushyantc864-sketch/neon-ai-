import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  onCopy: (text: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onCopy }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === 'user';

  const handleCopy = () => {
    onCopy(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Helper to render text with markdown code blocks, bold, lists
  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : '';
        const codeText = lang ? lines.slice(1).join('\n') : lines.join('\n');

        return (
          <div
            key={index}
            className="my-3 rounded-xl overflow-hidden border border-[#333] bg-[#141414] shadow-md"
          >
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#1f1f1f] border-b border-[#2d2d2d] text-[11px] font-mono text-gray-300">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-[#00E5FF]" />
                <span className="text-[#00E5FF] font-semibold">{lang || 'code'}</span>
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(codeText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                }}
                className="hover:text-white flex items-center gap-1 text-gray-400 text-xs"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3.5 text-xs font-mono overflow-x-auto text-gray-100 leading-relaxed">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }

      return (
        <div key={index} className="space-y-2 whitespace-pre-wrap leading-relaxed text-sm text-gray-100">
          {part}
        </div>
      );
    });
  };

  return (
    <div
      id={`message-${message.id}`}
      className={`flex gap-4 max-w-3xl my-2 ${isUser ? 'self-end' : 'self-start'}`}
    >
      {/* Neon Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#00E5FF] flex-shrink-0 flex items-center justify-center text-black font-bold text-xs shadow-[0_0_10px_rgba(0,229,255,0.5)] mt-0.5">
          N
        </div>
      )}

      {/* Bubble Container matching Elegant Dark Design */}
      <div
        className={`group relative p-4 rounded-2xl text-sm leading-relaxed text-gray-100 transition-all ${
          isUser
            ? 'bg-[#242424] rounded-tr-none text-white'
            : 'bg-[#1a1a1a] border border-[#00E5FF]/20 rounded-tl-none shadow-[0_0_20px_rgba(0,229,255,0.05)]'
        }`}
        onContextMenu={(e) => {
          e.preventDefault();
          handleCopy();
        }}
        title="Right click to copy"
      >
        <div>{renderFormattedContent(message.text)}</div>

        {/* Timestamp & Copy button bar */}
        <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-gray-500 border-t border-white/5 font-mono">
          <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-gray-400 hover:text-[#00E5FF] transition-opacity"
            title="Copy message"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 text-[10px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span className="text-[10px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-0.5">
          U
        </div>
      )}
    </div>
  );
};
