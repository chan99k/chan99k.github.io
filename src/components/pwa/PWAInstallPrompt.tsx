/**
 * PWA Install Prompt Component
 * Shows install prompt for PWA installation
 */

'use client';

import React, { useState } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { isIOS, isAndroid } from '@/lib/pwa-utils';

interface PWAInstallPromptProps {
  className?: string;
}

export function PWAInstallPrompt({ className = '' }: PWAInstallPromptProps) {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isVisible, setIsVisible] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);

  // Don't show if already installed or not installable
  if (isInstalled || !isInstallable || !isVisible) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await installApp();
      if (success) {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember dismissal for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Check if user has dismissed this session
  React.useEffect(() => {
    const dismissed = sessionStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const getInstallInstructions = () => {
    if (isIOS()) {
      return {
        icon: <Smartphone className="w-5 h-5" />,
        text: 'Tap the share button and select "Add to Home Screen"',
        showButton: false,
      };
    }

    if (isAndroid()) {
      return {
        icon: <Smartphone className="w-5 h-5" />,
        text: 'Install this app for a better experience',
        showButton: true,
      };
    }

    return {
      icon: <Monitor className="w-5 h-5" />,
      text: 'Install this app for quick access',
      showButton: true,
    };
  };

  const instructions = getInstallInstructions();

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 ${className}`}>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-md mx-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-shrink-0 mt-1">
              {instructions.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Install App
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {instructions.text}
              </p>
              
              {instructions.showButton && (
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    {isInstalling ? 'Installing...' : 'Install'}
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Not now
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Dismiss install prompt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}