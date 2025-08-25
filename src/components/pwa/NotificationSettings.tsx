/**
 * Notification Settings Component
 * Allows users to manage push notification preferences
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Settings, Check, X } from 'lucide-react';
import { 
  subscribeToPushNotifications, 
  unsubscribeFromPushNotifications,
  isPushNotificationSubscribed,
  storePushSubscription,
  simulateNewBlogPostNotification,
  type PushSubscriptionData 
} from '@/lib/push-notifications';

interface NotificationSettingsProps {
  className?: string;
  showTestButton?: boolean;
}

export function NotificationSettings({ 
  className = '',
  showTestButton = false 
}: NotificationSettingsProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Check initial subscription status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkSubscriptionStatus = async () => {
      try {
        const subscribed = await isPushNotificationSubscribed();
        setIsSubscribed(subscribed);
        
        if ('Notification' in window) {
          setNotificationPermission(Notification.permission);
        }
      } catch (error) {
        console.error('Failed to check subscription status:', error);
      }
    };

    checkSubscriptionStatus();
  }, []);

  const handleSubscribe = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const subscriptionData = await subscribeToPushNotifications();
      
      if (subscriptionData) {
        storePushSubscription(subscriptionData);
        setIsSubscribed(true);
        setNotificationPermission('granted');
        console.log('Successfully subscribed to push notifications');
      } else {
        setError('Failed to subscribe to notifications. Please check your browser settings.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setError(error instanceof Error ? error.message : 'Failed to subscribe to notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await unsubscribeFromPushNotifications();
      
      if (success) {
        setIsSubscribed(false);
        localStorage.removeItem('push-subscription');
        console.log('Successfully unsubscribed from push notifications');
      } else {
        setError('Failed to unsubscribe from notifications');
      }
    } catch (error) {
      console.error('Unsubscription error:', error);
      setError(error instanceof Error ? error.message : 'Failed to unsubscribe from notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = () => {
    simulateNewBlogPostNotification({
      title: 'Test Blog Post',
      description: 'This is a test notification to verify that push notifications are working correctly.',
      slug: 'test-post',
    });
  };

  const isNotificationSupported = typeof window !== 'undefined' && 
    'Notification' in window && 
    'serviceWorker' in navigator && 
    'PushManager' in window;

  if (!isNotificationSupported) {
    return (
      <div className={`p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md ${className}`}>
        <div className="flex items-center space-x-2">
          <BellOff className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Push notifications are not supported in your browser.
          </p>
        </div>
      </div>
    );
  }

  if (!showSettings) {
    return (
      <button
        onClick={() => setShowSettings(true)}
        className={`inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors ${className}`}
      >
        <Bell className="w-4 h-4" />
        <span>Notification Settings</span>
        {isSubscribed && (
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        )}
      </button>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Push Notifications
        </h3>
        <button
          onClick={() => setShowSettings(false)}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
          <div className="flex items-center space-x-3">
            {isSubscribed ? (
              <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Blog Post Notifications
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isSubscribed ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isSubscribed ? (
              <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                <Check className="w-4 h-4" />
                <span className="text-xs">Active</span>
              </div>
            ) : (
              <span className="text-xs text-gray-500">Inactive</span>
            )}
          </div>
        </div>

        {/* Permission Status */}
        {notificationPermission !== 'granted' && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              {notificationPermission === 'denied' 
                ? 'Notifications are blocked. Please enable them in your browser settings.'
                : 'Click "Enable Notifications" to receive updates about new blog posts.'
              }
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {!isSubscribed ? (
            <button
              onClick={handleSubscribe}
              disabled={isLoading || notificationPermission === 'denied'}
              className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span>{isLoading ? 'Enabling...' : 'Enable Notifications'}</span>
            </button>
          ) : (
            <button
              onClick={handleUnsubscribe}
              disabled={isLoading}
              className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
            >
              <BellOff className="w-4 h-4" />
              <span>{isLoading ? 'Disabling...' : 'Disable Notifications'}</span>
            </button>
          )}

          {showTestButton && isSubscribed && (
            <button
              onClick={handleTestNotification}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-md transition-colors"
            >
              Test
            </button>
          )}
        </div>

        {/* Information */}
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <p>• Get notified when new blog posts are published</p>
          <p>• Notifications work even when the site is closed</p>
          <p>• You can disable notifications at any time</p>
        </div>
      </div>
    </div>
  );
}