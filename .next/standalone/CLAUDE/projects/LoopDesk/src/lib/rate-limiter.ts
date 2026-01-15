/**
 * Simple in-memory rate limiter for API routes
 *
 * Uses sliding window algorithm to track requests per IP/user
 * For production with multiple Railway instances, consider Redis-based rate limiting
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RequestLog {
  timestamps: number[];
}

class RateLimiter {
  private requests = new Map<string, RequestLog>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up old entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if request is allowed
   * @returns { allowed: boolean, remaining: number, resetAt: Date }
   */
  check(
    identifier: string,
    config: RateLimitConfig
  ): { allowed: boolean; remaining: number; resetAt: Date } {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get or create request log
    let log = this.requests.get(identifier);
    if (!log) {
      log = { timestamps: [] };
      this.requests.set(identifier, log);
    }

    // Filter out timestamps outside the window
    log.timestamps = log.timestamps.filter(t => t > windowStart);

    // Check if limit exceeded
    const allowed = log.timestamps.length < config.maxRequests;

    if (allowed) {
      // Add current request
      log.timestamps.push(now);
    }

    // Calculate remaining requests
    const remaining = Math.max(0, config.maxRequests - log.timestamps.length);

    // Calculate when the window resets
    const oldestTimestamp = log.timestamps[0] || now;
    const resetAt = new Date(oldestTimestamp + config.windowMs);

    return { allowed, remaining, resetAt };
  }

  /**
   * Clean up old entries to prevent memory leaks
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    for (const [key, log] of this.requests.entries()) {
      // Remove if no recent requests
      if (log.timestamps.length === 0 || log.timestamps[log.timestamps.length - 1] < now - maxAge) {
        this.requests.delete(key);
      }
    }

    console.log(`[RateLimiter] Cleanup: ${this.requests.size} active identifiers`);
  }

  /**
   * Reset rate limit for an identifier
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Get current stats
   */
  getStats(): { activeIdentifiers: number; totalRequests: number } {
    let totalRequests = 0;
    for (const log of this.requests.values()) {
      totalRequests += log.timestamps.length;
    }
    return {
      activeIdentifiers: this.requests.size,
      totalRequests,
    };
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Rate limit configurations
export const RATE_LIMITS = {
  // General API endpoints
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 100 requests per minute
  },
  // Scraping endpoints (expensive)
  scraping: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 10 searches per minute
  },
  // Auth endpoints (sensitive)
  auth: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 5 login attempts per minute
  },
  // Heavy endpoints (database intensive)
  heavy: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 20 requests per minute
  },
} as const;

/**
 * Create rate limit middleware
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return (identifier: string): { allowed: boolean; remaining: number; resetAt: Date } => {
    return rateLimiter.check(identifier, config);
  };
}
