/**
 * Session Manager - Cookie persistence to reduce CAPTCHAs
 *
 * Stores and restores browser session cookies between scrape runs
 * In serverless environments, uses in-memory cache with fallback
 */

import type { BrowserContext } from 'playwright-core';

export interface SessionCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
}

export interface SessionData {
  cookies: SessionCookie[];
  savedAt: number;
  userAgent?: string;
}

// In-memory session cache (for serverless environments)
// In production, this could be Redis or database-backed
const sessionCache = new Map<string, SessionData>();

// Session expiry time (4 hours)
const SESSION_EXPIRY_MS = 4 * 60 * 60 * 1000;

class SessionManager {
  private sessionKey = 'poit_session';

  /**
   * Save cookies from browser context
   */
  async saveCookies(context: BrowserContext): Promise<void> {
    try {
      const cookies = await context.cookies();

      // Filter to only POIT-related cookies
      const poitCookies = cookies
        .filter(c =>
          c.domain.includes('bolagsverket.se') ||
          c.domain.includes('poit')
        )
        .map(c => ({
          name: c.name,
          value: c.value,
          domain: c.domain,
          path: c.path,
          expires: c.expires,
          httpOnly: c.httpOnly,
          secure: c.secure,
          sameSite: c.sameSite as 'Strict' | 'Lax' | 'None',
        }));

      if (poitCookies.length === 0) {
        console.log('[SessionManager] No POIT cookies to save');
        return;
      }

      const sessionData: SessionData = {
        cookies: poitCookies,
        savedAt: Date.now(),
      };

      sessionCache.set(this.sessionKey, sessionData);
      console.log(`[SessionManager] Saved ${poitCookies.length} cookies`);
    } catch (error) {
      console.error('[SessionManager] Error saving cookies:', error);
    }
  }

  /**
   * Restore cookies to browser context
   */
  async restoreCookies(context: BrowserContext): Promise<boolean> {
    try {
      const sessionData = sessionCache.get(this.sessionKey);

      if (!sessionData) {
        console.log('[SessionManager] No saved session found');
        return false;
      }

      // Check if session is expired
      if (Date.now() - sessionData.savedAt > SESSION_EXPIRY_MS) {
        console.log('[SessionManager] Session expired, clearing');
        sessionCache.delete(this.sessionKey);
        return false;
      }

      // Filter out expired cookies
      const now = Date.now() / 1000;
      const validCookies = sessionData.cookies.filter(c =>
        c.expires === -1 || c.expires > now
      );

      if (validCookies.length === 0) {
        console.log('[SessionManager] All cookies expired');
        return false;
      }

      await context.addCookies(validCookies);
      console.log(`[SessionManager] Restored ${validCookies.length} cookies`);
      return true;
    } catch (error) {
      console.error('[SessionManager] Error restoring cookies:', error);
      return false;
    }
  }

  /**
   * Clear saved session
   */
  clearSession(): void {
    sessionCache.delete(this.sessionKey);
    console.log('[SessionManager] Session cleared');
  }

  /**
   * Check if we have a valid session
   */
  hasValidSession(): boolean {
    const sessionData = sessionCache.get(this.sessionKey);
    if (!sessionData) return false;

    // Check expiry
    if (Date.now() - sessionData.savedAt > SESSION_EXPIRY_MS) {
      return false;
    }

    return sessionData.cookies.length > 0;
  }

  /**
   * Get session age in minutes
   */
  getSessionAge(): number | null {
    const sessionData = sessionCache.get(this.sessionKey);
    if (!sessionData) return null;
    return Math.floor((Date.now() - sessionData.savedAt) / 60000);
  }

  /**
   * Get session status
   */
  getStatus(): {
    hasSession: boolean;
    cookieCount: number;
    ageMinutes: number | null;
    expiresIn: number | null;
  } {
    const sessionData = sessionCache.get(this.sessionKey);

    if (!sessionData) {
      return {
        hasSession: false,
        cookieCount: 0,
        ageMinutes: null,
        expiresIn: null,
      };
    }

    const ageMs = Date.now() - sessionData.savedAt;
    const expiresInMs = SESSION_EXPIRY_MS - ageMs;

    return {
      hasSession: true,
      cookieCount: sessionData.cookies.length,
      ageMinutes: Math.floor(ageMs / 60000),
      expiresIn: expiresInMs > 0 ? Math.floor(expiresInMs / 60000) : 0,
    };
  }
}

// Singleton instance
export const sessionManager = new SessionManager();

export default sessionManager;
