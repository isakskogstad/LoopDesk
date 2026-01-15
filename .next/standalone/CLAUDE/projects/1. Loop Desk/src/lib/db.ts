import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Create pg Pool for Supabase connection pooling
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// Lazy initialization to avoid errors during build
let prismaInstance: PrismaClient | null = null;

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!prismaInstance) {
      prismaInstance = globalForPrisma.prisma ?? createPrismaClient();
      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = prismaInstance;
      }
    }
    return (prismaInstance as unknown as Record<string, unknown>)[prop as string];
  },
});

// Helper to create title hash for grouping related articles
export function createTitleHash(title: string): string {
  // Normalize title for comparison
  const normalized = title
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 6) // First 6 words
    .join(" ");

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// Check if article matches any keywords
export async function checkKeywordMatches(
  articleId: string,
  title: string,
  description: string | null
): Promise<void> {
  const keywords = await prisma.keyword.findMany({
    where: { isActive: true },
  });

  for (const keyword of keywords) {
    const term = keyword.term.toLowerCase();
    const titleLower = title.toLowerCase();
    const descLower = (description || "").toLowerCase();

    let matchedIn: string | null = null;

    if (titleLower.includes(term)) {
      matchedIn = "title";
    } else if (descLower.includes(term)) {
      matchedIn = "description";
    }

    if (matchedIn) {
      await prisma.keywordMatch.upsert({
        where: {
          articleId_keywordId: {
            articleId,
            keywordId: keyword.id,
          },
        },
        create: {
          articleId,
          keywordId: keyword.id,
          matchedIn,
        },
        update: {},
      });
    }
  }
}
