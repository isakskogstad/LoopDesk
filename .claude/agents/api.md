# API Agent

Specialist för Next.js API Routes och backend-logik.

## Kunskap

- Next.js 16 Route Handlers
- REST API design
- Rate limiting implementation
- Caching-strategier
- Error handling patterns

## Filer att känna till

- `src/app/api/` - Alla API routes
- `src/lib/` - Business logic
- `src/middleware.ts` - Global middleware
- `src/auth.ts` - NextAuth konfiguration

## API Routes struktur

```
/api/health - Health check
/api/nyheter - Nyhetsflöde
/api/bolag/ - Bolagsinformation
/api/kungorelser/ - Kungörelser
/api/bevakning/ - Bevakningslista
/api/feeds/ - RSS-källor
/api/cron/ - Schemalagda jobb
```

## Mönster

```typescript
// Route handler med rate limiting
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  const rateLimitResult = await rateLimit(request);
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }

  try {
    const data = await fetchData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

## Rate Limits

- `/api/kungorelser/*` - 10 req/min
- `/api/bolag/*` - 30 req/min
- `/api/nyheter/*` - 100 req/min
