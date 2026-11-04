/**
 * Service Worker Registration and Management
 * Handles offline capability and caching for the application
 */

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  // Only register in production and if service workers are supported
  if (import.meta.env.DEV || !('serviceWorker' in navigator)) {
    console.log('[SW] Service Worker not registered (dev mode or unsupported)');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[SW] Service Worker registered successfully:', registration.scope);

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000); // Check every hour

    // Handle service worker updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            console.log('[SW] New version available! Reload to update.');
            
            // Notify user about update
            showUpdateNotification();
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('[SW] Service Worker registration failed:', error);
    return null;
  }
};

export const unregisterServiceWorker = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const success = await registration.unregister();
      console.log('[SW] Service Worker unregistered:', success);
      return success;
    }
    return false;
  } catch (error) {
    console.error('[SW] Service Worker unregistration failed:', error);
    return false;
  }
};

/**
 * Show update notification to user
 */
const showUpdateNotification = () => {
  // You can integrate this with your toast notification system
  if (window.confirm('A new version is available! Reload to update?')) {
    window.location.reload();
  }
};

/**
 * Check if the app is running in standalone mode (PWA)
 */
export const isStandalone = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone ||
    document.referrer.includes('android-app://')
  );
};

/**
 * Check if the user is online
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Listen for online/offline events
 */
export const setupNetworkListeners = (
  onOnline?: () => void,
  onOffline?: () => void
) => {
  window.addEventListener('online', () => {
    console.log('[SW] Back online');
    onOnline?.();
  });

  window.addEventListener('offline', () => {
    console.log('[SW] Gone offline');
    onOffline?.();
  });
};

/**
 * Send message to service worker
 */
export const sendMessageToSW = async (message: any): Promise<void> => {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    return;
  }

  navigator.serviceWorker.controller.postMessage(message);
};

/**
 * Clear all caches
 */
export const clearCaches = async (): Promise<void> => {
  await sendMessageToSW({ type: 'CLEAR_CACHE' });
  console.log('[SW] Cache clear requested');
};

/**
 * Force service worker update
 */
export const forceUpdate = async (): Promise<void> => {
  const registration = await navigator.serviceWorker.getRegistration();
  if (registration) {
    await registration.update();
    await sendMessageToSW({ type: 'SKIP_WAITING' });
    window.location.reload();
  }
};



