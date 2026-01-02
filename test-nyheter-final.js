// Final comprehensive test
const { chromium } = require('playwright');

(async () => {
  console.log('🧪 Final test of /nyheter page...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Log all console messages
  page.on('console', msg => console.log('🖥️ ', msg.text()));
  page.on('pageerror', err => console.log('❌ PAGE ERROR:', err.message));

  try {
    console.log('1️⃣ Navigating to page...');
    await page.goto('https://loopdesk-production.up.railway.app/nyheter', {
      waitUntil: 'networkidle',
      timeout: 45000
    });

    console.log('2️⃣ Waiting for page to fully load...');
    await page.waitForTimeout(8000); // Give it time to load everything

    console.log('3️⃣ Checking page state...');
    const state = await page.evaluate(() => {
      return {
        url: window.location.href,
        bodyText: document.body.innerText.substring(0, 500),
        articles: document.querySelectorAll('article').length,
        hasErrorText: document.body.innerText.includes('Kunde inte'),
        hasEmptyText: document.body.innerText.includes('Inga nyheter'),
        hasCountText: document.body.innerText.includes('nyheter'),
        hasRealtid: document.body.innerText.includes('Realtidsuppdatering'),
        images: document.querySelectorAll('img').length,
        divs: document.querySelectorAll('div').length
      };
    });

    console.log('\n📊 Page State:');
    console.log(JSON.stringify(state, null, 2));

    // Check if sidebar is rendered
    console.log('\n4️⃣ Checking sidebar...');
    const sidebar = await page.locator('aside, [class*="sidebar"]').count();
    console.log(`Found ${sidebar} sidebar elements`);

    // Check for loading state
    const loading = await page.locator('[class*="animate-spin"]').count();
    console.log(`Found ${loading} loading spinners`);

    // Final verdict
    console.log('\n' + '='.repeat(50));
    if (state.articles > 0) {
      console.log(`✅ SUCCESS! Page is showing ${state.articles} news articles.`);
    } else if (state.hasEmptyText) {
      console.log('⚠️  Page is showing "Inga nyheter" - filtering issue!');
    } else if (state.hasErrorText) {
      console.log('❌ Page has an error state!');
    } else if (!state.hasRealtid && !state.hasCountText) {
      console.log('❌ Page not loading properly - content missing!');
    } else {
      console.log('🤔 Page loaded but no articles visible - check console logs above');
    }
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
  } finally {
    await browser.close();
  }
})();
