/**
 * Proxy Manager - Smart proxy activation based on blocking stats
 *
 * Ported from Electron Bolags app proxy-manager.js
 * Uses 2captcha proxy API for Swedish residential proxies
 */

const API_KEY = process.env.TWOCAPTCHA_API_KEY || '';

export interface Proxy {
  id: string;
  type: string;
  ip: string;
  port: number;
  login: string;
  password: string;
  url: string;
}

export interface BlockingStats {
  http429Count: number;
  consecutiveCaptchas: number;
  lastCaptchaTime: number;
  sessionBlocked: boolean;
}

// Thresholds for proxy activation
const THRESHOLDS = {
  HTTP_429_COUNT: 3,        // Activate after 3 rate limit responses
  CONSECUTIVE_CAPTCHAS: 5,  // Activate after 5 consecutive CAPTCHAs
  CAPTCHA_BURST_WINDOW: 60000, // 1 minute window for burst detection
  CAPTCHA_BURST_COUNT: 3,   // 3 CAPTCHAs in 1 minute triggers activation
};

class ProxyManager {
  private proxies: Proxy[] = [];
  private currentIndex = 0;
  private isActive = false;
  private lastFetchTime = 0;
  private fetchCooldown = 300000; // 5 minutes between fetches
  private balance = 0;
  private blockingStats: BlockingStats = {
    http429Count: 0,
    consecutiveCaptchas: 0,
    lastCaptchaTime: 0,
    sessionBlocked: false,
  };
  private captchaTimes: number[] = [];

  /**
   * Check if proxy should be activated based on blocking stats
   */
  shouldActivate(): { shouldActivate: boolean; reason: string | null } {
    if (this.isActive) {
      return { shouldActivate: false, reason: null };
    }

    // Check HTTP 429 count
    if (this.blockingStats.http429Count >= THRESHOLDS.HTTP_429_COUNT) {
      return {
        shouldActivate: true,
        reason: `Rate limited ${this.blockingStats.http429Count} times`,
      };
    }

    // Check consecutive CAPTCHAs
    if (this.blockingStats.consecutiveCaptchas >= THRESHOLDS.CONSECUTIVE_CAPTCHAS) {
      return {
        shouldActivate: true,
        reason: `${this.blockingStats.consecutiveCaptchas} consecutive CAPTCHAs`,
      };
    }

    // Check CAPTCHA burst (many CAPTCHAs in short time)
    const now = Date.now();
    const recentCaptchas = this.captchaTimes.filter(
      (t) => now - t < THRESHOLDS.CAPTCHA_BURST_WINDOW
    );
    if (recentCaptchas.length >= THRESHOLDS.CAPTCHA_BURST_COUNT) {
      return {
        shouldActivate: true,
        reason: `${recentCaptchas.length} CAPTCHAs in ${THRESHOLDS.CAPTCHA_BURST_WINDOW / 1000}s`,
      };
    }

    // Check session blocked flag
    if (this.blockingStats.sessionBlocked) {
      return {
        shouldActivate: true,
        reason: 'Session blocked',
      };
    }

    return { shouldActivate: false, reason: null };
  }

  /**
   * Record a CAPTCHA encounter
   */
  recordCaptcha(): void {
    const now = Date.now();
    this.blockingStats.consecutiveCaptchas++;
    this.blockingStats.lastCaptchaTime = now;
    this.captchaTimes.push(now);

    // Clean old captcha times
    this.captchaTimes = this.captchaTimes.filter(
      (t) => now - t < THRESHOLDS.CAPTCHA_BURST_WINDOW * 2
    );

    console.log(
      `[ProxyManager] CAPTCHA recorded: consecutive=${this.blockingStats.consecutiveCaptchas}`
    );
  }

  /**
   * Record a successful request (resets consecutive counter)
   */
  recordSuccess(): void {
    this.blockingStats.consecutiveCaptchas = 0;
  }

  /**
   * Record an HTTP 429 response
   */
  recordRateLimit(): void {
    this.blockingStats.http429Count++;
    console.log(
      `[ProxyManager] Rate limit recorded: count=${this.blockingStats.http429Count}`
    );
  }

  /**
   * Record session blocked
   */
  recordSessionBlocked(): void {
    this.blockingStats.sessionBlocked = true;
    console.log('[ProxyManager] Session blocked recorded');
  }

  /**
   * Reset blocking stats
   */
  resetStats(): void {
    this.blockingStats = {
      http429Count: 0,
      consecutiveCaptchas: 0,
      lastCaptchaTime: 0,
      sessionBlocked: false,
    };
    this.captchaTimes = [];
  }

