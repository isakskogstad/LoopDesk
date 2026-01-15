import * as dotenv from "dotenv";
import * as path from "path";

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { syncFromRSS, regenerateGlobalCache } from "../src/lib/nyheter";

async function main() {
  console.log("Starting RSS sync...");
  const result = await syncFromRSS();
  console.log("Sync result:", JSON.stringify(result, null, 2));

  console.log("Regenerating global cache...");
  await regenerateGlobalCache();
  console.log("Done!");
}

main().catch(console.error);
