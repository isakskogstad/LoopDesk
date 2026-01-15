# Railway-compatible Dockerfile with Playwright support + xvfb
FROM node:20-slim AS base

# Install Playwright/Chromium dependencies + xvfb + tini + bash
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libxshmfence1 \
    xdg-utils \
    openssl \
    xvfb \
    tini \
    bash \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
FROM base AS deps
WORKDIR /app

# Set Playwright browser path
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0

COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# Install full Playwright Chromium browser (not headless shell)
# Use --with-deps to ensure all dependencies are installed
RUN npx playwright install chromium --with-deps

# Build the application
FROM base AS builder
WORKDIR /app

# Copy deps and browser
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /ms-playwright /ms-playwright
COPY . .

# Set environment for build
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma Client and build
RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
# Enable display for xvfb (helps with Angular detection issues)
ENV DISPLAY=:99

# Copy Playwright browsers
COPY --from=deps /ms-playwright /ms-playwright

# Create non-root user with proper home directory for Playwright
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 --home /home/nextjs nextjs

# Create necessary directories for Playwright/Chromium and xvfb
RUN mkdir -p /home/nextjs/.cache/fontconfig \
    /home/nextjs/.pki/nssdb \
    /var/cache/fontconfig \
    /tmp/.X11-unix \
    && chown -R nextjs:nodejs /home/nextjs \
    && chmod -R 755 /var/cache/fontconfig \
    && chmod 1777 /tmp/.X11-unix

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules

# Create startup script for xvfb + node
COPY --chown=nextjs:nodejs <<EOF /app/start.sh
#!/bin/bash
# Start Xvfb in the background
Xvfb :99 -screen 0 1920x1080x24 &
sleep 1
# Start the Node.js server
exec node server.js
EOF
RUN chmod +x /app/start.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use tini as init system to prevent zombie processes
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["/app/start.sh"]
