# Lokala anteckningar (gitignored)

## URLs

- **Lokal:** http://localhost:3000
- **Produktion:** https://loopdesk-production.up.railway.app
- **Health:** http://localhost:3000/api/health

## Databas

- **Supabase Dashboard:** https://supabase.com/dashboard/project/rpjmsncjnhtnjnycabys
- **SQL Editor:** Supabase Dashboard → SQL Editor
- **Prisma Studio:** `npx prisma studio`


## Snabbkommandon

```bash
# Starta dev
npm run dev

# Kolla health
curl localhost:3000/api/health | jq

# Kolla proxy
curl localhost:3000/api/health | jq '.proxy'

# Öppna DB GUI
npx prisma studio
```

## Debug-tips

- Scraper-problem? Kolla proxy först: `curl localhost:3000/api/health | jq '.proxy'`
- RSS-problem? Kolla RSSHub-status (extern tjänst): `curl https://rsshub.rssforever.com`
- DB-problem? Kör `npx prisma db push`

## Senaste session - 2026-01-08

### Genomfört
- Strukturerade om slash commands - nu 15 aktiva
- Skapade nya commands:
  - `/rss-add-feed` + `/rss-delete-feed` (ersatte `/add-feed`)
  - `/granska-kod` - Code review med checklista
  - `/git-status` - Git-överblick med förslag
  - `/railway-debug` - Felsök Railway med loggar
  - `/supabase-anslut` - Anslut till Supabase-databas
  - `/kontrollera-hemsida` - Öppna prod med rensad cache
  - `/search-github-repos` - Sök högst rankade repos
- Uppdaterade `/visualisera-data` med D3.js-charts anpassade för LoopDesk frontend
- Tog bort 12 gamla/oanvända commands

### Slash commands (aktuella)
`/projekt`, `/avsluta`, `/git-status`, `/granska-kod`, `/skapa-komponent`, `/forbattra-ui`, `/visualisera-data`, `/analysera-bolag`, `/rss-add-feed`, `/rss-delete-feed`, `/supabase-anslut`, `/railway-debug`, `/kontrollera-hemsida`, `/search-github-repos`, `/mcp-add`, `/mcp-delete`, `/test`

### Session 2 - 2026-01-08

#### Genomfört
- Skapade `/mcp-add` - Lägg till MCP-server (analyserar docs, installerar, konfigurerar)
- Skapade `/mcp-delete` - Ta bort MCP-server (avinstallerar, rensar config/docs)

### Session 3 - 2026-01-08 (21:00-21:45)

#### Genomfört
- Skapade `/mcp-add` - Lägg till MCP-server (analysera, installera, konfigurera)
- Skapade `/mcp-delete` - Ta bort MCP-server (avinstallera, rensa config/docs)
- Skapade `/deploy` - Deploy med obligatorisk repo-backup till `.archive/[timestamp]/`
- Uppdaterade `/avsluta` - Nu med cleanup av oanvända filer till `.backup/`
- Skapade `/approve` - YOLO-mode (acceptera alla kommandon)
- Skapade `/exa-search` + Exa AI skill för semantisk webbsökning
- Uppdaterade MCP-policy till "Lazy Loading" - MCP används endast på begäran
- Lade till regel i CLAUDE.md: Läs ALLTID sessionsloggar vid session start
- Uppdaterade `/Users/isak/CLAUDE.md`, `/Users/isak/CLAUDE/CLAUDE.md`, projektets `CLAUDE.md`

#### Commits
- `9af73e1`: feat: Add MCP lazy loading, deploy backup, session logging, Exa search skill

#### Slash commands (aktuella - 21 st)
`/projekt`, `/avsluta`, `/deploy`, `/approve`, `/exa-search`, `/git-status`, `/granska-kod`, `/skapa-komponent`, `/forbattra-ui`, `/visualisera-data`, `/analysera-bolag`, `/rss-add-feed`, `/rss-delete-feed`, `/supabase-anslut`, `/railway-debug`, `/kontrollera-hemsida`, `/search-github-repos`, `/mcp-add`, `/mcp-delete`, `/test`

