import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div id="typing-indicator" className="flex gap-4 max-w-3xl items-center my-2 self-start">
      <div className="w-8 h-8 rounded-full bg-[#00E5FF] flex-shrink-0 flex items-center justify-center text-black font-bold text-xs shadow-[0_0_10px_rgba(0,229,255,0.5)]">
        N
      </div>
      <div className="flex gap-1.5 p-2 bg-[#1a1a1a] border border-[#00E5FF]/20 rounded-2xl rounded-tl-none">
        <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full opacity-40 animate-pulse" />
        <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full opacity-70 animate-pulse [animation-delay:0.2s]" />
        <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-pulse [animation-delay:0.4s]" />
      </div>
    </div>
  );
};
