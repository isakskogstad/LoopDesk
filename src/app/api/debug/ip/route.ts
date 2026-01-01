import { NextResponse } from "next/server";

/**
 * GET /api/debug/ip
 * Returns the server's outbound IP address
 */
export async function GET() {
  try {
    // Call external service to get our outbound IP
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();

    return NextResponse.json({
      outboundIP: data.ip,
      timestamp: new Date().toISOString(),
      note: "This is the IP address Railway uses for outbound requests. Add this to 2captcha IP whitelist.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch IP", details: String(error) },
      { status: 500 }
    );
  }
}
