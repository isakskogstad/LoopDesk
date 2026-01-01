import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",

  // External packages that should not be bundled
  serverExternalPackages: ["playwright", "playwright-core"],

  // Empty turbopack config to silence warnings
  turbopack: {},

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

export default nextConfig;
