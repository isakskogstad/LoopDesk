/**
 * Proxy Manager Initialization - Auto-refresh for Railway deployments
 *
 * Railway assigns new IP on each deploy → proxies need refreshing
 * This module ensures proxies are always fresh
 */

import { proxyManager } from './proxy-manager';

// Track last refresh
let lastRefresh = 0;
let refreshInterval: NodeJS.Timeout | null = null;

// Refresh interval: 4 hours (14400000ms)
const REFRESH_INTERVAL_MS = 4 * 60 * 60 * 1000;

/**
 * Initialize proxy auto-refresh
 * Called once when app starts
 */
export async function initializeProxyManager(): Promise<void> {
  // Only initialize if 2captcha API key is configured
  if (!process.env.TWOCAPTCHA_API_KEY) {
    console.log('[ProxyInit] Skipping proxy initialization (no API key)');
    return;
  }
  if (process.env.PROXY_SERVER && process.env.PROXY_SERVER !== 'disabled') {
    console.log('[ProxyInit] Skipping proxy initialization (static proxy configured)');
    return;
  }

  console.log('[ProxyInit] Initializing proxy auto-refresh...');

  // Initial refresh
  try {
    await refreshProxies();
  } catch (error) {
    console.error('[ProxyInit] Initial refresh failed:', error);
  }

  // Set up periodic refresh (every 4 hours)
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  refreshInterval = setInterval(async () => {
    try {
      await refreshProxies();
    } catch (error) {
      console.error('[ProxyInit] Periodic refresh failed:', error);
    }
  }, REFRESH_INTERVAL_MS);

  console.log(`[ProxyInit] Auto-refresh scheduled every ${REFRESH_INTERVAL_MS / 1000 / 60 / 60} hours`);
}

/**
 * Refresh proxies if needed
 */
async function refreshProxies(): Promise<void> {
  const now = Date.now();

  // Skip if refreshed recently (within 5 minutes)
  if (now - lastRefresh < 5 * 60 * 1000) {
    console.log('[ProxyInit] Skipping refresh (too recent)');
    return;
  }

  console.log('[ProxyInit] Refreshing proxies...');
  await proxyManager.refresh();
  lastRefresh = now;

  const status = proxyManager.getStatus();
  console.log(`[ProxyInit] Refresh complete - ${status.available}/${status.total} proxies available`);
}

/**
 * Force refresh proxies (called on-demand)
 */
export async function forceRefreshProxies(): Promise<void> {
  if (process.env.PROXY_SERVER && process.env.PROXY_SERVER !== 'disabled') {
    console.log('[ProxyInit] Skipping refresh (static proxy configured)');
    return;
  }
  console.log('[ProxyInit] Force refreshing proxies...');
  lastRefresh = 0; // Reset to allow immediate refresh
  await refreshProxies();
}

/**
 * Stop auto-refresh (cleanup)
 */
export function stopProxyRefresh(): void {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log('[ProxyInit] Auto-refresh stopped');
  }
}

// Auto-initialize on import (happens once per Node.js process)
if (typeof window === 'undefined') {
  // Only run in server environment
  initializeProxyManager().catch(err => {
    console.error('[ProxyInit] Failed to initialize:', err);
  });
}
