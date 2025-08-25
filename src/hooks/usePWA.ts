/**
 * PWA Hook
 * Provides PWA functionality and state management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  registerServiceWorker,
  requestNotificationPermission,
  subscribeToPushNotifications,
  getPWACapabilities,
  isPWA,
  showNotification,
  type PWAInstallPrompt,
  type PWACapabilities,
} from '@/lib/pwa-utils';

export interface PWAState {
  isInstalled: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  hasNotificationSupport: boolean;
  notificationPermission: NotificationPermission;
  serviceWorkerRegistration: ServiceWorkerRegistration | null;
  installPrompt: PWAInstallPrompt | null;
  capabilities: PWACapabilities;
}

export interface PWAActions {
  installApp: () => Promise<boolean>;
  requestNotifications: () => Promise<NotificationPermission>;
  subscribeToPush: (vapidKey?: string) => Promise<PushSubscription | null>;
  showNotification: (title: string, options?: NotificationOptions) => Notification | null;
  updateServiceWorker: () => void;
}

export function usePWA(): PWAState & PWAActions {
  const [state, setState] = useState<PWAState>({
    isInstalled: false,
    isInstallable: false,
    isOnline: true,
    hasNotificationSupport: false,
    notificationPermission: 'default',
    serviceWorkerRegistration: null,
    installPrompt: null,
    capabilities: {
      isInstallable: false,
      isInstalled: false,
      isOnline: true,
      hasNotificationSupport: false,
      hasServiceWorkerSupport: false,
    },
  });

  // Initialize PWA state
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const capabilities = getPWACapabilities();
    
    setState(prev => ({
      ...prev,
      isInstalled: isPWA(),
      isOnline: navigator.onLine,
      hasNotificationSupport: 'Notification' in window,
      notificationPermission: 'Notification' in window ? Notification.permission : 'denied',
      capabilities,
    }));

    // Register service worker
    registerServiceWorker().then(registration => {
      if (registration) {
        setState(prev => ({
          ...prev,
          serviceWorkerRegistration: registration,
        }));
      }
    });

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installPrompt = e as any as PWAInstallPrompt;
      setState(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt,
      }));
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null,
      }));
    };

    // Listen for online/offline status
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Install app
  const installApp = useCallback(async (): Promise<boolean> => {
    if (!state.installPrompt) {
      return false;
    }

    try {
      await state.installPrompt.prompt();
      const choiceResult = await state.installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setState(prev => ({
          ...prev,
          isInstallable: false,
          installPrompt: null,
        }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to install app:', error);
      return false;
    }
  }, [state.installPrompt]);

  // Request notification permission
  const requestNotifications = useCallback(async (): Promise<NotificationPermission> => {
    const permission = await requestNotificationPermission();
    setState(prev => ({
      ...prev,
      notificationPermission: permission,
    }));
    return permission;
  }, []);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async (vapidKey?: string): Promise<PushSubscription | null> => {
    if (!state.serviceWorkerRegistration) {
      console.error('Service Worker not registered');
      return null;
    }

    if (state.notificationPermission !== 'granted') {
      const permission = await requestNotifications();
      if (permission !== 'granted') {
        return null;
      }
    }

    return subscribeToPushNotifications(state.serviceWorkerRegistration, vapidKey);
  }, [state.serviceWorkerRegistration, state.notificationPermission, requestNotifications]);

  // Show notification
  const showNotificationCallback = useCallback((
    title: string,
    options?: NotificationOptions
  ): Notification | null => {
    return showNotification(title, options);
  }, []);

  // Update service worker
  const updateServiceWorker = useCallback(() => {
    if (state.serviceWorkerRegistration) {
      state.serviceWorkerRegistration.update();
    }
  }, [state.serviceWorkerRegistration]);

  return {
    ...state,
    installApp,
    requestNotifications,
    subscribeToPush,
    showNotification: showNotificationCallback,
    updateServiceWorker,
  };
}