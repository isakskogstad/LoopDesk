import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
  // Adjust for production (e.g., 0.1 = 10% of transactions)
  tracesSampleRate: 0.1,

  // Set sampling rate for profiling
  profilesSampleRate: 0.1,

  // Filter out noisy errors
  ignoreErrors: [
    // Playwright timeout errors (already handled)
    'Timeout',
    'page.goto: Timeout',
    // Database connection errors (transient)
    'ECONNREFUSED',
    // Network errors (transient)
    'ENOTFOUND',
    'ETIMEDOUT',
  ],

  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    // Add extra context
    if (event.request) {
      event.request.headers = {
        ...event.request.headers,
        // Remove sensitive headers
        authorization: '[Filtered]',
        cookie: '[Filtered]',
      };
    }

    // Log to console
    if (hint.originalException) {
      console.error('Sentry server error:', hint.originalException);
    }

    return event;
  },
});
