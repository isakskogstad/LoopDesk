// Debug script to see what's happening on /nyheter page
const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Debugging /nyheter page...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capture console logs
  page.on('console', msg => {
    if (msg.text().includes('filteredItems') || msg.text().includes('displayedItems') || msg.text().includes('allSources')) {
      console.log('🖥️  BROWSER:', msg.text());
    }
  });

  try {
    await page.goto('https://loopdesk-production.up.railway.app/nyheter', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(5000);

    // Check the React state
    const debugInfo = await page.evaluate(() => {
      // Try to find React fiber and extract state
      const statusBar = document.querySelector('[class*="items-center gap-3"]');
      const bodyText = document.body.innerText;

      return {
        hasStatusBar: !!statusBar,
        statusText: statusBar?.innerText || 'not found',
        bodyIncludes259: bodyText.includes('259'),
        bodyIncludesNyheter: bodyText.includes('nyheter'),
        articleCount: document.querySelectorAll('article').length,
        hasEmptyState: bodyText.includes('Inga nyheter hittades'),
        hasLoadingState: bodyText.includes('Kunde inte hämta'),
        errorText: document.querySelector('[class*="text-red"]')?.innerText || null
      };
    });

    console.log('Page State:');
    console.log(JSON.stringify(debugInfo, null, 2));

    // Try to get API response
    console.log('\n📡 Checking API response...');
    const apiResponse = await page.request.get('https://loopdesk-production.up.railway.app/api/feed/global?limit=5');
    const apiData = await apiResponse.json();
    console.log('API returned:', apiData.itemCount, 'items');
    console.log('First item:', apiData.items[0]?.title || 'none');

    // Check sources API
    const sourcesResponse = await page.request.get('https://loopdesk-production.up.railway.app/api/sources');
    const sourcesData = await sourcesResponse.json();
    console.log('Sources API returned:', sourcesData.feeds?.length || 0, 'feeds');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
})();