#### Skills
- **exa-search** - Avancerad semantisk webbsökning med Exa AI (`.claude/skills/exa-search/`)

#### Backup-struktur
```
.archive/     # Repo-snapshots före deploy (tidsstämplade)
.backup/      # Cleanup av oanvända filer (tidsstämplade)
```

---

## Session - 2026-01-09

### Genomfört: Chatbot med Tool Use

Implementerade AI-chatbot med full databasåtkomst via Anthropic Tool Use:

**Backend (`/api/chat/route.ts`):**
- Lade till 5 verktyg för databasåtkomst:
  - `search_companies` - Sök i bevakningslistan (namn, stad, bransch)
  - `get_company_details` - Hämta fullständig företagsinfo inkl kungörelser & nyheter
  - `search_announcements` - Sök kungörelser från Bolagsverket
  - `get_news` - Hämta nyheter från RSS-flödet
  - `get_investors` - Sök VC-bolag och family offices
- Tool use loop som hanterar flera verktygsanrop i sekvens
- Uppdaterad system prompt med riktlinjer för verktygsanvändning
- Ökade max_tokens från 1024 till 2048

**Frontend (`ChatPanel.tsx`):**
- Visar vilka verktyg som används (chips med ikoner)
- Real-time indikator när verktyg körs ("Söker företag...")
- Enkel markdown-rendering (punktlistor, fetstil, rubriker)
- Snabbfråge-knappar för vanliga sökningar
- Uppdaterad placeholder och beskrivning

**Tekniska detaljer:**
- Använder Prisma för databaskopplingar
- SSE-streaming för svar
- Tool notifications via SSE för UX-feedback
- Web Search (beta) förberett men avaktiverat (SDK-stöd krävs)

### Filer ändrade
- `src/app/api/chat/route.ts` - Komplett omskrivning med tool use
- `src/components/chat/ChatPanel.tsx` - Uppdaterad UI med tool indicators

### Roadmap skapad
Skapade `/docs/chatbot-roadmap.md` med:
- Dokumentation av nuvarande implementation
- 10 förslag på nya verktyg (person-sökning, företagsjämförelse, branschanalys, etc.)
- Prioriteringsordning i 3 faser
- Tekniska överväganden

### Nästa steg
- ~~Implementera Fas 1: Person-sökning, Företagsjämförelse, Branschanalys~~ ✅
- ~~Aktivera Web Search~~ ✅
- Implementera D3.js-charts på dashboard
- Testa chatboten i produktion

---

## Session 2 - 2026-01-09

### Genomfört: Chatbot Fas 1 Implementation

**Nya verktyg (`/api/chat/route.ts`):**
- `search_persons` - Sök VD:ar, styrelsemedlemmar, grundare med rollfiltrering
- `compare_companies` - Jämför 2-5 företag sida vid sida (omsättning, resultat, anställda, tillväxt, finansiering)
- `analyze_industry` - Aggregerad branschanalys med antal bolag, total omsättning, geografisk spridning, top performers
- `web_search` - Anthropic server-side tool (web_search_20250305) begränsat till svenska affärstidningar

**Frontend (`ChatPanel.tsx`):**
- Nya tool indicators för search_persons, compare_companies, analyze_industry

**Dokumentation:**
- Uppdaterad `/docs/chatbot-roadmap.md` med v1.1 ändringar

### Tekniska detaljer
- Web Search använder `type: "web_search_20250305"` syntax (server-side tool)
- Person-sökning querier Person + PersonRole tabeller med rollfiltrering
- Branschanalys aggregerar data och parsear svenska format (MSEK, MDSEK, %)
- TypeScript build kompilerar utan fel

### Filer ändrade
- `src/app/api/chat/route.ts` - 4 nya verktyg + uppdaterad system prompt
- `src/components/chat/ChatPanel.tsx` - 3 nya tool labels
- `docs/chatbot-roadmap.md` - v1.1 dokumentation

