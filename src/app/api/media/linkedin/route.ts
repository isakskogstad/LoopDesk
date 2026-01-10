import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";

// LinkedIn session cookie - MUST be set via environment variable
const LINKEDIN_COOKIE = process.env.LINKEDIN_COOKIE;

interface LinkedInCompany {
  name: string | null;
  about_us: string | null;
  website: string | null;
  phone: string | null;
  headquarters: string | null;
  founded: string | null;
  industry: string | null;
  company_type: string | null;
  company_size: string | null;
  specialties: string[] | null;
  showcase_pages: Array<{ name: string; linkedin_url: string; followers: number }>;
  affiliated_companies: Array<{ name: string; linkedin_url: string; followers: number }>;
  headcount: number | null;
  employees?: Array<{ name: string; title: string; linkedin_url: string }>;
}

interface MCPResponse {
  jsonrpc: string;
  id: number;
  result?: {
    structuredContent?: LinkedInCompany;
    content?: Array<{ type: string; text: string }>;
  };
  error?: {
    code: number;
    message: string;
  };
}

async function callLinkedInMCP(companyName: string): Promise<LinkedInCompany | null> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Timeout efter 60 sekunder"));
    }, 60000);

    const docker = spawn("docker", [
      "run", "--rm", "-i",
      "stickerdaniel/linkedin-mcp-server:latest",
      "--cookie", LINKEDIN_COOKIE
    ]);

    let output = "";
    let errorOutput = "";

    docker.stdout.on("data", (data) => {
      output += data.toString();
    });

    docker.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    docker.on("close", (code) => {
      clearTimeout(timeout);

      // Parse MCP responses from output
      const lines = output.split("\n").filter(line => line.startsWith("{"));

      for (const line of lines) {
        try {
          const response: MCPResponse = JSON.parse(line);
          if (response.id === 2 && response.result) {
            if (response.result.structuredContent) {
              resolve(response.result.structuredContent);
              return;
            }
            // Fallback: parse from content text
            if (response.result.content?.[0]?.text) {
              const parsed = JSON.parse(response.result.content[0].text);
              if (parsed.error) {
                reject(new Error(parsed.message || parsed.error));
                return;
              }
              resolve(parsed);
              return;
            }
          }
        } catch {
          // Continue parsing
        }
      }

      reject(new Error("Kunde inte parsa LinkedIn-svar"));
    });

    docker.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    // Send MCP protocol messages
    const initMessage = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "loopdesk", version: "1.0" }
      }
    });

    const notifyMessage = JSON.stringify({
      jsonrpc: "2.0",
      method: "notifications/initialized"
    });

    const callMessage = JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "get_company_profile",
        arguments: { company_name: companyName }
      }
    });

    // Send messages with delays
    docker.stdin.write(initMessage + "\n");

    setTimeout(() => {
      docker.stdin.write(notifyMessage + "\n");
    }, 2000);

    setTimeout(() => {
      docker.stdin.write(callMessage + "\n");
    }, 3000);

    // Close stdin after sending (allow time for response)
    setTimeout(() => {
      docker.stdin.end();
    }, 50000);
  });
}

// Convert company name to LinkedIn slug
function toLinkedInSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*(ab|aktiebolag|hb|kb|inc\.?|ltd\.?|llc|gmbh|oy|as)\s*$/i, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9-]/g, "");
}

// GET /api/media/linkedin?company=course-corrected
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const company = searchParams.get("company");

  if (!company) {
    return NextResponse.json(
      { error: "Parameter 'company' krävs" },
      { status: 400 }
    );
  }

  // Convert to LinkedIn slug if needed
  const slug = company.includes("-") ? company : toLinkedInSlug(company);

  try {
    console.log(`[LinkedIn] Hämtar profil för: ${slug}`);
    const data = await callLinkedInMCP(slug);

    if (!data) {
      return NextResponse.json(
        { error: "Ingen data från LinkedIn", company: slug, success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      company: slug,
      data,
      // Construct LinkedIn URL
      linkedinUrl: `https://www.linkedin.com/company/${slug}/`,
      // Logo URL (LinkedIn CDN pattern)
      logoUrl: `https://media.licdn.com/dms/image/v2/C4E0BAQFfDWlEiwlMlQ/company-logo_200_200/${slug}`,
    });
  } catch (error) {
    console.error("[LinkedIn] Error:", error);
    const message = error instanceof Error ? error.message : "Okänt fel";

    return NextResponse.json(
      { error: message, company: slug, success: false },
      { status: 500 }
    );
  }
}
