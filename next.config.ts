import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",

  // External packages that should not be bundled
  serverExternalPackages: ["playwright", "playwright-core"],

  // Empty turbopack config to silence warnings
  turbopack: {},

  // Experimental features
  experimental: {},

  // Webpack configuration for Playwright
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude Playwright from server-side bundling
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push("playwright-core", "playwright");
      }
    }
    return config;
  },
};

// Sentry configuration
const sentryWebpackPluginOptions = {
  // Suppress all logs for cleaner output
  silent: true,

  // Upload source maps only in production
  disableLogger: true,

  // Automatically inject Sentry configuration
  widenClientFileUpload: true,
  hideSourceMaps: true,
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
// Build cache bust: lör 10 jan. 2026 01:49:00 CET
