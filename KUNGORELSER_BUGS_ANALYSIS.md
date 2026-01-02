# Kungörelser Scraper - Bug Analysis & Comparison

**Analyzed:** 2026-01-02
**Comparing:** Electron Bolags app (working) vs LoopDesk web app (failing)

## Executive Summary

LoopDesk's kungörelser scraper is missing **critical features** from the working Electron app that cause it to fail under real-world conditions. The main issues are:

1. ❌ **NO 429 error handling** in detail fetching
2. ❌ **NO proxy rotation** during scraping
3. ❌ **NO retry logic** for failed detail fetches
4. ❌ **Sequential processing** (no concurrency)
5. ❌ **Fixed short delay** between requests

## Detailed Comparison

### 1. Framework & Architecture

| Feature | Electron App ✅ | LoopDesk ❌ | Impact |
|---------|----------------|-------------|--------|
| **Browser automation** | Crawlee + Playwright | Plain playwright-core | Crawlee provides robust error handling, request queue, and retry logic |
| **Concurrency** | Parallel with `runWithConcurrency(items, DETAIL_CONCURRENCY)` | Sequential `for` loop | Electron: 5 parallel fetches<br>LoopDesk: 1 at a time (5x slower) |
| **Storage** | Unique per-run directories | None (no conflicts) | Electron can run 30 parallel searches without conflicts |

**Problem:** LoopDesk is fundamentally slower and can't handle parallel searches.

---

### 2. Rate Limit Handling (429 Errors)

#### Electron App ✅

```javascript
// Lines 869-895 in poit.js - Tracks 429 errors
detailPage.on("response", (res) => {
  if (res.status() === 429 && res.url().includes("/poit/rest/")) {
    got429 = true;
    blockingStats.errors429++;
    if (proxyManager && options.currentProxy) {
      proxyManager.markFailed(options.currentProxy);
    }
  }
});

// Lines 1048-1074 - Handles 429 with retry & proxy rotation
if (result.got429) {
  blockingStats.errors429++;
  if (proxyManager && proxyManager.isEnabled) {
    proxyManager.markFailed(currentProxy);
    proxyManager.refresh(); // Get new proxies
  } else {
    await blockingStats.checkAndActivateProxy(`429 rate limit error #${blockingStats.errors429}`);
  }
  retryDelay *= 2; // Exponential backoff
  continue; // Retry with different proxy
}
```

**Features:**
- Detects 429 responses
- Marks failed proxies
- Rotates to next proxy
- Exponential backoff (5s → 10s → 20s)
- Up to 5 retries with proxy
- Activates proxy mode on repeated 429s

#### LoopDesk ❌

```typescript
// Lines 577-649 in scraper.ts - NO 429 handling!
async function fetchDetailText(
  context: BrowserContext,
  item: ScrapedResult
): Promise<string> {
  const detailPage = await context.newPage();

  try {
    // No response listener for 429!
    // No retry logic!
    // No error handling!

    await detailPage.goto(item.url, { waitUntil: "networkidle" });
    await detailPage.waitForTimeout(1500);
    await solveBlocker(detailPage);

    // ... fetch logic ...

    return text;
  } finally {
    await detailPage.close();
  }
}
```

**Problems:**
- ❌ No 429 detection
- ❌ No retry logic
- ❌ No proxy rotation
- ❌ No error tracking
- ❌ Fails silently on rate limit

**Impact:** When Bolagsverket rate limits (after ~5 requests), all subsequent detail fetches fail silently, returning empty text.

---

### 3. Proxy Management

#### Electron App ✅

```javascript
// Lines 836-855 - Creates NEW context with proxy per request
if (options.currentProxy && USE_PROXY && proxyManager) {
  const browser = context.browser();
  const proxyConfig = proxyManager.getPlaywrightConfig(options.currentProxy);
  detailContext = await browser.newContext({
    proxy: proxyConfig,  // Different proxy per request!
  });
  shouldCloseContext = true;
}

