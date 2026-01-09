#!/usr/bin/env python3
"""
Generate INSERT statements for Article migration
Outputs SQL to stdout - redirect to file

Usage:
    python3 scripts/generate_article_inserts.py > migration_data.sql
"""

import psycopg2
import sys

NEON_URL = "postgresql://neondb_owner:npg_eWiqBKdgCf71@ep-rapid-salad-agxleazh-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"

BATCH_SIZE = 100
START_OFFSET = 80

COLUMNS = [
    "id", "externalId", "url", "title", "description", "content", "author",
    "imageUrl", "publishedAt", "fetchedAt", "sourceId", "sourceName",
    "sourceColor", "sourceType", "freshRssId", "feedId", "titleHash",
    "isRead", "isBookmarked", "userId", "createdAt", "updatedAt",
    "mediaDuration", "mediaEmbed", "mediaPlatform", "mediaThumbnail",
    "mediaType", "mediaUrl"
]

def escape_sql(val):
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "true" if val else "false"
    if isinstance(val, (int, float)):
        return str(val)
    s = str(val).replace("'", "''").replace("\\", "\\\\")
    return f"'{s}'"

def main():
    print("-- Article Migration SQL", file=sys.stderr)
    print(f"-- Generated from Neon, offset {START_OFFSET}+", file=sys.stderr)

    conn = psycopg2.connect(NEON_URL)
    cur = conn.cursor()

    # Get total
    cur.execute('SELECT COUNT(*) FROM "Article"')
    total = cur.fetchone()[0]
    print(f"-- Total articles: {total}", file=sys.stderr)

    # Output SQL header
    print("-- Article INSERT statements")
    print("-- Run in Supabase SQL Editor")
    print()

    offset = START_OFFSET
    batch_num = 0

    while offset < total:
        cur.execute(f'''
            SELECT {', '.join(f'"{c}"' for c in COLUMNS)}
            FROM "Article"
            ORDER BY id
            LIMIT {BATCH_SIZE} OFFSET {offset}
        ''')

        rows = cur.fetchall()
        if not rows:
            break

        print(f"-- Batch {batch_num + 1}: rows {offset}-{offset + len(rows) - 1}")

        for row in rows:
            values = [escape_sql(v) for v in row]
            col_str = ', '.join(f'"{c}"' for c in COLUMNS)
            val_str = ', '.join(values)
            print(f'INSERT INTO "Article" ({col_str}) VALUES ({val_str}) ON CONFLICT (id) DO NOTHING;')

        print()

        batch_num += 1
        offset += BATCH_SIZE
        print(f"-- Processed batch {batch_num} (offset {offset})", file=sys.stderr)

    conn.close()
    print(f"-- Done! Generated {batch_num} batches", file=sys.stderr)

if __name__ == "__main__":
    main()
