#!/usr/bin/env node

/**
 * Folo RSS Sync Daemon
 *
 * Watches Folo's IndexedDB (LevelDB) for changes and syncs new feeds to LoopDesk.
 *
 * Usage:
 *   node daemon.js           # Start daemon (watches for changes)
 *   node daemon.js --once    # Sync once and exit
 *   node daemon.js --watch   # Watch mode with file system polling
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync, watch, readdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";

// Configuration
const CONFIG = {
  // Folo data paths
  foloDataPath: join(
    homedir(),
    "Library/Containers/is.follow/Data/Library/Application Support/Folo"
  ),
  levelDbPath: join(
    homedir(),
    "Library/Containers/is.follow/Data/Library/Application Support/Folo/IndexedDB/app_folo.is_0.indexeddb.leveldb"
  ),

  // LoopDesk API
  apiUrl:
    process.env.LOOPDESK_API_URL ||
    "https://loopdesk-production.up.railway.app",
  apiKey: process.env.FOLO_SYNC_API_KEY || "",
  userEmail: process.env.LOOPDESK_USER_EMAIL || "",

  // Daemon settings
  syncIntervalMs: 5 * 60 * 1000, // 5 minutes
  stateFile: join(homedir(), ".config/folo-sync/state.json"),

  // Debug
  debug: process.env.DEBUG === "true",
};

// State management
let state = {
  lastSync: null,
  syncedUrls: [],
  lastLdbModified: null,
};

function log(message, ...args) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, ...args);
}

function debug(message, ...args) {
  if (CONFIG.debug) {
    log(`[DEBUG] ${message}`, ...args);
  }
}

function loadState() {
  try {
    if (existsSync(CONFIG.stateFile)) {
      const data = readFileSync(CONFIG.stateFile, "utf-8");
      state = JSON.parse(data);
      debug("Loaded state:", state.syncedUrls.length, "URLs tracked");
    }
  } catch (error) {
    debug("Could not load state:", error.message);
  }
}

function saveState() {
  try {
    const dir = join(homedir(), ".config/folo-sync");
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(CONFIG.stateFile, JSON.stringify(state, null, 2));
    debug("State saved");
  } catch (error) {
    log("Could not save state:", error.message);
  }
}

/**
 * Extract feed URLs from LevelDB files using string extraction
 * (We can't use native LevelDB bindings as they might conflict with Folo's lock)
 */