// Lines 1038-1044 - Rotates proxy on each retry
for (let attempt = 1; attempt <= maxRetries; attempt++) {
  const currentProxy = proxyManager ? proxyManager.getNext() : null;
  if (currentProxy && attempt > 1) {
    log.info(`DETAIL: switching to proxy ${currentProxy.url}`);
  }
  const result = await fetchDetailText(context, item, debug, { currentProxy });
  // ...
}
```

**Features:**
- New browser context per detail fetch with different proxy
- Rotates proxy on each retry
- Tracks proxy success/failure
- Refreshes proxy pool when running low

#### LoopDesk ❌

```typescript
// Lines 717-739 in scraper.ts - Proxy set ONCE at browser launch
export async function searchAnnouncements(
  query: string,
  options: SearchOptions = {}
): Promise<Announcement[]> {
  const proxyConfig = proxyManager.getPlaywrightConfig(); // Gets proxy once

  const browser = await chromium.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    ...proxyConfig,  // Proxy set here, NEVER changes
  });

  const context = await browser.newContext(); // No proxy rotation!

  // ... all detail fetches use same proxy or no proxy ...
}
```

**Problems:**
- ❌ Proxy set once at browser launch
- ❌ No proxy rotation during scraping
- ❌ If proxy fails, entire session continues with failed proxy
- ❌ No per-request proxy switching

**Impact:** If first proxy is blocked or slow, all subsequent requests fail or are blocked.

---

### 4. Retry Logic

#### Electron App ✅

```javascript
// Lines 1034-1088 - Comprehensive retry with adaptive timeouts
let maxRetries = USE_PROXY ? 5 : 3;
let retryDelay = 5000;

for (let attempt = 1; attempt <= maxRetries; attempt++) {
  const currentProxy = proxyManager ? proxyManager.getNext() : null;
  const result = await fetchDetailText(context, item, debug, { currentProxy });
  text = result.text || "";

  if (result.got429) {
    // Handle 429 with proxy rotation
  }

  if (text && text.trim()) {
    proxyManager.markSuccess(currentProxy);
    break;
  }

  if (attempt < maxRetries) {
    await new Promise((r) => setTimeout(r, 4000));
  }
}

// Lines 1090-1105 - FINAL retry with extended timeouts
if (!text || !text.trim()) {
  await new Promise((r) => setTimeout(r, DETAIL_DELAY_MS + 2000));
  const result = await fetchDetailText(context, item, debug, {
    apiTimeout: 25000,      // Increased from 12000
    detailTimeout: 35000,   // Increased from 20000
    waitTextTimeout: 25000, // Increased from 12000
    postGotoWait: 3000,     // Increased from 2000
    linkWait: 3000,         // Increased from 2000
    currentProxy,
  });
}
```

**Features:**
- 3-5 retries per detail fetch
- Exponential backoff between retries
- Final retry with 2x longer timeouts
- Different proxy on each retry
- Marks successful proxies

#### LoopDesk ❌

```typescript
// Lines 823-836 in scraper.ts - NO retries!
if (!options.skipDetails) {
  const limit = options.detailLimit || results.length;
  const itemsToEnrich = results.slice(0, limit);

  for (const item of itemsToEnrich) {
    try {
      const text = await fetchDetailText(context, item); // Single attempt!
      if (text) {
        const longText = isLongText(text);
        item.detailText = longText ? truncateWords(text, DETAIL_TEXT_WORD_LIMIT) : text;
        item.fullText = text;
      }
    } catch (err) {
      console.warn(`DETAIL: failed ${item.id}:`, err);
      // Fails silently, no retry!
    }

    await new Promise(resolve => setTimeout(resolve, 2000)); // Fixed delay
  }
}
```

**Problems:**
- ❌ Single attempt only
- ❌ No retry on failure
- ❌ No adaptive timeouts
- ❌ Fails silently on error

**Impact:** Any network hiccup, timeout, or rate limit results in missing detail text.

---

### 5. Delay Management

#### Electron App ✅

```javascript
// Lines 1024-1032 - Enforced delay between fetches
const now = Date.now();
const elapsed = now - lastFetchTime;
if (elapsed < DETAIL_DELAY_MS && lastFetchTime > 0) {
  const waitTime = DETAIL_DELAY_MS - elapsed;
  log.info(`DETAIL: waiting ${waitTime}ms before next fetch...`);
  await new Promise((r) => setTimeout(r, waitTime));
}
lastFetchTime = Date.now();
```

**Features:**
- Tracks actual time elapsed since last fetch
- Enforces minimum delay (DETAIL_DELAY_MS = 3000ms default)
- Configurable via environment variable
- Accounts for time spent in previous fetch

#### LoopDesk ❌

```typescript
// Line 836 in scraper.ts - Fixed 2000ms delay
await new Promise(resolve => setTimeout(resolve, 2000)); // Too short!
```

**Problems:**
- ❌ Fixed 2000ms delay (too short for rate limiting)
- ❌ Not configurable
- ❌ Doesn't account for fetch duration
- ❌ No adaptive delay based on 429 errors

**Impact:** Requests fire too quickly, triggering rate limits faster.

---

### 6. Concurrency Control

#### Electron App ✅

```javascript
// Lines 1006-1118 - Parallel detail fetching
await runWithConcurrency(items, DETAIL_CONCURRENCY, async (item) => {
  // Enforced delay per worker
  // Each worker has own lastFetchTime tracking
  // Up to DETAIL_CONCURRENCY (5) parallel fetches
});

