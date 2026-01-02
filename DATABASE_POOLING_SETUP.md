# Database Connection Pooling Setup

**Datum:** 2026-01-02
**Status:** Kräver Railway environment variables uppdatering

## 🔧 Vad har Gjorts

Uppdaterat `prisma/schema.prisma` för att stödja connection pooling med Neon PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")      // Pooled connection (via PgBouncer)
  directUrl = env("DIRECT_URL")       // Direct connection (för migrations)
}
```

## 📋 Railway Environment Variables Setup

Du måste lägga till/uppdatera följande environment variables i Railway:

### 1. DATABASE_URL (Pooled Connection)
Lägg till connection pool parameters till din befintliga Neon URL:

```bash
# Nuvarande (direkt anslutning):
DATABASE_URL="postgresql://neondb_owner:npg_eWiqBKdgCf71@ep-rapid-salad-agxleazh-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# Ny (med pooling - REKOMMENDERAT):
DATABASE_URL="postgresql://neondb_owner:npg_eWiqBKdgCf71@ep-rapid-salad-agxleazh-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&connection_limit=10&pool_timeout=20&connect_timeout=10"
```

### 2. DIRECT_URL (Ny variabel)
För migrations och schema operations som kräver direkt connection:

```bash
# Samma som nuvarande DATABASE_URL men utan pooling params:
DIRECT_URL="postgresql://neondb_owner:npg_eWiqBKdgCf71@ep-rapid-salad-agxleazh-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

## 🎯 Connection Pool Parameters Förklaring

- **connection_limit=10** - Max 10 samtidiga connections per instans
  - Neon free tier: Max 100 connections totalt
  - Railway kan skala upp flera containers → dela på budgeten

- **pool_timeout=20** - Max 20 sekunder väntan på ledig connection
  - Förhindrar eviga hangs om pool är full

- **connect_timeout=10** - Max 10 sekunder för initial connection
  - Snabb failure om DB är down

## 🚀 Hur Applicera Ändringarna

### Via Railway Dashboard:
1. Öppna https://railway.app/
2. Välj projekt: **LoopDesk**
3. Gå till **Variables** tab
4. Uppdatera `DATABASE_URL` med pooling parameters
5. Lägg till ny variabel `DIRECT_URL`
6. Deploy

### Via Railway CLI:
```bash
# Sätt DATABASE_URL med pooling
railway variables set DATABASE_URL="postgresql://neondb_owner:npg_eWiqBKdgCf71@ep-rapid-salad-agxleazh-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&connection_limit=10&pool_timeout=20&connect_timeout=10"

# Sätt DIRECT_URL för migrations
railway variables set DIRECT_URL="postgresql://neondb_owner:npg_eWiqBKdgCf71@ep-rapid-salad-agxleazh-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

## ✅ Fördelar

1. **Förhindrar "too many connections" errors**
   - Med scraping + web traffic kan connections ta slut
   - Connection limit skyddar mot överanvändning

2. **Snabbare queries**
   - Connection pooling återanvänder connections
   - Ingen overhead för ny connection per query

3. **Bättre resilience**
   - Timeout parameters förhindrar hangs
   - Graceful degradation om DB är överbelastad

4. **Migrations fungerar**
   - `directUrl` används för schema migrations
   - Undviker PgBouncer issues med transactions

## 🔍 Verification

Efter deploy, kontrollera att allt fungerar:

```bash
# Kör en migration för att testa directUrl:
railway run npx prisma migrate deploy

# Kontrollera connections i Neon dashboard:
# https://console.neon.tech → Din projekt → Monitoring
```

## 📊 Connection Monitoring

Övervaka connection usage i Neon dashboard för att justera `connection_limit`:

- **Under 5 connections**: Öka limit för bättre prestanda
- **Nära 100 connections**: Minska limit per instans
- **Timeout errors**: Öka `pool_timeout` värdet

---

**Action Required:** Uppdatera DATABASE_URL och lägg till DIRECT_URL i Railway