### Nästa steg
- Testa nya verktyg i produktion
- Implementera Fas 2: Protokoll-sökning, Investor-matchning, Bevakningslist-integration
- D3.js-charts på dashboard

---

## Session - 2026-01-10

### Genomfört: Supabase Realtime Implementation

Implementerade Supabase Realtime för live-uppdateringar av nyhetsflödet (fortsättning från tidigare session).

**Nya filer:**
- `src/lib/supabase.ts` - Supabase browser client (defensiv - crashar inte utan env vars)
- `src/hooks/use-realtime-articles.ts` - React hook för Postgres CDC subscriptions

**Ändringar:**
- Ersatte 57 rader SSE-kod i `news-feed.tsx` med enkel hook-anrop
- Aktiverade Realtime på Article-tabellen i Supabase (`ALTER PUBLICATION supabase_realtime ADD TABLE "Article"`)
- Lade till NEXT_PUBLIC_SUPABASE_URL och NEXT_PUBLIC_SUPABASE_ANON_KEY i Railway

**Problem löst:**
- "supabaseUrl is required" error kraschade appen
- Lösning: Gjorde Supabase-klienten defensiv - returnerar null istället för att krascha
- Hook loggar varning och hoppar över subscription om inte konfigurerad

**Kvarvarande:**
- NEXT_PUBLIC_* miljövariabler bäkas inte in vid build på Railway
- Realtime är INAKTIVERAT i produktion (varning i console)
- Behöver felsöka Railway build-time env var injection

### Filer ändrade
- `src/lib/supabase.ts` - Defensiv Supabase-klient
- `src/hooks/use-realtime-articles.ts` - Realtime hook med null-hantering
- `src/components/nyheter/news-feed.tsx` - Använder ny hook
- `next.config.ts` - Build cache bust

### Commits
- `fd7ca35`: feat: Add Supabase Realtime for live news updates
- `433ea10`: chore: Trigger redeploy to load NEXT_PUBLIC_* env vars
- `6124ff1`: fix: Make Supabase client defensive when env vars missing
- `a902f0b`: chore: Force fresh build to pick up NEXT_PUBLIC_* env vars

### Status
- Appen fungerar stabilt i produktion
- Realtime redo att aktiveras när env var-problemet är löst
- Supabase: `rpjmsncjnhtnjnycabys.supabase.co`

### Nästa steg
- Felsök varför Railway inte injicerar NEXT_PUBLIC_* vid build
- Alternativ: Flytta Supabase URL/key till runtime config (fetch från API)
- Testa Realtime lokalt med `npm run dev`

---

## Session 2 - 2026-01-10

### Löst: Credentials Login + Databas-förvirring

**Problem:** Login med email/lösenord fungerade inte. Bcrypt-jämförelse misslyckades.

**Rotorsak:** Två separata databaser!
- **Neon MCP** (`mute-violet-89803455`) - gammal databas jag uppdaterade lösenord i
- **Supabase** (`rpjmsncjnhtnjnycabys`) - produktionsdatabas som Railway faktiskt använder

**Lösning:**
1. Uppdaterade lösenord direkt i Supabase SQL Editor
2. Login fungerar nu

### Åtgärder: Databas-dokumentation uppdaterad

Uppdaterade dokumentation för att förhindra liknande förvirring i framtiden:

**CLAUDE.md:**
- Ersatte alla Neon-referenser med Supabase
- Lade till VARNING om globala Neon MCP
- Uppdaterade Tech Stack: "PostgreSQL 17 (Supabase)"
- Uppdaterade Databas-sektion med Supabase projekt-ID
- Uppdaterade MCP-server-tabell
- Uppdaterade miljövariabler-dokumentation

**CLAUDE.local.md:**
- Ersatte Neon Console-länk med Supabase Dashboard
- Lade till varning om att inte använda Neon MCP
- Bytte `/neon-anslut` till `/supabase-anslut`

