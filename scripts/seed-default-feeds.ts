/**
 * Seed script to populate default feeds in the database
 * Run this once to initialize global news sources
 */

import { prisma } from "../src/lib/db";
import { defaultFeeds } from "../src/lib/nyheter/feeds";

async function seedDefaultFeeds() {
  console.log("🌱 Seeding default feeds...");

  try {
    // Get existing global feeds
    const existingFeeds = await prisma.feed.findMany({
      where: { userId: null },
    });

    const existingUrls = new Set(existingFeeds.map((f) => f.url));

    // Filter out feeds that already exist
    const newFeeds = defaultFeeds.filter((feed) => !existingUrls.has(feed.url));

    if (newFeeds.length === 0) {
      console.log("✅ All default feeds already exist in database");
      return;
    }

    // Insert new feeds
    const result = await prisma.feed.createMany({
      data: newFeeds.map((feed) => ({
        id: feed.id,
        name: feed.name,
        url: feed.url,
        type: feed.type,
        category: feed.category || "general",
        color: feed.color || "#666666",
        enabled: feed.enabled !== false,
        tags: feed.tags ? JSON.stringify(feed.tags) : null,
        options: feed.options ? JSON.stringify(feed.options) : null,
        userId: null, // Global feeds
      })),
      skipDuplicates: true,
    });

    console.log(`✅ Seeded ${result.count} default feeds`);
    console.log(`📊 Total global feeds in database: ${existingFeeds.length + result.count}`);
  } catch (error) {
    console.error("❌ Error seeding feeds:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedDefaultFeeds()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedDefaultFeeds };
