// Test sources API behavior
const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing sources API...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Test API directly
    console.log('1️⃣ Testing /api/sources without auth...');
    const apiResponse = await page.request.get('https://loopdesk-production.up.railway.app/api/sources');
    console.log('Status:', apiResponse.status());
    if (apiResponse.ok()) {
      const data = await apiResponse.json();
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      const text = await apiResponse.text();
      console.log('Error:', text);
    }

    // Navigate to page and check what happens
    console.log('\n2️⃣ Navigating to /nyheter page...');

    // Capture console logs
    page.on('console', msg => {
      if (msg.text().includes('sources') || msg.text().includes('Failed') || msg.text().includes('allSources')) {
        console.log('🖥️ ', msg.text());
      }
    });

    await page.goto('https://loopdesk-production.up.railway.app/nyheter', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(5000);

    // Check the state in the browser
    const state = await page.evaluate(() => {
      const sidebar = document.querySelector('aside');
      const sidebarText = sidebar?.innerText || '';

      return {
        sidebarText: sidebarText,
        hasSources: sidebarText.includes('0/0'),
        feedContent: document.querySelector('.flex-1.min-w-0')?.innerHTML?.length || 0
      };
    });

    console.log('\n📊 Page State:');
    console.log('Sidebar shows:', state.sidebarText.substring(0, 100));
    console.log('Feed content length:', state.feedContent);
    console.log('Has 0/0 sources:', state.hasSources);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
