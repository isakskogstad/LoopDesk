/**
 * Upload person avatars to Supabase Storage
 * Uploads images from local avatars folder to person-assets bucket
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Config
const SUPABASE_URL = "https://rpjmsncjnhtnjnycabys.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const AVATARS_DIR = "/Users/isak/Desktop/LoopDesk v.2/avatars";

if (!SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_SERVICE_KEY environment variable");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface UploadResult {
  name: string;
  success: boolean;
  path?: string;
  error?: string;
}

async function uploadAvatars(): Promise<void> {
  console.log("Starting avatar upload...\n");

  const files = fs.readdirSync(AVATARS_DIR).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return [".png", ".jpg", ".jpeg", ".webp"].includes(ext) && !f.startsWith(".");
  });

  console.log(`Found ${files.length} avatar files to upload\n`);

  const results: UploadResult[] = [];

  for (const file of files) {
    const filePath = path.join(AVATARS_DIR, file);
    const fileBuffer = fs.readFileSync(filePath);

    // Extract person name from filename (e.g., "erik-fernholm.png" -> "erik-fernholm")
    const personSlug = path.basename(file, path.extname(file));
    const storagePath = `${personSlug}/avatar${path.extname(file)}`;

    console.log(`Uploading: ${file} -> ${storagePath}`);

    const { data, error } = await supabase.storage
      .from("person-assets")
      .upload(storagePath, fileBuffer, {
        contentType: `image/${path.extname(file).slice(1)}`,
        upsert: true,
      });

    if (error) {
      console.log(`  ❌ Error: ${error.message}`);
      results.push({ name: file, success: false, error: error.message });
    } else {
      console.log(`  ✓ Uploaded to: ${data.path}`);
      results.push({ name: file, success: true, path: data.path });
    }
  }

  // Summary
  console.log("\n--- Upload Summary ---");
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  console.log(`✓ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log("\nFailed uploads:");
    results
      .filter((r) => !r.success)
      .forEach((r) => console.log(`  - ${r.name}: ${r.error}`));
  }
}

uploadAvatars().catch(console.error);
