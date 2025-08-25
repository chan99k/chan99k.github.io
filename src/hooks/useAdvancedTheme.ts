'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState, useCallback } from 'react';
import { THEME_VARIANTS, getThemeVariant, isSystemTheme } from '@/lib/theme-config';

export interface ThemePreferences {
  theme: string;
  autoSwitch: boolean;
  autoSwitchTimes: {
    lightStart: string;
    darkStart: string;
  };
  reducedMotion: boolean;
  highContrast: boolean;
}

const DEFAULT_PREFERENCES: ThemePreferences = {
  theme: 'system',
  autoSwitch: false,
  autoSwitchTimes: {
    lightStart: '06:00',
    darkStart: '18:00',
  },
  reducedMotion: false,
  highContrast: false,
};

export function useAdvancedTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [preferences, setPreferences] = useState<ThemePreferences>(DEFAULT_PREFERENCES);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    
    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem('theme-preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      } catch (error) {
        console.warn('Failed to parse theme preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback((newPreferences: Partial<ThemePreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    localStorage.setItem('theme-preferences', JSON.stringify(updated));
  }, [preferences]);

  // Auto-switch theme based on time
  useEffect(() => {
    if (!mounted || !preferences.autoSwitch) return;

    const checkTime = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const { lightStart, darkStart } = preferences.autoSwitchTimes;
      
      if (currentTime >= lightStart && currentTime < darkStart) {
        if (theme !== 'light') {
          changeTheme('light');
        }
      } else {
        if (theme !== 'dark') {
          changeTheme('dark');
        }
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [mounted, preferences.autoSwitch, preferences.autoSwitchTimes, theme]);

  // Handle theme transitions
  const changeTheme = useCallback(async (newTheme: string) => {
    if (!mounted) return;

    setIsTransitioning(true);
    
    // Add transition class to body
    document.body.classList.add('theme-transitioning');
    
    // Change theme
    setTheme(newTheme);
    
    // Update preferences
    savePreferences({ theme: newTheme });
    
    // Remove transition class after animation
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
      setIsTransitioning(false);
    }, 300);
  }, [mounted, setTheme, savePreferences]);

  // Get current theme info
  const currentThemeVariant = getThemeVariant(theme || 'system');
  const effectiveTheme = resolvedTheme || systemTheme || 'light';
  const effectiveThemeVariant = getThemeVariant(effectiveTheme);

  // Detect system preferences
  const [systemPreferences, setSystemPreferences] = useState({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersColorScheme: 'light' as 'light' | 'dark',
  });

  useEffect(() => {
    if (!mounted) return;

    const updateSystemPreferences = () => {
      setSystemPreferences({
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
        prefersColorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      });
    };

    updateSystemPreferences();

    // Listen for system preference changes
    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(prefers-color-scheme: dark)'),
    ];

    mediaQueries.forEach(mq => mq.addEventListener('change', updateSystemPreferences));

    return () => {
      mediaQueries.forEach(mq => mq.removeEventListener('change', updateSystemPreferences));
    };
  }, [mounted]);

  // Apply accessibility preferences
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // Apply reduced motion preference
    if (preferences.reducedMotion || systemPreferences.prefersReducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Apply high contrast preference
    if (preferences.highContrast || systemPreferences.prefersHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [mounted, preferences.reducedMotion, preferences.highContrast, systemPreferences]);

  // Cycle through themes
  const cycleTheme = useCallback(() => {
    const currentIndex = THEME_VARIANTS.findIndex(variant => variant.id === theme);
    const nextIndex = (currentIndex + 1) % THEME_VARIANTS.length;
    const nextTheme = THEME_VARIANTS[nextIndex].id;
    changeTheme(nextTheme);
  }, [theme, changeTheme]);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    if (isSystemTheme(theme || '')) {
      changeTheme(systemPreferences.prefersColorScheme === 'dark' ? 'light' : 'dark');
    } else {
      changeTheme(theme === 'dark' ? 'light' : 'dark');
    }
  }, [theme, changeTheme, systemPreferences.prefersColorScheme]);

  return {
    // Current theme state
    theme,
    resolvedTheme,
    systemTheme,
    currentThemeVariant,
    effectiveTheme,
    effectiveThemeVariant,
    mounted,
    isTransitioning,

    // Theme actions
    setTheme: changeTheme,
    toggleTheme,
    cycleTheme,

    // Preferences
    preferences,
    savePreferences,
    systemPreferences,

    // Available themes
    availableThemes: THEME_VARIANTS,
  };
}