# LoopDesk - Claude Code Context

## Arbetsflöde

### Token-optimering (KRITISKT)
Undvik excessive token usage:

**MCP-verktyg:**
- Använd `limit` parameter för databas-queries (max 50 rader)
- Filtrera console logs med `pattern` parameter
- Begränsa Railway logs med `lines` parameter
- Använd `head_limit` i Grep för att begränsa resultat

**Mönster:**
```
# DÅLIGT - returnerar alla rader
SELECT * FROM "Article"

# BRA - begränsa och filtrera
SELECT id, title FROM "Article" LIMIT 20

# DÅLIGT - alla console messages
mcp__claude-in-chrome__read_console_messages(tabId)

# BRA - filtrera
mcp__claude-in-chrome__read_console_messages(tabId, pattern="error")

# DÅLIGT - alla logs
mcp__Railway__get-logs(workspacePath)

# BRA - begränsa
mcp__Railway__get-logs(workspacePath, lines=50, filter="error")
```

**Principer:**
1. Filtrera data i verktyget, inte i context
2. Begränsa output med limit/lines/head_limit
3. Använd SELECT specifika kolumner, inte SELECT *
4. Spara stora resultat till fil istället för context
5. Undvik att läsa samma data flera gånger

### Plan Mode (VIKTIGT)
Använd ALLTID plan mode för:
- Nya features
- Refaktorering
- Komplexa bugfixar
- Arkitekturförändringar

```
# Aktivera plan mode
"think" / "think hard" / "ultrathink"

# Eller använd EnterPlanMode tool
```

### MCP-servrar - Lazy Loading (KRITISKT)
**REGEL:** MCP-servrar ska INTE användas automatiskt. Anslut endast när servern faktiskt behövs. Detta minimerar token context window-åtgång.

**Policy:**
1. Använd INTE MCP-verktyg om uppgiften kan lösas utan dem
2. Fråga användaren innan du använder en MCP-server första gången i sessionen
3. Föredra lokala verktyg (Bash, Read, Grep, Prisma CLI) framför MCP
4. Använd `/mcp-add` för att aktivera ny server
5. Använd `/mcp-delete` för att ta bort oanvända servrar

**Tillgängliga servrar (aktivera vid behov):**

| Server | Syfte | Aktivera när |
|--------|-------|--------------|
| **Supabase** | PostgreSQL databas (produktion) | DB-queries, migrations |
| **GitHub** | Issues, PRs, kod-sök | GitHub-interaktion krävs |
| **Railway** | Deployment, logs | Debug/deployment-problem |
| **Context7** | Biblioteksdokumentation | Extern API-docs behövs |
| **Chrome** | Browser testing | Live-testning explicit begärd |
| **Browserbase** | Cloud browser | Scraping behövs |

**VARNING - Neon MCP:** Det finns ett globalt Neon MCP-verktyg (`mcp__neon__*`) som kopplar till en **gammal databas**. Använd INTE detta för LoopDesk - produktionen använder Supabase!

**Alternativ utan MCP:**
- DB: `npx prisma studio`, Supabase Dashboard SQL Editor
- Git: `git`, `gh` CLI
- Logs: `railway logs` CLI
- Docs: WebFetch, WebSearch

### Chrome - Live Testing (på begäran)
Testa LoopDesk live i Chrome när användaren explicit begär det:

```
# Testa lokal utveckling
"Öppna localhost:3000 och verifiera att nyhetsflödet laddar"

# Testa produktion
"Gå till loopdesk-production.up.railway.app och kolla console för errors"

# Testa användarflöden
"Logga in, gå till bevakning, lägg till ett bolag och verifiera"

# Debug med console
"Öppna dashboard och filtrera console för 'error'"

# Spela in demo
"Spela in en GIF som visar hur man söker efter ett bolag"
```

**Chrome-verktyg:**
- `mcp__claude-in-chrome__navigate` - Navigera till URL
- `mcp__claude-in-chrome__read_page` - Läs sidinnehåll (accessibility tree)
- `mcp__claude-in-chrome__computer` - Klick, scroll, screenshot
- `mcp__claude-in-chrome__read_console_messages` - Läs console logs
- `mcp__claude-in-chrome__gif_creator` - Spela in GIF

### Subagents - Delegera uppgifter
Använd Task tool med specialiserade agenter:

```
# Frontend-arbete
Task(subagent_type="frontend-developer", prompt="...")

# TypeScript-problem
Task(subagent_type="typescript-pro", prompt="...")

# Databas-optimering
Task(subagent_type="database-optimizer", prompt="...")

# Debugging
Task(subagent_type="debugger", prompt="...")

# Kodgranskning
Task(subagent_type="code-reviewer", prompt="...")
```

### Custom Agents (@-mention)
Projektspecifika agenter i `.claude/agents/`:

- `@scraper` - Playwright, Bolagsverket, proxy
- `@frontend` - Next.js 16, React 19, Tailwind
- `@api` - API routes, rate limiting
- `@database` - Prisma, Supabase, migrations
- `@debug` - Felsökning, Sentry
- `@browser` - Live Chrome testing, GIF recording

### Slash Commands
Använd dessa för vanliga uppgifter:

- `/deploy` - Railway deployment
- `/db-migrate` - Prisma migration
- `/test-scraper` - Testa scraper
- `/health-check` - Systemstatus
- `/add-feed` - Lägg till RSS-källa
- `/test-live` - Testa i Chrome live

---

## Projekt
Svensk business intelligence-plattform med nyhetsaggregering, bolagsinformation och kungörelser.

