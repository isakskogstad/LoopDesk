# Folo API Integration Specification for LoopDesk

## Overview

Folo (formerly Follow) is an AI-powered RSS reader developed by RSSNext. This document specifies how LoopDesk can integrate with Folo's API to import feeds from shared lists and sync subscriptions.

**Repository:** https://github.com/RSSNext/Folo
**API Base URL:** `https://api.folo.is`
**Web App:** `https://app.folo.is`

---

## API Endpoints

### Public Endpoints (No Authentication Required)

These endpoints are publicly accessible and ideal for importing shared lists.

#### 1. Get List Details

```http
GET /lists?listId={listId}
```

**Parameters:**
- `listId` (required): The list ID (e.g., `230942183743771648`)

**Response:**
```json
{
  "code": 0,
  "data": {
    "list": {
      "type": "list",
      "id": "230942183743771648",
      "feedIds": ["128541751215072256", "..."],
      "title": "Loop Desk",
      "description": "",
      "image": "",
      "view": 0,
      "fee": 0,
      "createdAt": "2026-01-05T10:05:22.302Z",
      "updatedAt": "2026-01-05T10:05:36.658Z",
      "ownerUserId": "230843095138295808",
      "owner": {
        "id": "230843095138295808",
        "name": "Isak Skogstad",
        "handle": null,
        "image": "https://..."
      },
      "feeds": [
        {
          "type": "feed",
          "id": "128541751215072256",
          "url": "https://computersweden.se/feed/",
          "title": "Computer Sweden",
          "description": "nyheter om it och digitalisering",
          "siteUrl": "https://computersweden.se/",
          "image": null
        }
      ]
    },
    "subscriptionCount": 0,
    "readCount": 0,
    "feedCount": 33,
    "entries": [...]
  }
}
```

#### 2. Get Feed Details with Entries

```http
GET /feeds?id={feedId}
```

**Parameters:**
- `id` (required): The feed ID

**Response:**
```json
{
  "code": 0,
  "data": {
    "feed": {
      "type": "feed",
      "id": "128541751215072256",
      "url": "https://computersweden.se/feed/",
      "title": "Computer Sweden",
      "description": "nyheter om it och digitalisering",
      "siteUrl": "https://computersweden.se/",
      "image": null,
      "errorMessage": null,
      "errorAt": null,
      "ownerUserId": null
    },
    "entries": [
      {
        "id": "208201071193570304",
        "title": "Article Title",
        "url": "https://...",
        "content": "<div>...</div>",
        "description": "Short description...",
        "guid": "https://...",
        "author": null,
        "publishedAt": "2025-11-03T14:41:42.215Z",
        "media": [
          {
            "url": "https://...",
            "type": "photo",
            "width": 1280,
            "height": 853,
            "blurhash": "LH9uU1o~r9VXohtS..."
          }
        ],
        "categories": ["Category1", "Category2"],
        "attachments": [...],
        "language": null,
        "summary": "AI-generated summary..."
      }
    ]
  }
}
```

#### 3. Get Feed by URL

```http
GET /feeds?url={feedUrl}
```

**Parameters:**
- `url` (required): The RSS feed URL (URL-encoded)

#### 4. Get Entries Preview

```http
GET /entries/preview?id={feedId}
```

**Parameters:**
- `id` (required): The feed ID

Returns entries for a feed without requiring authentication.

#### 5. Get User Profile

```http
GET /profiles?id={userId}
```

**Parameters:**
- `id` (required): The user ID

**Response:**
```json
{
  "code": 0,
  "data": {
    "id": "230843095138295808",
    "name": "Isak Skogstad",
    "handle": null,
    "image": "https://...",
    "bio": null,
    "website": null,
    "socialLinks": null
  }
}
```

---

### Authenticated Endpoints

