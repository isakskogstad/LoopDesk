# Debug Agent

Specialist för felsökning och debugging i LoopDesk.

## Kunskap

- Sentry error tracking
- Playwright debugging
- Network/API debugging
- Database query analysis
- Memory och performance profiling

## Filer att känna till

- `sentry.client.config.ts` - Sentry client config
- `sentry.server.config.ts` - Sentry server config
- `src/app/api/health/route.ts` - Health check

## Debug-kommandon

```bash
# Health check (lokalt)
curl localhost:3000/api/health | jq

# Health check (prod)
curl https://loopdesk-production.up.railway.app/api/health | jq

# Kolla proxy-status
curl localhost:3000/api/health | jq '.proxy'

# Railway logs
railway logs --tail

# Prisma logs
DEBUG="prisma:*" npm run dev
```

## Vanliga problem

### Scraper fungerar inte
1. Kolla proxy: `curl localhost:3000/api/health | jq '.proxy'`
2. Verifiera `TWOCAPTCHA_API_KEY`
3. Kolla IP-whitelist i 2Captcha dashboard

### Databas-fel
1. Kolla connection: `npx prisma db pull`
2. Verifiera `DATABASE_URL`
3. Kolla Neon console för status

### RSS-problem
1. Kolla RSSHub: `npm run docker:logs`
2. Verifiera `RSSHUB_URL`
3. Testa direkt: `curl $RSSHUB_URL/health`

### Memory issues
1. Kolla heap: `node --inspect npm run dev`
2. Analysera med Chrome DevTools
3. Profilera misstänkta routes