// Utility function for concurrency control
async function runWithConcurrency(items, concurrency, fn) {
  // Limits parallel execution to 'concurrency' workers
  // Each worker processes items independently
}
```

**Features:**
- 5 parallel workers (configurable)
- Each worker enforces its own delays
- Processes 5x faster than sequential
- Can handle 30 parallel searches (30 * 5 = 150 concurrent operations)

#### LoopDesk ❌

```typescript
// Lines 823-838 - Sequential processing
for (const item of itemsToEnrich) {
  try {
    const text = await fetchDetailText(context, item);
    // ... process one at a time ...
  } catch (err) {
    console.warn(`DETAIL: failed ${item.id}:`, err);
  }

  await new Promise(resolve => setTimeout(resolve, 2000));
}
```

**Problems:**
- ❌ Sequential processing only
- ❌ No concurrency
- ❌ 5x slower than Electron app
- ❌ Can't run multiple searches in parallel

**Impact:**
- Fetching 10 details: Electron = ~6 seconds, LoopDesk = ~30 seconds
- Can't handle multiple concurrent user requests

---

### 7. Statistics & Monitoring

#### Electron App ✅

```javascript
// Comprehensive blockingStats tracking
const blockingStats = {
  captchaAttempts: 0,
  captchaFailures: 0,
  consecutiveCaptchas: 0,
  errors429: 0,
  proxyActivations: 0,

  checkAndActivateProxy: async function(reason) {
    if (this.consecutiveCaptchas >= 5 || this.errors429 >= 3) {
      await proxyManager.activate(reason);
      this.proxyActivations++;
    }
  }
};

// Real-time IPC streaming
console.log(`RESULT_FOUND: ${JSON.stringify(result)}`);
console.log(`DETAIL_FETCHING: ${index}/${total}`);
console.log(`DETAIL_SUCCESS: ${item.id}`);
```

**Features:**
- Tracks CAPTCHA attempts/failures
- Tracks 429 errors
- Real-time progress updates
- Smart proxy activation based on stats

#### LoopDesk ❌

```typescript
// proxy-manager.ts has basic tracking
private blockingStats: BlockingStats = {
  http429Count: 0,
  consecutiveCaptchas: 0,
  lastCaptchaTime: 0,
  sessionBlocked: false,
};

