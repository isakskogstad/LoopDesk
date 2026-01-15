import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
  // Adjust for production (e.g., 0.1 = 10% of transactions)
  tracesSampleRate: 0.1,

  // Set sampling rate for profiling - 10% of transactions
  profilesSampleRate: 0.1,

  // Filter out noisy errors
  ignoreErrors: [
    // Network errors
    'Network request failed',
    'Failed to fetch',
    'NetworkError',
    'ECONNRESET',
    'ETIMEDOUT',
  ],
});
