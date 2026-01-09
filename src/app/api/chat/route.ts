import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Tool definitions for LoopDesk chatbot
const tools: Anthropic.Messages.Tool[] = [
  // Web Search - Anthropic server-side tool
  {
    type: "web_search_20250305",
    name: "web_search",
    max_uses: 5,
    allowed_domains: [
      "di.se", "svd.se", "dn.se", "breakit.se", "realtid.se",
      "affarsvarlden.se", "va.se", "nyteknik.se", "omni.se",
      "linkedin.com", "wikipedia.org"
    ]
  } as unknown as Anthropic.Messages.Tool,
  {
    name: "search_companies",
    description: "Sök efter företag i LoopDesk:s bevakningslista eller i externa databaser. Returnerar företagsnamn, organisationsnummer, bransch och nyckeltal.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Sökterm - kan vara företagsnamn, del av namn, eller organisationsnummer"
        },
        limit: {
          type: "number",
          description: "Max antal resultat (default 10)"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "get_company_details",
    description: "Hämta detaljerad information om ett specifikt företag baserat på organisationsnummer. Inkluderar ekonomisk data, ledning, adress och status.",
    input_schema: {
      type: "object" as const,
      properties: {
        orgNumber: {
          type: "string",
          description: "Organisationsnummer (10 siffror, t.ex. 5591234567)"
        }
      },
      required: ["orgNumber"]
    }
  },
  {
    name: "search_announcements",
    description: "Sök kungörelser från Bolagsverket för ett företag. Visar registreringsändringar, styrelseändringar, konkurser, likvidationer mm.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Företagsnamn eller organisationsnummer"
        },
        limit: {
          type: "number",
          description: "Max antal kungörelser (default 10)"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "get_news",
    description: "Hämta senaste nyheter från LoopDesk:s nyhetsflöde. Kan filtrera på sökord eller källa.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Sökord för att filtrera nyheter (valfritt)"
        },
        sourceId: {
          type: "string",
          description: "Filtrera på nyhetskälla (valfritt)"
        },
        limit: {
          type: "number",
          description: "Max antal nyheter (default 10)"
        }
      }
    }
  },
  {
    name: "get_investors",
    description: "Sök efter investerare - VC-bolag eller family offices. Visar portföljbolag, investeringsfokus och kontaktinfo.",
    input_schema: {
      type: "object" as const,
      properties: {
        type: {
          type: "string",
          enum: ["vc", "family_office", "all"],
          description: "Typ av investerare att söka"
        },
        query: {
          type: "string",
          description: "Sökterm för namn eller investeringsfokus (valfritt)"
        },
        limit: {
          type: "number",
          description: "Max antal resultat (default 10)"
        }
      },
      required: ["type"]
    }
  },
  // Phase 1 tools - Person search, Company comparison, Industry analysis
  {
    name: "search_persons",
    description: "Sök efter personer - VD:ar, styrelsemedlemmar, grundare, investerare. Visar roller, företagskopplingar och kontaktinfo.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Namn eller del av namn att söka efter"
        },
        roleType: {
          type: "string",
          enum: ["CEO", "CHAIRMAN", "BOARD_MEMBER", "FOUNDER", "INVESTOR", "all"],
          description: "Filtrera på rolltyp (valfritt)"
        },
        limit: {
          type: "number",
          description: "Max antal resultat (default 10)"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "compare_companies",
    description: "Jämför nyckeltal mellan 2-5 företag sida vid sida. Visar omsättning, resultat, anställda, tillväxt och finansiering.",
    input_schema: {
      type: "object" as const,
      properties: {
        orgNumbers: {
          type: "array",
          items: { type: "string" },
          description: "Lista med organisationsnummer (2-5 stycken)"
        },
        metrics: {
          type: "array",
          items: {
            type: "string",
            enum: ["revenue", "profit", "employees", "funding", "growth"]
          },
          description: "Vilka nyckeltal att jämföra (valfritt, default alla)"
        }
      },
      required: ["orgNumbers"]
    }
  },
  {
    name: "analyze_industry",
    description: "Analysera en bransch/nisch - antal bolag, total omsättning, genomsnittlig tillväxt, top performers.",
    input_schema: {
      type: "object" as const,
      properties: {
        industry: {
          type: "string",
          description: "Bransch/nisch att analysera (t.ex. 'cleantech', 'fintech', 'carbon removal', 'foodtech')"
        },
        limit: {
          type: "number",
          description: "Max antal top performers att visa (default 5)"
        }
      },
      required: ["industry"]
    }
  }
];