// BUT it's never used for 429s in detail fetching!
// Only used for CAPTCHA detection
```

**Problems:**
- ❌ Doesn't track 429 errors in detail fetching
- ❌ No real-time progress updates
- ❌ Stats exist but aren't used
- ❌ No automatic proxy activation based on stats

---

## Critical Bugs Summary

### Bug #1: No 429 Error Handling ⚠️ CRITICAL
**File:** `src/lib/kungorelser/scraper.ts` lines 577-649

**Problem:**
```typescript
async function fetchDetailText(
  context: BrowserContext,
  item: ScrapedResult
): Promise<string> {
  const detailPage = await context.newPage();

  try {
    // NO response listener for HTTP 429!
    // NO error handling!
    // NO retry logic!

    await detailPage.goto(item.url, { waitUntil: "networkidle" });
    // ... rest of code ...
  } finally {
    await detailPage.close();
  }
}
```

**Impact:** After 5-10 successful detail fetches, Bolagsverket rate limits. All subsequent fetches return empty text silently.

**Fix Required:**
1. Add response listener to track 429 errors
2. Return error status from function
3. Add retry logic with proxy rotation
4. Track 429 count for proxy activation

---

### Bug #2: No Proxy Rotation ⚠️ CRITICAL
**File:** `src/lib/kungorelser/scraper.ts` lines 734-741

**Problem:**
```typescript
const browser = await chromium.launch({
  headless: true,
  executablePath,
  args: ['--no-sandbox'],
  ...proxyConfig,  // Proxy set once, never changed
});
```

**Impact:** Even when proxy is activated, all requests use the same proxy. If proxy is blocked or slow, scraping fails entirely.

**Fix Required:**
1. Create new browser context per detail fetch with different proxy
2. Rotate proxy on each retry
3. Track proxy success/failure
4. Refresh proxy pool when running low

---

### Bug #3: No Retry Logic ⚠️ HIGH
**File:** `src/lib/kungorelser/scraper.ts` lines 823-836

**Problem:**
```typescript
for (const item of itemsToEnrich) {
  try {
    const text = await fetchDetailText(context, item); // Single attempt
    // ...
  } catch (err) {
    console.warn(`DETAIL: failed ${item.id}:`, err); // Fails silently
  }

  await new Promise(resolve => setTimeout(resolve, 2000));
}
```

**Impact:** Any network error, timeout, or rate limit results in missing detail text with no retry.

**Fix Required:**
1. Add retry loop (3-5 attempts)
2. Exponential backoff between retries
3. Final retry with extended timeouts
4. Different proxy on each retry

---

### Bug #4: Sequential Processing ⚠️ HIGH
**File:** `src/lib/kungorelser/scraper.ts` lines 819-838

**Problem:**
```typescript
if (!options.skipDetails) {
  const limit = options.detailLimit || results.length;
  const itemsToEnrich = results.slice(0, limit);

  for (const item of itemsToEnrich) { // Sequential!
    try {
      const text = await fetchDetailText(context, item);
      // ...
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}
```

**Impact:**
- 5x slower than Electron app
- Can't handle concurrent user requests
- Poor user experience

**Fix Required:**
1. Implement concurrency control (like `runWithConcurrency`)
2. Process 5 items in parallel
3. Each worker enforces its own delays

---

### Bug #5: Fixed Short Delay ⚠️ MEDIUM
**File:** `src/lib/kungorelser/scraper.ts` line 836

**Problem:**
```typescript
await new Promise(resolve => setTimeout(resolve, 2000)); // Fixed 2s
```

**Impact:** 2 seconds between requests is too short, triggers rate limiting faster.

**Fix Required:**
1. Increase default to 3000ms (matching Electron)
2. Make configurable via environment
3. Implement enforced delay (accounting for fetch duration)
4. Add adaptive delay on 429 errors

---

### Bug #6: Stats Not Tracked ⚠️ MEDIUM
**File:** `src/lib/kungorelser/scraper.ts` and `src/lib/kungorelser/proxy-manager.ts`

**Problem:** `proxyManager` has `recordRateLimit()` method but it's never called during detail fetching.

**Impact:** Proxy activation doesn't happen automatically on rate limits.

**Fix Required:**
1. Call `proxyManager.recordRateLimit()` when 429 detected
2. Check `proxyManager.shouldActivate()` after each 429
3. Activate proxy automatically based on stats

---

## Recommended Fix Priority

1. **CRITICAL** - Add 429 error detection and handling
2. **CRITICAL** - Implement proxy rotation during scraping
3. **HIGH** - Add retry logic for detail fetches
4. **HIGH** - Implement concurrent processing
5. **MEDIUM** - Fix delay duration and enforcement
6. **MEDIUM** - Connect stats tracking to proxy activation

## Electron App Advantages to Keep

The Electron app has these additional features that are valuable but not critical:

1. **Long text storage** - Stores full text in separate markdown files
2. **IPC streaming** - Real-time progress updates via IPC
3. **SQLite** - Local database for offline access
4. **Multiple query variants** - Already implemented in LoopDesk ✅
5. **Unique storage per run** - Enables 30 parallel searches without conflicts

## Conclusion

LoopDesk's scraper **will fail in production** due to missing 429 handling and proxy rotation. The Electron app succeeds because it:

1. **Detects and handles** rate limiting
2. **Rotates proxies** automatically
3. **Retries failed fetches** with exponential backoff
4. **Processes in parallel** with concurrency control
5. **Adapts delays** based on errors

All of these features are **missing or broken** in LoopDesk.
