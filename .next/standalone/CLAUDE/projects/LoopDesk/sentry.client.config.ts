import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
  // Adjust for production (e.g., 0.1 = 10% of transactions)
  tracesSampleRate: 0.1,

  // Set sampling rate for profiling - 10% of transactions
  profilesSampleRate: 0.1,

  // Capture Replay for 10% of all sessions,
  // plus 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Filter out noisy errors
  ignoreErrors: [
    // Browser extensions
    /chrome-extension:/,
    /moz-extension:/,
    // Network errors
    'Network request failed',
    'Failed to fetch',
    'NetworkError',
    // ResizeObserver loop errors (benign)
    'ResizeObserver loop',
  ],

  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    // Log to console in development
    if (hint.originalException) {
      console.error('Sentry error:', hint.originalException);
    }

    return event;
  },

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
