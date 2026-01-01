/**
 * Kungörelser Scraper - Adapted from Electron Bolags app for Next.js/Railway
 *
 * Scrapes company announcements from Bolagsverket POIT
 * https://poit.bolagsverket.se/poit-app/sok
 *
 * Features (matching original Electron app):
 * - 2captcha integration for CAPTCHA solving
 * - Smart proxy activation based on blocking stats
 * - Session persistence to reduce CAPTCHAs
 */

import type { BrowserContext, Page } from 'playwright-core';
import type { Announcement, ScrapedResult, SearchOptions } from './types';
import { proxyManager } from './proxy-manager';
import { sessionManager } from './session-manager';
import { existsSync } from 'fs';
import { join } from 'path';

const START_URL = "https://poit.bolagsverket.se/poit-app/sok";

// Find Chromium executable path for playwright-core
function findChromiumPath(): string | undefined {
  const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH || '/ms-playwright';

  try {
    const { readdirSync } = require('fs');
    const dirs = readdirSync(browsersPath);

    // First, try to find full chromium (preferred)
    for (const dir of dirs) {
      if (dir.startsWith('chromium-') && !dir.includes('headless')) {
        const chromePath = join(browsersPath, dir, 'chrome-linux', 'chrome');
        if (existsSync(chromePath)) {
          console.log('[Scraper] Found full Chromium at:', chromePath);
          return chromePath;
        }
      }
    }

    // Fallback to headless shell
    for (const dir of dirs) {
      if (dir.startsWith('chromium_headless_shell-')) {
        // The headless shell has a different path structure
        const headlessPath = join(browsersPath, dir, 'chrome-headless-shell-linux64', 'chrome-headless-shell');
        if (existsSync(headlessPath)) {
          console.log('[Scraper] Found headless shell at:', headlessPath);
          return headlessPath;
        }
      }
    }
  } catch (e) {
    console.warn('[Scraper] Could not search for Chromium:', e);
  }

  return undefined;
}
const DETAIL_TEXT_WORD_LIMIT = 100;
const DETAIL_TEXT_CHAR_LIMIT = 1000;

// 2captcha API configuration from environment
const TWOCAPTCHA_API_KEY = process.env.TWOCAPTCHA_API_KEY || '';

// Scraper configuration
const SCRAPER_CONFIG = {
  // Delay between requests (ms)
  detailDelayMs: parseInt(process.env.SCRAPER_DETAIL_DELAY_MS || '2000', 10),
  // Maximum retries for captcha
  maxCaptchaRetries: parseInt(process.env.SCRAPER_MAX_CAPTCHA_RETRIES || '10', 10),
  // Timeout for navigation (ms)
  navigationTimeout: parseInt(process.env.SCRAPER_NAVIGATION_TIMEOUT || '60000', 10),
  // Enable proxy for scraping
  useProxy: process.env.SCRAPER_USE_PROXY === 'true',
};

/**
 * Build query variants for better search coverage
 */
export function buildQueryVariants(query: string): string[] {
  const trimmed = (query || "").trim();
  const variants = trimmed ? [trimmed] : [];
  const digits = trimmed.replace(/\D/g, "");

  // Add org number variants
  if (digits.length === 10) {
    const dashed = `${digits.slice(0, 6)}-${digits.slice(6)}`;
    if (dashed !== trimmed) variants.push(dashed);
    if (digits !== trimmed) variants.push(digits);
  }

  // Add name-only variant
  if (/[a-zA-Z]/.test(trimmed)) {
    const nameOnly = trimmed.replace(/[0-9\-]+/g, " ").replace(/\s+/g, " ").trim();
    if (nameOnly && nameOnly !== trimmed) variants.push(nameOnly);
  }

  return Array.from(new Set(variants));
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Check if text is long (needs truncation)
 */
function isLongText(text: string): boolean {
  if (!text) return false;
  return countWords(text) > DETAIL_TEXT_WORD_LIMIT || text.trim().length > DETAIL_TEXT_CHAR_LIMIT;
}

/**
 * Truncate text to word limit
 */
function truncateWords(text: string, limit: number): string {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= limit) return text.trim();
  return `${words.slice(0, limit).join(" ")} ...`;
}

/**
 * Format text as markdown
 */
