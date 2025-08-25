/**
 * PWA Utils Tests
 */

import {
  isPWA,
  isIOS,
  isAndroid,
  getPWACapabilities,
} from '@/lib/pwa-utils';

// Mock window and navigator
const mockWindow = {
  matchMedia: jest.fn(),
  navigator: {
    userAgent: '',
    onLine: true,
  },
};

const mockNavigator = {
  userAgent: '',
  onLine: true,
  serviceWorker: {
    register: jest.fn(),
  },
};

// Mock global objects
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

Object.defineProperty(window, 'navigator', {
  writable: true,
  value: mockNavigator,
});

describe('PWA Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigator.userAgent = '';
  });

  describe('isPWA', () => {
    it('should return false when not in PWA mode', () => {
      window.matchMedia = jest.fn().mockReturnValue({ matches: false });
      expect(isPWA()).toBe(false);
    });

    it('should return true when in standalone mode', () => {
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(display-mode: standalone)',
      }));
      expect(isPWA()).toBe(true);
    });

    it('should return true when in fullscreen mode', () => {
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(display-mode: fullscreen)',
      }));
      expect(isPWA()).toBe(true);
    });
  });

  describe('isIOS', () => {
    it('should return true for iPad', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)';
      expect(isIOS()).toBe(true);
    });

    it('should return true for iPhone', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      expect(isIOS()).toBe(true);
    });

    it('should return true for iPod', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPod touch; CPU iPhone OS 14_0 like Mac OS X)';
      expect(isIOS()).toBe(true);
    });

    it('should return false for Android', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Linux; Android 10)';
      expect(isIOS()).toBe(false);
    });

    it('should return false for desktop', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
      expect(isIOS()).toBe(false);
    });
  });

  describe('isAndroid', () => {
    it('should return true for Android', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Linux; Android 10; SM-G975F)';
      expect(isAndroid()).toBe(true);
    });

    it('should return false for iOS', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      expect(isAndroid()).toBe(false);
    });

    it('should return false for desktop', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
      expect(isAndroid()).toBe(false);
    });
  });

  describe('getPWACapabilities', () => {
    it('should return correct capabilities', () => {
      // Mock various browser capabilities
      Object.defineProperty(window, 'BeforeInstallPromptEvent', {
        writable: true,
        value: function() {},
      });

      Object.defineProperty(window, 'Notification', {
        writable: true,
        value: function() {},
      });

      mockNavigator.serviceWorker = {
        register: jest.fn(),
      };

      window.matchMedia = jest.fn().mockReturnValue({ matches: false });

      const capabilities = getPWACapabilities();

      expect(capabilities).toEqual({
        isInstallable: true,
        isInstalled: false,
        isOnline: true,
        hasNotificationSupport: true,
        hasServiceWorkerSupport: true,
      });
    });

    it('should handle missing features gracefully', () => {
      // Store original values
      const originalBeforeInstallPrompt = (window as any).BeforeInstallPromptEvent;
      const originalNotification = (window as any).Notification;
      const originalServiceWorker = mockNavigator.serviceWorker;

      // Remove features
      delete (window as any).BeforeInstallPromptEvent;
      delete (window as any).Notification;
      delete mockNavigator.serviceWorker;

      const capabilities = getPWACapabilities();

      expect(capabilities).toEqual({
        isInstallable: false,
        isInstalled: false,
        isOnline: true,
        hasNotificationSupport: false,
        hasServiceWorkerSupport: false,
      });

      // Restore original values
      if (originalBeforeInstallPrompt) {
        (window as any).BeforeInstallPromptEvent = originalBeforeInstallPrompt;
      }
      if (originalNotification) {
        (window as any).Notification = originalNotification;
      }
      if (originalServiceWorker) {
        mockNavigator.serviceWorker = originalServiceWorker;
      }
    });
  });
});

// Test server-side rendering
describe('PWA Utils - SSR', () => {
  const originalWindow = global.window;
  const originalNavigator = global.navigator;

  beforeAll(() => {
    // @ts-ignore
    delete global.window;
    // @ts-ignore
    delete global.navigator;
  });

  afterAll(() => {
    global.window = originalWindow;
    global.navigator = originalNavigator;
  });

  it('should handle server-side rendering gracefully', () => {
    expect(isPWA()).toBe(false);
    expect(isIOS()).toBe(false);
    expect(isAndroid()).toBe(false);
    
    const capabilities = getPWACapabilities();
    expect(capabilities).toEqual({
      isInstallable: false,
      isInstalled: false,
      isOnline: false,
      hasNotificationSupport: false,
      hasServiceWorkerSupport: false,
    });
  });
});