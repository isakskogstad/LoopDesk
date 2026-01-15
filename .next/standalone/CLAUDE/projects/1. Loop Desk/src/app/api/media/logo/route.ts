import { NextRequest, NextResponse } from "next/server";

// API Keys - MUST be set via environment variables
const BRANDFETCH_API_KEY = process.env.BRANDFETCH_API_KEY;
const BRANDFETCH_CLIENT_ID = process.env.BRANDFETCH_CLIENT_ID;
const LOGODEV_KEY = process.env.LOGODEV_KEY;

const TIMEOUT = 8000;

interface LogoFile {
  url: string;
  format: string;
  width?: number;
  height?: number;
  type: string; // logo, icon, symbol
}

interface LogoResult {
  domain: string;
  success: boolean;
  source?: string;
  files: LogoFile[];
  error?: string;
}

function cleanDomain(domain: string): string {
  return domain
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];
}

// Helper to fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// 1. Brandfetch Brand API (best quality, multiple formats)
async function fetchBrandfetchApi(domain: string): Promise<LogoFile[]> {
  const files: LogoFile[] = [];

  try {
    const response = await fetchWithTimeout(
      `https://api.brandfetch.io/v2/brands/${domain}`,
      {
        headers: {
          Authorization: `Bearer ${BRANDFETCH_API_KEY}`,
        },
      }
    );

    if (!response.ok) return files;

    const data = await response.json();
    const logos = data.logos || [];

    for (const logo of logos) {
      const logoType = logo.type || "logo";
      const formats = logo.formats || [];

      // Sort: SVG first, then PNG by size
      const sortedFormats = formats.sort((a: { format: string; width?: number }, b: { format: string; width?: number }) => {
        if (a.format === "svg" && b.format !== "svg") return -1;
        if (a.format !== "svg" && b.format === "svg") return 1;
        return (b.width || 0) - (a.width || 0);
      });

      for (const fmt of sortedFormats) {
        if (!fmt.src || !["svg", "png", "jpeg"].includes(fmt.format)) continue;

        files.push({
          url: fmt.src,
          format: fmt.format,
          width: fmt.width,
          height: fmt.height,
          type: logoType,
        });
      }
    }
  } catch {
    // Ignore errors
  }

  return files;
}

// 2. Brandfetch CDN (fast, single file)
async function fetchBrandfetchCdn(domain: string): Promise<LogoFile | null> {
  try {
    const url = `https://cdn.brandfetch.io/${domain}?c=${BRANDFETCH_CLIENT_ID}`;
    const response = await fetchWithTimeout(url, {
      headers: {
        Referer: `https://${domain}`,
        Origin: `https://${domain}`,
      },
      redirect: "manual",
    });

    if (response.status === 302) {
      const location = response.headers.get("location") || "";
      // Skip if redirect to docs/guidelines (hotlinking blocked)
      if (location.includes("docs.brandfetch.com") || location.includes("guidelines")) {
        return null;
      }
      return {
        url: location,
        format: "png",
        type: "logo",
      };
    }

    if (response.ok) {
      return {
        url,
        format: "png",
        type: "logo",
      };
    }
  } catch {
    // Ignore errors
  }
  return null;
}

// 3. Unavatar (aggregates multiple sources)
async function fetchUnavatar(domain: string): Promise<LogoFile | null> {
  try {
    const url = `https://unavatar.io/${domain}?fallback=false`;
    const response = await fetchWithTimeout(url);

    if (response.ok) {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("image")) {
        return {
          url,
          format: contentType.includes("png") ? "png" : "jpeg",
          type: "logo",
        };
      }
    }
  } catch {
    // Ignore errors
  }
  return null;
}

// 4. Google Favicons (always available)
async function fetchGoogle(domain: string): Promise<LogoFile | null> {
  try {
    const url = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    const response = await fetchWithTimeout(url, { redirect: "follow" });

    if (response.ok) {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("image")) {
        return {
          url: response.url || url, // Use final URL after redirects
          format: "png",
          width: 128,
          height: 128,
          type: "icon",
        };
      }
    }
  } catch {
    // Ignore errors
  }
  return null;
}

// 5. DuckDuckGo Icons
async function fetchDuckDuckGo(domain: string): Promise<LogoFile | null> {
  try {
    const url = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    const response = await fetchWithTimeout(url);

    if (response.ok) {
      return {
        url,
        format: "ico",
        type: "icon",
      };
    }
  } catch {
    // Ignore errors
  }
  return null;
}

// 6. Logo.dev
async function fetchLogoDev(domain: string): Promise<LogoFile | null> {
  try {
    const url = `https://img.logo.dev/${domain}?token=${LOGODEV_KEY}`;
    const response = await fetchWithTimeout(url);

    if (response.ok) {
      return {
        url,
        format: "png",
        type: "logo",
      };
    }
  } catch {
    // Ignore errors
  }
  return null;
}

// Main fetch function with fallback chain
async function fetchLogo(domain: string, allFormats = false): Promise<LogoResult> {
  const cleanedDomain = cleanDomain(domain);
  const result: LogoResult = {
    domain: cleanedDomain,
    success: false,
    files: [],
  };

  // 1. Try Brandfetch API first (best quality)
  const brandfetchFiles = await fetchBrandfetchApi(cleanedDomain);
  if (brandfetchFiles.length > 0) {
    result.files = allFormats ? brandfetchFiles : [brandfetchFiles[0]];
    result.success = true;
    result.source = "brandfetch_api";
    return result;
  }

  // 2. Fallback chain
  const fallbackSources: [string, () => Promise<LogoFile | null>][] = [
    ["brandfetch_cdn", () => fetchBrandfetchCdn(cleanedDomain)],
    ["unavatar", () => fetchUnavatar(cleanedDomain)],
    ["google", () => fetchGoogle(cleanedDomain)],
    ["duckduckgo", () => fetchDuckDuckGo(cleanedDomain)],
    ["logodev", () => fetchLogoDev(cleanedDomain)],
  ];

  for (const [sourceName, fetchFn] of fallbackSources) {
    const file = await fetchFn();
    if (file) {
      result.files = [file];
      result.success = true;
      result.source = sourceName;
      return result;
    }
  }

  result.error = "Ingen logo hittades";
  return result;
}

// GET /api/media/logo?domain=volvo.com&all=true
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const domain = searchParams.get("domain");
  const allFormats = searchParams.get("all") === "true";

  if (!domain) {
    return NextResponse.json(
      { error: "Parameter 'domain' krävs" },
      { status: 400 }
    );
  }

  try {
    const result = await fetchLogo(domain, allFormats);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Logo fetch error:", error);
    return NextResponse.json(
      { error: "Kunde inte hämta logo", domain, success: false, files: [] },
      { status: 500 }
    );
  }
}

// POST /api/media/logo/batch - Batch fetch for multiple domains
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domains, allFormats = false } = body as { domains: string[]; allFormats?: boolean };

    if (!domains || !Array.isArray(domains)) {
      return NextResponse.json(
        { error: "Parameter 'domains' (array) krävs" },
        { status: 400 }
      );
    }

    // Limit batch size
    const limitedDomains = domains.slice(0, 50);

    const results: LogoResult[] = [];
    for (const domain of limitedDomains) {
      const result = await fetchLogo(domain, allFormats);
      results.push(result);

      // Small delay between requests to be nice to APIs
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      total: results.length,
      success: successCount,
      failed: results.length - successCount,
      results,
    });
  } catch (error) {
    console.error("Batch logo fetch error:", error);
    return NextResponse.json(
      { error: "Kunde inte hämta logos" },
      { status: 500 }
    );
  }
}
