/**
 * PWA Provider Component
 * Initializes PWA functionality and provides context
 */

'use client';

import React, { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/pwa-utils';
import { PWAInstallPrompt, OfflineIndicator } from '@/components/pwa';

interface PWAProviderProps {
  children: React.ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [isClient, setIsClient] = React.useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Register service worker on mount
    if (typeof window !== 'undefined' && isClient) {
      registerServiceWorker().then(registration => {
        if (registration) {
          console.log('PWA: Service Worker registered successfully');
          
          // Listen for service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker is available
                  console.log('PWA: New service worker available');
                  
                  // You could show a notification to the user here
                  if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('App Updated', {
                      body: 'A new version of the app is available. Refresh to update.',
                      icon: '/icons/icon-192x192.svg',
                      tag: 'app-update',
                    });
                  }
                }
              });
            }
          });
        }
      }).catch(error => {
        console.error('PWA: Service Worker registration failed:', error);
      });

      // Handle service worker messages
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('PWA: Message from service worker:', event.data);
          
          if (event.data && event.data.type === 'CACHE_UPDATED') {
            // Handle cache updates
            console.log('PWA: Cache updated');
          }
        });
      }

      // Handle app installation
      window.addEventListener('appinstalled', () => {
        console.log('PWA: App installed successfully');
        
        // Track installation analytics if needed
        if (typeof window !== 'undefined' && 'gtag' in window) {
          (window as any).gtag('event', 'pwa_install', {
            event_category: 'PWA',
            event_label: 'App Installed',
          });
        }
      });

      // Handle visibility change for background sync
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
          // App became visible, check for updates
          navigator.serviceWorker.controller.postMessage({
            type: 'CHECK_FOR_UPDATES'
          });
        }
      });
    }
  }, []);

  return (
    <>
      {children}
      
      {/* PWA Components - Only render on client */}
      {isClient && (
        <>
          <PWAInstallPrompt />
          <div className="fixed top-4 right-4 z-40">
            <OfflineIndicator />
          </div>
        </>
      )}
    </>
  );
}