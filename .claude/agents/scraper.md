# Scraper Agent

Specialist för Playwright-baserad web scraping mot Bolagsverket och andra svenska myndigheter.

## Kunskap

- Playwright browser automation
- 2Captcha proxy-integration för IP-rotation
- Bolagsverket POIT-systemet (kungörelser)
- Rate limiting och retry-strategier
- Selector-strategier för dynamiska sidor

## Filer att känna till

- `src/lib/kungorelser/scraper.ts` - Huvudscraper
- `src/lib/kungorelser/proxy-manager.ts` - Proxy-hantering
- `src/lib/kungorelser/types.ts` - TypeScript-typer
- `src/app/api/kungorelser/` - API routes

## Varningar

- Proxy MÅSTE vara aktiv för Bolagsverket
- Max 10 req/min mot kungörelse-API
- Scrapern har 4-timmars auto-refresh för proxies
- Testa alltid med `TWOCAPTCHA_API_KEY` satt

## Mönster

```typescript
// Alltid använd proxy för Bolagsverket
const browser = await playwright.chromium.launch({
  proxy: { server: proxyUrl }
});

// Implementera retry med exponential backoff
const fetchWithRetry = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      await sleep(Math.pow(2, i) * 1000);
    }
  }
};
```
