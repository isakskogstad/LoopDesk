# Sentry Error Tracking Setup

**Datum:** 2026-01-02
**Status:** Installed and configured

## ✅ Vad har Installerats

Sentry error tracking har lagts till för att fånga production errors och performance issues.

### Installerade Packages:
```bash
@sentry/nextjs
```

### Konfigurationsfiler:
- `sentry.client.config.ts` - Client-side error tracking
- `sentry.server.config.ts` - Server-side error tracking
- `sentry.edge.config.ts` - Edge runtime error tracking
- `instrumentation.ts` - Sentry initialization
- Updated `next.config.ts` - Sentry webpack integration

## 🔧 Railway Environment Variables

Lägg till följande environment variables i Railway:

### Required:
```bash
# Sentry DSN (från Sentry dashboard)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Public DSN för client-side (samma värde)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### Optional (för source maps upload):
```bash
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=loopdesk
SENTRY_AUTH_TOKEN=sntrys_xxx
```

## 🎯 Hur Få Sentry DSN

1. Gå till https://sentry.io/
2. Skapa konto eller logga in
3. Skapa nytt projekt "LoopDesk" (välj "Next.js")
4. Kopiera DSN från "Client Keys (DSN)"
5. Lägg till i Railway environment variables

## 📊 Vad Trackas

### Client-Side:
- React component errors
- Browser JavaScript errors
- Network errors
- User interactions (replay sessions)
- Performance metrics

### Server-Side:
- API route errors
- Database errors
- Scraping errors
- Uncaught exceptions
- Performance bottlenecks

### Filtrering:
- Development errors filtreras bort
- Noisy errors (browser extensions, benign errors) ignoreras
- Sensitive headers (auth, cookies) maskeras

## 🔍 Sample Rates

**Production Settings:**
- Transaction sampling: 10% (performance monitoring)
- Profile sampling: 10% (profiling)
- Replay sampling: 10% of sessions
- Error replays: 100% of sessions with errors

Dessa kan justeras baserat på behov och budget:
```typescript
// sentry.client.config.ts / sentry.server.config.ts
tracesSampleRate: 0.1,        // 10% → högre = fler transactions, högre kostnad
profilesSampleRate: 0.1,       // 10% profiling
replaysSessionSampleRate: 0.1, // 10% session replays
replaysOnErrorSampleRate: 1.0, // 100% error replays
```

## ⚙️ Användning i Kod

### Manuell Error Tracking:
```typescript
import * as Sentry from '@sentry/nextjs';

try {
  // Risky operation
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      component: 'scraper',
      query: 'Voi Technology AB',
    },
    extra: {
      proxyUsed: true,
      retries: 3,
    },
  });
  throw error;
}
```

### Custom Context:
```typescript
Sentry.setUser({
  id: session.user.id,
  email: session.user.email,
});

Sentry.setContext('scraping', {
  query: 'Voi Technology AB',
  proxyEnabled: true,
  searchDuration: 45000,
});
```

### Breadcrumbs:
```typescript
Sentry.addBreadcrumb({
  category: 'scraper',
  message: 'Started search for Voi Technology AB',
  level: 'info',
});
```

## 📈 Dashboard

Efter deployment, se errors i Sentry dashboard:
- **Issues**: https://sentry.io/organizations/YOUR_ORG/issues/
- **Performance**: https://sentry.io/organizations/YOUR_ORG/performance/
- **Replays**: https://sentry.io/organizations/YOUR_ORG/replays/

## 🚨 Alerts

Konfigurera alerts i Sentry dashboard:
1. Go to **Alerts** → **Create Alert**
2. Exempel alerts:
   - Error rate > 10 errors/hour
   - Specific error: "Timeout" repeated > 5 times
   - Performance: API response time > 5s
3. Notification channels: Email, Slack, PagerDuty

## 💰 Pricing

Sentry Free Tier:
- 5,000 errors/month
- 10,000 performance units/month
- 50 replay sessions/month

Om ni överskrider free tier, upgradera till Team plan ($29/month).

## 🔒 Security

- Sensitive data filtreras automatiskt:
  - Auth tokens → `[Filtered]`
  - Cookies → `[Filtered]`
  - Passwords → Not captured
- Source maps uploadade endast för sourcemap lookup (inte publika)
- User PII maskeras i replays

## ✅ Verification

Efter deploy med Sentry DSN konfigurerad:

1. Testa error tracking:
```bash
curl https://loopdesk-production.up.railway.app/api/test-sentry
```

2. Check Sentry dashboard för captured error
3. Verify performance transactions captured

## 📝 Next Steps

1. **Now**: Lägg till `SENTRY_DSN` och `NEXT_PUBLIC_SENTRY_DSN` i Railway
2. **After deploy**: Verifiera errors i Sentry dashboard
3. **Configure**: Sätt upp alerts för kritiska errors
4. **Monitor**: Övervaka error rate och fix high-priority issues

---

**Related Files:**
- `sentry.client.config.ts` - Client configuration
- `sentry.server.config.ts` - Server configuration
- `sentry.edge.config.ts` - Edge configuration
- `instrumentation.ts` - Initialization hook
