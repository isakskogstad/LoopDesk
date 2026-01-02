import type { CompanyData, CompanyAddress, CompanyIndustry } from "./types";
import { cachedBolag } from "./cache";

const BASE_URL = "https://gw.api.bolagsverket.se/vardefulla-datamangder/v1";
const TOKEN_URL = "https://portal.api.bolagsverket.se/oauth2/token";

// OAuth2 credentials from environment variables
const CLIENT_ID = process.env.BOLAGSVERKET_CLIENT_ID;
const CLIENT_SECRET = process.env.BOLAGSVERKET_CLIENT_SECRET;

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface BolagsverketOrganisation {
  organisationsidentitet: {
    identitetsbeteckning: string;
    typ?: { kod: string; klartext: string };
  };
  organisationsnamn?: {
    organisationsnamnLista?: {
      namn: string;
      organisationsnamntyp?: { kod: string; klartext: string };
      registreringsdatum?: string;
    }[];
  };
  organisationsform?: { kod: string; klartext: string };
  juridiskForm?: { kod: string; klartext: string };
  verksamOrganisation?: { kod: "JA" | "NEJ" };
  avregistreradOrganisation?: { avregistreringsdatum?: string };
  avregistreringsorsak?: { kod: string; klartext: string };
  pagaendeAvvecklingsEllerOmstruktureringsforfarande?: {
    pagaendeAvvecklingsEllerOmstruktureringsforfarandeLista?: {
      kod: string;
      klartext: string;
      fromDatum?: string;
    }[];
  };
  verksamhetsbeskrivning?: { beskrivning?: string };
  naringsgrenOrganisation?: {
    sni?: { kod: string; klartext: string }[];
  };
  postadressOrganisation?: {
    postadress?: {
      utdelningsadress?: string;
      coAdress?: string;
      postnummer?: string;
      postort?: string;
      land?: string;
    };
  };
  organisationsdatum?: {
    registreringsdatum?: string;
    infortHosScb?: string;
  };
  reklamsparr?: { kod: "JA" | "NEJ" };
}

interface BolagsverketResponse {
  organisationer: BolagsverketOrganisation[];
}

