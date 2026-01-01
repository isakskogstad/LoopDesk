import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { PlaywrightCrawler, Configuration } from "crawlee";
import type { Page, BrowserContext } from "playwright";

const START_URL = "https://poit.bolagsverket.se/poit-app/sok";
const TWOCAPTCHA_API_KEY = process.env.TWOCAPTCHA_API_KEY || "";

// Proxy configuration for bypassing IP blocking
// Format: http://username:password@proxy.example.com:port
const PROXY_SERVER = process.env.PROXY_SERVER || "";
const PROXY_USERNAME = process.env.PROXY_USERNAME || "";
const PROXY_PASSWORD = process.env.PROXY_PASSWORD || "";

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
 * Using Crawlee PlaywrightCrawler (same approach as working Electron app)
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

      // Store results to return after crawl
      let scrapedResults: ScrapedResult[] = [];
      let crawlerContext: BrowserContext | null = null;

      try {
        sendEvent({ type: "status", message: "Startar Crawlee..." });

        // Create unique storage directory per request (like Electron app)
        const sanitizedQuery = query.trim().replace(/[^a-zA-Z0-9]/g, "_").substring(0, 20);
        const uniqueStorageDir = `/tmp/crawlee_${sanitizedQuery}_${Date.now()}`;

        // Configure Crawlee storage
        const config = Configuration.getGlobalConfig();
        config.set("storageClientOptions", { localDataDirectory: uniqueStorageDir });

        // Build proxy configuration if provided
        const proxyConfig = PROXY_SERVER
          ? {
              server: PROXY_SERVER,
              ...(PROXY_USERNAME && PROXY_PASSWORD
                ? { username: PROXY_USERNAME, password: PROXY_PASSWORD }
                : {}),
            }
          : undefined;

        if (proxyConfig) {
          console.log(`[Proxy] Using proxy server: ${PROXY_SERVER.replace(/:[^:@]*@/, ':***@')}`);
          sendEvent({ type: "status", message: "Ansluter via proxy..." });
        } else {
          console.log("[Proxy] No proxy configured, using direct connection");
        }

        // Create PlaywrightCrawler with anti-detection measures
        const crawler = new PlaywrightCrawler({
          maxRequestsPerCrawl: 1,
          headless: true,
          navigationTimeoutSecs: 60,
          requestHandlerTimeoutSecs: 600, // 10 minutes like Electron app
          launchContext: {
            launchOptions: {
              args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--disable-features=IsolateOrigins,site-per-process",
                "--disable-web-security",
                "--disable-features=BlockInsecurePrivateNetworkRequests",
                "--disable-dev-shm-usage",
                "--window-size=1920,1080",
                // Additional flags to prevent ERR_BLOCKED_BY_CLIENT
                "--disable-extensions",
                "--disable-component-extensions-with-background-pages",
                "--disable-default-apps",
                "--disable-client-side-phishing-detection",
                "--disable-sync",
                "--disable-background-networking",
                "--disable-breakpad",
                "--disable-hang-monitor",
                "--disable-ipc-flooding-protection",
                "--disable-popup-blocking",
                "--disable-prompt-on-repost",
                "--disable-renderer-backgrounding",
                "--force-color-profile=srgb",
                "--metrics-recording-only",
                "--safebrowsing-disable-auto-update",
                "--enable-features=NetworkService,NetworkServiceInProcess",
                "--password-store=basic",
                "--use-mock-keychain",
              ],
              proxy: proxyConfig,
            },
          },
          // Browser context with realistic settings
          browserPoolOptions: {
            useFingerprints: false,
            preLaunchHooks: [
              async (_pageId, launchContext) => {
                launchContext.launchOptions = {
                  ...launchContext.launchOptions,
                  ignoreDefaultArgs: ["--enable-automation"],
                };
              },
            ],
          },
          preNavigationHooks: [
            async ({ page }) => {
              // Set realistic viewport
              await page.setViewportSize({ width: 1920, height: 1080 });

              // Hide webdriver property
              await page.addInitScript(() => {
                Object.defineProperty(navigator, "webdriver", { get: () => undefined });
                // Hide automation
                Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
                Object.defineProperty(navigator, "languages", { get: () => ["sv-SE", "sv", "en-US", "en"] });
              });
            },
          ],
          async requestHandler({ page }) {
            console.log("[Crawlee] Request handler started");
            crawlerContext = page.context();

            // Capture console errors for debugging
            page.on("console", (msg) => {
              if (msg.type() === "error") {
                console.log("[PageConsole] ERROR:", msg.text());
              }
            });
            page.on("pageerror", (error) => {
              console.log("[PageError]", error.message);
            });

            sendEvent({ type: "status", message: "Öppnar Bolagsverkets POIT..." });

            await page.goto(START_URL, { waitUntil: "networkidle" });
            await page.waitForTimeout(1000);

            sendEvent({ type: "status", message: "Kontrollerar captcha..." });
            await solveBlockerWithProgress(page, sendEvent);

            // Navigate to search form
            sendEvent({ type: "status", message: "Öppnar sökformulär..." });
            let ready = await maybeNavigateToSearch(page);
            await solveBlockerWithProgress(page, sendEvent);

            // Retry navigation if needed (like Electron app)
            if (!ready) {
              console.log("[Crawlee] First navigation failed, reloading page...");
              await page.goto(START_URL, { waitUntil: "networkidle" });
              await page.waitForTimeout(1000);
              await solveBlockerWithProgress(page, sendEvent);
              ready = await maybeNavigateToSearch(page);
            }

            await waitForSearchInputs(page);

            // Submit search with retry (like Electron app)
            sendEvent({ type: "search", message: `Söker: "${query.trim()}"...` });
            let submitted: boolean | "disabled" = false;

            for (let attempt = 1; attempt <= 3; attempt++) {
              submitted = await submitSearch(page, query.trim());

              if (submitted === true) {
                console.log("[Crawlee] Search submitted successfully");
                break;
              }

              if (submitted === "disabled") {
                sendEvent({ type: "error", message: "Sökfältet inaktiverat - ogiltigt sökord" });
                throw new Error("Invalid search query");
              }

              console.log(`[Crawlee] Input not found, retrying (attempt ${attempt}/3)...`);
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

            // Wait for search results (like Electron app findResults)
            await page.waitForTimeout(1000);
            sendEvent({ type: "status", message: "Väntar på resultat..." });

            const results = await findResults(page, sendEvent, query.trim());

            sendEvent({
              type: "result",
              message: `Hittade ${results.length} kungörelser`,
              data: { count: results.length },
            });

            // Fetch details if not skipped
            const enrichedResults: ScrapedResult[] = [];

            if (!skipDetails && results.length > 0 && crawlerContext) {
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
                  const text = await fetchDetailText(crawlerContext, item);
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

            scrapedResults = enrichedResults;
          },
        });

        // Run the crawler
        console.log("[Crawlee] Starting crawler...");
        await crawler.run([START_URL]);
        console.log("[Crawlee] Crawler finished");

        // Save to database
        sendEvent({ type: "status", message: "Sparar till databas..." });
        const saved = await saveAnnouncements(query.trim(), orgNumber, scrapedResults);

        sendEvent({
          type: "complete",
          message: `Klar! ${saved} kungörelser sparade`,
          data: {
            total: scrapedResults.length,
            saved,
            withDetails: scrapedResults.filter((r) => r.fullText).length,
          },
        });

        // Cleanup storage
        try {
          const fs = await import("fs");
          if (fs.existsSync(uniqueStorageDir)) {
            fs.rmSync(uniqueStorageDir, { recursive: true, force: true });
          }
        } catch {
          // Ignore cleanup errors
        }
      } catch (error) {
        console.log("[Crawlee] Error:", error);
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

// Helper functions (matching Electron app patterns)

async function solveBlockerWithProgress(page: Page, sendEvent: ProgressCallback): Promise<boolean> {
  for (let attempt = 1; attempt <= 10; attempt++) {
    const blocked = await page.evaluate(() => {
      const body = document.body ? document.body.innerText : "";
      return Boolean(document.querySelector("#ans")) || body.includes("human visitor");
    });

    if (!blocked) return true;

    sendEvent({
      type: "captcha",
      message: `Captcha upptäckt, löser... (försök ${attempt}/10)`,
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
  const hasNameField = await page.$("#namn");
  const hasOrgField = await page.$("#personOrgnummer");
  if (hasNameField || hasOrgField) return true;

  console.log("[maybeNavigateToSearch] Opening search form...");
  const link = page.getByRole("link", { name: /Sök kungörelse/i });
  if (await link.count()) {
    await Promise.all([
      link.first().click(),
      page.waitForURL(/\/poit-app\/sok/, { timeout: 15000 }).catch(() => {}),
    ]);
  } else {
    await page.evaluate(() => {
      const a = Array.from(document.querySelectorAll("a")).find((el) =>
        (el.innerText || "").includes("Sök kungörelse")
      );
      if (a) (a as HTMLElement).click();
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

  // Dispatch form events to trigger Angular validation (matching Electron app)
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

async function collectResults(page: Page): Promise<ScrapedResult[]> {
  // Same pattern as Electron app
  const items = await page.evaluate(() => {
    const seen = new Set<string>();
    const results: Array<{
      id: string;
      url: string;
      cells: string[];
      rowText: string;
    }> = [];

    const links = Array.from(document.querySelectorAll('a[href*="kungorelse/"]'));
    for (const link of links) {
      const href = (link as HTMLAnchorElement).href || "";
      const id = href.split("/").pop()?.split("?")[0] || "";
      if (!id || seen.has(id)) continue;
      seen.add(id);

      const row = link.closest("tr") || link.closest("[role=row]") || link.closest("div");
      let cells: string[] = [];
      if (row) {
        cells = Array.from(row.querySelectorAll("td"))
          .map((c) => ((c as HTMLElement).innerText || "").trim())
          .filter(Boolean);
        if (cells.length === 0) {
          cells = Array.from(row.querySelectorAll('[role="cell"]'))
            .map((c) => ((c as HTMLElement).innerText || "").trim())
            .filter(Boolean);
        }
        if (cells.length === 0 && (row as HTMLElement).innerText) {
          cells = (row as HTMLElement).innerText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }

      results.push({
        id,
        url: href,
        cells,
        rowText: row ? (row as HTMLElement).innerText || "" : "",
      });
    }

    return results;
  });

  return items.map((item) => {
    const cells = item.cells || [];
    return {
      id: item.id,
      url: item.url,
      reporter: cells[1] || "",
      type: cells[2] || "",
      subject: cells[3] || "",
      pubDate: cells[4] || "",
    };
  });
}

async function findResults(page: Page, sendEvent: ProgressCallback, query?: string): Promise<ScrapedResult[]> {
  // Same pattern as Electron app: 10 retries with 1.5s delay
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(1500);
    await solveBlockerWithProgress(page, sendEvent);

    const results = await collectResults(page);
    if (results.length > 0) {
      console.log(`[findResults] Found ${results.length} results on attempt ${i + 1}`);
      return results;
    }

    // Check for "no results" message
    const bodyText = await page.textContent("body") || "";
    if (bodyText.toLowerCase().includes("inga träffar")) {
      console.log("[findResults] Page shows 'inga träffar'");
      return [];
    }

    // Check for Angular errors
    const hasError = bodyText.includes("TypeError") || bodyText.includes("Okänt fel");
    if (hasError && i < 2 && query) {
      console.log("[findResults] Angular error detected, reloading and re-searching...");
      await page.reload({ waitUntil: "networkidle" });
      await page.waitForTimeout(2000);
      await solveBlockerWithProgress(page, sendEvent);
      await maybeNavigateToSearch(page);
      await waitForSearchInputs(page);
      await submitSearch(page, query);
      await page.waitForTimeout(3000);
    }

    console.log(`[findResults] No results on attempt ${i + 1}, waiting...`);
  }

  console.log("[findResults] No results found after 10 attempts");
  return [];
}

async function fetchDetailText(context: BrowserContext, item: ScrapedResult): Promise<string> {
  const detailPage = await context.newPage();

  try {
    // Wait for API response like Electron app
    const apiResponsePromise = detailPage
      .waitForResponse(
        (res) =>
          res.url().includes("/poit/rest/SokKungorelse?kungorelseid=") &&
          res.status() === 200,
        { timeout: 15000 }
      )
      .catch(() => null);

    const detailResponsePromise = detailPage
      .waitForResponse(
        (res) =>
          res.url().includes("/poit/rest/HamtaKungorelse?") &&
          res.status() === 200,
        { timeout: 20000 }
      )
      .catch(() => null);

    await detailPage.goto(item.url, { waitUntil: "networkidle", timeout: 60000 });
    await detailPage.waitForTimeout(1500);

    // Wait for detail text to appear
    await detailPage
      .waitForFunction(
        () => (document.body?.innerText || "").includes("Kungörelsetext"),
        { timeout: 15000 }
      )
      .catch(() => {});

    // Try to get text from API response first
    let apiText = "";
    const apiResponse = await apiResponsePromise;
    if (apiResponse) {
      try {
        const data = await apiResponse.json();
        apiText = pickTextFromApi(data);
      } catch {
        // Ignore JSON parse errors
      }
    }

    if (!apiText) {
      const detailResponse = await detailResponsePromise;
      if (detailResponse) {
        try {
          const data = await detailResponse.json();
          apiText = pickTextFromApi(data);
        } catch {
          // Ignore JSON parse errors
        }
      }
    }

    if (apiText) return apiText;

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

    return text;
  } finally {
    await detailPage.close();
  }
}

function pickTextFromApi(data: unknown): string {
  if (!data) return "";
  const candidates: string[] = [];

  const walk = (val: unknown, path: string): void => {
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
    if (typeof val === "object") {
      for (const [key, item] of Object.entries(val as Record<string, unknown>)) {
        walk(item, `${path}.${key}`);
      }
    }
  };

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
