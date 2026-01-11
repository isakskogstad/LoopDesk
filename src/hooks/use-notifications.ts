"use client";

import { useState, useEffect, useCallback } from "react";

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
  requestPermission: () => Promise<boolean>;
  updateSettings: (updates: Partial<NotificationSettings>) => void;
  notify: (options: NotifyOptions) => void;
  shouldNotify: (category: string | null) => boolean;
}

interface NotifyOptions {
  title: string;
  body: string;
  category?: string | null;
  url?: string;
  icon?: string;
}

/**
 * Hook for managing browser push notifications.
 */
export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isSupported, setIsSupported] = useState(false);

  // Check support and load settings on mount
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

      if (settings.criticalOnly) {
        return CRITICAL_CATEGORIES.includes(category);
      }

      return NOTIFICATION_CATEGORIES.includes(category);
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

      try {
        const notification = new Notification(title, {
          body,
          icon: icon || "/icon-192.png",
          badge: "/icon-192.png",
          tag: `loopdesk-${Date.now()}`, // Unique tag to allow multiple notifications
          requireInteraction: CRITICAL_CATEGORIES.includes(category || ""),
        });

        // Play sound if enabled
        if (settings.soundEnabled) {
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

        // Handle click - open URL if provided
        if (url) {
          notification.onclick = () => {
            window.focus();
            window.location.href = url;
            notification.close();
          };
        }

        // Auto-close non-critical notifications after 10 seconds
        if (!CRITICAL_CATEGORIES.includes(category || "")) {
          setTimeout(() => notification.close(), 10000);
        }
      } catch (error) {
        console.error("Failed to show notification:", error);
      }
    },
    [isSupported, permission, settings, shouldNotify]
  );

  return {
    permission,
    settings,
    isSupported,
    requestPermission,
    updateSettings,
    notify,
    shouldNotify,
  };
}

/**
 * Detect event category from text
 */
export function detectEventCategory(text: string): string | null {
  const lowerText = text.toLowerCase();

  const categories: Record<string, string[]> = {
    konkurs: ["konkurs", "konkursbeslut"],
    likvidation: ["likvidation", "likvidator"],
    fusion: ["fusion", "sammanslagning"],
    emission: ["nyemission", "fondemission", "riktad emission"],
    styrelse: ["styrelse", "ledamot", "ordförande", "vd"],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((kw) => lowerText.includes(kw))) {
      return category;
    }
  }

  return null;
}