// Token cache
let tokenCache: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Bolagsverket credentials not configured");
  }

  // Check if we have a valid cached token
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60000) {
    return tokenCache.token;
  }

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: "vardefulla-datamangder:read vardefulla-datamangder:ping",
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get Bolagsverket token: ${response.status}`);
  }

  const data: TokenResponse = await response.json();

  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

/**
 * Check if Bolagsverket API is configured
 */
export function isBolagsverketConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET);
}

/**
 * Internal function to fetch company data (uncached)
 */
async function fetchFromBolagsverketUncached(
  orgNr: string
): Promise<Partial<CompanyData> | null> {
  if (!isBolagsverketConfigured()) {
    console.warn("Bolagsverket API not configured");
    return null;
  }

  try {
    const token = await getAccessToken();

    const response = await fetch(`${BASE_URL}/organisationer`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Request-Id": crypto.randomUUID(),
      },
      body: JSON.stringify({ identitetsbeteckning: orgNr.replace("-", "") }),
    });

    if (!response.ok) {
      if (response.status === 400) {
        // Invalid org number
        return null;
      }
      throw new Error(`Bolagsverket API returned ${response.status}`);
    }

    const data: BolagsverketResponse = await response.json();

    if (!data.organisationer || data.organisationer.length === 0) {
      return null;
    }

    const org = data.organisationer[0];
    return parseBolagsverketData(org);
  } catch (error) {
    console.error("Error fetching from Bolagsverket:", error);
    return null;
  }
}

/**
 * Fetch company data from Bolagsverket VDM API (with caching)
 * Cached for 1 hour - company info changes rarely
 */
export async function fetchFromBolagsverket(
  orgNr: string
): Promise<Partial<CompanyData> | null> {
  // Use cached version with 1 hour revalidation
  return cachedBolag.getCompanyInfo(orgNr, () => fetchFromBolagsverketUncached(orgNr));
}

function parseBolagsverketData(
  org: BolagsverketOrganisation
): Partial<CompanyData> {
  // Get primary company name
  const primaryName = org.organisationsnamn?.organisationsnamnLista?.find(
    (n) => n.organisationsnamntyp?.kod === "FORETAGSNAMN"
  );
  const name = primaryName?.namn || org.organisationsnamn?.organisationsnamnLista?.[0]?.namn || "";

  // Parse address
  const addr = org.postadressOrganisation?.postadress;
  const postalAddress: CompanyAddress | undefined = addr
    ? {
        street: addr.utdelningsadress,
        coAddress: addr.coAdress,
        zipCode: addr.postnummer,
        city: addr.postort,
        country: addr.land || "Sverige",
      }
    : undefined;

  // Parse industries (SNI codes)
  const industries: CompanyIndustry[] =
    org.naringsgrenOrganisation?.sni?.map((sni) => ({
      code: sni.kod,
      name: sni.klartext,
    })) || [];

  // Determine status
  const isActive = org.verksamOrganisation?.kod === "JA";
  const isDeregistered = Boolean(org.avregistreradOrganisation?.avregistreringsdatum);
  const ongoingProceedings =
    org.pagaendeAvvecklingsEllerOmstruktureringsforfarande
      ?.pagaendeAvvecklingsEllerOmstruktureringsforfarandeLista;

  let statusText = "Aktiv";
  if (isDeregistered) {
    statusText = org.avregistreringsorsak?.klartext || "Avregistrerad";
  } else if (ongoingProceedings && ongoingProceedings.length > 0) {
    statusText = ongoingProceedings.map((p) => p.klartext).join(", ");
  } else if (!isActive) {
    statusText = "Ej verksam";
  }

  return {
    basic: {
      orgNr: org.organisationsidentitet.identitetsbeteckning,
      name,
      companyType: {
        code: org.organisationsform?.kod || "",
        name: org.organisationsform?.klartext || "",
      },
      status: {
        active: isActive && !isDeregistered,
        status: statusText,
        statusDate: org.avregistreradOrganisation?.avregistreringsdatum,
      },
      registrationDate: org.organisationsdatum?.registreringsdatum,
      purpose: org.verksamhetsbeskrivning?.beskrivning,
    },
    postalAddress,
    industries,
    flags: {
      marketingProtection: org.reklamsparr?.kod === "JA",
    },
    sources: {
      bolagsverket: true,
    },
  };
}

/**
 * Get list of available annual reports
 */
export async function getAnnualReportsList(
  orgNr: string
): Promise<{ dokumentId: string; period: string; date: string; filformat: string }[]> {
  if (!isBolagsverketConfigured()) {
    return [];
  }

  try {
    const token = await getAccessToken();

    const response = await fetch(`${BASE_URL}/dokumentlista`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Request-Id": crypto.randomUUID(),
      },
      body: JSON.stringify({ identitetsbeteckning: orgNr.replace("-", "") }),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return (data.dokument || []).map(
      (doc: {
        dokumentId: string;
        filformat: string;
        rapporteringsperiodTom: string;
        registreringstidpunkt: string;
      }) => ({
        dokumentId: doc.dokumentId,
        filformat: doc.filformat,
        period: doc.rapporteringsperiodTom,
        date: doc.registreringstidpunkt,
      })
    );
  } catch (error) {
    console.error("Error fetching annual reports list:", error);
    return [];
  }
}

/**
 * Download an annual report document
 * Returns the document as a Buffer (ZIP file containing iXBRL)
 */
export async function downloadAnnualReport(
  dokumentId: string
): Promise<{ data: Buffer; contentType: string } | null> {
  if (!isBolagsverketConfigured()) {
    return null;
  }

  try {
    const token = await getAccessToken();

    const response = await fetch(`${BASE_URL}/dokument/${dokumentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Request-Id": crypto.randomUUID(),
      },
    });

    if (!response.ok) {
      console.error("Failed to download document:", response.status);
      return null;
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "application/zip";

    return {
      data: Buffer.from(buffer),
      contentType,
    };
  } catch (error) {
    console.error("Error downloading annual report:", error);
    return null;
  }
}

/**
 * Download and extract the iXBRL content from an annual report
 * Returns the XHTML content that can be displayed in a browser
 */
export async function getAnnualReportContent(
  dokumentId: string
): Promise<{ content: string; filename: string } | null> {
  const zipResult = await downloadAnnualReport(dokumentId);
  if (!zipResult) return null;

  try {
    // Use JSZip to extract the content
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(zipResult.data);

    // Find the xhtml file in the zip
    const files = Object.keys(zip.files);
    const xhtmlFile = files.find(
      (f) => f.endsWith(".xhtml") || f.endsWith(".html")
    );

    if (!xhtmlFile) {
      console.error("No XHTML file found in ZIP");
      return null;
    }

    const content = await zip.files[xhtmlFile].async("string");

    return {
      content,
      filename: xhtmlFile,
    };
  } catch (error) {
    console.error("Error extracting annual report:", error);
    return null;
  }
}