// Tool execution functions
async function executeSearchCompanies(query: string, limit: number = 10) {
  const companies = await prisma.watchedCompany.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { orgNumber: { contains: query } },
        { impactNiche: { contains: query, mode: "insensitive" } },
        { city: { contains: query, mode: "insensitive" } }
      ]
    },
    select: {
      orgNumber: true,
      name: true,
      impactNiche: true,
      city: true,
      status: true,
      employees: true,
      turnover2024: true,
      profit2024: true,
      website: true
    },
    take: limit,
    orderBy: { name: "asc" }
  });

  if (companies.length === 0) {
    return { message: `Inga företag hittades för sökningen "${query}"`, results: [] };
  }

  return {
    message: `Hittade ${companies.length} företag`,
    results: companies.map(c => ({
      namn: c.name,
      orgNr: c.orgNumber,
      bransch: c.impactNiche || "Ej angiven",
      stad: c.city || "Ej angiven",
      status: c.status || "Aktiv",
      anställda: c.employees || "Okänt",
      omsättning2024: c.turnover2024 || "Ej tillgängligt",
      resultat2024: c.profit2024 || "Ej tillgängligt",
      hemsida: c.website || null
    }))
  };
}

async function executeGetCompanyDetails(orgNumber: string) {
  const company = await prisma.watchedCompany.findUnique({
    where: { orgNumber: orgNumber.replace(/[^0-9]/g, "") },
    include: {
      articleMatches: {
        include: { article: true },
        take: 5,
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!company) {
    return { error: `Inget företag hittat med organisationsnummer ${orgNumber}` };
  }

  // Get recent announcements
  const announcements = await prisma.announcement.findMany({
    where: { orgNumber: company.orgNumber },
    take: 5,
    orderBy: { publishedAt: "desc" }
  });

  return {
    grundinfo: {
      namn: company.name,
      legalNamn: company.legalName,
      orgNr: company.orgNumber,
      bolagsform: company.companyType,
      status: company.status,
      registreringsdatum: company.registrationDate,
      bransch: company.sniDescription || company.impactNiche
    },
    kontakt: {
      adress: company.address,
      postnummer: company.postalCode,
      kommun: company.municipality,
      stad: company.city,
      telefon: company.phone,
      email: company.email,
      hemsida: company.website
    },
    ledning: {
      vd: company.ceo,
      styrelseordförande: company.chairman
    },
    ekonomi: {
      anställda: company.employees,
      omsättning2024: company.turnover2024,
      resultat2024: company.profit2024,
      omsättning2023: company.turnover2023,
      resultat2023: company.profit2023,
      tillväxt: company.growth2023to2024,
      aktiekapital: company.shareCapital ? `${company.shareCapital} SEK` : null
    },
    finansiering: {
      totalFinansiering: company.totalFunding,
      senasteRunda: company.latestFundingRound,
      senasteDatum: company.latestFundingDate,
      värdering: company.latestValuation,
      störstaÄgare: company.largestOwners
    },
    flaggor: {
      fSkatt: company.fSkatt,
      momsRegistrerad: company.momsRegistered,
      betalningsanmärkningar: company.paymentRemarks
    },
    senastKungörelser: announcements.map(a => ({
      typ: a.type,
      datum: a.publishedAt?.toISOString().split("T")[0],
      text: a.detailText?.substring(0, 200)
    })),
    senastNyheter: company.articleMatches.map(m => ({
      rubrik: m.article.title,
      datum: m.article.publishedAt?.toISOString().split("T")[0],
      källa: m.article.sourceName
    }))
  };
}

async function executeSearchAnnouncements(query: string, limit: number = 10) {
  const announcements = await prisma.announcement.findMany({
    where: {
      OR: [
        { subject: { contains: query, mode: "insensitive" } },
        { orgNumber: { contains: query } },
        { type: { contains: query, mode: "insensitive" } }
      ]
    },
    select: {
      id: true,
      subject: true,
      type: true,
      pubDate: true,
      publishedAt: true,
      detailText: true,
      orgNumber: true
    },
    take: limit,
    orderBy: { publishedAt: "desc" }
  });

  if (announcements.length === 0) {
    return { message: `Inga kungörelser hittades för "${query}"`, results: [] };
  }

  return {
    message: `Hittade ${announcements.length} kungörelser`,
    results: announcements.map(a => ({
      id: a.id,
      företag: a.subject,
      orgNr: a.orgNumber,
      typ: a.type,
      datum: a.publishedAt?.toISOString().split("T")[0] || a.pubDate,
      sammanfattning: a.detailText?.substring(0, 300) || "Ingen text tillgänglig"
    }))
  };
}

async function executeGetNews(query?: string, sourceId?: string, limit: number = 10) {
  const articles = await prisma.article.findMany({
    where: {
      AND: [
        query ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } }
          ]
        } : {},
        sourceId ? { sourceId } : {}
      ]
    },
    select: {
      id: true,
      title: true,
      description: true,
      url: true,
      sourceName: true,
      publishedAt: true,
      imageUrl: true
    },
    take: limit,
    orderBy: { publishedAt: "desc" }
  });

  if (articles.length === 0) {
    return { message: query ? `Inga nyheter hittades för "${query}"` : "Inga nyheter tillgängliga", results: [] };
  }

  return {
    message: `Hittade ${articles.length} nyheter`,
    results: articles.map(a => ({
      rubrik: a.title,
      beskrivning: a.description?.substring(0, 200),
      källa: a.sourceName,
      datum: a.publishedAt?.toISOString().split("T")[0],
      länk: a.url
    }))
  };
}

