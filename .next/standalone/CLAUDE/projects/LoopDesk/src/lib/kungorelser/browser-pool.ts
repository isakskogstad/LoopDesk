/**
 * Browser Context Pool for Playwright
 *
 * Reuses browser contexts to reduce memory usage and startup time
 * Each context can be used multiple times before being disposed
 */

import type { Browser, BrowserContext } from 'playwright-core';

interface PooledContext {
  context: BrowserContext;
  createdAt: number;
  usageCount: number;
  inUse: boolean;
}

interface BrowserPoolConfig {
  maxContexts: number;          // Max concurrent contexts
  maxUsagePerContext: number;   // Max uses before recycling
  maxContextAge: number;        // Max age in ms before recycling
  idleTimeout: number;          // Time before cleaning up idle contexts
}

const DEFAULT_CONFIG: BrowserPoolConfig = {
  maxContexts: 5,               // Max 5 concurrent contexts
  maxUsagePerContext: 10,       // Recycle after 10 uses
  maxContextAge: 5 * 60 * 1000, // 5 minutes
  idleTimeout: 2 * 60 * 1000,   // 2 minutes idle timeout
};

class BrowserPool {
  private browser: Browser | null = null;
  private contexts: PooledContext[] = [];
  private config: BrowserPoolConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<BrowserPoolConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize browser instance
   */
  async init(browser: Browser): Promise<void> {
    this.browser = browser;

    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000); // Clean up every minute

    console.log('[BrowserPool] Initialized with max', this.config.maxContexts, 'contexts');
  }

  /**
   * Get or create a browser context
   */
  async acquire(options?: Parameters<Browser['newContext']>[0]): Promise<BrowserContext> {
    if (!this.browser) {
      throw new Error('Browser pool not initialized');
    }

    // Try to find an available context
    for (const pooled of this.contexts) {
      if (!pooled.inUse && this.isContextHealthy(pooled)) {
        pooled.inUse = true;
        pooled.usageCount++;
        console.log(`[BrowserPool] Reusing context (usage: ${pooled.usageCount}/${this.config.maxUsagePerContext})`);
        return pooled.context;
      }
    }

    // Create new context if under limit
    if (this.contexts.length < this.config.maxContexts) {
      const context = await this.browser.newContext(options);
      const pooled: PooledContext = {
        context,
        createdAt: Date.now(),
        usageCount: 1,
        inUse: true,
      };
      this.contexts.push(pooled);
      console.log(`[BrowserPool] Created new context (${this.contexts.length}/${this.config.maxContexts})`);
      return context;
    }

    // Wait for a context to become available
    console.log('[BrowserPool] Waiting for available context...');
    return this.waitForAvailableContext(options);
  }

  /**
   * Release a context back to the pool
   */
  async release(context: BrowserContext): Promise<void> {
    const pooled = this.contexts.find(p => p.context === context);
    if (!pooled) {
      // Context not from pool, close it
      await context.close().catch(() => {});
      return;
    }

    pooled.inUse = false;

    // Check if context should be recycled
    if (!this.isContextHealthy(pooled)) {
      await this.recycleContext(pooled);
    }
  }

  /**
   * Check if context is still healthy
   */
  private isContextHealthy(pooled: PooledContext): boolean {
    const now = Date.now();
    const age = now - pooled.createdAt;

    // Too old?
    if (age > this.config.maxContextAge) {
      return false;
    }

    // Used too many times?
    if (pooled.usageCount >= this.config.maxUsagePerContext) {
      return false;
    }

    return true;
  }

  /**
   * Wait for a context to become available
   */
  private async waitForAvailableContext(options?: Parameters<Browser['newContext']>[0]): Promise<BrowserContext> {
    // Wait up to 30 seconds for a context
    const timeout = 30000;
    const start = Date.now();

    while (Date.now() - start < timeout) {
      // Check for available context
      for (const pooled of this.contexts) {
        if (!pooled.inUse && this.isContextHealthy(pooled)) {
          pooled.inUse = true;
          pooled.usageCount++;
          return pooled.context;
        }
      }

      // Check for contexts that can be recycled
      for (const pooled of this.contexts) {
        if (!pooled.inUse) {
          await this.recycleContext(pooled);
          pooled.inUse = true;
          pooled.usageCount = 1;
          return pooled.context;
        }
      }

      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Timeout - force create new context
    console.warn('[BrowserPool] Timeout waiting for context, creating new one');
    const context = await this.browser!.newContext(options);
    return context;
  }

  /**
   * Recycle a context (close and recreate)
   */
  private async recycleContext(pooled: PooledContext): Promise<void> {
    console.log(`[BrowserPool] Recycling context (age: ${Date.now() - pooled.createdAt}ms, uses: ${pooled.usageCount})`);

    try {
      await pooled.context.close();
    } catch (err) {
      console.warn('[BrowserPool] Error closing context:', err);
    }

    // Create new context
    const newContext = await this.browser!.newContext();
    pooled.context = newContext;
    pooled.createdAt = Date.now();
    pooled.usageCount = 0;
    pooled.inUse = false;
  }

  /**
   * Clean up idle and unhealthy contexts
   */
  private async cleanup(): Promise<void> {
    const now = Date.now();
    const toRemove: number[] = [];

    for (let i = 0; i < this.contexts.length; i++) {
      const pooled = this.contexts[i];

      // Skip contexts in use
      if (pooled.inUse) continue;

      // Check if idle too long
      const idleTime = now - pooled.createdAt;
      if (idleTime > this.config.idleTimeout || !this.isContextHealthy(pooled)) {
        toRemove.push(i);
      }
    }

    // Remove contexts
    for (const index of toRemove.reverse()) {
      const pooled = this.contexts[index];
      try {
        await pooled.context.close();
      } catch (err) {
        console.warn('[BrowserPool] Error closing context during cleanup:', err);
      }
      this.contexts.splice(index, 1);
    }

    if (toRemove.length > 0) {
      console.log(`[BrowserPool] Cleaned up ${toRemove.length} idle contexts (${this.contexts.length} remaining)`);
    }
  }

  /**
   * Close all contexts and browser
   */
  async destroy(): Promise<void> {
    console.log('[BrowserPool] Destroying pool...');

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Close all contexts
    await Promise.all(
      this.contexts.map(p => p.context.close().catch(() => {}))
    );
    this.contexts = [];

    // Close browser
    if (this.browser) {
      await this.browser.close().catch(() => {});
      this.browser = null;
    }

    console.log('[BrowserPool] Destroyed');
  }

  /**
   * Get pool stats
   */
  getStats() {
    return {
      total: this.contexts.length,
      inUse: this.contexts.filter(p => p.inUse).length,
      available: this.contexts.filter(p => !p.inUse && this.isContextHealthy(p)).length,
      maxContexts: this.config.maxContexts,
    };
  }
}

// Singleton instance for the application
let globalPool: BrowserPool | null = null;

/**
 * Get the global browser pool
 */
export function getBrowserPool(): BrowserPool {
  if (!globalPool) {
    globalPool = new BrowserPool();
  }
  return globalPool;
}

/**
 * Initialize the global browser pool
 */
export async function initBrowserPool(browser: Browser): Promise<void> {
  const pool = getBrowserPool();
  await pool.init(browser);
}

/**
 * Destroy the global browser pool
 */
export async function destroyBrowserPool(): Promise<void> {
  if (globalPool) {
    await globalPool.destroy();
    globalPool = null;
  }
}

export default BrowserPool;
