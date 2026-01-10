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
  },
  // Phase 2 tools - Protocols, Investor matching, Watchlist
  {
    name: "search_protocols",
    description: "Sök i köpta protokoll från Bolagsverket. Visar AI-analyserad information om nyemissioner, styrelseändringar mm.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Företagsnamn eller organisationsnummer (valfritt)"
        },
        eventType: {
          type: "string",
          enum: ["nyemission", "styrelseändring", "fusion", "likvidation", "all"],
          description: "Filtrera på typ av händelse (valfritt)"
        },
        limit: {
          type: "number",
          description: "Max antal protokoll (default 10)"
        }
      }
    }
  },
  {
    name: "match_investors",
    description: "Hitta investerare som matchar ett företags profil baserat på bransch och fas.",
    input_schema: {
      type: "object" as const,
      properties: {
        orgNumber: {
          type: "string",
          description: "Organisationsnummer för företaget att matcha"
        },
        investorType: {
          type: "string",
          enum: ["vc", "family_office", "all"],
          description: "Typ av investerare (default 'all')"
        }
      },
      required: ["orgNumber"]
    }
  },
  {
    name: "manage_watchlist",
    description: "Hantera bevakningslistan - visa, lägg till eller sök företag.",
    input_schema: {
      type: "object" as const,
      properties: {
        action: {
          type: "string",
          enum: ["list", "search", "stats"],
          description: "Åtgärd: 'list' visar alla, 'search' söker, 'stats' visar statistik"
        },
        query: {
          type: "string",
          description: "Sökterm för 'search' action (valfritt)"
        },
        limit: {
          type: "number",
          description: "Max antal resultat (default 20)"
        }
      },
      required: ["action"]
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

// Phase 1: Search persons
async function executeSearchPersons(query: string, roleType?: string, limit: number = 10) {
  // Build role type filter
  const roleTypeFilter = roleType && roleType !== "all" ? {
    roles: {
      some: {
        roleType: roleType as "CEO" | "CHAIRMAN" | "BOARD_MEMBER" | "FOUNDER" | "OWNER"
      }
    }
  } : {};

  const persons = await prisma.person.findMany({
    where: {
      AND: [
        {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { title: { contains: query, mode: "insensitive" } }
          ]
        },
        roleTypeFilter
      ]
    },
    select: {
      id: true,
      name: true,
      title: true,
      personType: true,
      location: true,
      totalCompanies: true,
      activeCompanies: true,
      totalBoardSeats: true,
      roles: {
        where: { isActive: true },
        select: {
          roleType: true,
          roleTitle: true,
          companyName: true,
          orgNumber: true
        },
        take: 5,
        orderBy: { startDate: "desc" }
      }
    },
    take: limit,
    orderBy: { totalCompanies: "desc" }
  });

  if (persons.length === 0) {
    return { message: `Inga personer hittades för "${query}"`, results: [] };
  }

  return {
    message: `Hittade ${persons.length} personer`,
    results: persons.map(p => ({
      namn: p.name,
      titel: p.title || "Ej angiven",
      typ: p.personType,
      plats: p.location || "Ej angiven",
      antalBolag: p.totalCompanies,
      aktivaBolag: p.activeCompanies,
      styrelseposter: p.totalBoardSeats,
      nuvarandeRoller: p.roles.map(r => ({
        roll: r.roleTitle || r.roleType,
        bolag: r.companyName,
        orgNr: r.orgNumber
      }))
    }))
  };
}

// Phase 1: Compare companies
async function executeCompareCompanies(orgNumbers: string[], metrics?: string[]) {
  if (orgNumbers.length < 2 || orgNumbers.length > 5) {
    return { error: "Ange mellan 2 och 5 organisationsnummer för jämförelse" };
  }

  const cleanedOrgNumbers = orgNumbers.map(org => org.replace(/[^0-9]/g, ""));

  const companies = await prisma.watchedCompany.findMany({
    where: {
      orgNumber: { in: cleanedOrgNumbers }
    },
    select: {
      orgNumber: true,
      name: true,
      impactNiche: true,
      employees: true,
      turnover2024: true,
      profit2024: true,
      turnover2023: true,
      profit2023: true,
      growth2023to2024: true,
      totalFunding: true,
      latestFundingRound: true,
      latestValuation: true,
      city: true,
      status: true
    }
  });

  if (companies.length === 0) {
    return { error: "Inga av de angivna företagen hittades" };
  }

  // Build comparison object
  const comparison = companies.map(c => {
    const base: Record<string, unknown> = {
      namn: c.name,
      orgNr: c.orgNumber,
      bransch: c.impactNiche || "Ej angiven",
      stad: c.city || "Ej angiven",
      status: c.status || "Aktiv"
    };

    // Add requested metrics (or all if not specified)
    const allMetrics = !metrics || metrics.length === 0;

    if (allMetrics || metrics?.includes("employees")) {
      base.anställda = c.employees || "Okänt";
    }
    if (allMetrics || metrics?.includes("revenue")) {
      base.omsättning2024 = c.turnover2024 || "Ej tillgängligt";
      base.omsättning2023 = c.turnover2023 || "Ej tillgängligt";
    }
    if (allMetrics || metrics?.includes("profit")) {
      base.resultat2024 = c.profit2024 || "Ej tillgängligt";
      base.resultat2023 = c.profit2023 || "Ej tillgängligt";
    }
    if (allMetrics || metrics?.includes("growth")) {
      base.tillväxt = c.growth2023to2024 || "Ej tillgängligt";
    }
    if (allMetrics || metrics?.includes("funding")) {
      base.totalFinansiering = c.totalFunding || "Ej tillgängligt";
      base.senasteRunda = c.latestFundingRound || "Ej tillgängligt";
      base.värdering = c.latestValuation || "Ej tillgängligt";
    }

    return base;
  });

  return {
    message: `Jämförelse av ${companies.length} företag`,
    jämförelse: comparison,
    saknade: cleanedOrgNumbers.filter(
      org => !companies.find(c => c.orgNumber === org)
    ).length > 0 ? `${cleanedOrgNumbers.filter(org => !companies.find(c => c.orgNumber === org)).length} företag hittades inte` : null
  };
}

// Phase 1: Analyze industry
async function executeAnalyzeIndustry(industry: string, limit: number = 5) {
  // Find all companies in the industry/niche
  const companies = await prisma.watchedCompany.findMany({
    where: {
      OR: [
        { impactNiche: { contains: industry, mode: "insensitive" } },
        { sniDescription: { contains: industry, mode: "insensitive" } }
      ]
    },
    select: {
      orgNumber: true,
      name: true,
      impactNiche: true,
      city: true,
      employees: true,
      turnover2024: true,
      profit2024: true,
      growth2023to2024: true,
      totalFunding: true,
      status: true
    },
    orderBy: { turnover2024: { sort: "desc", nulls: "last" } }
  });

  if (companies.length === 0) {
    return {
      message: `Inga företag hittades inom "${industry}"`,
      results: [],
      tips: "Prova bredare söktermer som 'cleantech', 'fintech', 'foodtech', 'impact'"
    };
  }

  // Calculate aggregates
  const withRevenue = companies.filter(c => c.turnover2024 && typeof c.turnover2024 === "string");
  const withProfit = companies.filter(c => c.profit2024 && typeof c.profit2024 === "string");
  const withEmployees = companies.filter(c => c.employees != null);
  const withGrowth = companies.filter(c => c.growth2023to2024 && typeof c.growth2023to2024 === "string");

  // Parse revenue numbers (format: "123 MSEK" or "1.2 MDSEK")
  const parseRevenue = (rev: string): number => {
    const match = rev.match(/([\d,.]+)\s*(MSEK|MDSEK|TSEK)/i);
    if (!match) return 0;
    const num = parseFloat(match[1].replace(",", "."));
    const unit = match[2].toUpperCase();
    if (unit === "MDSEK") return num * 1000;
    if (unit === "TSEK") return num / 1000;
    return num; // MSEK
  };

  const totalRevenue = withRevenue.reduce((sum, c) => sum + parseRevenue(c.turnover2024 as string), 0);
  const totalEmployees = withEmployees.reduce((sum, c) => sum + (c.employees || 0), 0);

  // Parse growth numbers
  const parseGrowth = (g: string): number => {
    const match = g.match(/([-\d,.]+)\s*%/);
    return match ? parseFloat(match[1].replace(",", ".")) : 0;
  };

  const avgGrowth = withGrowth.length > 0
    ? withGrowth.reduce((sum, c) => sum + parseGrowth(c.growth2023to2024 as string), 0) / withGrowth.length
    : 0;

  // City distribution
  const cityCount = companies.reduce((acc, c) => {
    const city = c.city || "Okänd";
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCities = Object.entries(cityCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([city, count]) => ({ stad: city, antal: count }));

  // Top performers
  const topPerformers = companies.slice(0, limit).map(c => ({
    namn: c.name,
    orgNr: c.orgNumber,
    bransch: c.impactNiche,
    omsättning: c.turnover2024 || "Okänt",
    tillväxt: c.growth2023to2024 || "Okänt",
    anställda: c.employees || "Okänt"
  }));

  return {
    bransch: industry,
    sammanfattning: {
      antalBolag: companies.length,
      totalOmsättning: `${Math.round(totalRevenue)} MSEK`,
      totaltAnställda: totalEmployees,
      genomsnittligTillväxt: `${avgGrowth.toFixed(1)}%`,
      aktivaBolag: companies.filter(c => c.status === "active" || !c.status).length
    },
    geografiskSpridning: topCities,
    topPerformers
  };
}

// Phase 2: Search protocols from Bolagsverket
async function executeSearchProtocols(query?: string, eventType?: string, limit: number = 10) {
  const whereClause: Record<string, unknown> = {};

  if (query) {
    whereClause.OR = [
      { companyName: { contains: query, mode: "insensitive" } },
      { orgNumber: { contains: query } }
    ];
  }

  if (eventType && eventType !== "all") {
    whereClause.eventType = { contains: eventType, mode: "insensitive" };
  }

  const protocols = await prisma.protocolPurchase.findMany({
    where: whereClause,
    select: {
      id: true,
      orgNumber: true,
      companyName: true,
      protocolDate: true,
      purchaseDate: true,
      eventType: true,
      aiSummary: true,
      aiDetails: true,
      extractedText: true,
      pdfUrl: true
    },
    take: limit,
    orderBy: { protocolDate: "desc" }
  });

  if (protocols.length === 0) {
    return {
      message: query ? `Inga protokoll hittades för "${query}"` : "Inga protokoll tillgängliga",
      results: [],
      tips: "Protokoll köps från Bolagsverket och lagras med AI-analys"
    };
  }

  return {
    message: `Hittade ${protocols.length} protokoll`,
    results: protocols.map(p => ({
      id: p.id,
      företag: p.companyName,
      orgNr: p.orgNumber,
      protokollDatum: p.protocolDate?.toISOString().split("T")[0],
      köptDatum: p.purchaseDate?.toISOString().split("T")[0],
      händelseTyp: p.eventType || "Okänd",
      aiSammanfattning: p.aiSummary || "Ingen sammanfattning tillgänglig",
      aiDetaljer: p.aiDetails || null,
      harPDF: !!p.pdfUrl,
      textUtdrag: p.extractedText?.substring(0, 500) || null
    }))
  };
}

// Phase 2: Match investors to company profile
async function executeMatchInvestors(orgNumber: string, investorType: string = "all") {
  // First, get the company profile
  const company = await prisma.watchedCompany.findUnique({
    where: { orgNumber: orgNumber.replace(/[^0-9]/g, "") },
    select: {
      name: true,
      orgNumber: true,
      impactNiche: true,
      city: true,
      totalFunding: true,
      latestFundingRound: true,
      employees: true,
      turnover2024: true
    }
  });

  if (!company) {
    return { error: `Inget företag hittat med organisationsnummer ${orgNumber}` };
  }

  // Extract niche keywords for matching
  const niche = company.impactNiche?.toLowerCase() || "";
  const keywords = niche.split(/[,\s]+/).filter(k => k.length > 3);

  const matchedInvestors: { vc?: unknown[]; familyOffices?: unknown[] } = {};

  // Match VC companies
  if (investorType === "vc" || investorType === "all") {
    const vcMatches = await prisma.vCCompany.findMany({
      where: keywords.length > 0 ? {
        OR: keywords.map(k => ({
          OR: [
            { impactNiche: { contains: k, mode: "insensitive" } },
            { portfolioCompanies: { contains: k, mode: "insensitive" } },
            { description: { contains: k, mode: "insensitive" } }
          ]
        }))
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
      take: 10,
      orderBy: { aum: { sort: "desc", nulls: "last" } }
    });

    matchedInvestors.vc = vcMatches.map(v => ({
      namn: v.name,
      typ: v.type,
      fokus: v.impactNiche,
      matchAnledning: `Fokuserar på ${v.impactNiche || "liknande branscher"}`,
      portföljExempel: v.portfolioCompanies?.substring(0, 150),
      hemsida: v.website,
      aum: v.aum ? `${(Number(v.aum) / 1000000000).toFixed(1)} mdkr` : null
    }));
  }

  // Match family offices
  if (investorType === "family_office" || investorType === "all") {
    const foMatches = await prisma.familyOffice.findMany({
      where: keywords.length > 0 ? {
        OR: keywords.map(k => ({
          OR: [
            { impactNiche: { contains: k, mode: "insensitive" } },
            { portfolioCompanies: { contains: k, mode: "insensitive" } },
            { description: { contains: k, mode: "insensitive" } }
          ]
        }))
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
      take: 10,
      orderBy: { assets: { sort: "desc", nulls: "last" } }
    });

    matchedInvestors.familyOffices = foMatches.map(f => ({
      namn: f.name,
      familj: f.family,
      fokus: f.impactNiche,
      matchAnledning: `Investerar i ${f.impactNiche || "liknande branscher"}`,
      portföljExempel: f.portfolioCompanies?.substring(0, 150),
      hemsida: f.website,
      region: f.region,
      tillgångar: f.assets ? `${(Number(f.assets) / 1000000000).toFixed(1)} mdkr` : null
    }));
  }

  const totalMatches = (matchedInvestors.vc?.length || 0) + (matchedInvestors.familyOffices?.length || 0);

  return {
    företag: {
      namn: company.name,
      orgNr: company.orgNumber,
      bransch: company.impactNiche,
      stad: company.city,
      finansiering: company.totalFunding,
      senasteRunda: company.latestFundingRound
    },
    matchadeInvesterare: {
      totalt: totalMatches,
      sökordAnvända: keywords,
      ...matchedInvestors
    },
    tips: totalMatches === 0
      ? "Prova att bredda sökningen eller kontrollera att företaget har rätt branschkategori"
      : null
  };
}

// Phase 2: Manage watchlist
async function executeManageWatchlist(action: string, query?: string, limit: number = 20) {
  switch (action) {
    case "list": {
      const companies = await prisma.watchedCompany.findMany({
        select: {
          orgNumber: true,
          name: true,
          impactNiche: true,
          city: true,
          employees: true,
          turnover2024: true
        },
        take: limit,
        orderBy: { name: "asc" }
      });

      return {
        message: `Bevakningslistan innehåller ${companies.length} företag (visar ${Math.min(limit, companies.length)})`,
        företag: companies.map(c => ({
          namn: c.name,
          orgNr: c.orgNumber,
          bransch: c.impactNiche || "Ej angiven",
          stad: c.city || "Ej angiven"
        }))
      };
    }

    case "search": {
      if (!query) {
        return { error: "Sökterm krävs för 'search' action" };
      }

      const companies = await prisma.watchedCompany.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { orgNumber: { contains: query } },
            { impactNiche: { contains: query, mode: "insensitive" } },
            { city: { contains: query, mode: "insensitive" } },
            { ceo: { contains: query, mode: "insensitive" } }
          ]
        },
        select: {
          orgNumber: true,
          name: true,
          impactNiche: true,
          city: true,
          ceo: true,
          employees: true,
          turnover2024: true
        },
        take: limit,
        orderBy: { name: "asc" }
      });

      return {
        message: `Hittade ${companies.length} företag för "${query}"`,
        företag: companies.map(c => ({
          namn: c.name,
          orgNr: c.orgNumber,
          bransch: c.impactNiche || "Ej angiven",
          stad: c.city || "Ej angiven",
          vd: c.ceo || "Ej angiven"
        }))
      };
    }

    case "stats": {
      const [
        totalCount,
        byNiche,
        byCity
      ] = await Promise.all([
        prisma.watchedCompany.count(),
        prisma.watchedCompany.groupBy({
          by: ["impactNiche"],
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 10
        }),
        prisma.watchedCompany.groupBy({
          by: ["city"],
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 10
        })
      ]);

      return {
        statistik: {
          totaltAntalFöretag: totalCount,
          fördelningPerBransch: byNiche.map(n => ({
            bransch: n.impactNiche || "Ej angiven",
            antal: n._count.id
          })),
          fördelningPerStad: byCity.map(c => ({
            stad: c.city || "Ej angiven",
            antal: c._count.id
          }))
        }
      };
    }

    default:
      return { error: `Okänd action: ${action}` };
  }
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
      case "search_persons":
        result = await executeSearchPersons(
          input.query as string,
          input.roleType as string | undefined,
          (input.limit as number) || 10
        );
        break;
      case "compare_companies":
        result = await executeCompareCompanies(
          input.orgNumbers as string[],
          input.metrics as string[] | undefined
        );
        break;
      case "analyze_industry":
        result = await executeAnalyzeIndustry(
          input.industry as string,
          (input.limit as number) || 5
        );
        break;
      case "search_protocols":
        result = await executeSearchProtocols(
          input.query as string | undefined,
          input.eventType as string | undefined,
          (input.limit as number) || 10
        );
        break;
      case "match_investors":
        result = await executeMatchInvestors(
          input.orgNumber as string,
          (input.investorType as string) || "all"
        );
        break;
      case "manage_watchlist":
        result = await executeManageWatchlist(
          input.action as string,
          input.query as string | undefined,
          (input.limit as number) || 20
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

Du har tillgång till följande verktyg:

**Databasverktyg:**
- **search_companies**: Sök företag i bevakningslistan (1200+ svenska impactbolag). Sökbar på namn, stad, bransch.
- **get_company_details**: Hämta fullständig info om ett företag (ekonomi, ledning, finansiering, kungörelser, nyheter).
- **search_announcements**: Sök kungörelser från Bolagsverket (styrelseändringar, konkurser, nyemissioner mm).
- **get_news**: Hämta nyheter från RSS-flödet. Kan filtrera på sökord.
- **get_investors**: Sök VC-bolag och family offices i Sverige.
- **search_persons**: Sök efter personer - VD:ar, styrelsemedlemmar, grundare. Visa roller och företagskopplingar.
- **compare_companies**: Jämför nyckeltal mellan 2-5 företag sida vid sida.
- **analyze_industry**: Analysera en bransch - antal bolag, total omsättning, tillväxt, top performers.
- **search_protocols**: Sök i köpta protokoll från Bolagsverket med AI-analys (nyemissioner, styrelseändringar mm).
- **match_investors**: Hitta investerare som matchar ett företags bransch och profil.
- **manage_watchlist**: Hantera och sök i bevakningslistan, visa statistik.

**Webbsökning:**
- **web_search**: Sök på webben efter aktuella nyheter och information (begränsat till svenska affärstidningar).

**Arbetsflöde:**
1. Vid företagsfrågor: Börja med search_companies, använd sedan get_company_details för mer info.
2. Vid nyhetsfrågor: Använd get_news eller web_search för aktuella nyheter.
3. Vid investerar-frågor: Använd get_investors eller match_investors för att hitta passande investerare.
4. Vid personsökning: Använd search_persons med namn och eventuell rolltyp.
5. Vid jämförelser: Använd compare_companies med organisationsnummer.
6. Vid branschanalys: Använd analyze_industry med branschnamn (t.ex. "cleantech", "fintech").
7. Vid protokollfrågor: Använd search_protocols för att hitta köpta protokoll med AI-analys.
8. För bevakningslistan: Använd manage_watchlist för statistik och sökning.
9. Kombinera verktyg vid behov för att ge ett komplett svar.

**Format:**
- Svara alltid på svenska
- Var koncis men informativ
- Använd punktlistor för listor med data
- Presentera ekonomiska data tydligt
- Ange organisationsnummer när du nämner specifika företag
- Vid webbsökningar, ange alltid källa och datum`;

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
