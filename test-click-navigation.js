// Test script: Click-based navigation from search results
// This tests if clicking result links from the search page (where Angular is active) works

const { chromium } = require('playwright');

async function testClickNavigation() {
  console.log('Starting click-based navigation test...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    // 1. Navigate to homepage
    console.log('1. Navigating to homepage...');
    await page.goto('https://poit.bolagsverket.se/poit-app/', { waitUntil: 'networkidle', timeout: 60000 });

    // Wait for Angular to bootstrap (with better error handling)
    let bodyLength = 0;
    for (let i = 0; i < 15; i++) {
      await page.waitForTimeout(1000);
      const state = await page.evaluate(() => ({
        bodyLength: document.body?.innerText?.length || 0,
        hasAppRoot: !!document.querySelector('app-root'),
        hasNgVersion: !!document.querySelector('[ng-version]'),
        htmlLength: document.documentElement?.outerHTML?.length || 0,
      }));
      bodyLength = state.bodyLength;
      console.log(`   Attempt ${i+1}: bodyLength=${bodyLength}, hasAppRoot=${state.hasAppRoot}, hasNgVersion=${state.hasNgVersion}, htmlLength=${state.htmlLength}`);
      if (bodyLength > 500) break;
    }
    console.log('   Homepage loaded, bodyLength:', bodyLength);

    // Debug: Print page content if Angular didn't load
    if (bodyLength < 500) {
      const html = await page.evaluate(() => document.documentElement?.outerHTML?.substring(0, 2000));
      console.log('   HTML preview:', html?.substring(0, 500));
    }

    // 2. Navigate to search page
    console.log('\n2. Navigating to search page...');
    await page.goto('https://poit.bolagsverket.se/poit-app/sok', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    // 3. Fill in search and submit
    console.log('\n3. Performing search for "EcoRub AB"...');
    const input = page.locator('#namn');
    await input.fill('EcoRub AB');
    await page.locator('button:has-text("Sök")').click();

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

    if (resultLinks.length === 0) {
      console.log('   No results found, trying to wait longer...');
      await page.waitForTimeout(5000);
      const retryLinks = await page.locator('a[href*="/poit-app/kungorelse/"]').all();
      console.log(`   Retry: Found ${retryLinks.length} result links`);
    }

    // 5. Click on first result
    if (resultLinks.length > 0) {
      const firstLink = resultLinks[0];
      const href = await firstLink.getAttribute('href');
      const text = await firstLink.textContent();
      console.log(`\n4. Clicking on first result: "${text?.trim()}" -> ${href}`);

      // Log page state before click
      const beforeClick = await page.evaluate(() => ({
        url: window.location.href,
        bodyLength: document.body?.innerText?.length || 0,
        hasKungorelsetext: document.body?.innerText?.includes('Kungörelsetext') || false,
      }));
      console.log('   Before click:', JSON.stringify(beforeClick));

      // Click the link
      await firstLink.click();

      // Wait for navigation/content
      await page.waitForTimeout(3000);
      await page.waitForFunction(
        () => document.body?.innerText?.includes('Kungörelsetext') ||
              document.body?.innerText?.length > 800,
        { timeout: 20000 }
      ).catch(() => console.log('   Timeout waiting for content'));

      // Log page state after click
      const afterClick = await page.evaluate(() => ({
        url: window.location.href,
        bodyLength: document.body?.innerText?.length || 0,
        hasKungorelsetext: document.body?.innerText?.includes('Kungörelsetext') || false,
        preview: document.body?.innerText?.substring(0, 300).replace(/\s+/g, ' '),
      }));
      console.log('\n5. After click:');
      console.log('   URL:', afterClick.url);
      console.log('   Body length:', afterClick.bodyLength);
      console.log('   Has Kungörelsetext:', afterClick.hasKungorelsetext);
      console.log('   Preview:', afterClick.preview?.substring(0, 150) + '...');

      // 6. Try to extract text
      if (afterClick.hasKungorelsetext) {
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
        console.log('\n6. Extracted text:');
        console.log('   ', extractedText.substring(0, 200) + (extractedText.length > 200 ? '...' : ''));
      }

      // 7. Test going back
      console.log('\n7. Testing navigation back...');
      await page.goBack();
      await page.waitForTimeout(2000);

      const backState = await page.evaluate(() => ({
        url: window.location.href,
        resultCount: document.querySelectorAll('a[href*="/kungorelse/"]').length,
      }));
      console.log('   Back to:', backState.url);
      console.log('   Results still visible:', backState.resultCount);
    }

    console.log('\n=== TEST COMPLETE ===');

  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testClickNavigation();
