import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
  // Adjust for production (e.g., 0.1 = 10% of transactions)
  tracesSampleRate: 0.1,

  // Filter out noisy errors
  ignoreErrors: [
    // Network errors
    'Network request failed',
    'Failed to fetch',
  ],

  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    // Remove sensitive data
    if (event.request) {
      event.request.headers = {
        ...event.request.headers,
        authorization: '[Filtered]',
        cookie: '[Filtered]',
      };
    }

    return event;
  },
});
