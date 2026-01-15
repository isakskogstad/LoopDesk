/**
 * Rate limiting and account lockout for authentication
 *
 * Rules:
 * - Max 5 failed attempts per minute (rate limit)
 * - Max 10 total failed attempts before account lockout
 * - Lockout duration: 15 minutes
 */

import { prisma } from "@/lib/db";

interface RateLimitResult {
  allowed: boolean;
  error?: "RATE_LIMITED" | "ACCOUNT_LOCKED" | "ACCOUNT_NOT_FOUND" | "INVALID_CREDENTIALS";
  remainingAttempts?: number;
  lockoutMinutes?: number;
  retryAfterSeconds?: number;
}

// In-memory store for rate limiting (per-minute tracking)
// In production, consider using Redis for distributed systems
const rateLimitStore = new Map<string, { attempts: number; windowStart: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_ATTEMPTS_PER_WINDOW = 5;
const MAX_FAILED_ATTEMPTS_BEFORE_LOCKOUT = 10;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Check if a login attempt is allowed based on rate limiting
 */
function checkRateLimit(email: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const key = email.toLowerCase();
  const record = rateLimitStore.get(key);

  if (!record) {
    rateLimitStore.set(key, { attempts: 1, windowStart: now });
    return { allowed: true };
  }

  // Check if we're in a new window
  if (now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(key, { attempts: 1, windowStart: now });
    return { allowed: true };
  }

  // Check if rate limit exceeded
  if (record.attempts >= MAX_ATTEMPTS_PER_WINDOW) {
    const retryAfterSeconds = Math.ceil((record.windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  // Increment attempts
  record.attempts++;
  return { allowed: true };
}

/**
 * Reset rate limit for an email (called on successful login)
 */
function resetRateLimit(email: string): void {
  rateLimitStore.delete(email.toLowerCase());
}

/**
 * Check if account is locked and handle failed attempt tracking
 */
export async function checkLoginAttempt(email: string): Promise<RateLimitResult> {
  // First check rate limit
  const rateLimitCheck = checkRateLimit(email);
  if (!rateLimitCheck.allowed) {
    return {
      allowed: false,
      error: "RATE_LIMITED",
      retryAfterSeconds: rateLimitCheck.retryAfterSeconds,
    };
  }

  // Check if user exists and if account is locked
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        failedLoginAttempts: true,
        lockedUntil: true,
      },
    });

    if (!user) {
      return { allowed: true }; // Let auth handle "user not found"
    }

    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const lockoutMinutes = Math.ceil(
        (new Date(user.lockedUntil).getTime() - Date.now()) / (60 * 1000)
      );
      return {
        allowed: false,
        error: "ACCOUNT_LOCKED",
        lockoutMinutes,
      };
    }

    // If lock has expired, reset it
    if (user.lockedUntil && new Date(user.lockedUntil) <= new Date()) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
    }

    const remainingAttempts = MAX_FAILED_ATTEMPTS_BEFORE_LOCKOUT - (user.failedLoginAttempts || 0);
    return { allowed: true, remainingAttempts };
  } catch (error) {
    console.error("[RateLimit] Error checking login attempt:", error);
    return { allowed: true }; // Fail open - allow attempt if DB error
  }
}

/**
 * Record a failed login attempt
 */
export async function recordFailedAttempt(email: string): Promise<RateLimitResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, failedLoginAttempts: true },
    });

    if (!user) {
      return { allowed: false, error: "ACCOUNT_NOT_FOUND" };
    }

    const newFailedAttempts = (user.failedLoginAttempts || 0) + 1;
    const shouldLock = newFailedAttempts >= MAX_FAILED_ATTEMPTS_BEFORE_LOCKOUT;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: newFailedAttempts,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null,
      },
    });

    if (shouldLock) {
      return {
        allowed: false,
        error: "ACCOUNT_LOCKED",
        lockoutMinutes: 15,
      };
    }

    return {
      allowed: false,
      error: "INVALID_CREDENTIALS",
      remainingAttempts: MAX_FAILED_ATTEMPTS_BEFORE_LOCKOUT - newFailedAttempts,
    };
  } catch (error) {
    console.error("[RateLimit] Error recording failed attempt:", error);
    return { allowed: false, error: "INVALID_CREDENTIALS" };
  }
}

/**
 * Record a successful login (reset failed attempts)
 */
export async function recordSuccessfulLogin(email: string): Promise<void> {
  resetRateLimit(email);

  try {
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });
  } catch (error) {
    console.error("[RateLimit] Error recording successful login:", error);
  }
}

/**
 * Get error message for display
 */
export function getErrorMessage(error: RateLimitResult["error"], details?: RateLimitResult): string {
  switch (error) {
    case "RATE_LIMITED":
      return `För många försök. Vänta ${details?.retryAfterSeconds || 60} sekunder.`;
    case "ACCOUNT_LOCKED":
      return `Kontot är låst i ${details?.lockoutMinutes || 15} minuter pga för många misslyckade försök.`;
    case "ACCOUNT_NOT_FOUND":
      return "Inget konto hittades med denna e-postadress.";
    case "INVALID_CREDENTIALS":
      if (details?.remainingAttempts !== undefined && details.remainingAttempts <= 3) {
        return `Fel lösenord. ${details.remainingAttempts} försök kvar innan kontot låses.`;
      }
      return "Fel e-postadress eller lösenord.";
    default:
      return "Något gick fel. Försök igen.";
  }
}