## Tech Stack
- **Frontend:** Next.js 16.1.1 + React 19.2.3 + TypeScript 5
- **Styling:** Tailwind CSS 4 + Radix UI
- **Databas:** PostgreSQL 17 (Supabase) + Prisma 7.2.0
- **Realtime:** Supabase Realtime (Postgres CDC)
- **Auth:** NextAuth 5.0.0-beta.30 + Supabase Auth (lösenordsåterställning)
- **Scraping:** Playwright + 2Captcha
- **Monitoring:** Sentry 10.32.1
- **Deployment:** Railway

## Kommandon

### Utveckling
- `npm run dev` - Starta utvecklingsserver (port 3000)
- `npm run build` - Bygga för produktion
- `npm run lint` - Köra ESLint

### Databas (Prisma)
- `npx prisma db push` - Pusha schema till databas
- `npx prisma migrate dev` - Skapa ny migration
- `npx prisma studio` - Öppna Prisma Studio (GUI)
- `npx prisma generate` - Generera Prisma Client

### Docker (lokal RSSHub)
- `npm run docker:up` - Starta RSSHub + Redis + Browserless
- `npm run docker:down` - Stoppa containers
- `npm run docker:logs` - Visa RSSHub-loggar

### Deployment (VIKTIGT)
Railway autodeployar från GitHub. ALLTID:
1. `git add -A && git commit -m "beskrivning"`
2. `git push origin main`
3. Railway deployar automatiskt från main-branchen

**Använd ALDRIG `railway up` eller `mcp__Railway__deploy`!**

### Railway Status (VIKTIGT)
När du kollar deployment status, använd ALLTID:
```
mcp__Railway__list-deployments(workspacePath, json=true, limit=1)
```
- Kolla `status` fältet: BUILDING, SUCCESS, FAILED
- Kolla `commitHash` för att verifiera rätt version
- `mcp__Railway__get-logs` visar INTE alltid senaste deployment!

### Railway (endast för logs/vars)
- `mcp__Railway__get-logs` - Visa loggar (OBS: kan visa äldre deployment)
- `mcp__Railway__list-variables` - Visa env vars

## Viktiga filer

### Konfiguration
- `prisma/schema.prisma` - Databasschema (27 tabeller)
- `src/auth.ts` - NextAuth-konfiguration
- `next.config.ts` - Next.js-konfiguration
- `docker-compose.yml` - Lokal Docker-setup

### API Routes (`/src/app/api/`)
- `/health/route.ts` - Health check endpoint
- `/nyheter/route.ts` - Nyhetsflöde
- `/bolag/` - Bolagsinformation
- `/kungorelser/` - Kungörelsescraping
- `/bevakning/` - Bevakningslista
- `/feeds/` - RSS-källor
- `/cron/` - Schemalagda jobb

### Business Logic (`/src/lib/`)
- `/kungorelser/scraper.ts` - Playwright-scraper
- `/kungorelser/proxy-manager.ts` - Proxy-hantering
- `/bolag/bolagsverket.ts` - Bolagsverket API
- `/bolag/allabolag.ts` - Allabolag API
- `/nyheter/adapters/` - RSS-adaptrar
- `/db.ts` - Prisma-klient

## Databas (Supabase)

### Nyckeltabeller
- `User` - Användare med auth
- `Article` - Cachade nyhetsartiklar (Realtime aktiverat)
- `Feed` - RSS-källor per användare
- `WatchedCompany` - Bevakade bolag (200+)
- `Announcement` - Scrapade kungörelser
- `FeedCache` / `GlobalFeedCache` - RSS-cache

### Projekt-ID
- Supabase: `rpjmsncjnhtnjnycabys` (https://supabase.com/dashboard/project/rpjmsncjnhtnjnycabys)
- Railway: `e2fc90ba-e67b-49b9-9c3c-bd70ec193edb`

### VIKTIGT: Databas-åtkomst
Produktionen använder Supabase-databasen. Använd:
- **Supabase Dashboard SQL Editor** för direkta queries
- **Prisma Studio** (`npx prisma studio`) för GUI
- **UNDVIK** globala Neon MCP (`mcp__neon__*`) - den kopplar till en gammal, inaktiv databas!

## Varningar

### Scraping
- Proxy KRÄVS för Bolagsverket (2Captcha IP-whitelist)
- `TWOCAPTCHA_API_KEY` måste vara satt
- Scraper har 4-timmars auto-refresh för proxies

### Rate Limiting
- `/api/kungorelser/*` - 10 req/min
- `/api/bolag/*` - 30 req/min
- `/api/nyheter/*` - 100 req/min

### Caching
- Bolagsinfo: 1 timme
- Finansdata: 24 timmar
- Persondata: 2 timmar
- RSS-feeds: 30 min - 24 timmar

## Miljövariabler (krävs)

```
# Databas (Supabase)
DATABASE_URL=postgresql://postgres.rpjmsncjnhtnjnycabys:...@aws-1-eu-central-1.pooler.supabase.com:5432/postgres
DIRECT_URL=postgresql://postgres.rpjmsncjnhtnjnycabys:...@aws-1-eu-central-1.pooler.supabase.com:5432/postgres

# Supabase (för Realtime och Auth)
NEXT_PUBLIC_SUPABASE_URL=https://rpjmsncjnhtnjnycabys.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Auth
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Externa tjänster
TWOCAPTCHA_API_KEY=...
SENTRY_DSN=...
RSSHUB_URL=https://rsshub.rssforever.com
```

## Health Check

```bash
# Lokal
curl localhost:3000/api/health | jq

# Produktion
curl https://loopdesk-production.up.railway.app/api/health | jq
```
