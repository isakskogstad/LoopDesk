#!/usr/bin/env python3
"""
Article Migration Script: Neon -> Supabase
Run this script to migrate remaining articles.

Usage:
    python3 migrate_articles_to_supabase.py

Requirements:
    pip install psycopg2-binary
"""

import psycopg2
import json
from datetime import datetime

# Connection strings
NEON_URL = "postgresql://neondb_owner:npg_eWiqBKdgCf71@ep-rapid-salad-agxleazh-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
# Direct connection (port 5432) instead of pooler (port 6543)
SUPABASE_URL = "postgresql://postgres.xkrsjrfexjqrhnbgsbhe:LoopDesk2025!@aws-0-eu-north-1.pooler.supabase.com:5432/postgres"

BATCH_SIZE = 50
START_OFFSET = 80  # Already migrated: 0-79

def get_total_count(neon_conn):
    """Get total number of articles in Neon"""
    with neon_conn.cursor() as cur:
        cur.execute('SELECT COUNT(*) FROM "Article"')
        return cur.fetchone()[0]

def fetch_batch(neon_conn, offset, limit):
    """Fetch a batch of articles from Neon"""
    with neon_conn.cursor() as cur:
        cur.execute(f'''
            SELECT id, "externalId", url, title, description, content, author,
                   "imageUrl", "publishedAt", "fetchedAt", "sourceId", "sourceName",
                   "sourceColor", "sourceType", "freshRssId", "feedId", "titleHash",
                   "isRead", "isBookmarked", "userId", "createdAt", "updatedAt",
                   "mediaDuration", "mediaEmbed", "mediaPlatform", "mediaThumbnail",
                   "mediaType", "mediaUrl"
            FROM "Article"
            ORDER BY id
            LIMIT %s OFFSET %s
        ''', (limit, offset))
        columns = [desc[0] for desc in cur.description]
        return [dict(zip(columns, row)) for row in cur.fetchall()]

def insert_batch(supabase_conn, articles):
    """Insert a batch of articles into Supabase"""
    if not articles:
        return 0

    columns = [
        "id", "externalId", "url", "title", "description", "content", "author",
        "imageUrl", "publishedAt", "fetchedAt", "sourceId", "sourceName",
        "sourceColor", "sourceType", "freshRssId", "feedId", "titleHash",
        "isRead", "isBookmarked", "userId", "createdAt", "updatedAt",
        "mediaDuration", "mediaEmbed", "mediaPlatform", "mediaThumbnail",
        "mediaType", "mediaUrl"
    ]

    col_str = ', '.join(f'"{c}"' for c in columns)
    placeholders = ', '.join(['%s'] * len(columns))

    sql = f'''
        INSERT INTO "Article" ({col_str})
        VALUES ({placeholders})
        ON CONFLICT (id) DO NOTHING
    '''

    inserted = 0
    with supabase_conn.cursor() as cur:
        for article in articles:
            values = [article.get(col) for col in columns]
            try:
                cur.execute(sql, values)
                inserted += 1
            except Exception as e:
                print(f"  Error inserting {article.get('id')}: {e}")

    supabase_conn.commit()
    return inserted

def main():
    print("=" * 60)
    print("Article Migration: Neon -> Supabase")
    print("=" * 60)

    # Connect to databases
    print("\nConnecting to Neon...")
    neon_conn = psycopg2.connect(NEON_URL)

    print("Connecting to Supabase...")
    supabase_conn = psycopg2.connect(SUPABASE_URL)

    # Get counts
    total = get_total_count(neon_conn)
    print(f"\nTotal articles in Neon: {total}")
    print(f"Starting from offset: {START_OFFSET}")
    print(f"Remaining to migrate: {total - START_OFFSET}")

    # Migrate in batches
    offset = START_OFFSET
    total_inserted = 0

    while offset < total:
        print(f"\nBatch: offset {offset}-{offset + BATCH_SIZE - 1}...", end=" ")

        # Fetch from Neon
        articles = fetch_batch(neon_conn, offset, BATCH_SIZE)

        if not articles:
            print("No more articles")
            break

        # Insert to Supabase
        inserted = insert_batch(supabase_conn, articles)
        total_inserted += inserted

        print(f"Inserted {inserted}/{len(articles)} rows")

        offset += BATCH_SIZE

    # Cleanup
    neon_conn.close()
    supabase_conn.close()

    print("\n" + "=" * 60)
    print(f"Migration complete! Total inserted: {total_inserted}")
    print("=" * 60)

if __name__ == "__main__":
    main()