These endpoints require authentication via session cookies.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/subscriptions` | GET | List user's subscriptions |
| `/subscriptions` | POST | Subscribe to a feed/list |
| `/entries` | GET | Get entries with read status |
| `/actions` | GET | Get user actions |
| `/categories` | GET | List user's categories |
| `/collections` | GET | Get saved/starred items |

**Authentication:** Uses `better-auth` with session cookies. Supports:
- Email/Password
- Magic Link
- OAuth (Google, GitHub, Apple)
- Two-Factor Authentication

---

## Response Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `3` | Validation error (check `errors` field) |
| `1000` | Unauthorized |
| `6000` | User not found |

---

## Data Models

### Feed

```typescript
interface Feed {
  type: "feed";
  id: string;           // Snowflake ID
  url: string;          // RSS feed URL
  title: string;
  description: string;
  siteUrl: string;      // Website URL
  image: string | null;
  errorMessage: string | null;
  errorAt: string | null;
  ownerUserId: string | null;
}
```

### Entry

```typescript
interface Entry {
  id: string;
  feedId: string;
  title: string;
  url: string;
  content: string;      // HTML content
  description: string;  // Plain text excerpt
  guid: string;
  author: string | null;
  authorUrl: string | null;
  authorAvatar: string | null;
  publishedAt: string;  // ISO 8601
  insertedAt: string;   // ISO 8601
  media: Media[];
  categories: string[];
  attachments: Attachment[];
  extra: any | null;
  language: string | null;
  summary: string | null;  // AI-generated
}
```

### List

```typescript
interface List {
  type: "list";
  id: string;
  feedIds: string[];
  title: string;
  description: string;
  image: string;
  view: number;
  fee: number;
  createdAt: string;
  updatedAt: string;
  ownerUserId: string;
  owner: UserProfile;
  feeds: Feed[];
}
```

---

## LoopDesk Integration Strategy

### 1. Import Feeds from Shared Lists

**Use Case:** User shares a Folo list URL, LoopDesk imports all feeds.

```typescript
// src/lib/folo/client.ts

const FOLO_API_URL = "https://api.folo.is";

export async function importFoloList(listId: string): Promise<Feed[]> {
  const response = await fetch(`${FOLO_API_URL}/lists?listId=${listId}`);
  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(`Folo API error: ${data.message}`);
  }

  return data.data.list.feeds;
}

export function extractListIdFromUrl(url: string): string | null {
  // Supports:
  // - https://app.folo.is/share/lists/{id}
  // - https://app.folo.is/list/{id} (redirects)
  const match = url.match(/(?:share\/)?lists?\/(\d+)/);
  return match ? match[1] : null;
}
```

### 2. Fetch Feed Entries

```typescript
export async function fetchFeedEntries(feedId: string): Promise<Entry[]> {
  const response = await fetch(`${FOLO_API_URL}/feeds?id=${feedId}`);
  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(`Folo API error: ${data.message}`);
  }

  return data.data.entries;
}
```

### 3. Resolve Feed by URL

```typescript
export async function resolveFeedByUrl(feedUrl: string): Promise<Feed | null> {
  const response = await fetch(
    `${FOLO_API_URL}/feeds?url=${encodeURIComponent(feedUrl)}`
  );
  const data = await response.json();

  if (data.code !== 0) {
    return null;
  }

  return data.data.feed;
}
```

### 4. API Route for List Import

```typescript
// src/app/api/folo/import/route.ts

