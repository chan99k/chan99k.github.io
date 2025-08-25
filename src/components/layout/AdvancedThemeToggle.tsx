'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Monitor, 
  Sun, 
  Moon, 
  Contrast, 
  Eye,
  Settings,
  Check,
  ChevronDown
} from 'lucide-react';
import { useAdvancedTheme } from '@/hooks/useAdvancedTheme';
import { THEME_VARIANTS, THEME_CATEGORIES, getThemesByCategory } from '@/lib/theme-config';

export function AdvancedThemeToggle() {
  const {
    theme,
    effectiveTheme,
    currentThemeVariant,
    setTheme,
    toggleTheme,
    mounted,
    isTransitioning,
    preferences,
    savePreferences,
  } = useAdvancedTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSettings(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setShowSettings(false);
    }
  };

  if (!mounted) {
    return (
      <button className="p-2 text-muted-foreground">
        <Sun size={18} />
      </button>
    );
  }

  const getThemeIcon = (themeId: string) => {
    switch (themeId) {
      case 'light':
        return <Sun size={16} />;
      case 'dark':
        return <Moon size={16} />;
      case 'system':
        return <Monitor size={16} />;
      case 'high-contrast-light':
      case 'high-contrast-dark':
        return <Contrast size={16} />;
      case 'sepia':
        return <Eye size={16} />;
      default:
        return <Palette size={16} />;
    }
  };

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId);
    setIsOpen(false);
  };

  const handleQuickToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    toggleTheme();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Quick toggle button */}
      <div className="flex items-center">
        <button
          onClick={handleQuickToggle}
          className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-accent"
          aria-label={`Current theme: ${currentThemeVariant?.name || theme}. Click to toggle`}
          disabled={isTransitioning}
        >
          <motion.div
            animate={{ rotate: isTransitioning ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {getThemeIcon(effectiveTheme)}
          </motion.div>
        </button>

        {/* Dropdown toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className="p-1 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-accent"
          aria-label="Open theme selector"
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={14} />
          </motion.div>
        </button>
      </div>

      {/* Theme selector dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50"
            role="menu"
            aria-label="Theme selector"
          >
            <div className="p-4">
              {!showSettings ? (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">Choose Theme</h3>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="p-1 text-muted-foreground hover:text-primary transition-colors rounded"
                      aria-label="Theme settings"
                    >
                      <Settings size={16} />
                    </button>
                  </div>

                  {/* Theme categories */}
                  <div className="space-y-4">
                    {Object.entries(THEME_CATEGORIES).map(([category, label]) => {
                      const themes = getThemesByCategory(category as keyof typeof THEME_CATEGORIES);
                      
                      return (
                        <div key={category}>
                          <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                            {label}
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {themes.map((themeVariant) => (
                              <button
                                key={themeVariant.id}
                                onClick={() => handleThemeSelect(themeVariant.id)}
                                className={`
                                  flex items-center gap-2 p-2 rounded-md text-left transition-colors
                                  hover:bg-accent hover:text-accent-foreground
                                  ${theme === themeVariant.id ? 'bg-primary text-primary-foreground' : ''}
                                `}
                                role="menuitem"
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <span className="text-sm">{themeVariant.icon}</span>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm font-medium truncate">
                                      {themeVariant.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      {themeVariant.description}
                                    </div>
                                  </div>
                                </div>
                                {theme === themeVariant.id && (
                                  <Check size={14} className="flex-shrink-0" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  {/* Settings panel */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">Theme Settings</h3>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="p-1 text-muted-foreground hover:text-primary transition-colors rounded"
                      aria-label="Back to theme selector"
                    >
                      ←
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Auto-switch setting */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Auto Switch</div>
                        <div className="text-xs text-muted-foreground">
                          Automatically switch between light and dark themes
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.autoSwitch}
                          onChange={(e) => savePreferences({ autoSwitch: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {/* Time settings (only show if auto-switch is enabled) */}
                    {preferences.autoSwitch && (
                      <div className="space-y-3 pl-4 border-l-2 border-muted">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">
                            Light theme starts at:
                          </label>
                          <input
                            type="time"
                            value={preferences.autoSwitchTimes.lightStart}
                            onChange={(e) => savePreferences({
                              autoSwitchTimes: {
                                ...preferences.autoSwitchTimes,
                                lightStart: e.target.value
                              }
                            })}
                            className="w-full mt-1 px-2 py-1 text-sm bg-background border border-border rounded"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">
                            Dark theme starts at:
                          </label>
                          <input
                            type="time"
                            value={preferences.autoSwitchTimes.darkStart}
                            onChange={(e) => savePreferences({
                              autoSwitchTimes: {
                                ...preferences.autoSwitchTimes,
                                darkStart: e.target.value
                              }
                            })}
                            className="w-full mt-1 px-2 py-1 text-sm bg-background border border-border rounded"
                          />
                        </div>
                      </div>
                    )}

                    {/* Accessibility settings */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">Reduce Motion</div>
                          <div className="text-xs text-muted-foreground">
                            Minimize animations and transitions
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.reducedMotion}
                            onChange={(e) => savePreferences({ reducedMotion: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">High Contrast</div>
                          <div className="text-xs text-muted-foreground">
                            Enhance contrast for better visibility
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.highContrast}
                            onChange={(e) => savePreferences({ highContrast: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}