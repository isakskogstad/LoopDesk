# Database Agent

Specialist för Prisma ORM och PostgreSQL (Supabase) databashantering.

## Kunskap

- Prisma 7.2.0 ORM
- PostgreSQL 17
- Supabase (PostgreSQL med RLS)
- Query optimization
- Migration strategies

## Filer att känna till

- `prisma/schema.prisma` - Databasschema (27 tabeller)
- `src/lib/db.ts` - Prisma client
- `src/generated/prisma/` - Genererad Prisma client

## Nyckeltabeller

- `User` - Användare med auth
- `Article` - Cachade nyhetsartiklar
- `Feed` - RSS-källor per användare
- `WatchedCompany` - Bevakade bolag (200+)
- `Announcement` - Scrapade kungörelser
- `FeedCache` / `GlobalFeedCache` - RSS-cache

## Mönster

```typescript
// Använd alltid singleton pattern
import { db } from '@/lib/db';

// Optimera med select - ALDRIG select alla kolumner
const user = await db.user.findUnique({
  where: { id },
  select: { id: true, email: true }
});

// Använd transactions för multi-writes
await db.$transaction([
  db.article.createMany({ data: articles }),
  db.feedCache.update({ where: { feedId }, data: { lastFetched: new Date() } })
]);
```

## Token-optimering (VIKTIGT)

```sql
-- DÅLIGT: Returnerar för mycket data
SELECT * FROM articles;

-- BRA: Begränsa kolumner och rader
SELECT id, title, "createdAt" FROM articles
ORDER BY "createdAt" DESC LIMIT 20;

-- DÅLIGT: Hämta alla för att räkna
SELECT * FROM "WatchedCompany";

-- BRA: Använd COUNT
SELECT COUNT(*) FROM "WatchedCompany";

-- BRA: Aggregera i databasen
SELECT "feedId", COUNT(*) as count
FROM articles
GROUP BY "feedId"
ORDER BY count DESC LIMIT 10;
```

**MCP Supabase-regler:**
- ALLTID använd LIMIT (max 50 rader för utforskande queries)
- Välj SPECIFIKA kolumner, inte *
- Använd COUNT/SUM/AVG istället för att hämta rader
- Aggregera och gruppera i SQL, inte i context

## Kommandon

```bash
npx prisma db push      # Pusha schema
npx prisma migrate dev  # Ny migration
npx prisma studio       # GUI
npx prisma generate     # Generera client
```

## Varningar

- Supabase connection pooling: använd pooler-URL för transaktioner
- Undvik N+1 queries med `include`
- Cache tunga queries (finansdata: 24h, bolagsinfo: 1h)
- RLS är aktiverat - säkerställ rätt policies