import { NextRequest, NextResponse } from "next/server";
import { importFoloList, extractListIdFromUrl } from "@/lib/folo/client";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listUrl } = await request.json();
  const listId = extractListIdFromUrl(listUrl);

  if (!listId) {
    return NextResponse.json({ error: "Invalid list URL" }, { status: 400 });
  }

  try {
    const feeds = await importFoloList(listId);

    // Upsert feeds to database
    const results = await Promise.all(
      feeds.map(async (feed) => {
        return prisma.feed.upsert({
          where: { url: feed.url },
          create: {
            url: feed.url,
            title: feed.title,
            description: feed.description,
            siteUrl: feed.siteUrl,
            image: feed.image,
            userId: session.user.id,
            source: "folo",
            externalId: feed.id,
          },
          update: {
            title: feed.title,
            description: feed.description,
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      imported: results.length,
      feeds: results,
    });
  } catch (error) {
    console.error("Folo import error:", error);
    return NextResponse.json(
      { error: "Failed to import list" },
      { status: 500 }
    );
  }
}
```

---

## Considerations

### Rate Limiting
- Folo API uses Cloudflare protection
- Implement client-side rate limiting (recommended: 10 req/min)
- Cache responses where appropriate

### Data Mapping

| Folo Field | LoopDesk Field |
|------------|----------------|
| `feed.url` | `Feed.url` |
| `feed.title` | `Feed.title` |
| `feed.siteUrl` | `Feed.siteUrl` |
| `entry.title` | `Article.title` |
| `entry.url` | `Article.url` |
| `entry.content` | `Article.content` |
| `entry.description` | `Article.description` |
| `entry.publishedAt` | `Article.publishedAt` |
| `entry.summary` | `Article.summary` (AI) |
| `entry.media[0].url` | `Article.imageUrl` |

### Caching Strategy

```typescript
// Recommended cache durations
const CACHE_DURATIONS = {
  list: 30 * 60 * 1000,      // 30 minutes
  feed: 15 * 60 * 1000,      // 15 minutes
  entries: 5 * 60 * 1000,    // 5 minutes
  profile: 60 * 60 * 1000,   // 1 hour
};
```

### Error Handling

```typescript
class FoloApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public errors?: Record<string, any>
  ) {
    super(message);
    this.name = "FoloApiError";
  }
}

async function handleFoloResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (data.code !== 0) {
    throw new FoloApiError(data.code, data.message, data.errors);
  }

  return data.data as T;
}
```

---

## Automatic Sync (Cron Job)

LoopDesk supports automatic syncing of Folo lists via a cron job.

### Endpoint

```http
GET /api/cron/folo-sync
Authorization: Bearer {CRON_SECRET}
```

### Behavior

1. Fetches all `FoloListConfig` records where `autoSync=true`
2. For each list, calls the Folo API to get current feeds
3. Compares with existing feeds:
   - **New feeds**: Validated and added to user's feed list
   - **Updated feeds**: Name and metadata synced
   - **Removed feeds**: Disabled (not deleted) to preserve user data
4. Updates `lastSyncAt` and `feedCount` on each list config
5. Regenerates `GlobalFeedCache` if changes were made

### Setup with External Cron Service

Railway doesn't have built-in cron support, so use an external service:

**Option 1: cron-job.org (Free)**

1. Create account at https://cron-job.org
2. Add new cron job:
   - URL: `https://loopdesk-production.up.railway.app/api/cron/folo-sync`
   - Schedule: `0 * * * *` (every hour)
   - Headers: `Authorization: Bearer YOUR_CRON_SECRET`
   - Method: GET

**Option 2: Upstash QStash**

1. Create account at https://upstash.com
2. Use QStash to schedule the endpoint

**Option 3: GitHub Actions**

```yaml
# .github/workflows/folo-sync.yml
name: Folo Sync
on:
  schedule:
    - cron: '0 * * * *'  # Every hour
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Folo Sync
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://loopdesk-production.up.railway.app/api/cron/folo-sync
```

### Environment Variables

```
CRON_SECRET=your-secure-secret-here
```

### Response Format

```json
{
  "success": true,
  "listsProcessed": 3,
  "totalAdded": 5,
  "totalUpdated": 12,
  "totalDisabled": 1,
  "totalErrors": 0,
  "duration": 4523,
  "results": [
    {
      "listId": "230942183743771648",
      "listName": "Loop Desk",
      "added": 2,
      "updated": 8,
      "disabled": 0,
      "errors": 0,
      "duration": 1523
    }
  ]
}
```

### Manual Trigger

```bash
# Local development
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/folo-sync

# Production
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://loopdesk-production.up.railway.app/api/cron/folo-sync
```

---

## Future Enhancements

### 1. Real-time Sync (WebSocket)
Folo may support WebSocket for real-time updates. Monitor their API for:
- Entry push notifications
- Subscription sync events

### 2. OAuth Integration
If Folo exposes OAuth for third-party apps:
- Implement "Connect Folo Account" feature
- Sync subscriptions bidirectionally

### 3. AI Features
Folo provides AI-generated summaries. Consider:
- Using their summaries when available
- Fallback to LoopDesk's own summarization

---

## Example: Full Import Flow

```typescript
// src/components/FoloImportDialog.tsx

async function handleImport(listUrl: string) {
  setLoading(true);
  try {
    const response = await fetch("/api/folo/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listUrl }),
    });

    const result = await response.json();

    if (result.success) {
      toast.success(`Imported ${result.imported} feeds from Folo`);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  } catch (error) {
    toast.error("Failed to import feeds");
  } finally {
    setLoading(false);
  }
}
```

---

## References

- **Folo GitHub:** https://github.com/RSSNext/Folo
- **Folo App:** https://app.folo.is
- **Shared List Example:** https://app.folo.is/share/lists/230942183743771648
- **Authentication:** Better Auth (https://better-auth.com)