export function formatTextAsMarkdown(text: string): string {
  if (!text) return "";
  const lines = text.split(/\r?\n/);
  const output: string[] = [];
  let started = false;
  let pendingList = false;

  function isHeadingCandidate(line: string): boolean {
    if (!line) return false;
    if (line.length > 160) return false;
    if (/^(https?:|www\.)/i.test(line)) return false;
    if (/^[-*•–]\s+/.test(line)) return false;
    if (/^\d+[.)]\s+/.test(line)) return false;
    if (/[.!?]$/.test(line)) return false;
    if (line.endsWith(":")) return line.length <= 50;
    return true;
  }

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+/g, " ").trim();
    if (!line) {
      if (output.length && output[output.length - 1] !== "") output.push("");
      pendingList = false;
      continue;
    }

    if (!started) {
      output.push(`# ${line}`);
      started = true;
      pendingList = false;
      continue;
    }

    if (isHeadingCandidate(line)) {
      if (output.length && output[output.length - 1] !== "") output.push("");
      output.push(`## ${line.replace(/:$/, "")}`);
      pendingList = false;
      continue;
    }

    let normalized = line;
    let isListItem = false;
    const bulletMatch = line.match(/^[-*•–]\s+(.*)$/);
    if (bulletMatch) {
      normalized = bulletMatch[1].trim();
      isListItem = true;
    }
    const orderedMatch = line.match(/^\d+[.)]\s+(.*)$/);
    if (orderedMatch) {
      normalized = orderedMatch[1].trim();
      isListItem = true;
    }
    if (!isListItem && pendingList) {
      isListItem = true;
    }

    if (isListItem) {
      output.push(`- ${normalized}`);
    } else {
      output.push(line);
    }
    pendingList = line.endsWith(":");
  }

  return output.join("\n").replace(/\n{3,}/g, "\n\n");
}

/**
 * Check 2captcha balance
 */
async function check2CaptchaBalance(): Promise<number> {
  if (!TWOCAPTCHA_API_KEY) {
    return 0;
  }

  try {
    const balanceUrl = new URL("https://2captcha.com/res.php");
    balanceUrl.searchParams.set("key", TWOCAPTCHA_API_KEY);
    balanceUrl.searchParams.set("action", "getbalance");
    balanceUrl.searchParams.set("json", "1");

    const response = await fetch(balanceUrl.toString());
    const result = await response.json();

    if (result.status === 1) {
      return parseFloat(result.request);
    }
    return 0;
  } catch (error) {
    console.error("Failed to check 2captcha balance:", error);
    return 0;
  }
}

/**
 * Solve CAPTCHA using 2captcha API
 */
async function solveCaptcha(imageBase64: string): Promise<string> {
  if (!TWOCAPTCHA_API_KEY) {
    console.warn("CAPTCHA: TWOCAPTCHA_API_KEY not configured - captcha solving disabled");
    throw new Error("TWOCAPTCHA_API_KEY not configured. Set this environment variable to enable captcha solving.");
  }

  // Check balance before solving
  const balance = await check2CaptchaBalance();
  if (balance < 0.001) {
    console.warn("CAPTCHA: 2captcha balance too low:", balance);
    throw new Error(`2captcha balance too low: $${balance}. Please top up your account.`);
  }

  console.log("CAPTCHA: Submitting to 2captcha (balance: $" + balance.toFixed(3) + ")");

  // Submit captcha
  const submitUrl = new URL("https://2captcha.com/in.php");
  submitUrl.searchParams.set("key", TWOCAPTCHA_API_KEY);
  submitUrl.searchParams.set("method", "base64");
  submitUrl.searchParams.set("json", "1");

  // Extract base64 data from data URL if present
  const base64Data = imageBase64.includes("base64,")
    ? imageBase64.split("base64,")[1]
    : imageBase64;

  const submitResponse = await fetch(submitUrl.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ body: base64Data }),
  });

  const submitResult = await submitResponse.json();
  if (submitResult.status !== 1) {
    console.error("CAPTCHA: Submit failed:", submitResult);
    throw new Error(`2captcha submit failed: ${submitResult.request}`);
  }

  const captchaId = submitResult.request;
  console.log("CAPTCHA: Submitted, ID:", captchaId);

  // Poll for result
  const resultUrl = new URL("https://2captcha.com/res.php");
  resultUrl.searchParams.set("key", TWOCAPTCHA_API_KEY);
  resultUrl.searchParams.set("action", "get");
  resultUrl.searchParams.set("id", captchaId);
  resultUrl.searchParams.set("json", "1");

  for (let i = 0; i < 30; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const resultResponse = await fetch(resultUrl.toString());
    const result = await resultResponse.json();

    if (result.status === 1) {
      console.log("CAPTCHA: Solved successfully");
      return result.request;
    }

    if (result.request !== "CAPCHA_NOT_READY") {
      console.error("CAPTCHA: Failed:", result);
      throw new Error(`2captcha failed: ${result.request}`);
    }

    console.log("CAPTCHA: Waiting for solution... attempt", i + 1);
  }

  throw new Error("2captcha timeout after 60 seconds");
}

