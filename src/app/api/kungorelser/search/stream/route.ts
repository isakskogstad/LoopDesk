import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { getRateLimitIdentifier, checkRateLimit } from "@/lib/rate-limit-helper";
import { proxyManager } from "@/lib/kungorelser/proxy-manager";
import type { BrowserContext, Page } from "playwright";
import { existsSync, readdirSync } from "fs";
import { join } from "path";

// Find Chromium/Chrome executable path for playwright-core
function findChromiumPath(): string | undefined {
  const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH || "/ms-playwright";

  try {
    const dirs = readdirSync(browsersPath);
    console.log("[StreamScraper] Available browser directories:", dirs.join(", "));

    // Priority 1: Google Chrome (best compatibility with dynamic sites)
    for (const dir of dirs) {
      if (dir.startsWith("chrome-")) {
        const chromePath = join(browsersPath, dir, "chrome-linux", "chrome");
        if (existsSync(chromePath)) {
          console.log("[StreamScraper] Found Google Chrome at:", chromePath);
          return chromePath;
        }
      }
    }

    // Priority 2: Full Chromium (preferred over headless shell)
    for (const dir of dirs) {
      if (dir.startsWith("chromium-") && !dir.includes("headless")) {
        const chromePath = join(browsersPath, dir, "chrome-linux", "chrome");
        if (existsSync(chromePath)) {
          console.log("[StreamScraper] Found full Chromium at:", chromePath);
          return chromePath;
        }
      }
    }

    // Priority 3: Chromium with different path structure (newer Playwright)
    for (const dir of dirs) {
      if (dir.startsWith("chromium") && !dir.includes("headless")) {
        // Try different possible paths
        const paths = [
          join(browsersPath, dir, "chrome-linux", "chrome"),
          join(browsersPath, dir, "chrome"),
          join(browsersPath, dir, "chromium"),
        ];
        for (const p of paths) {
          if (existsSync(p)) {
            console.log("[StreamScraper] Found Chromium at:", p);
            return p;
          }
        }
      }
    }

    // Fallback: headless shell (last resort - may not work with Angular apps)
    for (const dir of dirs) {
      if (dir.startsWith("chromium_headless_shell-")) {
        const headlessPath = join(browsersPath, dir, "chrome-headless-shell-linux64", "chrome-headless-shell");
        if (existsSync(headlessPath)) {
          console.log("[StreamScraper] WARNING: Using headless shell (may not work with Angular apps):", headlessPath);
          return headlessPath;
        }
      }
    }
  } catch (e) {
    console.warn("[StreamScraper] Could not search for Chromium:", e);
  }

  console.log("[StreamScraper] No browser found, will try system default");
  return undefined;
}

const START_URL = "https://poit.bolagsverket.se/poit-app/sok";

// NOTE: Env vars are read inside functions to avoid stale values in serverless environments

// Scraper configuration
const SCRAPER_CONFIG = {
  // Timeout for navigation (ms) - increased to handle slow Bolagsverket pages
  navigationTimeout: parseInt(process.env.SCRAPER_NAVIGATION_TIMEOUT || '90000', 10),
};

/**
 * Debug helper: capture page state for error diagnosis
 */
async function captureDebugInfo(page: Page, context: string): Promise<void> {
  try {
    const info = await page.evaluate(() => {
      const body = document.body?.innerText || "";
      const html = document.body?.innerHTML || "";

      // Get all visible inputs
      const inputs = Array.from(document.querySelectorAll("input")).map(el => ({
        id: el.id,
        name: el.name,
        type: el.type,
        placeholder: el.placeholder,
        visible: el.offsetParent !== null,
        formcontrolname: el.getAttribute("formcontrolname"),
      }));

      // Get all buttons
      const buttons = Array.from(document.querySelectorAll("button")).map(el => ({
        text: (el.innerText || "").slice(0, 50),
        disabled: el.disabled,
        visible: el.offsetParent !== null,
      }));

      // Check for Angular app state
      const hasNgApp = !!document.querySelector("[ng-version]") || !!document.querySelector("app-root");
      const hasAngularError = body.includes("TypeError") || body.includes("Cannot read") || body.includes("undefined");

      return {
        url: window.location.href,
        title: document.title,
        bodyLength: body.length,
        htmlLength: html.length,
        inputCount: inputs.length,
        visibleInputs: inputs.filter(i => i.visible),
        buttons: buttons.filter(b => b.visible).slice(0, 5),
        hasNgApp,
        hasAngularError,
        has403: body.includes("403") || body.includes("Forbidden"),
        hasBlocker: body.includes("human visitor") || !!document.querySelector("#ans"),
        textPreview: body.slice(0, 800),
      };
    });

    console.log(`[DEBUG ${context}] Page state:`, JSON.stringify(info, null, 2));
  } catch (err) {
    console.log(`[DEBUG ${context}] Failed to capture page state:`, err);
  }
}

interface ScrapedResult {
  id: string;
  url: string;
  reporter: string;
  type: string;
  subject: string;
  pubDate: string;
  detailText?: string;
  fullText?: string;
}

type ProgressCallback = (event: {
  type: "status" | "captcha" | "search" | "result" | "detail" | "success" | "error" | "complete";
  message: string;
  data?: Record<string, unknown>;
}) => void;