async function executeGetInvestors(type: string, query?: string, limit: number = 10) {
  const results: { vc?: unknown[]; familyOffices?: unknown[] } = {};

  if (type === "vc" || type === "all") {
    const vcCompanies = await prisma.vCCompany.findMany({
      where: query ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { impactNiche: { contains: query, mode: "insensitive" } },
          { portfolioCompanies: { contains: query, mode: "insensitive" } }
        ]
      } : {},
      select: {
        name: true,
        type: true,
        impactNiche: true,
        description: true,
        portfolioCompanies: true,
        website: true,
        office: true,
        aum: true
      },
      take: limit,
      orderBy: { name: "asc" }
    });

    results.vc = vcCompanies.map(v => ({
      namn: v.name,
      typ: v.type,
      fokus: v.impactNiche,
      beskrivning: v.description?.substring(0, 200),
      portfölj: v.portfolioCompanies?.substring(0, 200),
      hemsida: v.website,
      kontor: v.office,
      aum: v.aum ? `${(Number(v.aum) / 1000000000).toFixed(1)} mdkr` : null
    }));
  }

  if (type === "family_office" || type === "all") {
    const familyOffices = await prisma.familyOffice.findMany({
      where: query ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { family: { contains: query, mode: "insensitive" } },
          { impactNiche: { contains: query, mode: "insensitive" } }
        ]
      } : {},
      select: {
        name: true,
        family: true,
        impactNiche: true,
        description: true,
        portfolioCompanies: true,
        website: true,
        region: true,
        assets: true
      },
      take: limit,
      orderBy: { name: "asc" }
    });

    results.familyOffices = familyOffices.map(f => ({
      namn: f.name,
      familj: f.family,
      fokus: f.impactNiche,
      beskrivning: f.description?.substring(0, 200),
      portfölj: f.portfolioCompanies?.substring(0, 200),
      hemsida: f.website,
      region: f.region,
      tillgångar: f.assets ? `${(Number(f.assets) / 1000000000).toFixed(1)} mdkr` : null
    }));
  }

  const totalCount = (results.vc?.length || 0) + (results.familyOffices?.length || 0);
  return {
    message: `Hittade ${totalCount} investerare`,
    ...results
  };
}