function extractFeedsFromLevelDb() {
  const feeds = new Map(); // url -> {name, url}

  try {
    const files = readdirSync(CONFIG.levelDbPath);

    for (const file of files) {
      if (!file.endsWith(".ldb") && !file.endsWith(".log")) continue;

      const filePath = join(CONFIG.levelDbPath, file);
      try {
        const content = readFileSync(filePath);

        // Method 1: Extract using string patterns
        const strings = extractStrings(content);
        for (const str of strings) {
          if (isFeedUrl(str)) {
            const url = cleanUrl(str);
            if (url && !feeds.has(url)) {
              feeds.set(url, { url, name: null });
            }
          }
        }

        // Method 2: Look for Folo-specific patterns in raw content
        const contentStr = content.toString("utf-8");

        // Pattern: Standard RSS/Atom feed URLs
        const foloFeedPattern =
          /(https?:\/\/[\w\-\.]+(?:\/[\w\-\.\/]*)?(?:\/feed\/?|\/rss\/?|\.xml|\/atom\/?))(?=\s|$|[<"'])/gi;
        let match;
        while ((match = foloFeedPattern.exec(contentStr)) !== null) {
          const url = cleanUrl(match[1]);
          if (url && !feeds.has(url)) {
            feeds.set(url, { url, name: null });
          }
        }

        // Pattern: xgo.ing RSS proxy (Twitter/X feeds)
        // Format: https://api.xgo.ing/rss/user/HASH
        const xgoPattern =
          /https:\/\/api\.xgo\.ing\/rss\/user\/([a-f0-9]+)/gi;
        while ((match = xgoPattern.exec(contentStr)) !== null) {
          const url = `https://api.xgo.ing/rss/user/${match[1]}`;
          if (!feeds.has(url)) {
            feeds.set(url, { url, name: null });
          }
        }

        // Pattern: YouTube channel feeds
        const ytPattern =
          /youtube\.com\/feeds\/videos\.xml\?channel_id=([A-Za-z0-9_-]+)/gi;
        while ((match = ytPattern.exec(contentStr)) !== null) {
          const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${match[1]}`;
          if (!feeds.has(url)) {
            feeds.set(url, { url, name: null });
          }
        }

        // Pattern: RSSHub feeds
        const rsshubPattern =
          /https:\/\/rsshub\.[^\/\s]+\/[^\s"<>]+/gi;
        while ((match = rsshubPattern.exec(contentStr)) !== null) {
          const url = cleanUrl(match[0]);
          if (url && !feeds.has(url)) {
            feeds.set(url, { url, name: null });
          }
        }
      } catch (e) {
        debug(`Could not read ${file}:`, e.message);
      }
    }
  } catch (error) {
    log("Error reading LevelDB:", error.message);
  }

  return Array.from(feeds.values());
}

/**
 * Extract readable strings from binary buffer
 */
function extractStrings(buffer) {
  const strings = [];
  let current = "";

  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer[i];
    // Printable ASCII or common UTF-8
    if (byte >= 32 && byte < 127) {
      current += String.fromCharCode(byte);
    } else {
      if (current.length >= 10) {
        strings.push(current);
      }
      current = "";
    }
  }

  if (current.length >= 10) {
    strings.push(current);
  }

  return strings;
}

/**
 * Check if a string looks like a feed URL
 */
function isFeedUrl(str) {
  // Skip common non-feed URLs
  const skipPatterns = [
    /googleusercontent\.com/i,
    /pbs\.twimg\.com/i,
    /assets\.folo\.is/i,
    /\.jpg$/i,
    /\.png$/i,
    /\.gif$/i,
    /x\.com\/.*\/status\//i, // Twitter/X individual tweets
    /youtube\.com\/watch/i, // Individual YouTube videos
    /youtube\.com\/shorts/i,
  ];

  if (skipPatterns.some((p) => p.test(str))) {
    return false;
  }

  const feedPatterns = [
    // Standard feed paths
    /\/feed\/?$/i,
    /\/rss\/?$/i,
    /\/atom\/?$/i,
    /\.rss$/i,
    /\.xml$/i,
    /\/feed\.xml/i,
    /\/rss\.xml/i,
    /\/atom\.xml/i,
    // Feed domains
    /^https?:\/\/feeds\./i,
    /\/feeds\//i,
    /^https?:\/\/rsshub\./i,
    // RSSHub and xgo.ing (common RSS proxies)
    /api\.xgo\.ing\/rss\//i,
    /rsshub\.app\//i,
    /rssforever\.com\//i,
    // YouTube channels
    /youtube\.com\/feeds\/videos\.xml/i,
    // SVT, Energimyndigheten etc (Swedish sources)
    /svt\.se\/nyheter/i,
    /energimyndigheten\.se/i,
    /resume\.se/i,
    /pcforalla\.se\/feed/i,
  ];

  return feedPatterns.some((pattern) => pattern.test(str));
}

/**
 * Clean up extracted URL
 */
function cleanUrl(str) {
  // Find the actual URL start (http:// or https://)
  const httpIndex = str.search(/https?:\/\//i);
  if (httpIndex === -1) {
    return null;
  }

  let url = str.substring(httpIndex);

  // Remove trailing garbage characters
  url = url.replace(/[^\w\-\.\/\:@\?\=\&\%]+$/, "");

  // Remove common trailing patterns that aren't part of URL
  url = url.replace(/<.*$/, ""); // Remove HTML tags
  url = url.replace(/\s+.*$/, ""); // Remove everything after whitespace

  // Validate URL
  try {
    const parsed = new URL(url);

    // Skip URLs that are clearly not feeds
    if (
      parsed.pathname === "/" &&
      !parsed.search &&
      !url.includes("rss") &&
      !url.includes("feed")
    ) {
      return null;
    }

    // Skip image URLs
    if (/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(parsed.pathname)) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

/**
 * Alternative: Parse Folo's JSON export if available
 */
function extractFeedsFromExport() {
  const exportPaths = [
    join(CONFIG.foloDataPath, "feeds.json"),
    join(CONFIG.foloDataPath, "subscriptions.json"),
    join(homedir(), "Downloads/folo-export.json"),
  ];

  for (const path of exportPaths) {
    if (existsSync(path)) {
      try {
        const data = JSON.parse(readFileSync(path, "utf-8"));
        if (Array.isArray(data)) {
          return data.map((feed) => ({
            url: feed.url || feed.feedUrl,
            name: feed.title || feed.name,
          }));
        }
        if (data.feeds) {
          return data.feeds.map((feed) => ({
            url: feed.url || feed.feedUrl,
            name: feed.title || feed.name,
          }));
        }
      } catch (e) {
        debug(`Could not parse ${path}:`, e.message);
      }
    }
  }

  return null;
}

/**
 * Sync feeds to LoopDesk API
 */
async function syncToLoopDesk(feeds) {
  if (!CONFIG.apiKey) {
    log("ERROR: FOLO_SYNC_API_KEY not set");
    return { success: false, error: "API key not configured" };
  }

  if (!CONFIG.userEmail) {
    log("ERROR: LOOPDESK_USER_EMAIL not set");
    return { success: false, error: "User email not configured" };
  }

  // Filter out already synced URLs
  const newFeeds = feeds.filter((f) => !state.syncedUrls.includes(f.url));

  if (newFeeds.length === 0) {
    debug("No new feeds to sync");
    return { success: true, added: 0, skipped: feeds.length };
  }

  log(`Syncing ${newFeeds.length} new feeds to LoopDesk...`);

  try {
    const response = await fetch(`${CONFIG.apiUrl}/api/feeds/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CONFIG.apiKey,
        "x-user-email": CONFIG.userEmail,
      },
      body: JSON.stringify({ feeds: newFeeds }),
    });

    if (!response.ok) {
      const error = await response.text();
      log("API error:", response.status, error);
      return { success: false, error };
    }

    const result = await response.json();

    // Update state with synced URLs
    if (result.results?.added) {
      state.syncedUrls.push(...result.results.added);
    }
    if (result.results?.skipped) {
      state.syncedUrls.push(...result.results.skipped);
    }

    state.lastSync = new Date().toISOString();
    saveState();

    log(
      `Sync complete: ${result.results?.added?.length || 0} added, ${result.results?.skipped?.length || 0} skipped, ${result.results?.failed?.length || 0} failed`
    );

    return { success: true, ...result.results };
  } catch (error) {
    log("Sync failed:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main sync function
 */
async function doSync() {
  log("Starting sync...");

  // Try JSON export first (more reliable)
  let feeds = extractFeedsFromExport();

  // Fall back to LevelDB extraction
  if (!feeds || feeds.length === 0) {
    feeds = extractFeedsFromLevelDb();
  }

  if (feeds.length === 0) {
    log("No feeds found in Folo data");
    return;
  }

  log(`Found ${feeds.length} feeds in Folo`);
  debug("Feeds:", feeds.map((f) => f.url).join(", "));

  await syncToLoopDesk(feeds);
}

/**
 * Watch for LevelDB changes
 */
async function watchForChanges() {
  log("Starting watch mode...");

  // Initial sync
  await doSync();

  // Watch LevelDB directory for changes
  try {
    const watcher = watch(CONFIG.levelDbPath, { persistent: true }, async (eventType, filename) => {
      if (filename && (filename.endsWith(".ldb") || filename.endsWith(".log"))) {
        debug(`LevelDB changed: ${filename}`);

        // Debounce - wait for Folo to finish writing
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await doSync();
      }
    });

    log(`Watching ${CONFIG.levelDbPath} for changes...`);

    // Also sync periodically
    setInterval(doSync, CONFIG.syncIntervalMs);

    // Keep process alive
    process.on("SIGINT", () => {
      log("Shutting down...");
      watcher.close();
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      log("Shutting down...");
      watcher.close();
      process.exit(0);
    });
  } catch (error) {
    log("Could not start file watcher:", error.message);
    log("Falling back to polling mode...");

    // Polling fallback
    setInterval(doSync, CONFIG.syncIntervalMs);
  }
}

/**
 * Check configuration
 */
function checkConfig() {
  const issues = [];

  if (!existsSync(CONFIG.foloDataPath)) {
    issues.push(`Folo data not found at: ${CONFIG.foloDataPath}`);
  }

  if (!CONFIG.apiKey) {
    issues.push("FOLO_SYNC_API_KEY environment variable not set");
  }

  if (!CONFIG.userEmail) {
    issues.push("LOOPDESK_USER_EMAIL environment variable not set");
  }

  if (issues.length > 0) {
    log("Configuration issues:");
    issues.forEach((issue) => log(`  - ${issue}`));
    return false;
  }

  log("Configuration OK");
  log(`  Folo data: ${CONFIG.foloDataPath}`);
  log(`  LoopDesk API: ${CONFIG.apiUrl}`);
  log(`  User: ${CONFIG.userEmail}`);

  return true;
}

// Main entry point
async function main() {
  const args = process.argv.slice(2);

  log("Folo Sync Daemon v1.0.0");

  if (!checkConfig()) {
    process.exit(1);
  }

  loadState();

  if (args.includes("--once")) {
    await doSync();
    process.exit(0);
  } else {
    await watchForChanges();
  }
}

main().catch((error) => {
  log("Fatal error:", error);
  process.exit(1);
});
