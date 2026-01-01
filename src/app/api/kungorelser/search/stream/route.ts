import { NextRequest } from "next/server";
import { auth } from "@/auth";
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
const TWOCAPTCHA_API_KEY = process.env.TWOCAPTCHA_API_KEY || "";

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

        // Dynamic import for serverless
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { chromium } = require("playwright") as typeof import("playwright");

        const executablePath = findChromiumPath();
        console.log("[StreamScraper] Launching browser, executablePath:", executablePath || "default");

        const browser = await chromium.launch({
          headless: true,
          executablePath,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-blink-features=AutomationControlled",
          ],
        });

        sendEvent({ type: "status", message: "Öppnar Bolagsverkets POIT..." });

        // Create context with realistic browser fingerprint
        const context = await browser.newContext({
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          viewport: { width: 1920, height: 1080 },
          locale: "sv-SE",
          timezoneId: "Europe/Stockholm",
        });
        const page = await context.newPage();

        // Hide webdriver property
        await page.addInitScript(() => {
          Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        });

        try {
          // Navigate to search (following reference poit.js pattern)
          await page.goto(START_URL, { waitUntil: "networkidle", timeout: 30000 });
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
            sendEvent({ type: "status", message: `Försöker igen (${attempt}/3)...` });

            await page.reload({ waitUntil: "domcontentloaded" });
            await page.waitForTimeout(1000);
            await solveBlockerWithProgress(page, sendEvent);
            await maybeNavigateToSearch(page);
            await waitForSearchInputs(page);
          }

          if (submitted !== true) {
            throw new Error("Kunde inte hitta sökformulär efter 3 försök");
          }

          // Wait for AJAX search to complete - look for results table or "no results" message
          try {
            await page.waitForFunction(
              () => {
                const body = document.body?.innerText || "";
                // Check for results table, result count, or "no results" message
                return (
                  document.querySelector('table') !== null ||
                  body.includes("Antal träffar") ||
                  body.includes("inga träffar") ||
                  body.includes("0 träffar")
                );
              },
              { timeout: 10000 }
            );
          } catch {
            console.log("[StreamScraper] Timeout waiting for search results");
          }

          await page.waitForTimeout(1500);
          await solveBlockerWithProgress(page, sendEvent);

          // Dismiss cookie banner again after search (might reappear)
          await dismissCookieBanner(page);

          // Collect results
          sendEvent({ type: "status", message: "Samlar in resultat..." });

          // Log the current page URL and state
          const currentUrl = page.url();
          console.log("[StreamScraper] Current URL after search:", currentUrl);

          const results = await collectResultsWithProgress(page, sendEvent);

          sendEvent({
            type: "result",
            message: `Hittade ${results.length} kungörelser`,
            data: { count: results.length },
          });

          // Fetch details if not skipped
          const enrichedResults: ScrapedResult[] = [];

          if (!skipDetails && results.length > 0) {
            const limit = Math.min(detailLimit, results.length);
            sendEvent({
              type: "status",
              message: `Hämtar detaljer för ${limit} av ${results.length} kungörelser...`,
            });

            for (let i = 0; i < limit; i++) {
              const item = results[i];
              sendEvent({
                type: "detail",
                message: `Hämtar detalj ${i + 1}/${limit}: ${item.type || "Kungörelse"}`,
                data: { current: i + 1, total: limit, id: item.id },
              });

              try {
                const text = await fetchDetailText(context, item);
                if (text) {
                  item.detailText = text.length > 500 ? text.slice(0, 500) + "..." : text;
                  item.fullText = text;
                }
                enrichedResults.push(item);

                sendEvent({
                  type: "success",
                  message: `✓ Detalj ${i + 1}/${limit} hämtad`,
                  data: { id: item.id, hasText: !!text },
                });
              } catch (err) {
                sendEvent({
                  type: "error",
                  message: `✗ Kunde inte hämta detalj: ${err instanceof Error ? err.message : "Okänt fel"}`,
                });
                enrichedResults.push(item);
              }

              // Delay between requests
              if (i < limit - 1) {
                await new Promise((r) => setTimeout(r, 1500));
              }
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
          await context.close();
          await browser.close();
        }
      } catch (error) {
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
      await page.reload();
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
      await page.reload();
      await page.waitForTimeout(3000);
    }
  }

  return false;
}

