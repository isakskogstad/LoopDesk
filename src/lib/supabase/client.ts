"use client";

import { createBrowserClient } from "@supabase/ssr";

type SupabaseClient = ReturnType<typeof createBrowserClient>;

// Cache for runtime client
let runtimeClient: SupabaseClient | null = null;
let runtimeConfigFetched = false;

// Build-time env vars (may not be available on Railway)
const buildTimeUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const buildTimeKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Sync client for when build-time env vars are available
let buildTimeClient: SupabaseClient | null = null;

/**
 * Get Supabase browser client.
 * First tries build-time env vars, then fetches runtime config from API.
 * Returns null if Supabase is not configured.
 */
export async function getSupabaseBrowser(): Promise<SupabaseClient | null> {
  // Return cached build-time client if available
  if (buildTimeClient) {
    return buildTimeClient;
  }

  // Try to create client from build-time env vars
  if (buildTimeUrl && buildTimeKey) {
    buildTimeClient = createBrowserClient(buildTimeUrl, buildTimeKey);
    return buildTimeClient;
  }

  // Return cached runtime client
  if (runtimeClient) {
    return runtimeClient;
  }

  // Only fetch runtime config once
  if (runtimeConfigFetched) {
    return null;
  }

  // Fetch runtime config from API
  if (typeof window !== "undefined") {
    try {
      const response = await fetch("/api/config/supabase");
      const config = await response.json();

      runtimeConfigFetched = true;

      if (config.configured && config.url && config.anonKey) {
        runtimeClient = createBrowserClient(config.url, config.anonKey);
        console.log("[Supabase] Initialized via runtime config");
        return runtimeClient;
      }
    } catch (error) {
      console.warn("[Supabase] Failed to fetch runtime config:", error);
      runtimeConfigFetched = true;
    }
  }

  return null;
}

/**
 * Synchronous version - only works if build-time env vars are available.
 * @deprecated Use getSupabaseBrowser() instead for Railway compatibility.
 */
export function createSupabaseBrowser(): SupabaseClient {
  if (buildTimeClient) {
    return buildTimeClient;
  }

  if (runtimeClient) {
    return runtimeClient;
  }

  if (buildTimeUrl && buildTimeKey) {
    buildTimeClient = createBrowserClient(buildTimeUrl, buildTimeKey);
    return buildTimeClient;
  }

  throw new Error(
    "Supabase is not configured. Use getSupabaseBrowser() for async initialization."
  );
}
