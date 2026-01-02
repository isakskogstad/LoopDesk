// Remove top-level constants that might be stale
// const API_KEY = process.env.TWOCAPTCHA_API_KEY || '';
// const STATIC_PROXY_SERVER = process.env.PROXY_SERVER || '';
// ...

function normalizeProxyServer(server: string): string {
  if (!server) return server;
  if (server.includes('://')) {
    return server;
  }
  return `http://${server}`;
}

export interface Proxy {
  id: string;
  host: string;
  port: number;
  url: string;
  source: string;
  username?: string;
  password?: string;
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
  private failedProxies = new Set<string>();
  private proxyFailures = new Map<string, number>();
  private maxFailures = 3;
  private activationReason: string | null = null;

  // ... (methods shouldActivate, recordCaptcha, etc. - no changes needed)

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
   * Fetch proxies from 2captcha API (credential-based residential proxies)
   */
  async fetchProxies(): Promise<Proxy[]> {
    // Read env vars fresh
    const STATIC_PROXY_SERVER = process.env.PROXY_SERVER || '';
    const STATIC_PROXY_USERNAME = process.env.PROXY_USERNAME || '';
    const STATIC_PROXY_PASSWORD = process.env.PROXY_PASSWORD || '';
    const API_KEY = process.env.TWOCAPTCHA_API_KEY || '';

    // Priority 1: Static Env Var
    if (STATIC_PROXY_SERVER && STATIC_PROXY_SERVER !== 'disabled') {
      const server = normalizeProxyServer(STATIC_PROXY_SERVER);
      const hostPort = server.replace(/^[a-z]+:\/\//, '').split('/')[0];
      const [host, portRaw] = hostPort.split(':');
      const port = parseInt(portRaw || '80', 10);

      this.proxies = [
        {
          id: server,
          host,
          port,
          url: server,
          source: 'static',
          username: STATIC_PROXY_USERNAME || undefined,
          password: STATIC_PROXY_PASSWORD || undefined,
        },
      ];
      this.lastFetchTime = Date.now();
      this.failedProxies.clear();
      this.proxyFailures.clear();
      console.log('[ProxyManager] Using static proxy from environment');
      return this.proxies;
    }

    // Priority 2: Fallback to user-provided 2captcha session (hardcoded fix)
    // This solves the "IP address is missing" error by using a specific pre-allocated session
    if (!API_KEY) {
      console.log('[ProxyManager] No API key, using fallback 2captcha session');
      this.proxies = [{
        id: '43.157.126.177:2334',
        host: '43.157.126.177',
        port: 2334,
        url: 'http://43.157.126.177:2334',
        source: 'fallback',
        username: 'ub11557c956fd05c3-zone-custom-region-se-session-QGVaVSUg0-sessTime-1',
        password: 'ub11557c956fd05c3'
      }];
      this.lastFetchTime = Date.now();
      return this.proxies;
    }

    const now = Date.now();
    if (now - this.lastFetchTime < this.fetchCooldown && this.proxies.length > 0) {
      console.log('[ProxyManager] Using cached proxies');
      return this.proxies;
    }

    try {
      console.log('[ProxyManager] Fetching 10 SE proxies from 2captcha...');

      const url = new URL('https://api.2captcha.com/proxy');
      url.searchParams.set('key', API_KEY);
      url.searchParams.set('country', 'se');
      url.searchParams.set('type', 'residential');
      url.searchParams.set('limit', '10');

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.status === 'OK' && Array.isArray(data.data)) {
        const proxies = data.data
          .map((entry: string | Record<string, unknown>) => {
            if (typeof entry === 'string') {
              const [host, port] = entry.split(':');
              if (!host || !port) return null;
              return {
                id: entry,
                host,
                port: parseInt(port, 10),
                url: `http://${entry}`,
                source: '2captcha',
              };
            }

            const proxyObj = entry as Record<string, unknown>;
            const proxyString = (proxyObj.proxy || proxyObj.proxy_string || proxyObj.ip_port) as
              | string
              | undefined;
            const host =
              (proxyObj.host as string | undefined) ||
              (proxyObj.ip as string | undefined) ||
              (proxyString ? proxyString.split(':')[0] : undefined);
            const portValue =
              (proxyObj.port as number | string | undefined) ||
              (proxyString ? proxyString.split(':')[1] : undefined);

            if (!host || !portValue) return null;

            const port = typeof portValue === 'string' ? parseInt(portValue, 10) : portValue;
            const protocol =
              (proxyObj.protocol as string | undefined) ||
              (proxyObj.type as string | undefined) ||
              'http';
            const username =
              (proxyObj.login as string | undefined) ||
              (proxyObj.username as string | undefined) ||
              (proxyObj.user as string | undefined);
            const password =
              (proxyObj.password as string | undefined) ||
              (proxyObj.pass as string | undefined);

            return {
              id: `${host}:${port}`,
              host,
              port,
              url: `${protocol}://${host}:${port}`,
              source: '2captcha',
              username,
              password,
            };
          })
          .filter((proxy: Proxy | null): proxy is Proxy => Boolean(proxy));

        this.proxies = proxies;
        this.lastFetchTime = now;
        this.failedProxies.clear();
        this.proxyFailures.clear();
        console.log(`[ProxyManager] Got ${this.proxies.length} proxies from 2captcha`);
      } else {
        console.error(`[ProxyManager] 2captcha error: ${data.message || JSON.stringify(data)}`);
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
    const API_KEY = process.env.TWOCAPTCHA_API_KEY || '';
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
   * Activate proxy mode (like Electron app)
   */
  async activate(reason: string): Promise<boolean> {
    if (this.isActive) {
      console.log('[ProxyManager] Already active');
      return true;
    }

    console.log(`[ProxyManager] ACTIVATING PROXY - Reason: ${reason}`);
    this.isActive = true;
    this.activationReason = reason;

    const proxies = await this.fetchProxies();
    if (proxies.length === 0) {
      console.warn('[ProxyManager] No proxies available');
      return false;
    }

    this.currentIndex = 0;
    this.resetStats();

    console.log(`[ProxyManager] Activated with ${proxies.length} proxies`);
    return true;
  }

  /**
   * Deactivate proxy mode
   */
  deactivate(): void {
    console.log('[ProxyManager] Deactivating proxy');
    this.isActive = false;
    this.activationReason = null;
    this.resetStats();
  }

  /**
   * Get current proxy for Playwright (supports credentials)
   */
  getCurrentProxy(): { server: string; username?: string; password?: string } | null {
    if (!this.isActive || this.proxies.length === 0) {
      return null;
    }

    const proxy = this.proxies[this.currentIndex];
    return {
      server: proxy.url,
      username: proxy.username,
      password: proxy.password,
    };
  }

  /**
   * Mark proxy as failed
   */
  markFailed(proxy: Proxy | { server: string } | null): void {
    if (!proxy) return;

    const proxyUrl = 'server' in proxy ? proxy.server : proxy.url;
    const failures = (this.proxyFailures.get(proxyUrl) || 0) + 1;
    this.proxyFailures.set(proxyUrl, failures);

    if (failures >= this.maxFailures) {
      console.log(`[ProxyManager] Proxy ${proxyUrl} marked as failed`);
      this.failedProxies.add(proxyUrl);
    }
  }

  /**
   * Mark proxy as successful
   */
  markSuccess(proxy: Proxy | { server: string } | null): void {
    if (!proxy) return;

    const proxyUrl = 'server' in proxy ? proxy.server : proxy.url;
    this.proxyFailures.set(proxyUrl, 0);
  }

  /**
   * Get Playwright browser context options with proxy
   */
  getPlaywrightConfig(
    proxy?: Proxy | { server: string; username?: string; password?: string } | null
  ): { proxy?: { server: string; username?: string; password?: string } } {
    // If no proxy provided, use current proxy
    const proxyToUse = proxy || this.getCurrentProxy();
    if (!proxyToUse) return {};

    const server = 'server' in proxyToUse ? proxyToUse.server : proxyToUse.url;
    const username = (proxyToUse as { username?: string }).username;
    const password = (proxyToUse as { password?: string }).password;
    return {
      proxy: {
        server,
        username,
        password,
      },
    };
  }

  /**
   * Get next proxy and rotate (skip failed proxies like Electron)
   */
  getNext(): Proxy | null {
    if (!this.isActive || this.proxies.length === 0) {
      return null;
    }

    // Find next non-failed proxy
    let attempts = 0;
    while (attempts < this.proxies.length) {
      const proxy = this.proxies[this.currentIndex];
      this.currentIndex = (this.currentIndex + 1) % this.proxies.length;

      if (!this.failedProxies.has(proxy.url)) {
        return proxy;
      }
      attempts++;
    }

    // All proxies failed, reset and return first
    console.log('[ProxyManager] All proxies exhausted, resetting...');
    this.failedProxies.clear();
    this.proxyFailures.clear();
    return this.proxies[0] || null;
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
   * Get current status (like Electron app)
   */
  getStatus(): {
    isActive: boolean;
    enabled: boolean;
    reason: string | null;
    total: number;
    failed: number;
    available: number;
  } {
    return {
      isActive: this.isActive,
      enabled: this.isActive,
      reason: this.activationReason,
      total: this.proxies.length,
      failed: this.failedProxies.size,
      available: this.proxies.length - this.failedProxies.size,
    };
  }

  /**
   * Refresh proxies if running low
   */
  async refresh(): Promise<void> {
    const now = Date.now();
    if (now - this.lastFetchTime < this.fetchCooldown && this.proxies.length >= 3) {
      return;
    }

    try {
      // Check balance first
      const balance = await this.checkBalance();
      if (balance < 0.1) {
        console.warn(`[ProxyManager] Low balance: $${balance} - proxy disabled`);
        return;
      }

      const newProxies = await this.fetchProxies();

      if (newProxies.length > 0) {
        this.proxies = newProxies;
        this.currentIndex = 0;
        this.lastFetchTime = now;
        this.failedProxies.clear();
        this.proxyFailures.clear();
        console.log(`[ProxyManager] Refreshed ${newProxies.length} proxies`);
      }
    } catch (err) {
      console.error(`[ProxyManager] Refresh failed:`, err);
    }
  }

  /**
   * Get stats for monitoring
   */
  getStats() {
    return {
      enabled: this.isActive,
      reason: this.activationReason,
      total: this.proxies.length,
      failed: this.failedProxies.size,
      available: this.proxies.length - this.failedProxies.size,
    };
  }
}

// Singleton instance
export const proxyManager = new ProxyManager();

export default proxyManager;
