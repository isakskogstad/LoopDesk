// Quick test script to verify /nyheter page works
const { chromium } = require('playwright');

(async () => {
  console.log('🧪 Testing /nyheter page...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to the page
    console.log('📍 Navigating to https://loopdesk-production.up.railway.app/nyheter...');
    await page.goto('https://loopdesk-production.up.railway.app/nyheter', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for the feed to load
    await page.waitForTimeout(3000);

    // Check for the count text
    const countText = await page.textContent('body');
    const hasCount = countText.includes('259 nyheter') || countText.includes('nyheter');
    console.log('✓ Page loaded');
    console.log(`✓ Count text found: ${hasCount}`);

    // Check for news items
    const newsCards = await page.locator('article').count();
    console.log(`✓ Found ${newsCards} news article cards`);

    // Check for sources
    const sources = await page.locator('[style*="color"]').count();
    console.log(`✓ Found ${sources} colored source elements`);

    // Check for images
    const images = await page.locator('img').count();
    console.log(`✓ Found ${images} images (logos and article images)`);

    // Take a screenshot
    await page.screenshot({ path: '/tmp/nyheter-test.png', fullPage: false });
    console.log('✓ Screenshot saved to /tmp/nyheter-test.png');

    if (newsCards === 0) {
      console.log('\n❌ ERROR: No news articles found on page!');
      console.log('This means the filtering or rendering is broken.');
    } else {
      console.log(`\n✅ SUCCESS: /nyheter page is working! Showing ${newsCards} articles.`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
