"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const NOTIFICATION_SETTINGS_KEY = "loopdesk_notification_settings";

type NotificationPermission = "default" | "granted" | "denied";

interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  criticalOnly: boolean; // Only konkurs/likvidation
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  soundEnabled: false,
  criticalOnly: true,
};

// Critical event categories that trigger notifications
const CRITICAL_CATEGORIES = ["konkurs", "likvidation"];

// All notification-worthy categories
const NOTIFICATION_CATEGORIES = ["konkurs", "likvidation", "fusion", "emission"];

interface UseNotificationsReturn {
  permission: NotificationPermission;
  settings: NotificationSettings;
  isSupported: boolean;
  serviceWorkerReady: boolean;
  requestPermission: () => Promise<boolean>;
  updateSettings: (updates: Partial<NotificationSettings>) => void;
  notify: (options: NotifyOptions) => void;
  shouldNotify: (category: string | null) => boolean;
  testNotification: () => void;
}

interface NotifyOptions {
  title: string;
  body: string;
  category?: string | null;
  url?: string;
  icon?: string;
}

/**
 * Hook for managing browser and Mac push notifications.
 *
 * Uses the Service Worker for persistent notifications that work:
 * - When the browser is in the background
 * - On macOS via native notification center
 * - With action buttons (view/dismiss)
 */
export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isSupported, setIsSupported] = useState(false);
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);

  // Check support, load settings, and register service worker on mount
  useEffect(() => {
    const supported = typeof window !== "undefined" && "Notification" in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission as NotificationPermission);
    }

    // Load settings from localStorage
    try {
      const stored = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.warn("Failed to load notification settings:", error);
    }

    // Register service worker for persistent notifications
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[Notifications] Service worker registered:", registration.scope);
          swRegistrationRef.current = registration;
          setServiceWorkerReady(true);

          // Handle updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New version available
                  console.log("[Notifications] New service worker available");
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn("[Notifications] Service worker registration failed:", error);
        });
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: NotificationSettings) => {
    try {
      localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.warn("Failed to save notification settings:", error);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);

      // If granted, test the notification to ensure it works
      if (result === "granted") {
        console.log("[Notifications] Permission granted");
      }

      return result === "granted";
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      return false;
    }
  }, [isSupported]);

  const updateSettings = useCallback((updates: Partial<NotificationSettings>) => {
    setSettings((prev) => {
      const newSettings = { ...prev, ...updates };
      saveSettings(newSettings);
      return newSettings;
    });
  }, [saveSettings]);

  const shouldNotify = useCallback(
    (category: string | null): boolean => {
      if (!settings.enabled) return false;
      if (!category) return false;

      const normalizedCategory = category.toLowerCase();

      if (settings.criticalOnly) {
        return CRITICAL_CATEGORIES.includes(normalizedCategory);
      }

      return NOTIFICATION_CATEGORIES.includes(normalizedCategory);
    },
    [settings]
  );

  const notify = useCallback(
    ({ title, body, category, url, icon }: NotifyOptions) => {
      if (!isSupported || permission !== "granted" || !settings.enabled) {
        return;
      }

      // Check if we should notify for this category
      if (category && !shouldNotify(category)) {
        return;
      }

      const isCritical = category && CRITICAL_CATEGORIES.includes(category.toLowerCase());

      // Use service worker for persistent notifications (works in background + Mac)
      if (serviceWorkerReady && swRegistrationRef.current?.active) {
        swRegistrationRef.current.active.postMessage({
          type: "SHOW_NOTIFICATION",
          title,
          body,
          url,
          critical: isCritical,
        });

        // Play sound if enabled (sound doesn't work from SW)
        if (settings.soundEnabled) {
          playNotificationSound();
        }

        return;
      }

      // Fallback to regular Notification API
      try {
        const notification = new Notification(title, {
          body,
          icon: icon || "/icon-192.png",
          badge: "/icon-192.png",
          tag: `loopdesk-${Date.now()}`,
          requireInteraction: isCritical || false,
        });

        // Play sound if enabled
        if (settings.soundEnabled) {
          playNotificationSound();
        }

        // Handle click - open URL if provided
        if (url) {
          notification.onclick = () => {
            window.focus();
            window.location.href = url;
            notification.close();
          };
        }

        // Auto-close non-critical notifications after 10 seconds
        if (!isCritical) {
          setTimeout(() => notification.close(), 10000);
        }
      } catch (error) {
        console.error("Failed to show notification:", error);
      }
    },
    [isSupported, permission, settings, shouldNotify, serviceWorkerReady]
  );

  // Test notification
  const testNotification = useCallback(() => {
    if (serviceWorkerReady && swRegistrationRef.current?.active) {
      swRegistrationRef.current.active.postMessage({
        type: "TEST_NOTIFICATION",
      });
    } else if (permission === "granted") {
      new Notification("LoopDesk Test", {
        body: "Push-notiser fungerar!",
        icon: "/icon-192.png",
      });
    }
  }, [serviceWorkerReady, permission]);

  return {
    permission,
    settings,
    isSupported,
    serviceWorkerReady,
    requestPermission,
    updateSettings,
    notify,
    shouldNotify,
    testNotification,
  };
}

/**
 * Play notification sound
 */
function playNotificationSound() {
  try {
    const audio = new Audio("/sounds/notification.mp3");
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Ignore audio play errors (common due to autoplay policies)
    });
  } catch {
    // Ignore audio errors
  }
}

/**
 * Detect event category from text
 */
export function detectEventCategory(text: string): string | null {
  const lowerText = text.toLowerCase();

  const categories: Record<string, string[]> = {
    konkurs: ["konkurs", "konkursbeslut", "konkursförfarande"],
    likvidation: ["likvidation", "likvidator", "upplösning"],
    fusion: ["fusion", "sammanslagning", "delning"],
    emission: ["nyemission", "fondemission", "riktad emission", "aktiekapital"],
    styrelse: ["styrelse", "ledamot", "ordförande", "vd", "verkställande direktör"],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((kw) => lowerText.includes(kw))) {
      return category;
    }
  }

  return null;
}
