import { NextRequest } from "next/server";
import { auth } from "@/auth";
import type { BrowserContext, Page } from "playwright-core";
import { existsSync, readdirSync } from "fs";
import { join } from "path";

// Find Chromium executable path for playwright-core
function findChromiumPath(): string | undefined {
  const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH || "/ms-playwright";

  try {
    const dirs = readdirSync(browsersPath);
    for (const dir of dirs) {
      if (dir.startsWith("chromium-")) {
        const chromePath = join(browsersPath, dir, "chrome-linux", "chrome");
        if (existsSync(chromePath)) {
          console.log("[StreamScraper] Found Chromium at:", chromePath);
          return chromePath;
        }
      }
    }
  } catch (e) {
    console.warn("[StreamScraper] Could not search for Chromium:", e);
  }

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
        const { chromium } = require("playwright-core") as typeof import("playwright-core");

        const executablePath = findChromiumPath();
        console.log("[StreamScraper] Launching browser, executablePath:", executablePath || "default");

        const browser = await chromium.launch({
          headless: true,
          executablePath,
          args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
        });

        sendEvent({ type: "status", message: "Öppnar Bolagsverkets POIT..." });

        const context = await browser.newContext();
        const page = await context.newPage();

        try {
          // Navigate to search
          await page.goto(START_URL, { waitUntil: "networkidle", timeout: 30000 });
          sendEvent({ type: "status", message: "Kontrollerar captcha..." });

          // Handle captcha if present
          const captchaSolved = await solveBlockerWithProgress(page, sendEvent);
          if (!captchaSolved) {
            throw new Error("Kunde inte lösa captcha efter flera försök");
          }

          // Navigate to search form
          sendEvent({ type: "status", message: "Öppnar sökformulär..." });
          await maybeNavigateToSearch(page);
          await solveBlockerWithProgress(page, sendEvent);
          await waitForSearchInputs(page);

          // Submit search
          sendEvent({ type: "search", message: `Söker: "${query.trim()}"...` });
          const submitted = await submitSearch(page, query.trim());

          if (submitted === "disabled") {
            sendEvent({ type: "error", message: "Sökfältet inaktiverat - ogiltigt sökord" });
            throw new Error("Invalid search query");
          }

          if (!submitted) {
            throw new Error("Kunde inte hitta sökformulär");
          }

          await page.waitForTimeout(1500);
          await solveBlockerWithProgress(page, sendEvent);

          // Collect results
          sendEvent({ type: "status", message: "Samlar in resultat..." });
          const results = await collectResults(page);

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

async function maybeNavigateToSearch(page: Page): Promise<boolean> {
  const hasField = await page.$("#namn") || await page.$("#personOrgnummer");
  if (hasField) return true;

  const link = page.getByRole("link", { name: /Sök kungörelse/i });
  if (await link.count()) {
    await link.first().click();
    await page.waitForTimeout(1500);
  }

  return Boolean(await page.$("#namn") || await page.$("#personOrgnummer"));
}

async function waitForSearchInputs(page: Page): Promise<void> {
  await page.waitForFunction(
    () =>
      document.querySelector("#namn") ||
      document.querySelector("#personOrgnummer"),
    { timeout: 10000 }
  ).catch(() => {});
}

async function submitSearch(page: Page, query: string): Promise<boolean | "disabled"> {
  const digits = query.replace(/\D/g, "");
  const isOrg = digits.length >= 10;

  const input = isOrg
    ? await page.$("#personOrgnummer")
    : await page.$("#namn");

  if (!input) return false;

  const formattedQuery = isOrg && digits.length >= 10
    ? `${digits.slice(0, 6)}-${digits.slice(6, 10)}`
    : query;

  await input.fill(formattedQuery);
  await page.waitForTimeout(500);

  const button = page.getByRole("button", { name: /Sök kungörelse/i });
  if (await button.count()) {
    const enabled = await button.first().isEnabled();
    if (!enabled) return "disabled";
    await button.first().click();
    return true;
  }

  return false;
}

async function collectResults(page: Page): Promise<ScrapedResult[]> {
  await page.waitForTimeout(2000);

  return await page.evaluate(() => {
    const seen = new Set<string>();
    const results: ScrapedResult[] = [];

    const links = Array.from(document.querySelectorAll('a[href*="kungorelse/"]'));
    for (const link of links) {
      const href = link.getAttribute("href") || "";
      const id = href.split("/").pop()?.split("?")[0] || "";
      if (!id || seen.has(id)) continue;
      seen.add(id);

      const row = link.closest("tr");
      const cells = row
        ? Array.from(row.querySelectorAll("td")).map((c) => c.innerText.trim())
        : [];

      results.push({
        id,
        url: (link as HTMLAnchorElement).href,
        reporter: cells[1] || "",
        type: cells[2] || "",
        subject: cells[3] || "",
        pubDate: cells[4] || "",
      });
    }

    return results;
  });
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
