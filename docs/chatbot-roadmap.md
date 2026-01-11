# LoopDesk Chatbot - Roadmap

## Nuvarande Implementation (v1.1) - Uppdaterad 2026-01-09

### Nytt i v1.1
- **Web Search** - Anthropic server-side tool för webbsökning (begränsat till svenska affärstidningar)
- **search_persons** - Sök VD:ar, styrelsemedlemmar, grundare
- **compare_companies** - Jämför 2-5 företag sida vid sida
- **analyze_industry** - Aggregerad branschanalys med top performers

---

## Implementation (v1.0)

### Backend (`/api/chat/route.ts`)

**5 verktyg för databasåtkomst:**

| Verktyg | Beskrivning | Input |
|---------|-------------|-------|
| `search_companies` | Sök i bevakningslistan (200+ bolag) | `query`, `limit` |
| `get_company_details` | Fullständig företagsinfo inkl kungörelser & nyheter | `orgNumber` |
| `search_announcements` | Kungörelser från Bolagsverket | `query`, `limit` |
| `get_news` | Nyheter från RSS-flödet | `query`, `sourceId`, `limit` |
| `get_investors` | VC-bolag och family offices | `type`, `query`, `limit` |

**Tekniska detaljer:**
- Anthropic SDK med Claude Sonnet 4.5
- Tool use loop för flera verktygsanrop i sekvens
- SSE-streaming för realtidssvar
- Max 2048 tokens per svar
- Prisma för databasåtkomst

### Frontend (`ChatPanel.tsx`)

- Slide-in panel från höger
- Tool indicators (visar vilka verktyg som används)
- Realtids-loading per verktyg ("Söker företag...")
- Snabbfråge-knappar
- Enkel markdown-rendering
- Keyboard shortcuts (Enter för skicka, ESC för stäng)

---

## Förslag på Förbättringar

### 1. Person-sökning
**Prioritet:** Hög | **Komplexitet:** Låg

Lägg till verktyg för att söka efter personer (VD:ar, styrelsemedlemmar, grundare).

```typescript
{
  name: "search_persons",
  description: "Sök efter personer - VD:ar, styrelsemedlemmar, grundare, investerare",
  input_schema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Namn eller titel" },
      role: { type: "string", enum: ["CEO", "CHAIRMAN", "BOARD_MEMBER", "FOUNDER", "INVESTOR", "all"] },
      limit: { type: "number" }
    },
    required: ["query"]
  }
}
```

**Användningsfall:**
- "Vem är VD för Northvolt?"
- "Vilka styrelseposter har Johan Dennelind?"
- "Visa grundare inom cleantech"

---

### 2. Företagsjämförelse
**Prioritet:** Hög | **Komplexitet:** Medium

Jämför två eller flera företag sida vid sida.

```typescript
{
  name: "compare_companies",
  description: "Jämför nyckeltal mellan 2-5 företag",
  input_schema: {
    type: "object",
    properties: {
      orgNumbers: {
        type: "array",
        items: { type: "string" },
        minItems: 2,
        maxItems: 5,
        description: "Lista med organisationsnummer"
      },
      metrics: {
        type: "array",
        items: { type: "string", enum: ["revenue", "profit", "employees", "funding", "growth"] }
      }
    },
    required: ["orgNumbers"]
  }
}
```

**Användningsfall:**
- "Jämför Northvolt och Einride"
- "Vilken har störst tillväxt: H2 Green Steel, Hybrit eller Ovako?"

---

### 3. Branschanalys
**Prioritet:** Hög | **Komplexitet:** Medium

Aggregerad analys för en hel bransch/nisch.

```typescript
{
  name: "analyze_industry",
  description: "Analysera en bransch - antal bolag, total omsättning, tillväxt, top performers",
  input_schema: {
    type: "object",
    properties: {
      industry: { type: "string", description: "Bransch/nisch (t.ex. 'cleantech', 'fintech', 'carbon removal')" },
      metrics: { type: "array", items: { type: "string" } }
    },
    required: ["industry"]
  }
}
```

**Användningsfall:**
- "Hur ser cleantech-branschen ut i Sverige?"
- "Vilka carbon removal-bolag växer snabbast?"

---

### 4. Protokoll- och dokumentsökning
**Prioritet:** Medium | **Komplexitet:** Låg

Sök i köpta protokoll från Bolagsverket.

```typescript
{
  name: "search_protocols",
  description: "Sök i protokoll från Bolagsverket (AI-analyserade)",
  input_schema: {
    type: "object",
    properties: {
      query: { type: "string" },
      eventType: { type: "string", enum: ["nyemission", "styrelseändring", "fusion", "all"] },
      fromDate: { type: "string", format: "date" },
      limit: { type: "number" }
    }
  }
}
```

**Användningsfall:**
- "Vilka nyemissioner har skett senaste månaden?"
- "Visa styrelseändringar för Klarna"

---

### 5. Investor-matchning
**Prioritet:** Medium | **Komplexitet:** Medium

Föreslå investerare som matchar ett företags profil.

```typescript
{
  name: "match_investors",
  description: "Hitta investerare som matchar ett företags bransch, fas och finansieringsbehov",
  input_schema: {
    type: "object",
    properties: {
      orgNumber: { type: "string" },
      investorType: { type: "string", enum: ["vc", "family_office", "all"] },
      fundingStage: { type: "string", enum: ["seed", "series_a", "series_b", "growth"] }
    },
    required: ["orgNumber"]
  }
}
```

