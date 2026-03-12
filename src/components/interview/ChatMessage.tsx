import React from 'react';

interface ChatMessageProps {
  role: 'user' | 'interviewer';
  children: React.ReactNode;
}

export function ChatMessage({ role, children }: ChatMessageProps) {
  const isInterviewer = role === 'interviewer';

  return (
    <div
      className={`flex flex-col gap-1 mb-4 ${
        isInterviewer ? 'items-start' : 'items-end'
      }`}
    >
      {isInterviewer && (
        <span className="text-xs text-neutral-400 px-1">AI 면접관</span>
      )}
      <div
        className={`px-4 py-3 max-w-[90%] sm:max-w-[80%] ${
          isInterviewer
            ? 'bg-white dark:bg-[#2B3040] border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm'
            : 'bg-[#0078FF] text-white rounded-2xl rounded-tr-sm ml-auto'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
