'use client';

import { useState, useRef } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  'data-language'?: string;
  'data-theme'?: string;
}

export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  // Extract language from className (e.g., "language-javascript" -> "javascript")
  const language = className?.replace(/language-/, '') || props['data-language'] || 'text';

  const copyToClipboard = async () => {
    if (!preRef.current) return;

    const code = preRef.current.textContent || '';
    
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="relative group">
      {/* Language label and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-900 text-gray-300 text-sm border-b border-gray-700">
        <span className="font-mono text-xs uppercase tracking-wide">
          {language}
        </span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors opacity-0 group-hover:opacity-100"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <pre
        ref={preRef}
        className={`overflow-x-auto p-4 bg-gray-900 dark:bg-gray-950 text-gray-100 text-sm leading-relaxed ${className || ''}`}
        {...props}
      >
        {children}
      </pre>

      {/* Copy success indicator */}
      {copied && (
        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
          Copied!
        </div>
      )}
    </div>
  );
}