**Användningsfall:**
- "Vilka VC:s skulle passa för Einride?"
- "Hitta family offices som investerar i foodtech"

---

### 6. Bevakningslist-integration
**Prioritet:** Medium | **Komplexitet:** Låg

Lägg till/ta bort företag från bevakningslistan direkt från chatten.

```typescript
{
  name: "manage_watchlist",
  description: "Lägg till eller ta bort företag från bevakningslistan",
  input_schema: {
    type: "object",
    properties: {
      action: { type: "string", enum: ["add", "remove", "list"] },
      orgNumber: { type: "string" },
      companyName: { type: "string" }
    },
    required: ["action"]
  }
}
```

**Användningsfall:**
- "Lägg till Northvolt i min bevakningslista"
- "Vilka bolag bevakar jag?"

---

### 7. Företags-timeline
**Prioritet:** Medium | **Komplexitet:** Medium

Visa viktiga händelser för ett företag över tid.

```typescript
{
  name: "get_company_timeline",
  description: "Visa tidslinje med viktiga händelser: finansieringsrundor, styrelseändringar, nyheter",
  input_schema: {
    type: "object",
    properties: {
      orgNumber: { type: "string" },
      fromDate: { type: "string", format: "date" },
      eventTypes: { type: "array", items: { type: "string" } }
    },
    required: ["orgNumber"]
  }
}
```

**Användningsfall:**
- "Visa Klarnas historia"
- "Vad har hänt med Northvolt senaste året?"

---

### 8. RSS-källhantering
**Prioritet:** Låg | **Komplexitet:** Låg

Visa och hantera RSS-källor.

```typescript
{
  name: "manage_feeds",
  description: "Visa, lägg till eller ta bort RSS-källor",
  input_schema: {
    type: "object",
    properties: {
      action: { type: "string", enum: ["list", "add", "remove", "stats"] },
      url: { type: "string" },
      name: { type: "string" }
    },
    required: ["action"]
  }
}
```

**Användningsfall:**
- "Vilka nyhetskällor har jag?"
- "Lägg till Breakit som källa"

---

### 9. Konversationsexport
**Prioritet:** Låg | **Komplexitet:** Medium

Exportera konversation eller data till markdown/PDF.

```typescript
{
  name: "export_data",
  description: "Exportera data eller konversation",
  input_schema: {
    type: "object",
    properties: {
      type: { type: "string", enum: ["conversation", "company_report", "comparison"] },
      format: { type: "string", enum: ["markdown", "json"] },
      orgNumber: { type: "string" }
    },
    required: ["type", "format"]
  }
}
```

**Användningsfall:**
- "Exportera vår konversation"
- "Skapa en rapport om Einride"

---

### 10. Web Search (framtida)
**Prioritet:** Hög | **Komplexitet:** Låg (när SDK stödjer det)

Lägg till Claudes inbyggda webbsökning för aktuella nyheter.

```typescript
// Aktiveras när beta-stöd finns
{
  type: "web_search_20250305",
  name: "web_search",
  allowed_domains: [
    "di.se", "svd.se", "dn.se", "breakit.se", "realtid.se",
    "affarsvarlden.se", "va.se", "nyteknik.se"
  ]
}
```

**Användningsfall:**
- "Vad skrivs om Klarna just nu?"
- "Senaste nyheterna om svenska unicorns"

---

## Prioriteringsordning

### Fas 1 (Nästa sprint)
1. **Person-sökning** - Hög värde, låg komplexitet
2. **Företagsjämförelse** - Ofta efterfrågat
3. **Branschanalys** - Unikt värde

### Fas 2
4. **Protokoll-sökning** - Komplettera kungörelser
5. **Investor-matchning** - Affärsvärde
6. **Bevakningslist-integration** - UX-förbättring

### Fas 3
7. **Företags-timeline** - Visualisering
8. **RSS-källhantering** - Admin-funktion
9. **Konversationsexport** - Nice-to-have
10. **Web Search** - Väntar på SDK-stöd

---

## Tekniska överväganden

### Token-optimering
- Begränsa resultat med `limit` parameter
- Returnera endast relevanta fält
- Cacha frekventa förfrågningar

### Felhantering
- Graceful degradation om verktyg misslyckas
- Tydliga felmeddelanden på svenska
- Retry-logik för databasfel

### Säkerhet
- Validera alla inputs
- Rate limiting per användare
- Audit logging av tool use

### Framtida arkitektur
```
┌─────────────────────────────────────────────────┐
│                  ChatPanel.tsx                   │
│                  (Frontend)                      │
└─────────────────────┬───────────────────────────┘
                      │ SSE
                      ▼
┌─────────────────────────────────────────────────┐
│              /api/chat/route.ts                  │
│              (Tool Orchestration)                │
└─────────────────────┬───────────────────────────┘
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
    ┌─────────┐  ┌─────────┐  ┌─────────┐
    │ Prisma  │  │ Web     │  │ External│
    │ Tools   │  │ Search  │  │ APIs    │
    └─────────┘  └─────────┘  └─────────┘
         │
         ▼
    ┌──────────┐
    │ Supabase │
    │PostgreSQL│
    └──────────┘
```
