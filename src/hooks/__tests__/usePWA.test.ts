/**
 * usePWA Hook Tests
 */

import { renderHook, act } from '@testing-library/react';

// Mock PWA utils before importing the hook
jest.mock('@/lib/pwa-utils', () => ({
  registerServiceWorker: jest.fn(),
  requestNotificationPermission: jest.fn(),
  subscribeToPushNotifications: jest.fn(),
  getPWACapabilities: jest.fn(),
  isPWA: jest.fn(),
  showNotification: jest.fn(),
}));

import { usePWA } from '@/hooks/usePWA';

// Mock window events
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

Object.defineProperty(window, 'addEventListener', {
  writable: true,
  value: mockAddEventListener,
});

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  value: mockRemoveEventListener,
});

Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

// Mock Notification API
Object.defineProperty(window, 'Notification', {
  writable: true,
  value: {
    permission: 'default',
    requestPermission: jest.fn().mockResolvedValue('granted'),
  },
});

// Get the mocked functions
const mockPWAUtils = require('@/lib/pwa-utils');

describe('usePWA Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mocks
    mockPWAUtils.registerServiceWorker.mockResolvedValue({
      addEventListener: jest.fn(),
      update: jest.fn(),
    });
    
    mockPWAUtils.getPWACapabilities.mockReturnValue({
      isInstallable: false,
      isInstalled: false,
      isOnline: true,
      hasNotificationSupport: true,
      hasServiceWorkerSupport: true,
    });
    
    mockPWAUtils.isPWA.mockReturnValue(false);
    mockPWAUtils.requestNotificationPermission.mockResolvedValue('granted');
    mockPWAUtils.subscribeToPushNotifications.mockResolvedValue({});
    mockPWAUtils.showNotification.mockReturnValue({});
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => usePWA());

    expect(result.current.isInstalled).toBe(false);
    expect(result.current.isInstallable).toBe(false);
    expect(result.current.isOnline).toBe(true);
    expect(result.current.hasNotificationSupport).toBe(false);
    expect(result.current.notificationPermission).toBe('default');
    expect(result.current.serviceWorkerRegistration).toBe(null);
    expect(result.current.installPrompt).toBe(null);
  });

  it('should register service worker on mount', async () => {
    renderHook(() => usePWA());

    await act(async () => {
      // Wait for useEffect to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockPWAUtils.registerServiceWorker).toHaveBeenCalled();
  });

  it('should handle install app', async () => {
    const mockInstallPrompt = {
      prompt: jest.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    };

    const { result } = renderHook(() => usePWA());

    // Simulate install prompt event
    await act(async () => {
      const event = new Event('beforeinstallprompt') as any;
      event.prompt = mockInstallPrompt.prompt;
      event.userChoice = mockInstallPrompt.userChoice;
      
      // Find and call the beforeinstallprompt listener
      const listener = mockAddEventListener.mock.calls.find(
        call => call[0] === 'beforeinstallprompt'
      )?.[1];
      
      if (listener) {
        listener(event);
      }
    });

    let installResult;
    await act(async () => {
      installResult = await result.current.installApp();
    });

    expect(mockInstallPrompt.prompt).toHaveBeenCalled();
    expect(installResult).toBe(true);
  });

  it('should handle notification permission request', async () => {
    const { result } = renderHook(() => usePWA());

    let permission;
    await act(async () => {
      permission = await result.current.requestNotifications();
    });

    expect(mockPWAUtils.requestNotificationPermission).toHaveBeenCalled();
    expect(permission).toBe('granted');
  });

  it('should handle push subscription', async () => {
    const mockRegistration = {
      addEventListener: jest.fn(),
      update: jest.fn(),
    };

    mockPWAUtils.registerServiceWorker.mockResolvedValue(mockRegistration);

    const { result } = renderHook(() => usePWA());

    await act(async () => {
      // Wait for service worker registration
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    let subscription;
    await act(async () => {
      subscription = await result.current.subscribeToPush('test-vapid-key');
    });

    expect(mockPWAUtils.subscribeToPushNotifications).toHaveBeenCalledWith(
      mockRegistration,
      'test-vapid-key'
    );
  });

  it('should show notifications', () => {
    const { result } = renderHook(() => usePWA());

    act(() => {
      result.current.showNotification('Test Title', { body: 'Test Body' });
    });

    expect(mockPWAUtils.showNotification).toHaveBeenCalledWith(
      'Test Title',
      { body: 'Test Body' }
    );
  });

  it('should update service worker', async () => {
    const mockRegistration = {
      addEventListener: jest.fn(),
      update: jest.fn(),
    };

    mockPWAUtils.registerServiceWorker.mockResolvedValue(mockRegistration);

    const { result } = renderHook(() => usePWA());

    await act(async () => {
      // Wait for service worker registration
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.updateServiceWorker();
    });

    expect(mockRegistration.update).toHaveBeenCalled();
  });

  it('should handle online/offline events', () => {
    const { result } = renderHook(() => usePWA());

    // Find the online/offline event listeners
    const onlineListener = mockAddEventListener.mock.calls.find(
      call => call[0] === 'online'
    )?.[1];
    const offlineListener = mockAddEventListener.mock.calls.find(
      call => call[0] === 'offline'
    )?.[1];

    expect(onlineListener).toBeDefined();
    expect(offlineListener).toBeDefined();

    // Simulate going offline
    act(() => {
      offlineListener?.();
    });

    expect(result.current.isOnline).toBe(false);

    // Simulate going online
    act(() => {
      onlineListener?.();
    });

    expect(result.current.isOnline).toBe(true);
  });

  it('should cleanup event listeners on unmount', () => {
    const { unmount } = renderHook(() => usePWA());

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'beforeinstallprompt',
      expect.any(Function)
    );
    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'appinstalled',
      expect.any(Function)
    );
    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'online',
      expect.any(Function)
    );
    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'offline',
      expect.any(Function)
    );
  });
});