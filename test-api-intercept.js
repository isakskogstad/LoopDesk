// Test script: Intercept API calls to find the data endpoint
const { chromium } = require('playwright');

async function testApiIntercept() {
  console.log('Starting API intercept test...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  // Collect all API requests
  const apiRequests = [];

  page.on('request', request => {
    const url = request.url();
    if (url.includes('/api/') || url.includes('/rest/') || url.includes('/service/') ||
        url.includes('kungorelse') || url.includes('sok') || url.includes('.json')) {
      apiRequests.push({
        method: request.method(),
        url: url,
        postData: request.postData()?.substring(0, 200)
      });
      console.log(`[REQUEST] ${request.method()} ${url.substring(0, 100)}`);
    }
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/') || url.includes('/rest/') || url.includes('/service/') ||
        url.includes('kungorelse') || url.includes('sok')) {
      const contentType = response.headers()['content-type'] || '';
      if (contentType.includes('json')) {
        try {
          const body = await response.text();
          console.log(`[RESPONSE] ${response.status()} ${url.substring(0, 80)}`);
          console.log(`   Body preview: ${body.substring(0, 300)}`);
        } catch (e) {}
      }
    }
  });

  try {
    // Navigate to the direct kungorelse URL
    console.log('1. Navigating to kungorelse detail page...');
    await page.goto('https://poit.bolagsverket.se/poit-app/kungorelse/K693962-25', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(5000);

    console.log('\n2. API Requests captured:');
    apiRequests.forEach((r, i) => {
      console.log(`   ${i+1}. ${r.method} ${r.url}`);
      if (r.postData) console.log(`      POST data: ${r.postData}`);
    });

    // Also check for any XHR/fetch that returns kungörelse data
    console.log('\n3. Checking page for any data...');
    const pageData = await page.evaluate(() => {
      // Check window object for any Angular data
      const win = window;
      const data = {};

      // Look for common Angular data storage patterns
      data['hasNg'] = !!win.ng;
      data['initialState'] = !!win.__INITIAL_STATE__;
      data['nuxt'] = !!win.__NUXT__;

      // Check for any JSON in script tags
      const scripts = Array.from(document.querySelectorAll('script[type="application/json"]'));
      data['jsonScripts'] = scripts.map(s => (s.textContent || '').substring(0, 100));

      return data;
    });
    console.log('   Page data:', JSON.stringify(pageData));

    console.log('\n=== TEST COMPLETE ===');

  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testApiIntercept();
