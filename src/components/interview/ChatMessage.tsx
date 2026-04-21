import React from 'react';

interface ChatMessageProps {
  role: 'user' | 'interviewer';
  children: React.ReactNode;
}

export function ChatMessage({ role, children }: ChatMessageProps) {
  const isInterviewer = role === 'interviewer';

  if (!isInterviewer) {
    return (
      <div className="flex justify-end">
        <div className="bg-[#0078FF] text-white rounded-2xl rounded-tr-none px-6 py-4 max-w-[85%] shadow-md">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">AI</span>
        </div>
        <span className="text-xs font-semibold text-neutral-400">AI 면접관</span>
      </div>
      <div className="bg-white dark:bg-[#2B3040] border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-none px-6 py-5 max-w-[85%] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
        {children}
      </div>
    </div>
  );
}
