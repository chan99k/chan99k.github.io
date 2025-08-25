import { renderHook, act } from '@testing-library/react';
import { useAdvancedTheme } from '../useAdvancedTheme';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    resolvedTheme: 'light',
    systemTheme: 'light',
  }),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('useAdvancedTheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with default preferences', () => {
    const { result } = renderHook(() => useAdvancedTheme());

    expect(result.current.preferences).toEqual({
      theme: 'system',
      autoSwitch: false,
      autoSwitchTimes: {
        lightStart: '06:00',
        darkStart: '18:00',
      },
      reducedMotion: false,
      highContrast: false,
    });
  });

  it('should load preferences from localStorage', () => {
    const savedPreferences = {
      theme: 'dark',
      autoSwitch: true,
      reducedMotion: true,
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedPreferences));

    const { result } = renderHook(() => useAdvancedTheme());

    // Wait for useEffect to run
    act(() => {
      // Trigger the effect
    });

    expect(result.current.preferences.theme).toBe('dark');
    expect(result.current.preferences.autoSwitch).toBe(true);
    expect(result.current.preferences.reducedMotion).toBe(true);
  });

  it('should save preferences to localStorage', () => {
    const { result } = renderHook(() => useAdvancedTheme());

    act(() => {
      result.current.savePreferences({ autoSwitch: true });
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'theme-preferences',
      expect.stringContaining('"autoSwitch":true')
    );
  });

  it('should provide available themes', () => {
    const { result } = renderHook(() => useAdvancedTheme());

    expect(result.current.availableThemes).toBeDefined();
    expect(result.current.availableThemes.length).toBeGreaterThan(0);
    expect(result.current.availableThemes[0]).toHaveProperty('id');
    expect(result.current.availableThemes[0]).toHaveProperty('name');
    expect(result.current.availableThemes[0]).toHaveProperty('category');
  });

  it('should handle invalid localStorage data gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid json');
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const { result } = renderHook(() => useAdvancedTheme());

    act(() => {
      // Trigger the effect
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to parse theme preferences:',
      expect.any(Error)
    );
    expect(result.current.preferences.theme).toBe('system');

    consoleSpy.mockRestore();
  });

  it('should detect system preferences', () => {
    // Mock matchMedia to return specific values
    window.matchMedia = jest.fn().mockImplementation(query => {
      if (query === '(prefers-reduced-motion: reduce)') {
        return { matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() };
      }
      if (query === '(prefers-contrast: high)') {
        return { matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() };
      }
      if (query === '(prefers-color-scheme: dark)') {
        return { matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() };
      }
      return { matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() };
    });

    const { result } = renderHook(() => useAdvancedTheme());

    act(() => {
      // Trigger the effect
    });

    expect(result.current.systemPreferences.prefersReducedMotion).toBe(true);
    expect(result.current.systemPreferences.prefersHighContrast).toBe(false);
    expect(result.current.systemPreferences.prefersColorScheme).toBe('dark');
  });
});