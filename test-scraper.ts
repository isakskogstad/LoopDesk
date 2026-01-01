import { chromium } from "playwright";

const START_URL = "https://poit.bolagsverket.se/poit-app/sok";

async function waitForSearchInputs(page: any): Promise<void> {
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

async function resolveSearchInput(page: any, isOrg: boolean) {
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
    if ((await loc.count()) > 0) {
      console.log(`[resolveSearchInput] Found input with selector: ${sel}`);
      return loc.first();
    }
  }
  return null;
}

async function maybeNavigateToSearch(page: any): Promise<boolean> {
  const hasNameField = await page.$("#namn");
  const hasOrgField = await page.$("#personOrgnummer");
  if (hasNameField || hasOrgField) {
    console.log("[maybeNavigateToSearch] Already on search page");
    return true;
  }

  console.log("[maybeNavigateToSearch] Opening search form...");

  const link = page.getByRole("link", { name: /Sök kungörelse/i });
  if (await link.count()) {
    try {
      await Promise.all([
        link.first().click(),
        page.waitForURL(/\/poit-app\/sok/, { timeout: 15000 }).catch(() => {}),
      ]);
    } catch {
      await link.first().click({ force: true, timeout: 5000 }).catch(() => {});
    }
  } else {
    await page.evaluate(() => {
      const a = Array.from(document.querySelectorAll("a")).find((el: any) =>
        (el.innerText || "").includes("Sök kungörelse")
      );
      if (a) (a as HTMLElement).click();
    });
  }

  await page.waitForTimeout(1000);

  const hasNameFieldAfter = await page.$("#namn");
  const hasOrgFieldAfter = await page.$("#personOrgnummer");
  const result = Boolean(hasNameFieldAfter || hasOrgFieldAfter);
  console.log(`[maybeNavigateToSearch] Result: ${result}`);
  return result;
}

async function checkForCaptcha(page: any): Promise<boolean> {
  const blocked = await page.evaluate(() => {
    const body = document.body ? document.body.innerText : "";
    return Boolean(document.querySelector("#ans")) || body.includes("human visitor");
  });
  return blocked;
}

async function testScraper() {
  console.log("=== Starting local scraper test ===\n");

  const browser = await chromium.launch({
    headless: false, // Show browser for debugging
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 },
    locale: "sv-SE",
    timezoneId: "Europe/Stockholm",
  });

  const page = await context.newPage();

  // Hide webdriver
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  try {
    // Step 1: Navigate to POIT
    console.log("[1] Navigating to POIT...");
    await page.goto(START_URL, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(1000);
    console.log(`[1] Current URL: ${page.url()}`);

    // Step 2: Check for captcha
    console.log("\n[2] Checking for captcha...");
    const hasCaptcha = await checkForCaptcha(page);
    console.log(`[2] Captcha detected: ${hasCaptcha}`);

    if (hasCaptcha) {
      console.log("[2] Captcha detected - please solve it manually in the browser");
      console.log("[2] Waiting 60 seconds for manual captcha solving...");
      await page.waitForTimeout(60000);
    }

    // Step 3: Navigate to search form
    console.log("\n[3] Navigating to search form...");
    const ready = await maybeNavigateToSearch(page);
    console.log(`[3] Search form ready: ${ready}`);

    // Step 4: Wait for inputs
    console.log("\n[4] Waiting for search inputs...");
    await waitForSearchInputs(page);

    // Step 5: Check what inputs are available
    console.log("\n[5] Checking available inputs...");
    const pageState = await page.evaluate(() => {
      const selectors = [
        "#namn",
        "#personOrgnummer",
        'input[name*="namn"]',
        'input[name*="org"]',
        'input[placeholder*="Företagsnamn"]',
        'input[placeholder*="Org"]',
      ];

      const found: string[] = [];
      for (const sel of selectors) {
        if (document.querySelector(sel)) {
          found.push(sel);
        }
      }

      const allInputs = Array.from(document.querySelectorAll("input")).map((input: any) => ({
        id: input.id,
        name: input.name,
        placeholder: input.placeholder,
        type: input.type,
      }));

      return { found, allInputs, url: window.location.href };
    });

    console.log(`[5] Current URL: ${pageState.url}`);
    console.log(`[5] Found selectors: ${pageState.found.join(", ") || "NONE"}`);
    console.log(`[5] All inputs on page:`);
    for (const input of pageState.allInputs) {
      console.log(`    - id="${input.id}" name="${input.name}" placeholder="${input.placeholder}" type="${input.type}"`);
    }

    // Step 6: Try to find input with resolveSearchInput
    console.log("\n[6] Testing resolveSearchInput...");
    const inputByName = await resolveSearchInput(page, false);
    const inputByOrg = await resolveSearchInput(page, true);
    console.log(`[6] Input by name found: ${!!inputByName}`);
    console.log(`[6] Input by org found: ${!!inputByOrg}`);

    // Step 7: Try to fill and submit
    if (inputByName) {
      console.log("\n[7] Trying to fill 'FORGO AB'...");
      await inputByName.fill("FORGO AB");

      await page.evaluate(() => {
        const el = document.querySelector("#namn") || document.querySelector('input[name*="namn"]');
        if (el) {
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
          (el as HTMLElement).blur();
        }
      });

      await page.waitForTimeout(500);

      const button = page.getByRole("button", { name: /Sök kungörelse/i });
      if (await button.count()) {
        const enabled = await button.first().isEnabled();
        console.log(`[7] Search button found, enabled: ${enabled}`);

        if (enabled) {
          console.log("[7] Clicking search button...");
          await button.first().click();

          console.log("[7] Waiting for results...");
          await page.waitForTimeout(5000);

          // Check for results
          const results = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a[href*="kungorelse/"]'));
            return links.map((link: any) => ({
              href: link.getAttribute("href"),
              text: link.innerText.slice(0, 50),
            }));
          });

          console.log(`[7] Found ${results.length} result links`);
          for (const r of results.slice(0, 5)) {
            console.log(`    - ${r.href}: ${r.text}`);
          }
        }
      } else {
        console.log("[7] Search button NOT found");
      }
    }

    // Keep browser open for inspection
    console.log("\n=== Test complete ===");
    console.log("Browser will stay open for 30 seconds for inspection...");
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error("\n=== ERROR ===");
    console.error(error);

    // Take screenshot on error
    await page.screenshot({ path: "error-screenshot.png", fullPage: true });
    console.log("Screenshot saved to error-screenshot.png");

    await page.waitForTimeout(30000);
  } finally {
    await context.close();
    await browser.close();
  }
}

testScraper();