/**
 * POST /api/kungorelser/search/stream
 * Streaming search with real-time progress updates
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Check rate limit (10 searches per minute)
  const identifier = getRateLimitIdentifier(request, session);
  const rateLimitCheck = checkRateLimit(identifier, 'scraping');
  if (!rateLimitCheck.allowed) {
    return rateLimitCheck.response!;
  }

  const body = await request.json();
  const { query, orgNumber, skipDetails = false, detailLimit = 5 } = body;

  if (!query || typeof query !== "string" || query.trim().length < 2) {
    return new Response(JSON.stringify({ error: "Query must be at least 2 characters" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent: ProgressCallback = (event) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        sendEvent({ type: "status", message: "Startar webbläsare..." });

        // Read env vars fresh (avoid stale values in serverless)
        const TWOCAPTCHA_API_KEY = process.env.TWOCAPTCHA_API_KEY || "";
        const PROXY_SERVER = process.env.PROXY_SERVER || "";
        const PROXY_USERNAME = process.env.PROXY_USERNAME || "";
        const PROXY_PASSWORD = process.env.PROXY_PASSWORD || "";

        // Ensure proxies are fresh before starting
        try {
          const { forceRefreshProxies } = await import("@/lib/kungorelser/proxy-init");
          await forceRefreshProxies();
        } catch (err) {
          console.warn("[StreamScraper] Failed to refresh proxies:", err);
        }

        // Dynamic import for serverless
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { chromium } = require("playwright") as typeof import("playwright");

        // Build proxy config from env vars (prefer static config over proxyManager)
        let proxyConfig: { server: string; username?: string; password?: string } | undefined;

        if (PROXY_SERVER && PROXY_SERVER !== "disabled") {
          proxyConfig = {
            server: PROXY_SERVER,
            username: PROXY_USERNAME || undefined,
            password: PROXY_PASSWORD || undefined,
          };
          console.log(`[StreamScraper] Using static proxy from env: ${PROXY_SERVER}`);
        } else {
          // Fallback to proxy manager
          await proxyManager.activate("stream-init");
          proxyConfig = proxyManager.getPlaywrightConfig().proxy;
        }

        if (proxyConfig) {
          console.log(`[Proxy] Using proxy server: ${proxyConfig.server}`);
          if (!proxyConfig.username) {
            console.warn("[Proxy] Username missing - proxy auth may fail");
          }
          sendEvent({ type: "status", message: "Ansluter via proxy..." });
        } else {
          console.log("[Proxy] No proxy configured, using direct connection");
        }

        // Try playwright's default browser first, fall back to custom path
        let browser;
        try {
          console.log("[StreamScraper] Trying playwright default browser...");
          browser = await chromium.launch({
            headless: true,
            args: [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--disable-blink-features=AutomationControlled",
              "--disable-dev-shm-usage",
            ],
            proxy: proxyConfig,
          });
          console.log("[StreamScraper] Using playwright default browser");
        } catch {
          const executablePath = findChromiumPath();
          console.log("[StreamScraper] Default failed, using custom path:", executablePath || "none");
          browser = await chromium.launch({
            headless: true,
            executablePath,
            args: [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--disable-blink-features=AutomationControlled",
              "--disable-dev-shm-usage",
            ],
            proxy: proxyConfig,
          });
        }

        sendEvent({ type: "status", message: "Öppnar Bolagsverkets POIT..." });

        // Simple context - no fingerprint spoofing (Electron app doesn't use it either)
        const context = await browser.newContext({
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          viewport: { width: 1920, height: 1080 },
          locale: "sv-SE",
        });
        const page = await context.newPage();

        // Track 403 errors for detection
        let got403 = false;
        let consecutive403Count = 0;

        // Capture console errors from the page for debugging
        page.on("console", (msg) => {
          if (msg.type() === "error") {
            console.log("[PageConsole] ERROR:", msg.text());
          }
        });
        page.on("pageerror", (error) => {
          console.log("[PageError]", error.message);
        });

        // Track 403 responses
        page.on("response", (response) => {
          if (response.status() === 403) {
            got403 = true;
            consecutive403Count++;
            console.log(`[StreamScraper] Got 403 on ${response.url()} (count: ${consecutive403Count})`);
          } else if (response.status() >= 200 && response.status() < 300) {
            // Reset on successful response
            consecutive403Count = 0;
          }
        });

        try {
          // Navigate to search with increased timeout for proxy
          await page.goto(START_URL, { waitUntil: "networkidle", timeout: 60000 });

          // Log initial page state
          console.log("[StreamScraper] Initial page loaded, capturing state...");
          await captureDebugInfo(page, "initial-load");

          // Check for 403 blocking
          if (got403 && consecutive403Count >= 3) {
            sendEvent({ type: "error", message: "Bolagsverket blockerar anslutningen (403). Försöker igen..." });
            console.log("[StreamScraper] Multiple 403s detected, waiting before retry...");
            await captureDebugInfo(page, "403-blocked");
            await page.waitForTimeout(5000);
            got403 = false;
            consecutive403Count = 0;
            await page.goto(START_URL, { waitUntil: "networkidle", timeout: 60000 });
          }
          await page.waitForTimeout(1000);
          sendEvent({ type: "status", message: "Kontrollerar captcha..." });

          // Handle captcha if present
          await solveBlockerWithProgress(page, sendEvent);

          // Navigate to search form
          sendEvent({ type: "status", message: "Öppnar sökformulär..." });
          let ready = await maybeNavigateToSearch(page);
          await solveBlockerWithProgress(page, sendEvent);

          // If not ready, reload and try again (like reference code)
          if (!ready) {
            console.log("[StreamScraper] First navigation failed, reloading page...");
            await page.goto(START_URL, { waitUntil: "networkidle", timeout: 30000 });
            await page.waitForTimeout(1000);
            await solveBlockerWithProgress(page, sendEvent);
            ready = await maybeNavigateToSearch(page);
          }

          await waitForSearchInputs(page);

          // Submit search with retry and page reload (like reference code)
          sendEvent({ type: "search", message: `Söker: "${query.trim()}"...` });
          let submitted: boolean | "disabled" = false;

          for (let attempt = 1; attempt <= 3; attempt++) {
            submitted = await submitSearch(page, query.trim());

            if (submitted === true) {
              console.log("[StreamScraper] Search submitted successfully");
              break;
            }

            if (submitted === "disabled") {
              sendEvent({ type: "error", message: "Sökfältet inaktiverat - ogiltigt sökord" });
              throw new Error("Invalid search query");
            }

            // Retry: reload page, solve captcha, navigate to search
            console.log(`[StreamScraper] Input not found, retrying (attempt ${attempt}/3)...`);
            await captureDebugInfo(page, `input-not-found-attempt-${attempt}`);
            sendEvent({ type: "status", message: `Försöker igen (${attempt}/3)...` });

            // Use goto instead of reload to avoid timeout issues
            await page.goto(page.url(), {
              waitUntil: "domcontentloaded",
              timeout: SCRAPER_CONFIG.navigationTimeout
            }).catch(() => {});
            await page.waitForTimeout(1000);
            await solveBlockerWithProgress(page, sendEvent);
            await maybeNavigateToSearch(page);
            await waitForSearchInputs(page);
          }

          if (submitted !== true) {
            await captureDebugInfo(page, "search-form-final-failure");
            throw new Error("Kunde inte hitta sökformulär efter 3 försök");
          }

          // Wait for AJAX search to complete - look for results table or "no results" message
          // Wait for loading to complete and results to appear
          try {
            // First wait for "Laddar" to disappear (page is loading)
            await page.waitForFunction(
              () => {
                const body = document.body?.innerText || "";
                return !body.includes("Laddar");
              },
              { timeout: 20000 }
            ).catch(() => console.log("[StreamScraper] Still shows 'Laddar' after 20s"));

            // Then wait for results or error message
            await page.waitForFunction(
              () => {
                const body = document.body?.innerText || "";
                // Check for results table, result links, result count, or "no results" message
                return (
                  document.querySelector('table') !== null ||
                  document.querySelector('a[href*="kungorelse/"]') !== null ||
                  body.includes("Antal träffar") ||
                  body.includes("inga träffar") ||
                  body.includes("0 träffar") ||
                  body.includes("Inga kungörelser")
                );
              },
              { timeout: 15000 }
            );
          } catch {
            console.log("[StreamScraper] Timeout waiting for search results");
          }

          await page.waitForTimeout(2000);
          await solveBlockerWithProgress(page, sendEvent);

          // Dismiss cookie banner again after search (might reappear)
          await dismissCookieBanner(page);

          // Collect results
          sendEvent({ type: "status", message: "Samlar in resultat..." });

          // Log the current page URL and state
          const currentUrl = page.url();
          console.log("[StreamScraper] Current URL after search:", currentUrl);

          const results = await collectResultsWithProgress(page, sendEvent, query.trim());

          sendEvent({
            type: "result",
            message: `Hittade ${results.length} kungörelser`,
            data: { count: results.length },
          });

          // Fetch details if not skipped
          const enrichedResults: ScrapedResult[] = [];

          if (!skipDetails && results.length > 0) {
            const limit = Math.min(detailLimit, results.length);
            const DETAIL_DELAY_MS = 3000; // Increased from 1500ms
            const MAX_RETRIES = 5;

            sendEvent({
              type: "status",
              message: `Hämtar detaljer för ${limit} av ${results.length} kungörelser...`,
            });

            let lastFetchTime = 0;

            for (let i = 0; i < limit; i++) {
              const item = results[i];
              sendEvent({
                type: "detail",
                message: `Hämtar detalj ${i + 1}/${limit}: ${item.type || "Kungörelse"}`,
                data: { current: i + 1, total: limit, id: item.id },
              });

              // Enforce delay between fetches
              const now = Date.now();
              const elapsed = now - lastFetchTime;
              if (elapsed < DETAIL_DELAY_MS && lastFetchTime > 0) {
                const waitTime = DETAIL_DELAY_MS - elapsed;
                await new Promise((r) => setTimeout(r, waitTime));
              }
              lastFetchTime = Date.now();

              let text = "";
              let retryDelay = 5000;
              let success = false;

              // Retry loop with proxy rotation
              for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {
                  // Get proxy from config
                  const proxyUrl = proxyConfig?.server;

                  const result = await fetchDetailText(context, item, {
                    proxyUrl,
                    proxyUsername: proxyConfig?.username,
                    proxyPassword: proxyConfig?.password,
                  });
                  text = result.text || "";

                  if (result.got429) {
                    sendEvent({
                      type: "error",
                      message: `⚠️ Rate limit för ${item.id}, försöker igen (${attempt}/${MAX_RETRIES})...`,
                    });

                    await new Promise((r) => setTimeout(r, retryDelay));
                    retryDelay *= 2; // Exponential backoff
                    lastFetchTime = Date.now();
                    continue;
                  }

                  if (text && text.trim()) {
                    success = true;
                    break;
                  }

                  if (attempt < MAX_RETRIES) {
                    sendEvent({
                      type: "status",
                      message: `Tom text för ${item.id}, försöker igen (${attempt}/${MAX_RETRIES})...`,
                    });
                    await new Promise((r) => setTimeout(r, 4000));
                  }
                } catch (err) {
                  if (attempt === MAX_RETRIES) {
                    sendEvent({
                      type: "error",
                      message: `✗ Kunde inte hämta detalj efter ${MAX_RETRIES} försök: ${err instanceof Error ? err.message : "Okänt fel"}`,
                    });
                  } else {
                    sendEvent({
                      type: "status",
                      message: `Fel för ${item.id}, försöker igen (${attempt}/${MAX_RETRIES})...`,
                    });
                    await new Promise((r) => setTimeout(r, 4000));
                  }
                }
              }

              // Final retry with extended timeouts if still empty
              if (!text || !text.trim()) {
                sendEvent({
                  type: "status",
                  message: `Sista försöket med längre timeout för ${item.id}...`,
                });
                await new Promise((r) => setTimeout(r, DETAIL_DELAY_MS + 2000));

                try {
                  const proxyUrl = proxyConfig?.server;
                  const result = await fetchDetailText(context, item, {
                    proxyUrl,
                    proxyUsername: proxyConfig?.username,
                    proxyPassword: proxyConfig?.password,
                    apiTimeout: 25000,
                    detailTimeout: 35000,
                    waitTextTimeout: 25000,
                    postGotoWait: 3000,
                  });
                  text = result.text || "";
                  lastFetchTime = Date.now();
                } catch {}
              }

              // Store results
              if (text) {
                item.detailText = text.length > 500 ? text.slice(0, 500) + "..." : text;
                item.fullText = text;
                sendEvent({
                  type: "success",
                  message: `✓ Detalj ${i + 1}/${limit} hämtad`,
                  data: { id: item.id, hasText: true },
                });
              } else {
                sendEvent({
                  type: "error",
                  message: `✗ Kunde inte hämta detalj för ${item.id} efter alla försök`,
                  data: { id: item.id, hasText: false },
                });
              }

              enrichedResults.push(item);
            }

            // Add remaining results without details
            for (let i = limit; i < results.length; i++) {
              enrichedResults.push(results[i]);
            }
          } else {
            enrichedResults.push(...results);
          }

          // Save to database
          sendEvent({ type: "status", message: "Sparar till databas..." });
          const saved = await saveAnnouncements(query.trim(), orgNumber, enrichedResults);

          sendEvent({
            type: "complete",
            message: `Klar! ${saved} kungörelser sparade`,
            data: {
              total: results.length,
              saved,
              withDetails: enrichedResults.filter((r) => r.fullText).length,
            },
          });
        } finally {
          // Safely close browser resources
          try {
            await context.close();
          } catch (closeErr) {
            console.log("[StreamScraper] Context already closed:", closeErr);
          }
          try {
            await browser.close();
          } catch (closeErr) {
            console.log("[StreamScraper] Browser already closed:", closeErr);
          }
        }
      } catch (error) {
        console.log("[StreamScraper] Error:", error);
        sendEvent({
          type: "error",
          message: `Fel: ${error instanceof Error ? error.message : "Okänt fel"}`,
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// Helper functions (simplified versions from scraper.ts)

async function solveBlockerWithProgress(page: Page, sendEvent: ProgressCallback): Promise<boolean> {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const blocked = await page.evaluate(() => {
      const body = document.body ? document.body.innerText : "";
      return Boolean(document.querySelector("#ans")) || body.includes("human visitor");
    });

    if (!blocked) return true;

    sendEvent({
      type: "captcha",
      message: `Captcha upptäckt, löser... (försök ${attempt}/5)`,
    });

    const imgSrc = await page.evaluate(() => {
      const img = Array.from(document.querySelectorAll("img")).find((i) =>
        (i.src || "").includes("base64")
      );
      return img ? img.src : null;
    });

    if (!imgSrc) {
      // Use goto instead of reload to avoid timeout issues
      await page.goto(page.url(), {
        waitUntil: "domcontentloaded",
        timeout: SCRAPER_CONFIG.navigationTimeout
      }).catch(() => {});
      await page.waitForTimeout(3000);
      continue;
    }

    try {
      const guess = await solveCaptcha(imgSrc, sendEvent);

      const input = page.locator("#ans");
      await input.fill(guess);
      await page.locator("#jar").click();
      await page.waitForTimeout(5000);

      sendEvent({ type: "captcha", message: "Captcha löst!" });
    } catch (err) {
      sendEvent({
        type: "error",
        message: `Captcha-fel: ${err instanceof Error ? err.message : "Okänt"}`,
      });
      // Use goto instead of reload to avoid timeout issues
      await page.goto(page.url(), {
        waitUntil: "domcontentloaded",
        timeout: SCRAPER_CONFIG.navigationTimeout
      }).catch(() => {});
      await page.waitForTimeout(3000);
    }
  }

  return false;
}

async function solveCaptcha(imageBase64: string, sendEvent: ProgressCallback): Promise<string> {
  // Read API key fresh
  const TWOCAPTCHA_API_KEY = process.env.TWOCAPTCHA_API_KEY || "";

  if (!TWOCAPTCHA_API_KEY) {
    throw new Error("TWOCAPTCHA_API_KEY ej konfigurerad");
  }

  sendEvent({ type: "captcha", message: "Skickar captcha till 2captcha..." });

  // Submit captcha
  const submitUrl = new URL("https://2captcha.com/in.php");
  submitUrl.searchParams.set("key", TWOCAPTCHA_API_KEY);
  submitUrl.searchParams.set("method", "base64");
  submitUrl.searchParams.set("json", "1");

  const base64Data = imageBase64.includes("base64,")
    ? imageBase64.split("base64,")[1]
    : imageBase64;

  const submitResponse = await fetch(submitUrl.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ body: base64Data }),
  });

  const submitResult = await submitResponse.json();
  if (submitResult.status !== 1) {
    throw new Error(`2captcha submit failed: ${submitResult.request}`);
  }

  const captchaId = submitResult.request;
  sendEvent({ type: "captcha", message: `Väntar på 2captcha (ID: ${captchaId})...` });

  // Poll for result
  const resultUrl = new URL("https://2captcha.com/res.php");
  resultUrl.searchParams.set("key", TWOCAPTCHA_API_KEY);
  resultUrl.searchParams.set("action", "get");
  resultUrl.searchParams.set("id", captchaId);
  resultUrl.searchParams.set("json", "1");

  for (let i = 0; i < 30; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const resultResponse = await fetch(resultUrl.toString());
    const result = await resultResponse.json();

    if (result.status === 1) {
      return result.request;
    }

    if (result.request !== "CAPCHA_NOT_READY") {
      throw new Error(`2captcha failed: ${result.request}`);
    }

    if (i % 5 === 0) {
      sendEvent({ type: "captcha", message: `Väntar på captcha-svar... (${i * 2}s)` });
    }
  }

  throw new Error("2captcha timeout");
}

async function dismissCookieBanner(page: Page): Promise<void> {
  try {
    // Try various cookie banner dismiss buttons
    const selectors = [
      'button[data-cookiefirst-action="reject"]',
      'button[data-cookiefirst-action="accept"]',
      '.cookiefirst-root button:has-text("Avvisa")',
      '.cookiefirst-root button:has-text("Acceptera")',
      'dialog[aria-label*="Cookie"] button',
      '[class*="cookie"] button:first-of-type',
    ];

    for (const selector of selectors) {
      const btn = page.locator(selector).first();
      if (await btn.count() > 0 && await btn.isVisible()) {
        await btn.click({ timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(500);
        console.log("[StreamScraper] Dismissed cookie banner");
        return;
      }
    }

    // Try to close by pressing Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  } catch (e) {
    // Ignore errors - banner might not exist
  }
}

async function waitForSearchPage(page: Page): Promise<boolean> {
  const heading = page.getByRole("heading", { name: /Sök kungörelse/i });
  try {
    await heading.first().waitFor({ timeout: 15000 });
    return true;
  } catch {
    return false;
  }
}

async function maybeNavigateToSearch(page: Page): Promise<boolean> {
  // First, try to dismiss any cookie banners
  await dismissCookieBanner(page);

  const hasNameField = await page.$("#namn");
  const hasOrgField = await page.$("#personOrgnummer");
  if (hasNameField || hasOrgField) return true;

  console.log("[maybeNavigateToSearch] Opening search form...");

  // Try clicking the link with URL wait like reference
  const link = page.getByRole("link", { name: /Sök kungörelse/i });
  if (await link.count()) {
    try {
      await Promise.all([
        link.first().click(),
        page.waitForURL(/\/poit-app\/sok/, { timeout: 15000 }).catch(() => {}),
      ]);
    } catch {
      // Try with force if normal click fails
      await link.first().click({ force: true, timeout: 5000 }).catch(() => {});
    }
  } else {
    // Fallback: click by evaluating text
    await page.evaluate(() => {
      const a = Array.from(document.querySelectorAll("a")).find((el) =>
        (el.innerText || "").includes("Sök kungörelse")
      );
      if (a) a.click();
    });
  }

  await page.waitForTimeout(1000);
  await waitForSearchPage(page);
  await waitForSearchInputs(page);

  const hasNameFieldAfter = await page.$("#namn");
  const hasOrgFieldAfter = await page.$("#personOrgnummer");
  return Boolean(hasNameFieldAfter || hasOrgFieldAfter);
}

async function waitForSearchInputs(page: Page): Promise<void> {
  // Wait for any of the possible search input selectors (expanded for Angular)
  await page.waitForFunction(
    () => {
      // Try multiple selector strategies
      const selectors = [
        "#namn",
        "#personOrgnummer",
        'input[id*="namn"]',
        'input[id*="org"]',
        'input[name*="namn"]',
        'input[name*="org"]',
        'input[placeholder*="Företag"]',
        'input[placeholder*="Org"]',
        'input[formcontrolname]',
        'input[type="text"]',
      ];

      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && (el as HTMLElement).offsetParent !== null) {
          return true; // Found visible input
        }
      }
      return false;
    },
    { timeout: 20000 }
  ).catch(() => {
    console.log("[waitForSearchInputs] Timeout waiting for inputs");
  });
}

// Resolve search input with multiple fallback selectors (expanded for Angular)
async function resolveSearchInput(page: Page, isOrg: boolean) {
  const selectors = isOrg
    ? [
        "#personOrgnummer",
        'input[id*="org"]',
        'input[id*="Org"]',
        'input[name*="org"]',
        'input[name*="Org"]',
        'input[formcontrolname*="org"]',
        'input[formcontrolname*="Org"]',
        'input[placeholder*="Org"]',
        'input[placeholder*="organisationsnummer"]',
        'input[placeholder*="Organisationsnummer"]',
        'input[aria-label*="Org"]',
        'input[type="text"]:near(:text("Organisationsnummer"))',
      ]
    : [
        "#namn",
        'input[id*="namn"]',
        'input[id*="Namn"]',
        'input[name*="namn"]',
        'input[name*="Namn"]',
        'input[formcontrolname*="namn"]',
        'input[formcontrolname*="Namn"]',
        'input[placeholder*="Företag"]',
        'input[placeholder*="företag"]',
        'input[placeholder*="namn"]',
        'input[placeholder*="Namn"]',
        'input[aria-label*="namn"]',
        'input[aria-label*="Namn"]',
        'input[type="text"]:near(:text("Företagsnamn"))',
        'input[type="text"]:near(:text("Namn"))',
      ];

  for (const sel of selectors) {
    try {
      const loc = page.locator(sel);
      if ((await loc.count()) > 0) {
        console.log(`[resolveSearchInput] Found input with selector: ${sel}`);
        return loc.first();
      }
    } catch {
      // Skip invalid selectors
    }
  }

  // Last resort: try to find any visible text input
  console.log("[resolveSearchInput] Trying generic text input fallback...");
  const genericInputs = page.locator('input[type="text"]:visible');
  if ((await genericInputs.count()) > 0) {
    console.log(`[resolveSearchInput] Found ${await genericInputs.count()} generic text inputs`);
    return genericInputs.first();
  }

  return null;
}

async function submitSearch(page: Page, query: string): Promise<boolean | "disabled"> {
  const digits = query.replace(/\D/g, "");
  const isOrg = digits.length >= 10;

  const formattedQuery = isOrg && digits.length >= 10
    ? `${digits.slice(0, 6)}-${digits.slice(6, 10)}`
    : query;

  // Wait for input to appear with retry (up to 15 seconds) using flexible selectors
  const start = Date.now();
  let input = null;
  while (!input && Date.now() - start < 15000) {
    input = await resolveSearchInput(page, isOrg);
    if (!input) {
      console.log("[submitSearch] Input not found, waiting 1s...");
      await page.waitForTimeout(1000);
    }
  }

  if (!input) {
    console.log("[submitSearch] Input not found after 15s retry");
    return false;
  }

  console.log("[submitSearch] Found input, filling with:", formattedQuery);
  await input.fill(formattedQuery);

  // Dispatch form events to trigger Angular/React validation (matching reference code)
  await page.evaluate(() => {
    const el =
      document.querySelector("#namn") ||
      document.querySelector("#personOrgnummer") ||
      document.querySelector('input[name*="namn"]') ||
      document.querySelector('input[name*="org"]');
    if (!el) return;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    (el as HTMLElement).blur();
  });

  await page.waitForTimeout(500);

  console.log("[submitSearch] Clicking search button...");
  const button = page.getByRole("button", { name: /Sök kungörelse/i });
  if (await button.count()) {
    const enabled = await button.first().isEnabled();
    if (!enabled) {
      console.log("[submitSearch] Button disabled, trying Enter key");
      try {
        await input.press("Enter");
      } catch {
        // ignore
      }
      return "disabled";
    }
    await button.first().click();
    return true;
  }

  // Fallback: try clicking button by text or pressing Enter
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find((b) =>
      (b.innerText || "").includes("Sök kungörelse")
    );
    if (btn) btn.click();
  });

  try {
    await input.press("Enter");
  } catch {
    // ignore
  }

  return true;
}

async function collectResultsWithProgress(page: Page, sendEvent: ProgressCallback, query?: string): Promise<ScrapedResult[]> {
  // Wait for results to load - try multiple times (10 retries like reference poit.js)
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(1500);

    // Re-check for captcha/blocker on each iteration
    await solveBlockerWithProgress(page, sendEvent);

    // Check for Angular errors or "no results" message
    const pageCheck = await page.evaluate(() => {
      const body = document.body?.innerText || "";
      const bodyLower = body.toLowerCase();
      return {
        noResults: bodyLower.includes("inga träffar") || bodyLower.includes("inga kungörelser") || bodyLower.includes("0 träffar"),
        hasTypeError: body.includes("TypeError"),
        hasLoading: body.includes("Laddar"),
        bodyText: body.slice(0, 500),
      };
    });

    // If Angular crashed, try reloading and re-searching
    if (pageCheck.hasTypeError && i < 2 && query) {
      console.log("[collectResults] Angular TypeError detected, reloading and re-searching...");
      // Use goto instead of reload to avoid timeout issues
      await page.goto(page.url(), {
        waitUntil: "networkidle",
        timeout: SCRAPER_CONFIG.navigationTimeout
      }).catch(() => {});
      await page.waitForTimeout(2000);
      await solveBlockerWithProgress(page, sendEvent);
      await maybeNavigateToSearch(page);
      await waitForSearchInputs(page);
      await submitSearch(page, query);
      await page.waitForTimeout(3000);
      continue;
    }

    if (pageCheck.noResults) {
      console.log("[collectResults] No results message found on page");
      sendEvent({ type: "status", message: "Sidan visar 'Inga träffar'" });
      return [];
    }

    // Try to find result links (matching reference poit.js pattern)
    const results = await page.evaluate(() => {
      const seen = new Set<string>();
      const items: Array<{
        id: string;
        url: string;
        reporter: string;
        type: string;
        subject: string;
        pubDate: string;
      }> = [];

      // Use the same selector as reference poit.js
      const links = Array.from(document.querySelectorAll('a.kungorelse__link, a[href*="kungorelse/"]'));

      console.log("[collectResults] Found", links.length, "potential kungorelse links");

      for (const link of links) {
        // Use link.href (resolved URL) instead of getAttribute (like reference code)
        const href = (link as HTMLAnchorElement).href || "";
        const id = href.split("/").pop()?.split("?")[0] || "";

        if (!id || seen.has(id)) continue;
        seen.add(id);

        // Try multiple ways to find row data (like reference poit.js)
        const row = link.closest("tr") || link.closest("[role=row]") || link.closest("div");
        let cells: string[] = [];

        if (row) {
          // Try td elements first
          cells = Array.from(row.querySelectorAll("td"))
            .map((c) => ((c as HTMLElement).innerText || "").trim())
            .filter(Boolean);

          // Try role="cell" elements
          if (cells.length === 0) {
            cells = Array.from(row.querySelectorAll('[role="cell"]'))
              .map((c) => ((c as HTMLElement).innerText || "").trim())
              .filter(Boolean);
          }

          // Fall back to splitting row text
          if (cells.length === 0 && (row as HTMLElement).innerText) {
            cells = (row as HTMLElement).innerText
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean);
          }
        }

        items.push({
          id,
          url: href,
          reporter: cells[1] || "",
          type: cells[2] || "",
          subject: cells[3] || "",
          pubDate: cells[4] || "",
        });
      }

      return items;
    });

    if (results.length > 0) {
      console.log(`[collectResults] Found ${results.length} results`);
      return results;
    }

    // Log page state for debugging
    const pageState = await page.evaluate(() => {
      const body = document.body?.innerText || "";
      const html = document.body?.innerHTML || "";
      const hasTable = !!document.querySelector("table");
      const hasResults = html.includes("kungorelse");
      const linkCount = document.querySelectorAll("a").length;
      const url = window.location.href;

      // Debug: find all links that might be kungorelse links
      const allLinks = Array.from(document.querySelectorAll("a"));
      const kungorelseLinks = allLinks
        .filter((a) => (a as HTMLAnchorElement).href.includes("kungorelse"))
        .map((a) => ({
          href: (a as HTMLAnchorElement).href,
          text: ((a as HTMLElement).innerText || "").slice(0, 50),
          className: a.className,
        }));

      return {
        url,
        bodyLength: body.length,
        hasTable,
        hasResults,
        linkCount,
        kungorelseLinkCount: kungorelseLinks.length,
        kungorelseLinks: kungorelseLinks.slice(0, 5), // First 5 for debugging
        sample: body.slice(0, 300),
      };
    });

    console.log(`[collectResults] Attempt ${i + 1}: Page state:`, JSON.stringify(pageState, null, 2));

    // Send debug info (only first attempt to avoid spam)
    if (i === 0) {
      sendEvent({
        type: "status",
        message: `Försöker hitta resultat (${pageState.kungorelseLinkCount} kungörelse-länkar av ${pageState.linkCount} totalt)`,
      });
    }
  }

  console.log("[collectResults] No results found after retries");
  return [];
}

async function fetchDetailText(
  browserOrContext: BrowserContext,
  item: ScrapedResult,
  options: {
    proxyUrl?: string;
    proxyUsername?: string;
    proxyPassword?: string;
    apiTimeout?: number;
    detailTimeout?: number;
    waitTextTimeout?: number;
    postGotoWait?: number;
  } = {}
): Promise<{ text: string; got429: boolean }> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { chromium } = require("playwright") as typeof import("playwright");

  const settings = {
    apiTimeout: options.apiTimeout || 30000,      // Increased from 15s to 30s for proxy
    detailTimeout: options.detailTimeout || 40000, // Increased from 20s to 40s for proxy
    waitTextTimeout: options.waitTextTimeout || 30000, // Increased from 15s to 30s for proxy
    postGotoWait: options.postGotoWait || 1500,
  };

  // Create new context with proxy if specified
  let detailContext: BrowserContext;
  let shouldCloseContext = false;

  // Use proxy if provided in options
  if (options.proxyUrl && options.proxyUrl !== "disabled") {
    try {
      const browser = "browser" in browserOrContext ? browserOrContext.browser() : null;
      if (browser) {
        detailContext = await browser.newContext({
          proxy: {
            server: options.proxyUrl,
            username: options.proxyUsername,
            password: options.proxyPassword,
          },
        });
        shouldCloseContext = true;
        console.log(`[fetchDetailText] Using proxy: ${options.proxyUrl}`);
      } else {
        detailContext = browserOrContext;
      }
    } catch (err) {
      console.warn(`[fetchDetailText] Failed to create context with proxy:`, err);
      detailContext = browserOrContext;
    }
  } else {
    detailContext = browserOrContext;
  }

  const detailPage = await detailContext.newPage();
  let got429 = false;

  try {
    // Track 429 errors
    detailPage.on("response", (res) => {
      if (res.status() === 429 && res.url().includes("/poit/rest/")) {
        got429 = true;
        console.log(`[fetchDetailText] Got 429 for ${item.id}`);
      }
    });

    // Set up response listener for API calls
    let apiText = "";

    const apiResponsePromise = detailPage
      .waitForResponse(
        (res) =>
          res.url().includes("/poit/rest/SokKungorelse?kungorelseid=") &&
          res.status() === 200,
        { timeout: settings.apiTimeout }
      )
      .catch(() => null);

    const detailResponsePromise = detailPage
      .waitForResponse(
        (res) =>
          res.url().includes("/poit/rest/HamtaKungorelse?") &&
          res.status() === 200,
        { timeout: settings.detailTimeout }
      )
      .catch(() => null);

    await detailPage.goto(item.url, { waitUntil: "networkidle", timeout: 45000 }); // Increased from 20s to 45s for proxy
    await detailPage.waitForTimeout(settings.postGotoWait);

    // Wait for content
    await detailPage
      .waitForFunction(
        () => (document.body?.innerText || "").includes("Kungörelsetext"),
        { timeout: settings.waitTextTimeout }
      )
      .catch(() => {});

    // Check if detail text is present, if not click the detail link (like Electron app)
    const initialHasDetail = await detailPage.evaluate(() =>
      (document.body?.innerText || "").includes("Kungörelsetext")
    );

    if (!initialHasDetail) {
      // Look for link to announcement detail and click it
      const link = detailPage.locator(
        'a.kungorelse__link, a[href*="/poit-app/kungorelse/"]'
      );
      if ((await link.count()) > 0) {
        await link.first().click().catch(() => {});
        await detailPage.waitForTimeout(1500);

        // Wait again for "Kungörelsetext"
        await detailPage
          .waitForFunction(
            () => (document.body?.innerText || "").includes("Kungörelsetext"),
            { timeout: settings.waitTextTimeout }
          )
          .catch(() => {});
      }
    }

    // Try to get text from API response
    const apiResponse = await apiResponsePromise;
    if (apiResponse) {
      try {
        const data = await apiResponse.json();
        apiText = extractTextFromApiData(data);
      } catch {}
    }

    if (!apiText) {
      const detailResponse = await detailResponsePromise;
      if (detailResponse) {
        try {
          const data = await detailResponse.json();
          apiText = extractTextFromApiData(data);
        } catch {}
      }
    }

    if (apiText) {
      return { text: apiText, got429 };
    }

    // Fallback: extract from page DOM
    const text = await detailPage.evaluate(() => {
      const body = document.body?.innerText || "";
      if (!body) return "";
      const lines = body.split("\n").map((s) => s.trim()).filter(Boolean);
      const idx = lines.findIndex((l) => /kungörelsetext/i.test(l));
      if (idx < 0) return "";
      let end = lines.findIndex((l, i) => i > idx && /tillbaka|skriv ut/i.test(l));
      if (end < 0) end = lines.length;
      return lines.slice(idx + 1, end).join("\n").trim();
    });

    return { text, got429 };
  } finally {
    await detailPage.close();
    if (shouldCloseContext && detailContext !== browserOrContext) {
      await detailContext.close().catch(() => {});
    }
  }
}

function extractTextFromApiData(data: unknown): string {
  if (!data) return "";
  const candidates: string[] = [];

  function walk(val: unknown, path: string) {
    if (!val) return;
    if (typeof val === "string") {
      const keyHint = /text|kungorelse/i.test(path);
      const contentHint = /org\s*nr|företagsnamn|kungörelsetext/i.test(val);
      if ((keyHint || contentHint) && val.length > 20) {
        candidates.push(val);
      }
      return;
    }
    if (Array.isArray(val)) {
      for (const item of val) walk(item, path);
      return;
    }
    if (typeof val === "object" && val !== null) {
      for (const [key, item] of Object.entries(val)) {
        walk(item, `${path}.${key}`);
      }
    }
  }

  walk(data, "root");
  if (candidates.length === 0) return "";
  candidates.sort((a, b) => b.length - a.length);
  return candidates[0].trim();
}

async function saveAnnouncements(
  query: string,
  orgNumber: string | undefined,
  results: ScrapedResult[]
): Promise<number> {
  const { prisma } = await import("@/lib/db");
  let saved = 0;

  for (const r of results) {
    try {
      await prisma.announcement.upsert({
        where: { id: r.id },
        create: {
          id: r.id,
          query,
          reporter: r.reporter || null,
          type: r.type || null,
          subject: r.subject,
          pubDate: r.pubDate || null,
          publishedAt: r.pubDate ? parseDate(r.pubDate) : null,
          detailText: r.detailText || null,
          fullText: r.fullText || null,
          url: r.url,
          orgNumber: orgNumber?.replace(/-/g, "") || null,
          scrapedAt: new Date(),
        },
        update: {
          detailText: r.detailText || undefined,
          fullText: r.fullText || undefined,
          updatedAt: new Date(),
        },
      });
      saved++;
    } catch (err) {
      console.error(`Failed to save announcement ${r.id}:`, err);
    }
  }

  return saved;
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) return new Date(dateStr);
  return null;
}