/**
 * Handle CAPTCHA blocker on page
 */
async function solveBlocker(page: Page): Promise<boolean> {
  for (let attempt = 1; attempt <= 10; attempt++) {
    const blocked = await page.evaluate(() => {
      const body = document.body ? document.body.innerText : "";
      return Boolean(document.querySelector("#ans")) || body.includes("human visitor");
    });

    if (!blocked) {
      proxyManager.recordSuccess(); // Reset consecutive counter on success
      return true;
    }

    // Record CAPTCHA encounter for proxy manager
    proxyManager.recordCaptcha();
    console.log(`CAPTCHA: block detected, attempt ${attempt}`);

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
      const guess = await solveCaptcha(imgSrc);
      console.log(`CAPTCHA: solved with answer '${guess}'`);

      const input = page.locator("#ans");
      await input.fill(guess);
      await page.locator("#jar").click();
      await page.waitForTimeout(5000);
    } catch (err) {
      console.warn(`CAPTCHA: solve failed:`, err);
      await page.reload();
      await page.waitForTimeout(3000);
    }
  }

  return false;
}

/**
 * Dismiss cookie consent banner if present
 */
async function dismissCookieBanner(page: Page): Promise<void> {
  try {
    const selectors = [
      'button[data-cookiefirst-action="reject"]',
      'button[data-cookiefirst-action="accept"]',
      '.cookiefirst-root button',
      'dialog[aria-label*="Cookie"] button',
      '[class*="cookie"] button:first-of-type',
    ];

    for (const selector of selectors) {
      const btn = page.locator(selector).first();
      if (await btn.count() > 0 && await btn.isVisible()) {
        await btn.click({ timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(500);
        console.log("COOKIE: dismissed banner");
        return;
      }
    }

    // Try Escape key
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  } catch {
    // Ignore - banner might not exist
  }
}

/**
 * Navigate to search page if needed
 */
async function maybeNavigateToSearch(page: Page): Promise<boolean> {
  // First dismiss any cookie banners
  await dismissCookieBanner(page);

  const hasNameField = await page.$("#namn");
  const hasOrgField = await page.$("#personOrgnummer");
  if (hasNameField || hasOrgField) return true;

  console.log("NAV: opening search form...");
  const link = page.getByRole("link", { name: /Sök kungörelse/i });
  if (await link.count()) {
    try {
      await Promise.all([
        link.first().click({ timeout: 5000 }),
        page.waitForURL(/\/poit-app\/sok/, { timeout: 15000 }).catch(() => {}),
      ]);
    } catch {
      // Try force click if blocked
      await link.first().click({ force: true, timeout: 5000 }).catch(() => {});
    }
  } else {
    await page.evaluate(() => {
      const a = Array.from(document.querySelectorAll("a")).find((el) =>
        ((el as HTMLAnchorElement).innerText || "").includes("Sök kungörelse")
      );
      if (a) (a as HTMLAnchorElement).click();
    });
  }
  await page.waitForTimeout(1000);

  const hasNameFieldAfter = await page.$("#namn");
  const hasOrgFieldAfter = await page.$("#personOrgnummer");
  return Boolean(hasNameFieldAfter || hasOrgFieldAfter);
}

/**
 * Wait for search inputs to be ready
 */
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

/**
 * Submit search form
 */
async function submitSearch(page: Page, query: string): Promise<boolean | 'disabled'> {
  const digits = query.replace(/\D/g, "");
  const isOrg = digits.length >= 10;
  const queryToFill = isOrg
    ? digits.length >= 10
      ? `${digits.slice(0, 6)}-${digits.slice(6, 10)}`
      : digits
    : query;

  const selectors = isOrg
    ? ["#personOrgnummer", 'input[name*="org"]', 'input[placeholder*="Org"]']
    : ["#namn", 'input[name*="namn"]', 'input[placeholder*="Företagsnamn"]'];

  let input = null;
  for (const sel of selectors) {
    const loc = page.locator(sel);
    if ((await loc.count()) > 0) {
      input = loc.first();
      break;
    }
  }

  if (!input) {
    console.warn("SEARCH: input not found.");
    return false;
  }

  await input.fill(queryToFill);
  await page.evaluate(() => {
    const el = document.querySelector("#namn") ||
      document.querySelector("#personOrgnummer") ||
      document.querySelector("input[name*='namn']") ||
      document.querySelector("input[name*='org']");
    if (!el) return;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    (el as HTMLInputElement).blur();
  });

  console.log("SEARCH: clicking search button...");
  const button = page.getByRole("button", { name: /Sök kungörelse/i });
  if (await button.count()) {
    const enabled = await button.first().isEnabled();
    if (!enabled) {
      console.warn("SEARCH: search button disabled, query likely invalid.");
      return "disabled";
    }
    await button.first().click();
  } else {
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        ((b as HTMLButtonElement).innerText || "").includes("Sök kungörelse")
      );
      if (btn) (btn as HTMLButtonElement).click();
    });
  }
  return true;
}