### Filer ändrade
- `CLAUDE.md` - Komplett uppdatering från Neon till Supabase
- `CLAUDE.local.md` - Databas-referenser och varningar

### Commits
- `77c4fc7`: cleanup: Remove debug endpoints and logging

### Status
- Login fungerar i produktion
- Dokumentation uppdaterad för att förhindra framtida förvirring
- Neon MCP bör INTE användas för LoopDesk

### Lärdomar
- Railway använder DATABASE_URL från sina miljövariabler (Supabase)
- Neon MCP är globalt konfigurerat och kopplar till fel databas
- Alltid verifiera vilken databas som används i produktion innan databasändringar

---

## Session - 2026-01-11

### Genomfört: Felsökning av databas och inloggning

**Problem 1: Circuit breaker open**
- LoopDesk kunde inte visa data från Supabase
- Fel: "Circuit breaker open: Too many authentication errors"
- Orsak: Tidigare misslyckade databasanslutningar (kanske från Loop Fetch-debugging)
- Lösning: Omstart av Railway deployment

**Problem 2: Credentials login fungerade inte**
- Fel: "Fel lösenord!" trots korrekt lösenord
- Bcrypt-hash var korrekt format ($2b$10$, 60 tecken)
- Lösning: Genererade ny bcrypt-hash och uppdaterade direkt i Supabase

**Problem 3: Google OAuth "deleted_client"**
- Fel: "The OAuth client was deleted" (401: deleted_client)
- Orsak: Ny Google OAuth-klient skapad men redirect URI pekade på Supabase Auth
- Lösning: Uppdatera redirect URI i Google Console till:
  ```
  https://loopdesk-production.up.railway.app/api/auth/callback/google
  ```

### Planerat: Migrering till Supabase Auth

**Bakgrund:**
- LoopDesk använder NextAuth.js för autentisering
- User-tabellen finns i Supabase (PostgreSQL via Prisma)
- Supabase Auth används endast för lösenordsåterställning
- Detta skapar förvirring och duplicerad logik

**Fördelar med Supabase Auth:**
- Enhetlig auth-lösning
- Inbyggd Google OAuth, Magic Links, etc.
- Row Level Security (RLS) integration
- Enklare session-hantering
- Färre miljövariabler (ingen NEXTAUTH_SECRET, GOOGLE_CLIENT_*)

**Migreringsplan (grov):**
1. Aktivera Supabase Auth providers (Google, Email)
2. Migrera User-tabellen till auth.users
3. Uppdatera Prisma schema (foreign keys till auth.users)
4. Ersätt NextAuth med Supabase Auth i frontend
5. Uppdatera middleware för session-hantering
6. Ta bort NextAuth-beroenden

**Status:** Planerat för framtida session

### Genomfört: Google OAuth fix

**Problem 4: redirect_uri_mismatch**
- Redirect URI i Google Console pekade på Supabase: `https://rpjmsncjnhtnjnycabys.supabase.co/auth/v1/callback`
- Lösning: Lade till NextAuth callback: `https://loopdesk-production.up.railway.app/api/auth/callback/google`

**Problem 5: Fel OAuth-klient i Railway**
- Railway hade gammal/raderad klient: `561058594862-qb4j2fp2qdbgi1nj1vvebohtlqa800cv`
- Aktiv klient i Google Console: `561058594862-2jvaigcqdtmnh408ivv2ob7mbn94qaon`
- Lösning: Uppdaterade `GOOGLE_CLIENT_ID` och `GOOGLE_CLIENT_SECRET` i Railway

**Problem 6: OAuthAccountNotLinked**
- Användaren fanns redan (credentials) men saknade Google Account-koppling
- Lösning: Skapade ny Account-record i databasen manuellt

### Status
- ✅ Credentials login fungerar
- ✅ Google OAuth login fungerar
- ✅ Databas-anslutning fungerar (circuit breaker återställd)

### Nästa steg
- [ ] Planera Supabase Auth-migrering i detalj (ersätt NextAuth)
