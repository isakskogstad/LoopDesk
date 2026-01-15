/**
 * LoopDesk Service Worker
 * Handles caching, offline support, and push notifications for company events
 */

const CACHE_NAME = "loopdesk-v2";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Service worker activated");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache API responses for offline
  if (url.pathname.startsWith("/api/feeds") || url.pathname.startsWith("/api/nyheter")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        try {
          const response = await fetch(request);
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        } catch {
          const cached = await cache.match(request);
          return cached || new Response(JSON.stringify({ error: "Offline" }), {
            headers: { "Content-Type": "application/json" },
          });
        }
      })
    );
    return;
  }

  // Network first, fallback to cache for other requests
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// ==========================================
// PUSH NOTIFICATIONS
// ==========================================

// Push event - triggered when a push notification is received
self.addEventListener("push", (event) => {
  console.log("[SW] Push received:", event);

  let data = {
    title: "LoopDesk",
    body: "Ny bolagshändelse",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: "loopdesk-event",
    url: "/bolaghandelser",
    critical: false,
  };

  // Parse push data if available
  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      console.error("[SW] Failed to parse push data:", e);
      // Try as text
      try {
        data.body = event.data.text();
      } catch {
        // Ignore
      }
    }
  }

  // Critical events (konkurs, likvidation) get special treatment
  const isCritical = data.critical ||
    data.title?.toLowerCase().includes("konkurs") ||
    data.title?.toLowerCase().includes("likvidation");

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: { url: data.url },
    requireInteraction: isCritical, // Critical notifications stay until dismissed
    silent: false,
    actions: [
      { action: "view", title: "Visa" },
      { action: "dismiss", title: "Avvisa" },
    ],
    vibrate: isCritical ? [200, 100, 200, 100, 200] : [100, 50, 100],
  };

  // Mac notifications: macOS shows native notifications when the browser
  // is in the background, as long as the service worker is registered
  // and notification permission is granted.

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.action);

  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  // Open or focus the app
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Try to focus an existing window
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open a new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Notification close event
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed");
});

// ==========================================
// MESSAGE HANDLING
// ==========================================

// Message event - for communication with the main app
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data);

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  // Handle test notification from the app
  if (event.data.type === "TEST_NOTIFICATION") {
    self.registration.showNotification("LoopDesk Test", {
      body: "Push-notiser fungerar! Du kommer få varningar vid bolagshändelser.",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "loopdesk-test",
      requireInteraction: false,
    });
  }

  // Handle local notification (from client-side realtime)
  if (event.data.type === "SHOW_NOTIFICATION") {
    const { title, body, url, critical } = event.data;
    self.registration.showNotification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: `loopdesk-${Date.now()}`,
      data: { url },
      requireInteraction: critical || false,
      actions: [
        { action: "view", title: "Visa" },
        { action: "dismiss", title: "Avvisa" },
      ],
    });
  }
});

// ==========================================
// BACKGROUND SYNC
// ==========================================

// Background sync event - for offline capability
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag);

  if (event.tag === "sync-articles") {
    event.waitUntil(syncArticles());
  }
});

// Sync articles in background
async function syncArticles() {
  try {
    const response = await fetch("/api/nyheter/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    console.log("[SW] Articles synced:", response.ok);
  } catch (error) {
    console.error("[SW] Failed to sync articles:", error);
  }
}

// Periodic sync (if supported)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "sync-company-events") {
    event.waitUntil(syncArticles());
  }
});
