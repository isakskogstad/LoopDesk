// Test script: Playwright with stealth plugin to bypass bot detection
const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Add stealth plugin
chromium.use(StealthPlugin());

async function testStealth() {
  console.log('Starting stealth test...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    // 1. Navigate to homepage
    console.log('1. Navigating to homepage...');
    await page.goto('https://poit.bolagsverket.se/poit-app/', { waitUntil: 'networkidle', timeout: 60000 });

    // Wait for Angular to bootstrap
    let state = null;
    for (let i = 0; i < 15; i++) {
      await page.waitForTimeout(1000);
      state = await page.evaluate(() => ({
        bodyLength: document.body?.innerText?.length || 0,
        hasAppRoot: !!document.querySelector('app-root'),
        hasNgVersion: !!document.querySelector('[ng-version]'),
        hasBotScript: document.documentElement?.outerHTML?.includes('bobcmn') || false,
      }));
      console.log(`   Attempt ${i+1}: bodyLength=${state.bodyLength}, hasNgVersion=${state.hasNgVersion}, hasBotScript=${state.hasBotScript}`);
      if (state.bodyLength > 500) break;
    }

    if (state && state.bodyLength > 500) {
      console.log('   SUCCESS: Angular loaded!');

      // 2. Navigate to search page
      console.log('\n2. Navigating to search page...');
      await page.goto('https://poit.bolagsverket.se/poit-app/sok', { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);

      // 3. Perform search
      console.log('\n3. Performing search for "EcoRub AB"...');
      const input = page.locator('#namn');
      await input.fill('EcoRub AB');
      await page.locator('button.btn-primary:has-text("Sök")').first().click();

      // Wait for results
      await page.waitForTimeout(3000);
      await page.waitForFunction(
        () => document.body?.innerText?.includes('Sökresultat') ||
              document.querySelectorAll('a[href*="/kungorelse/"]').length > 0,
        { timeout: 30000 }
      ).catch(() => {});

      // 4. Check for results
      const resultLinks = await page.locator('a[href*="/poit-app/kungorelse/"]').all();
      console.log(`   Found ${resultLinks.length} result links`);

      // 5. Click on first result
      if (resultLinks.length > 0) {
        const firstLink = resultLinks[0];
        const href = await firstLink.getAttribute('href');
        const text = await firstLink.textContent();
        console.log(`\n4. Clicking on first result: "${text?.trim()}" -> ${href}`);

        // Click the link (Angular should handle navigation)
        await firstLink.click();

        // Wait for content
        await page.waitForTimeout(3000);
        await page.waitForFunction(
          () => document.body?.innerText?.includes('Kungörelsetext'),
          { timeout: 20000 }
        ).catch(() => console.log('   Timeout waiting for Kungörelsetext'));

        // Log result
        const afterClick = await page.evaluate(() => ({
          url: window.location.href,
          bodyLength: document.body?.innerText?.length || 0,
          hasKungorelsetext: document.body?.innerText?.includes('Kungörelsetext') || false,
          preview: document.body?.innerText?.substring(0, 400).replace(/\s+/g, ' '),
        }));
        console.log('\n5. After click:');
        console.log('   URL:', afterClick.url);
        console.log('   Body length:', afterClick.bodyLength);
        console.log('   Has Kungörelsetext:', afterClick.hasKungorelsetext);
        console.log('   Preview:', afterClick.preview?.substring(0, 200) + '...');

        // 5b. If on /enskild/ page, look for Visa link and click it
        if (afterClick.url.includes('/enskild/') && !afterClick.hasKungorelsetext) {
          console.log('\n5b. On /enskild/ page - looking for Visa link...');

          // Debug: show all links
          const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a')).map(a => ({
              text: a.textContent?.trim().substring(0, 40),
              href: a.href?.substring(0, 60)
            }));
          });
          console.log('   Links on page:', JSON.stringify(links.slice(0, 10)));

          // Try to click on "Visa" or the kungörelse link
          const visaLink = page.locator('a:has-text("Visa")').first();
          const kungorelseLink = page.locator('a[href*="/kungorelse/"]').first();

          if (await visaLink.count() > 0) {
            console.log('   Found Visa link, clicking...');
            await visaLink.click();
            await page.waitForTimeout(3000);
          } else if (await kungorelseLink.count() > 0) {
            console.log('   Found kungorelse link, clicking...');
            await kungorelseLink.click();
            await page.waitForTimeout(3000);
          }

          // Check again after second click
          const afterSecondClick = await page.evaluate(() => ({
            url: window.location.href,
            bodyLength: document.body?.innerText?.length || 0,
            hasKungorelsetext: document.body?.innerText?.includes('Kungörelsetext') || false,
            preview: document.body?.innerText?.substring(0, 500).replace(/\s+/g, ' '),
          }));
          console.log('\n5c. After second click:');
          console.log('   URL:', afterSecondClick.url);
          console.log('   Body length:', afterSecondClick.bodyLength);
          console.log('   Has Kungörelsetext:', afterSecondClick.hasKungorelsetext);
          console.log('   Preview:', afterSecondClick.preview?.substring(0, 300) + '...');
        }

        // 6. Extract text - check final page state
        const finalState = await page.evaluate(() => ({
          url: window.location.href,
          hasKungorelsetext: document.body?.innerText?.includes('Kungörelsetext') || false,
        }));

        if (finalState.hasKungorelsetext) {
          const extractedText = await page.evaluate(() => {
            const body = document.body?.innerText || '';
            const lines = body.split('\n').map(s => s.trim()).filter(Boolean);
            const idx = lines.findIndex(l => /kungörelsetext/i.test(l));
            if (idx >= 0) {
              let end = lines.findIndex((l, i) => i > idx && /tillbaka|skriv ut/i.test(l));
              if (end < 0) end = Math.min(idx + 10, lines.length);
              return lines.slice(idx + 1, end).join('\n').trim();
            }
            return '';
          });
          console.log('\n6. EXTRACTED TEXT:');
          console.log('   ', extractedText.substring(0, 300) + (extractedText.length > 300 ? '...' : ''));
        }
      }
    } else {
      console.log('   FAILED: Angular did not load (bot protection still active)');
      const html = await page.evaluate(() => document.documentElement?.outerHTML?.substring(0, 1000));
      console.log('   HTML preview:', html?.substring(0, 400));
    }

    console.log('\n=== TEST COMPLETE ===');

  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testStealth();
