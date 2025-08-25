'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
  category: 'navigation' | 'search' | 'theme' | 'accessibility';
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts?: KeyboardShortcut[];
}

export function useKeyboardShortcuts({
  enabled = true,
  shortcuts = []
}: UseKeyboardShortcutsOptions = {}) {
  const router = useRouter();

  // Default shortcuts
  const defaultShortcuts: KeyboardShortcut[] = [
    {
      key: 'h',
      altKey: true,
      description: 'Go to Home',
      action: () => router.push('/'),
      category: 'navigation'
    },
    {
      key: 'p',
      altKey: true,
      description: 'Go to Portfolio',
      action: () => router.push('/portfolio'),
      category: 'navigation'
    },
    {
      key: 'b',
      altKey: true,
      description: 'Go to Blog',
      action: () => router.push('/blog'),
      category: 'navigation'
    },
    {
      key: 'r',
      altKey: true,
      description: 'Go to Reviews',
      action: () => router.push('/reviews'),
      category: 'navigation'
    },
    {
      key: '/',
      ctrlKey: true,
      description: 'Open Search',
      action: () => router.push('/search'),
      category: 'search'
    },
    {
      key: 'k',
      ctrlKey: true,
      description: 'Open Search (Alternative)',
      action: () => router.push('/search'),
      category: 'search'
    },
    {
      key: 't',
      altKey: true,
      description: 'Toggle Theme',
      action: () => {
        // This will be handled by the theme provider
        document.dispatchEvent(new CustomEvent('toggle-theme'));
      },
      category: 'theme'
    },
    {
      key: '?',
      shiftKey: true,
      description: 'Show Keyboard Shortcuts',
      action: () => {
        document.dispatchEvent(new CustomEvent('show-shortcuts-help'));
      },
      category: 'accessibility'
    }
  ];

  const allShortcuts = [...defaultShortcuts, ...shortcuts];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when user is typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      const matchingShortcut = allShortcuts.find(shortcut => {
        return (
          shortcut.key.toLowerCase() === event.key.toLowerCase() &&
          !!shortcut.ctrlKey === event.ctrlKey &&
          !!shortcut.altKey === event.altKey &&
          !!shortcut.shiftKey === event.shiftKey &&
          !!shortcut.metaKey === event.metaKey
        );
      });

      if (matchingShortcut) {
        event.preventDefault();
        event.stopPropagation();
        matchingShortcut.action();
      }
    },
    [enabled, allShortcuts]
  );

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);

  return {
    shortcuts: allShortcuts,
    enabled
  };
}