# Deployment Guide - Nyhetsflödet

## Snabb Deploy till Vercel (Rekommenderat)

### 1. Skapa databas på Neon (gratis)

1. Gå till [neon.tech](https://neon.tech) och skapa konto
2. Skapa ett nytt projekt (välj EU-region: Frankfurt)
3. Kopiera connection string (ser ut som `postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`)

### 2. Deploya till Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/nyhetsflödet)

Eller manuellt:

```bash
# Installera Vercel CLI
npm i -g vercel

# Deploya
vercel
```

### 3. Konfigurera miljövariabler i Vercel

Gå till Project Settings → Environment Variables och lägg till:

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | Din Neon connection string | ✅ |
| `DIRECT_URL` | Samma som DATABASE_URL | ✅ |
| `RSSHUB_URL` | `https://rsshub.rssforever.com` | ❌ |
| `CRON_SECRET` | Generera med `openssl rand -hex 32` | ❌ |

### 4. Kör databasmigrering

```bash
# Lokalt med production database
DATABASE_URL="din-neon-url" npx prisma db push
```

---

## Alternativ: Railway

### 1. Skapa projekt på Railway

1. Gå till [railway.app](https://railway.app)
2. Klicka "New Project" → "Deploy from GitHub repo"
3. Välj ditt repo

### 2. Lägg till PostgreSQL

1. Klicka "New" → "Database" → "Add PostgreSQL"
2. Railway kopplar automatiskt `DATABASE_URL`

### 3. Lägg till miljövariabler

```
DIRECT_URL=${{DATABASE_URL}}
RSSHUB_URL=https://rsshub.rssforever.com
```

---

## Alternativ: Render

### 1. Skapa Web Service

1. Gå till [render.com](https://render.com)
2. New → Web Service → Connect repo
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`

### 2. Lägg till PostgreSQL

1. New → PostgreSQL
2. Kopiera Internal Database URL
3. Lägg till som `DATABASE_URL` och `DIRECT_URL`

---

## Arkitektur för Production

```
┌─────────────────────────────────────────────────────────┐
│                    Användare                             │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Vercel / Railway / Render                   │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Next.js App                         │    │
│  │  • Server Components                             │    │
│  │  • API Routes (serverless)                       │    │
│  │  • Static Assets (CDN)                           │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼
   ┌──────────┐ ┌──────────┐ ┌──────────┐
   │ Neon DB  │ │  RSSHub  │ │ RSS/Atom │
   │(Postgres)│ │ (public) │ │  Feeds   │
   └──────────┘ └──────────┘ └──────────┘
```

## Miljövariabler - Komplett lista

| Variable | Beskrivning | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `DIRECT_URL` | Direkt DB-anslutning för migrationer | Required |
| `RSSHUB_URL` | RSSHub instans URL | Public fallback |
| `RSSHUB_ACCESS_KEY` | Access key för egen RSSHub | - |
| `CRON_SECRET` | Skydd för cron-endpoint | - |
| `TWITTER_USERNAME` | Twitter-konto för RSSHub | - |
| `TWITTER_PASSWORD` | Twitter-lösenord | - |
| `IG_USERNAME` | Instagram-konto för RSSHub | - |
| `IG_PASSWORD` | Instagram-lösenord | - |
| `GITHUB_ACCESS_TOKEN` | GitHub token för högre rate limits | - |

## Cron Jobs

Vercel kör automatiskt `/api/cron/refresh` var 5:e minut för att:
- Rensa utgången cache
- Förbereda populära feeds

För att skydda endpoint, sätt `CRON_SECRET` och konfigurera i `vercel.json`.

## Felsökning

### Database connection failed
- Kontrollera att `DATABASE_URL` är korrekt
- Se till att SSL är aktiverat: `?sslmode=require`
- Kör `npx prisma db push` för att skapa tabeller
- Prisma 7 använder `@prisma/adapter-pg` för PostgreSQL

### RSSHub feeds fungerar inte
- Publika instanser kan ha rate limits
- Prova alternativa instanser i `RSSHUB_URL`:
  - `https://rsshub.rssforever.com`
  - `https://hub.slarker.me`
  - `https://rsshub.liumingye.cn`

### Build fails
```bash
# Kör lokalt för att debugga
npm run build
```

## Säkerhet

- ✅ Alla API-routes är server-side only
- ✅ Databas-credentials exponeras aldrig till klienten
- ✅ CORS är aktiverat endast för samma origin
- ✅ Rate limiting via Vercel Edge
