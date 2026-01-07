import { prisma } from "@/lib/db";

export interface MatchResult {
  matchesCreated: number;
  articlesProcessed: number;
}

/**
 * Match recent articles to watched companies
 *
 * Looks for company name or org number mentions in article titles and descriptions
 */
export async function matchArticlesToCompanies(): Promise<MatchResult> {
  // Get watched companies
  const companies = await prisma.watchedCompany.findMany({
    select: {
      id: true,
      name: true,
      orgNumber: true,
    },
  });

  if (companies.length === 0) {
    return { matchesCreated: 0, articlesProcessed: 0 };
  }

  // Get recent articles without company matches (last 24 hours)
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const articles = await prisma.article.findMany({
    where: {
      publishedAt: { gte: since },
      CompanyArticleMatch: { none: {} },
    },
    select: {
      id: true,
      title: true,
      description: true,
    },
    take: 500,
  });

  let matchesCreated = 0;

  for (const article of articles) {
    const text = `${article.title} ${article.description || ""}`.toLowerCase();

    for (const company of companies) {
      const matches: { type: string; confidence: number }[] = [];

      // Match on company name (exact word boundary match)
      const nameLower = company.name.toLowerCase();
      // Use word boundary check for better accuracy
      const nameRegex = new RegExp(`\\b${escapeRegex(nameLower)}\\b`, "i");
      if (nameRegex.test(text)) {
        matches.push({ type: "name", confidence: 0.9 });
      }

      // Match on org number (if present)
      if (company.orgNumber) {
        // Org numbers can appear with or without dashes
        const orgNormalized = company.orgNumber.replace(/-/g, "");
        const textNormalized = text.replace(/-/g, "");
        if (textNormalized.includes(orgNormalized)) {
          matches.push({ type: "orgNumber", confidence: 1.0 });
        }
      }

      // Create matches
      for (const match of matches) {
        try {
          await prisma.companyArticleMatch.upsert({
            where: {
              articleId_companyId: {
                articleId: article.id,
                companyId: company.id,
              },
            },
            create: {
              articleId: article.id,
              companyId: company.id,
              matchType: match.type,
              confidence: match.confidence,
            },
            update: {
              matchType: match.type,
              confidence: match.confidence,
            },
          });
          matchesCreated++;
        } catch (error) {
          // Ignore duplicate errors
          console.error(`Error creating match for article ${article.id}:`, error);
        }
      }
    }
  }

  return {
    matchesCreated,
    articlesProcessed: articles.length,
  };
}

/**
 * Get articles for a specific company
 */
export async function getCompanyArticles(
  companyId: string,
  limit = 50
): Promise<{
  articles: {
    id: string;
    title: string;
    url: string;
    description: string | null;
    publishedAt: Date;
    sourceName: string;
    matchType: string;
    confidence: number;
  }[];
}> {
  const matches = await prisma.companyArticleMatch.findMany({
    where: { companyId },
    include: {
      Article: {
        select: {
          id: true,
          title: true,
          url: true,
          description: true,
          publishedAt: true,
          sourceName: true,
        },
      },
    },
    orderBy: {
      Article: {
        publishedAt: "desc",
      },
    },
    take: limit,
  });

  return {
    articles: matches.map((m) => ({
      ...m.Article,
      matchType: m.matchType,
      confidence: m.confidence,
    })),
  };
}

/**
 * Escape regex special characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
