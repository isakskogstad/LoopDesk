/**
 * Rate limit helper for Next.js API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, RATE_LIMITS } from './rate-limiter';
import type { Session } from 'next-auth';

/**
 * Get identifier for rate limiting (user ID or IP)
 */
export function getRateLimitIdentifier(request: NextRequest, session?: Session | null): string {
  // Prefer user ID if authenticated
  if (session?.user?.id) {
    return `user:${session.user.id}`;
  }

  // Fallback to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() :
             request.headers.get('x-real-ip') ||
             'unknown';

  return `ip:${ip}`;
}

/**
 * Check rate limit and return error response if exceeded
 */
export function checkRateLimit(
  identifier: string,
  limitType: keyof typeof RATE_LIMITS
): { allowed: boolean; response?: NextResponse } {
  const config = RATE_LIMITS[limitType];
  const { allowed, remaining, resetAt } = rateLimiter.check(identifier, config);

  if (!allowed) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again after ${resetAt.toISOString()}`,
          retryAfter: Math.ceil((resetAt.getTime() - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((resetAt.getTime() - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(config.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetAt.toISOString(),
          },
        }
      ),
    };
  }

  return { allowed: true };
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  identifier: string,
  limitType: keyof typeof RATE_LIMITS
): NextResponse {
  const config = RATE_LIMITS[limitType];
  const { remaining, resetAt } = rateLimiter.check(identifier, config);

  response.headers.set('X-RateLimit-Limit', String(config.maxRequests));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', resetAt.toISOString());

  return response;
}