  /**
   * Fetch proxies from 2captcha API
   */
  async fetchProxies(): Promise<Proxy[]> {
    if (!API_KEY) {
      console.warn('[ProxyManager] No API key configured');
      return [];
    }

    const now = Date.now();
    if (now - this.lastFetchTime < this.fetchCooldown && this.proxies.length > 0) {
      console.log('[ProxyManager] Using cached proxies');
      return this.proxies;
    }

    try {
      console.log('[ProxyManager] Fetching proxies from 2captcha...');

      const url = new URL('https://2captcha.com/api/v1/proxy');
      url.searchParams.set('key', API_KEY);
      url.searchParams.set('country', 'SE'); // Sweden
      url.searchParams.set('type', 'residential');
      url.searchParams.set('limit', '10');

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.status === 1 && data.proxies) {
        this.proxies = data.proxies.map((p: {
          id?: string;
          type?: string;
          ip: string;
          port: number;
          login?: string;
          password?: string;
        }) => ({
          id: p.id || `${p.ip}:${p.port}`,
          type: p.type || 'residential',
          ip: p.ip,
          port: p.port,
          login: p.login || '',
          password: p.password || '',
          url: p.login
            ? `http://${p.login}:${p.password}@${p.ip}:${p.port}`
            : `http://${p.ip}:${p.port}`,
        }));
        this.lastFetchTime = now;
        console.log(`[ProxyManager] Fetched ${this.proxies.length} proxies`);
      } else {
        console.warn('[ProxyManager] Failed to fetch proxies:', data);
      }
    } catch (error) {
      console.error('[ProxyManager] Error fetching proxies:', error);
    }

    return this.proxies;
  }

  /**
   * Check 2captcha balance
   */
  async checkBalance(): Promise<number> {
    if (!API_KEY) return 0;

    try {
      const url = new URL('https://2captcha.com/res.php');
      url.searchParams.set('key', API_KEY);
      url.searchParams.set('action', 'getbalance');
      url.searchParams.set('json', '1');

      const response = await fetch(url.toString());
      const result = await response.json();

      if (result.status === 1) {
        this.balance = parseFloat(result.request);
        return this.balance;
      }
    } catch (error) {
      console.error('[ProxyManager] Error checking balance:', error);
    }

    return 0;
  }

  /**
   * Activate proxy mode
   */
  async activate(reason: string): Promise<boolean> {
    if (this.isActive) {
      console.log('[ProxyManager] Already active');
      return true;
    }

    console.log(`[ProxyManager] Activating: ${reason}`);

    const proxies = await this.fetchProxies();
    if (proxies.length === 0) {
      console.warn('[ProxyManager] No proxies available');
      return false;
    }

    this.isActive = true;
    this.currentIndex = 0;
    this.resetStats();

    console.log(`[ProxyManager] Activated with ${proxies.length} proxies`);
    return true;
  }

  /**
   * Deactivate proxy mode
   */
  deactivate(): void {
    console.log('[ProxyManager] Deactivating');
    this.isActive = false;
    this.resetStats();
  }

  /**
   * Get current proxy for Playwright
   */
  getCurrentProxy(): { server: string; username?: string; password?: string } | null {
    if (!this.isActive || this.proxies.length === 0) {
      return null;
    }

    const proxy = this.proxies[this.currentIndex];
    return {
      server: proxy.url,
      username: proxy.login,
      password: proxy.password,
    };
  }

  /**
   * Get next proxy and rotate (for concurrent workers)
   */
  getNext(): Proxy | null {
    if (!this.isActive || this.proxies.length === 0) {
      return null;
    }

    const proxy = this.proxies[this.currentIndex];
    this.rotateProxy();
    return proxy;
  }

  /**
   * Mark proxy as failed
   */
  markFailed(proxy: Proxy | null): void {
    if (!proxy) return;
    console.log(`[ProxyManager] Marked proxy as failed: ${proxy.url}`);
    // In a full implementation, this would track failure counts per proxy
    // For now, just rotate to next proxy
    this.rotateProxy();
  }

  /**
   * Mark proxy as successful
   */
  markSuccess(proxy: Proxy | null): void {
    if (!proxy) return;
    // In a full implementation, this would track success counts per proxy
  }

  /**
   * Rotate to next proxy
   */
  rotateProxy(): void {
    if (this.proxies.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
    console.log(`[ProxyManager] Rotated to proxy ${this.currentIndex + 1}/${this.proxies.length}`);
  }

  /**
   * Get Playwright browser context options with proxy
   */
  getPlaywrightConfig(): { proxy?: { server: string; username?: string; password?: string } } {
    const proxy = this.getCurrentProxy();
    return proxy ? { proxy } : {};
  }

  /**
   * Get current status
   */
  getStatus(): {
    isActive: boolean;
    proxyCount: number;
    currentIndex: number;
    balance: number;
    blockingStats: BlockingStats;
  } {
    return {
      isActive: this.isActive,
      proxyCount: this.proxies.length,
      currentIndex: this.currentIndex,
      balance: this.balance,
      blockingStats: { ...this.blockingStats },
    };
  }
}

// Singleton instance
export const proxyManager = new ProxyManager();

export default proxyManager;