// Execute a tool and return the result
async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  try {
    let result: unknown;

    switch (name) {
      case "search_companies":
        result = await executeSearchCompanies(
          input.query as string,
          (input.limit as number) || 10
        );
        break;
      case "get_company_details":
        result = await executeGetCompanyDetails(input.orgNumber as string);
        break;
      case "search_announcements":
        result = await executeSearchAnnouncements(
          input.query as string,
          (input.limit as number) || 10
        );
        break;
      case "get_news":
        result = await executeGetNews(
          input.query as string | undefined,
          input.sourceId as string | undefined,
          (input.limit as number) || 10
        );
        break;
      case "get_investors":
        result = await executeGetInvestors(
          input.type as string,
          input.query as string | undefined,
          (input.limit as number) || 10
        );
        break;
      default:
        result = { error: `Okänt verktyg: ${name}` };
    }

    return JSON.stringify(result, null, 2);
  } catch (error) {
    console.error(`Tool execution error (${name}):`, error);
    return JSON.stringify({
      error: `Fel vid körning av ${name}`,
      details: error instanceof Error ? error.message : "Okänt fel"
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, systemPrompt } = body as {
      messages: ChatMessage[];
      systemPrompt?: string;
    };

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const anthropic = new Anthropic({ apiKey });

    const defaultSystemPrompt = `Du är LoopDesk Assistant, en AI-assistent för den svenska business intelligence-plattformen LoopDesk.

Du har tillgång till följande verktyg för att söka i plattformens databaser:

- **search_companies**: Sök företag i bevakningslistan (200+ svenska impactbolag). Sökbar på namn, stad, bransch.
- **get_company_details**: Hämta fullständig info om ett företag (ekonomi, ledning, finansiering, kungörelser, nyheter).
- **search_announcements**: Sök kungörelser från Bolagsverket (styrelseändringar, konkurser, nyemissioner mm).
- **get_news**: Hämta nyheter från RSS-flödet. Kan filtrera på sökord.
- **get_investors**: Sök VC-bolag och family offices i Sverige.

**Arbetsflöde:**
1. Vid företagsfrågor: Börja med search_companies, använd sedan get_company_details för mer info.
2. Vid nyhetsfrågor: Använd get_news med relevanta sökord.
3. Vid investerar-frågor: Använd get_investors med type="vc", "family_office" eller "all".
4. Kombinera verktyg vid behov för att ge ett komplett svar.

**Format:**
- Svara alltid på svenska
- Var koncis men informativ
- Använd punktlistor för listor med data
- Presentera ekonomiska data tydligt
- Ange organisationsnummer när du nämner specifika företag`;

    // Convert messages to Anthropic format
    const anthropicMessages: Anthropic.MessageParam[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Create streaming response with tool use
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let continueLoop = true;

          while (continueLoop) {
            const response = await anthropic.messages.create({
              model: "claude-sonnet-4-5-20250929",
              max_tokens: 2048,
              system: systemPrompt || defaultSystemPrompt,
              messages: anthropicMessages,
              tools,
            });

            // Process the response
            for (const block of response.content) {
              if (block.type === "text") {
                // Stream text content
                const data = JSON.stringify({ text: block.text });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              } else if (block.type === "tool_use") {
                // Notify about tool use
                const toolNotification = JSON.stringify({
                  tool: block.name,
                  status: "executing"
                });
                controller.enqueue(encoder.encode(`data: ${toolNotification}\n\n`));

                // Execute the tool
                const toolResult = await executeTool(block.name, block.input as Record<string, unknown>);

                // Add assistant message with tool use to conversation
                anthropicMessages.push({
                  role: "assistant",
                  content: response.content,
                });

                // Add tool result to conversation
                anthropicMessages.push({
                  role: "user",
                  content: [{
                    type: "tool_result",
                    tool_use_id: block.id,
                    content: toolResult,
                  }],
                });
              }
            }

            // Check if we should continue (more tool calls needed)
            if (response.stop_reason === "end_turn" || response.stop_reason === "stop_sequence") {
              continueLoop = false;
            } else if (response.stop_reason !== "tool_use") {
              continueLoop = false;
            }
          }

          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: "Failed to process chat request", details: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