/**
 * Collect results from search results page
 */
async function collectResults(page: Page): Promise<ScrapedResult[]> {
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
      const href = link.getAttribute("href") || "";
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
          cells = ((row as HTMLElement).innerText || "")
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }

      results.push({
        id,
        url: (link as HTMLAnchorElement).href,
        cells,
        rowText: row ? ((row as HTMLElement).innerText || "") : "",
      });
    }

    return results;
  });

  return items.map((item) => {
    const cells = item.cells || [];
    let reporter = "";
    let type = "";
    let subject = "";
    let pubDate = "";

    if (cells.length >= 5) {
      reporter = cells[1] || "";
      type = cells[2] || "";
      subject = cells[3] || "";
      pubDate = cells[4] || "";
    } else if (cells.length > 0) {
      subject = cells.join(" ");
    }

    return {
      id: item.id,
      url: item.url,
      cells: item.cells,
      rowText: item.rowText,
      reporter,
      type,
      subject,
      pubDate,
    };
  });
}

/**
 * Fetch detail text for an announcement
 */
async function fetchDetailText(
  context: BrowserContext,
  item: ScrapedResult
): Promise<string> {
  const detailPage = await context.newPage();

  try {
    // Set up response listener for API calls
    let apiText = "";

    const apiResponsePromise = detailPage.waitForResponse(
      (res) =>
        res.url().includes("/poit/rest/SokKungorelse?kungorelseid=") &&
        res.status() === 200,
      { timeout: 15000 }
    ).catch(() => null);

    const detailResponsePromise = detailPage.waitForResponse(
      (res) =>
        res.url().includes("/poit/rest/HamtaKungorelse?") &&
        res.status() === 200,
      { timeout: 20000 }
    ).catch(() => null);

    await detailPage.goto(item.url, { waitUntil: "networkidle" });
    await detailPage.waitForTimeout(1500);
    await solveBlocker(detailPage);

    // Wait for content
    await detailPage.waitForFunction(
      () => (document.body?.innerText || "").includes("Kungörelsetext"),
      { timeout: 15000 }
    ).catch(() => {});

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
      return apiText;
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

    return text;
  } finally {
    await detailPage.close();
  }
}

/**
 * Extract text from API response data
 */
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

/**
 * Find results on page (with retries)
 */
async function findResults(page: Page): Promise<ScrapedResult[]> {
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(1500);
    await solveBlocker(page);

    const results = await collectResults(page);
    if (results.length > 0) return results;

    const bodyText = (await page.textContent("body")) || "";
    if (bodyText.toLowerCase().includes("inga träffar")) {
      return [];
    }
  }
  return [];
}

/**
 * Main search function - search for announcements
 */
