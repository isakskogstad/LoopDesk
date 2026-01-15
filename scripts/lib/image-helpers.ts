/**
 * Image URL helpers with fallback chains
 * Provides consistent image URLs for persons and companies
 */

const SUPABASE_URL = "https://rpjmsncjnhtnjnycabys.supabase.co";
const STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public`;

// ============================================
// Person Images
// ============================================

interface PersonImageOptions {
  slug?: string; // e.g., "erik-fernholm"
  name?: string; // e.g., "Erik Fernholm"
  linkedinAvatar?: string;
  size?: number;
}

/**
 * Get person avatar URL with fallback chain:
 * 1. Supabase person-assets (if slug provided)
 * 2. LinkedIn avatar (if provided)
 * 3. UI Avatars generated avatar
 */
export function getPersonAvatarUrl(options: PersonImageOptions): string {
  const { slug, name, linkedinAvatar, size = 200 } = options;

  // 1. Try Supabase storage
  if (slug) {
    return `${STORAGE_URL}/person-assets/${slug}/avatar.png`;
  }

  // 2. Try LinkedIn avatar
  if (linkedinAvatar) {
    return linkedinAvatar;
  }

  // 3. Fallback to UI Avatars
  const displayName = name || "Unknown";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=6366f1&color=fff&bold=true`;
}

/**
 * Get person cover image URL
 */
export function getPersonCoverUrl(slug: string): string | null {
  if (!slug) return null;
  return `${STORAGE_URL}/person-assets/${slug}/cover.jpg`;
}

// ============================================
// Company Images
// ============================================

interface CompanyImageOptions {
  orgNr?: string; // e.g., "556016-9095"
  name?: string; // e.g., "Spotify AB"
  domain?: string; // e.g., "spotify.com"
}

/**
 * Get company logo URL with fallback chain:
 * 1. Supabase company-assets (if orgNr provided)
 * 2. Clearbit Logo API (if domain provided)
 * 3. Generated initials logo
 */
export function getCompanyLogoUrl(options: CompanyImageOptions): string {
  const { orgNr, name, domain } = options;

  // 1. Try Supabase storage
  if (orgNr) {
    // Ensure correct format with hyphen
    const formattedOrgNr = formatOrgNr(orgNr);
    return `${STORAGE_URL}/company-assets/${formattedOrgNr}/logo.jpg`;
  }

  // 2. Try Clearbit Logo API
  if (domain) {
    return `https://logo.clearbit.com/${domain}`;
  }

  // 3. Fallback to generated initials
  const displayName = name || "?";
  const initials = displayName
    .split(" ")
    .filter((word) => !["AB", "HB", "KB", "i"].includes(word))
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=128&background=1e293b&color=fff&bold=true`;
}

/**
 * Get company cover image URL
 */
export function getCompanyCoverUrl(orgNr: string): string | null {
  if (!orgNr) return null;
  const formattedOrgNr = formatOrgNr(orgNr);
  return `${STORAGE_URL}/company-assets/${formattedOrgNr}/cover.jpg`;
}

// ============================================
// Utilities
// ============================================

/**
 * Format org number to standard format: XXXXXX-XXXX
 */
function formatOrgNr(orgNr: string): string {
  const digits = orgNr.replace(/\D/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 6)}-${digits.slice(6)}`;
  }
  return orgNr;
}

/**
 * Check if image exists at URL (async)
 */
export async function imageExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get image URL with verification - falls back if primary doesn't exist
 */
export async function getVerifiedPersonAvatarUrl(
  options: PersonImageOptions
): Promise<string> {
  const { slug, name, linkedinAvatar, size = 200 } = options;

  // Try Supabase first
  if (slug) {
    const supabaseUrl = `${STORAGE_URL}/person-assets/${slug}/avatar.png`;
    if (await imageExists(supabaseUrl)) {
      return supabaseUrl;
    }
  }

  // Try LinkedIn
  if (linkedinAvatar && (await imageExists(linkedinAvatar))) {
    return linkedinAvatar;
  }

  // Fallback to UI Avatars (always works)
  return getPersonAvatarUrl({ name, size });
}

/**
 * Get verified company logo with fallback
 */
export async function getVerifiedCompanyLogoUrl(
  options: CompanyImageOptions
): Promise<string> {
  const { orgNr, name, domain } = options;

  // Try Supabase first
  if (orgNr) {
    const formattedOrgNr = formatOrgNr(orgNr);
    const supabaseUrl = `${STORAGE_URL}/company-assets/${formattedOrgNr}/logo.jpg`;
    if (await imageExists(supabaseUrl)) {
      return supabaseUrl;
    }
  }

  // Try Clearbit
  if (domain) {
    const clearbitUrl = `https://logo.clearbit.com/${domain}`;
    if (await imageExists(clearbitUrl)) {
      return clearbitUrl;
    }
  }

  // Fallback to generated
  return getCompanyLogoUrl({ name });
}

// ============================================
// Export URLs for direct use
// ============================================

export const STORAGE_URLS = {
  personAssets: `${STORAGE_URL}/person-assets`,
  companyAssets: `${STORAGE_URL}/company-assets`,
};