async function solveCaptcha(imageBase64: string, sendEvent: ProgressCallback): Promise<string> {
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
  // Wait for any of the possible search input selectors (matching reference code)
  await page.waitForFunction(
    () =>
      document.querySelector("#namn") ||
      document.querySelector("#personOrgnummer") ||
      document.querySelector('input[placeholder*="Företagsnamn"]') ||
      document.querySelector('input[placeholder*="Org"]') ||
      document.querySelector('input[name*="namn"]') ||
      document.querySelector('input[name*="org"]'),
    { timeout: 15000 }
  ).catch(() => {});
}

// Resolve search input with multiple fallback selectors (from reference poit.js)
async function resolveSearchInput(page: Page, isOrg: boolean) {
  const selectors = isOrg
    ? [
        "#personOrgnummer",
        'input[name*="org"]',
        'input[placeholder*="Org"]',
        'input[placeholder*="Organisationsnummer"]',
      ]
    : [
        "#namn",
        'input[name*="namn"]',
        'input[placeholder*="Företagsnamn"]',
      ];

  for (const sel of selectors) {
    const loc = page.locator(sel);
    if ((await loc.count()) > 0) return loc.first();
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

async function collectResultsWithProgress(page: Page, sendEvent: ProgressCallback): Promise<ScrapedResult[]> {
  // Wait for results to load - try multiple times (10 retries like reference poit.js)
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(1500);

    // Re-check for captcha/blocker on each iteration
    await solveBlockerWithProgress(page, sendEvent);

    // Check if we got a "no results" message
    const noResultsCheck = await page.evaluate(() => {
      const body = document.body?.innerText?.toLowerCase() || "";
      return {
        noResults: body.includes("inga träffar") || body.includes("inga kungörelser") || body.includes("0 träffar"),
        bodyText: body.slice(0, 300),
      };
    });

    if (noResultsCheck.noResults) {
      console.log("[collectResults] No results message found on page");
      sendEvent({ type: "status", message: "Sidan visar 'Inga träffar'" });
      return [];
    }

    // Try to find result links
    const results = await page.evaluate(() => {
      const seen = new Set<string>();
      const items: ScrapedResult[] = [];

      // Try multiple selectors for result links
      const selectors = [
        'a[href*="kungorelse/"]',
        'a[href*="/poit-app/kungorelse/"]',
        'tr[data-item-id] a',
        '.search-result a',
        'table tbody tr a',
      ];

      for (const selector of selectors) {
        const links = Array.from(document.querySelectorAll(selector));
        for (const link of links) {
          const href = link.getAttribute("href") || "";
          // Extract ID from URL - take last path segment (e.g., K959717-25)
          const id = href.split("/").pop()?.split("?")[0] || "";
          if (!id || seen.has(id) || !href.includes("kungorelse")) continue;
          seen.add(id);

          const row = link.closest("tr");
          const cells = row
            ? Array.from(row.querySelectorAll("td")).map((c) => c.innerText.trim())
            : [];

          items.push({
            id,
            url: href.startsWith("http") ? href : `https://poit.bolagsverket.se${href}`,
            reporter: cells[1] || "",
            type: cells[2] || "",
            subject: cells[3] || "",
            pubDate: cells[4] || "",
          });
        }
        if (items.length > 0) break;
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
      return {
        url,
        bodyLength: body.length,
        hasTable,
        hasResults,
        linkCount,
        sample: body.slice(0, 300),
      };
    });

    console.log(`[collectResults] Attempt ${i + 1}: Page state:`, JSON.stringify(pageState, null, 2));

    // Send debug info (only first attempt to avoid spam)
    if (i === 0) {
      sendEvent({
        type: "status",
        message: `Försöker hitta resultat (${pageState.linkCount} länkar, tabell: ${pageState.hasTable})`,
      });
    }
  }

  console.log("[collectResults] No results found after retries");
  return [];
}

async function fetchDetailText(context: BrowserContext, item: ScrapedResult): Promise<string> {
  const detailPage = await context.newPage();

  try {
    await detailPage.goto(item.url, { waitUntil: "networkidle", timeout: 20000 });
    await detailPage.waitForTimeout(1500);

    // Try to get text from page
    const text = await detailPage.evaluate(() => {
      const body = document.body?.innerText || "";
      const lines = body.split("\n").map((s) => s.trim()).filter(Boolean);
      const idx = lines.findIndex((l) => /kungörelsetext/i.test(l));
      if (idx < 0) return "";
      let end = lines.findIndex((l, i) => i > idx && /tillbaka|skriv ut/i.test(l));
      if (end < 0) end = lines.length;
      return lines.slice(idx + 1, end).join("\n").trim();
    });

    return text;
  } finally {
    await detailPage.close();
  }
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