export async function searchAnnouncements(
  query: string,
  options: SearchOptions = {}
): Promise<Announcement[]> {
  // Dynamic import of playwright-core for serverless environments
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { chromium } = require('playwright-core') as typeof import('playwright-core');

  // Check if proxy should be activated based on blocking stats
  const { shouldActivate, reason } = proxyManager.shouldActivate();
  if (shouldActivate && reason) {
    console.log(`[Scraper] Activating proxy: ${reason}`);
    await proxyManager.activate(reason);
  }

  // Get proxy configuration if active
  const proxyConfig = proxyManager.getPlaywrightConfig();

  // Find Chromium executable for playwright-core
  const executablePath = findChromiumPath();
  if (executablePath) {
    console.log('[Scraper] Using Chromium:', executablePath);
  } else {
    console.log('[Scraper] No custom Chromium path, using default');
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    ...proxyConfig,
  });

  const context = await browser.newContext();

  // Restore session cookies if available
  const hasSession = await sessionManager.restoreCookies(context);
  if (hasSession) {
    console.log('[Scraper] Restored session cookies');
  }
  const page = await context.newPage();

  try {
    console.log(`START: query='${query}'`);

    await page.goto(START_URL, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await solveBlocker(page);

    let ready = await maybeNavigateToSearch(page);
    await solveBlocker(page);

    if (!ready) {
      await page.goto(START_URL, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);
      await solveBlocker(page);
      ready = await maybeNavigateToSearch(page);
    }

    await waitForSearchInputs(page);

    const queryVariants = buildQueryVariants(query);
    let results: ScrapedResult[] = [];
    let usedQuery = query;

    for (let variantIndex = 0; variantIndex < queryVariants.length; variantIndex++) {
      const currentQuery = queryVariants[variantIndex];
      usedQuery = currentQuery;
      let submitted = false;
      let invalidQuery = false;

      for (let attempt = 1; attempt <= 3; attempt++) {
        const submitResult = await submitSearch(page, currentQuery);
        if (submitResult === true) {
          submitted = true;
          break;
        }
        if (submitResult === "disabled") {
          invalidQuery = true;
          break;
        }
        console.warn(`SEARCH: retrying input lookup (${attempt})`);
        await page.reload({ waitUntil: "domcontentloaded" });
        await page.waitForTimeout(1000);
        await solveBlocker(page);
        await maybeNavigateToSearch(page);
      }

      if (!submitted) {
        if (invalidQuery) {
          console.log(`SEARCH: query '${currentQuery}' invalid, trying next variant...`);
          continue;
        }
        throw new Error("Search input not found after retries.");
      }

      await page.waitForTimeout(1000);
      results = await findResults(page);
      console.log(`RESULTS: found ${results.length} for query='${currentQuery}'`);

      if (results.length > 0) break;

      if (variantIndex < queryVariants.length - 1) {
        console.log(`SEARCH: no results for '${currentQuery}', trying next variant...`);
        await solveBlocker(page);
        await maybeNavigateToSearch(page);
        await waitForSearchInputs(page);
      }
    }

    // Enrich with details if not skipped
    if (!options.skipDetails) {
      const limit = options.detailLimit || results.length;
      const itemsToEnrich = results.slice(0, limit);

      for (const item of itemsToEnrich) {
        try {
          const text = await fetchDetailText(context, item);
          if (text) {
            const longText = isLongText(text);
            item.detailText = longText ? truncateWords(text, DETAIL_TEXT_WORD_LIMIT) : text;
            item.fullText = text;
          }
        } catch (err) {
          console.warn(`DETAIL: failed ${item.id}:`, err);
        }

        // Add delay between detail fetches
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Convert to Announcement format
    const announcements: Announcement[] = results.map((r) => ({
      id: r.id,
      query: usedQuery,
      reporter: r.reporter,
      type: r.type,
      subject: r.subject || '',
      pubDate: r.pubDate,
      publishedAt: r.pubDate ? parseSwedishDate(r.pubDate) : undefined,
      detailText: r.detailText,
      fullText: r.fullText,
      url: r.url,
      scrapedAt: new Date(),
    }));

    console.log(`COMPLETE: ${announcements.length} announcements found`);
    return announcements;

  } finally {
    // Save session cookies for next run
    try {
      await sessionManager.saveCookies(context);
    } catch (e) {
      console.warn('[Scraper] Failed to save cookies:', e);
    }

    await context.close();
    await browser.close();
  }
}

/**
 * Parse Swedish date format (e.g., "2024-01-15" or "15 jan 2024")
 */
function parseSwedishDate(dateStr: string): Date | undefined {
  if (!dateStr) return undefined;

  // Try ISO format first
  const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return new Date(dateStr);
  }

  // Try Swedish format "15 jan 2024"
  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, maj: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, okt: 9, nov: 10, dec: 11,
  };

  const swedishMatch = dateStr.toLowerCase().match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
  if (swedishMatch) {
    const day = parseInt(swedishMatch[1], 10);
    const month = months[swedishMatch[2]];
    const year = parseInt(swedishMatch[3], 10);
    if (month !== undefined) {
      return new Date(year, month, day);
    }
  }

  return undefined;
}

export default {
  searchAnnouncements,
  buildQueryVariants,
  formatTextAsMarkdown,
};
