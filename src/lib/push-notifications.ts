/**
 * Push Notifications Utility
 * Handles push notification subscriptions and sending notifications for new blog posts
 */

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface BlogPostNotification {
  title: string;
  body: string;
  url: string;
  image?: string;
  tag?: string;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscriptionData | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported');
    return null;
  }

  try {
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      return subscriptionToData(existingSubscription);
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      // Note: In a real implementation, you would use your VAPID public key here
      // applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    console.log('Push notification subscription successful');
    return subscriptionToData(subscription);
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      const success = await subscription.unsubscribe();
      console.log('Push notification unsubscription successful');
      return success;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return false;
  }
}

/**
 * Check if user is subscribed to push notifications
 */
export async function isPushNotificationSubscribed(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch (error) {
    console.error('Failed to check push notification subscription:', error);
    return false;
  }
}

/**
 * Send a local notification (for testing purposes)
 */
export function sendLocalNotification(notification: BlogPostNotification): Notification | null {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return null;
  }

  const options: NotificationOptions & { 
    actions?: Array<{ action: string; title: string; icon?: string }>;
    image?: string;
  } = {
    body: notification.body,
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-96x96.svg',
    tag: notification.tag || 'blog-post',
    data: {
      url: notification.url,
    },
    actions: [
      {
        action: 'read',
        title: 'Read Now',
        icon: '/icons/icon-96x96.svg',
      },
      {
        action: 'dismiss',
        title: 'Later',
        icon: '/icons/icon-96x96.svg',
      },
    ],
    requireInteraction: false,
    silent: false,
    ...(notification.image && { image: notification.image }),
  };

  return new Notification(notification.title, options);
}

/**
 * Simulate sending a push notification for a new blog post
 * In a real implementation, this would be handled by your backend server
 */
export function simulateNewBlogPostNotification(post: {
  title: string;
  description: string;
  slug: string;
}): void {
  if (typeof window === 'undefined') return;

  // Simulate a delay as if the notification came from a server
  setTimeout(() => {
    const notification: BlogPostNotification = {
      title: 'New Blog Post Published!',
      body: `${post.title} - ${post.description}`,
      url: `/blog/${post.slug}`,
      tag: 'new-blog-post',
    };

    sendLocalNotification(notification);
  }, 1000);
}

/**
 * Store push subscription data (in a real app, send this to your server)
 */
export function storePushSubscription(subscriptionData: PushSubscriptionData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('push-subscription', JSON.stringify(subscriptionData));
    console.log('Push subscription stored locally');
    
    // In a real implementation, you would send this to your server:
    // await fetch('/api/push-subscription', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(subscriptionData)
    // });
  } catch (error) {
    console.error('Failed to store push subscription:', error);
  }
}

/**
 * Get stored push subscription data
 */
export function getStoredPushSubscription(): PushSubscriptionData | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem('push-subscription');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to get stored push subscription:', error);
    return null;
  }
}

/**
 * Convert PushSubscription to serializable data
 */
function subscriptionToData(subscription: PushSubscription): PushSubscriptionData {
  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
      auth: arrayBufferToBase64(subscription.getKey('auth')!),
    },
  };
}

/**
 * Convert ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string to Uint8Array (for VAPID keys)
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}