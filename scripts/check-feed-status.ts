
import { prisma } from "../src/lib/db";

async function checkFeedStatus() {
  console.log("🔍 Checking feed status...");

  try {
    // 1. Check Global Feed Cache
    const cache = await prisma.globalFeedCache.findUnique({
      where: { id: "global" },
    });

    if (!cache) {
      console.error("❌ Global Feed Cache is EMPTY/MISSING!");
    } else {
      console.log("✅ Global Feed Cache found.");
      console.log(`   - Last Updated: ${cache.lastUpdated}`);
      console.log(`   - Source Count: ${cache.sourceCount}`);
      console.log(`   - Item Count: ${cache.itemCount}`);
      
      const items = JSON.parse(cache.items);
      console.log(`   - Actual items in JSON: ${items.length}`);
      
      if (items.length > 0) {
        console.log("   - Sample Item:");
        console.log(`     "${items[0].title}" from ${items[0].source.name} (${items[0].publishedAt})`);
      }
    }

    // 2. Check Enabled Feeds
    const enabledFeeds = await prisma.feed.findMany({
      where: { enabled: true },
    });
    console.log(`\n✅ Enabled Feeds in DB: ${enabledFeeds.length}`);
    enabledFeeds.slice(0, 5).forEach(f => console.log(`   - ${f.name} (${f.url})`));

    // 3. Check Articles Table
    const articleCount = await prisma.article.count();
    console.log(`\n✅ Total Articles in DB: ${articleCount}`);

  } catch (error) {
    console.error("❌ Error checking status:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFeedStatus();
