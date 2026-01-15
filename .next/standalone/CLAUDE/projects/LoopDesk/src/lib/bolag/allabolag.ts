import type {
  CompanyData,
  CompanyAddress,
  CompanyPerson,
  AnnualReport,
  AccountEntry,
  CompanyAnnouncement,
  CompanyIndustry,
  RegistryStatus,
  Shareholder,
  Trademark,
  Merger,
  Certificate,
  RelatedCompany,
  StatusRemark,
} from "./types";

const BASE_URL = "https://www.allabolag.se";

interface AllabolagRawData {
  props: {
    pageProps: {
      company: AllabolagCompany;
      trademarks?: {
        trademarks: AllabolagTrademark[];
      };
      relatedCompanies?: {
        companies: AllabolagRelatedCompany[];
      };
    };
    i18n?: {
      initialStore?: {
        sv?: {
          common?: {
            AccountingFigures?: {
              figures?: {
                SE?: Record<string, string>;
              };
            };
          };
        };
      };
    };
  };
}

interface AllabolagTrademark {
  name: string;
  registrationNumber?: string;
  status?: string;
  classes?: string[];
  type?: string;
  expirationDate?: string;
}

interface AllabolagRelatedCompany {
  orgnr: string;
  name: string;
  relation?: string;
}

interface AllabolagRole {
  type?: string;
  name: string;
  role: string;
  birthDate?: string;
  id?: string;
  businessPerson?: boolean;
}

interface AllabolagRoleGroup {
  name: string;
  roles: AllabolagRole[];
}

interface AllabolagShareholder {
  name: string;
  orgnr?: string;
  ownership?: number;
  votes?: number;
  country?: string;
}

interface AllabolagMerger {
  date: string;
  type: string;
  description?: string;
  otherCompanyName?: string;
  otherCompanyOrgnr?: string;
}

interface AllabolagCompany {
  name: string;
  legalName: string;
  orgnr: string;
  companyType: { code: string; name: string; parentCode?: string };
  status: { status: string; statusCode: string; statusDate?: string };
  registrationDate?: string;
  foundationDate?: string;
  foundationYear?: string;
  purpose?: string;
  tagLine?: string;
  description?: string;
  revenue?: string;
  profit?: string;
  employees?: string;
  numberOfEmployees?: string;
  shareCapital?: number;
  estimatedTurnover?: string;
  turnoverYear?: number;
  currency?: string;
  postalAddress?: { addressLine?: string; boxAddressLine?: string; zipCode?: string; postPlace?: string };
  visitorAddress?: { addressLine?: string; boxAddressLine?: string; zipCode?: string; postPlace?: string };
  legalPostalAddress?: { addressLine?: string; boxAddressLine?: string; zipCode?: string; postPlace?: string };
  legalVisitorAddress?: { addressLine?: string; boxAddressLine?: string; zipCode?: string; postPlace?: string };
  location?: { county?: string; municipality?: string; countryPart?: string; coordinates?: number[] };
  domicile?: { municipality?: string; county?: string };
  industries?: { code: string; name: string; description?: string }[];
  currentIndustry?: { code: string; name: string };
  naceIndustries?: string[];
  roles?: {
    numberOfRoles?: number;
    chairman?: AllabolagRole;
    manager?: AllabolagRole;
    roleGroups?: AllabolagRoleGroup[];
  };
  contactPerson?: AllabolagRole;
  signatories?: string[];
  procuration?: string[];
  companyAccounts?: AllabolagAccount[];
  corporateAccounts?: AllabolagAccount[];
  announcements?: { id: string; date: string; text: string; type: string }[];
  mortgages?: boolean;
  paymentRemarks?: boolean;
  registeredForVat?: boolean;
  registeredForVatDescription?: string;
  marketingProtection?: boolean;
  gaselle?: boolean;
  registeredForPayrollTax?: boolean;
  registeredForNav?: boolean;
  registryStatusEntries?: { label: string; value: boolean }[];
  phone?: string;
  phone2?: string;
  mobile?: string;
  faxNumber?: string;
  email?: string;
  homePage?: string;
  socialMediaLinks?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  corporateStructure?: {
    numberOfCompanies?: number;
    numberOfSubsidiaries?: number;
    parentCompanyName?: string;
    parentCompanyOrganisationNumber?: string;
    parentCompanyCountryCode?: string;
  };
  shareholders?: AllabolagShareholder[];
  totalShareholders?: number;
  shareholdersLastUpdatedDate?: string;
  businessUnits?: { businessUnitId: string; name: string; businessUnitType: string }[];
  mergers?: AllabolagMerger[];
  certificates?: { name: string; issuer?: string; validUntil?: string }[];
  alternativeNames?: string[];
  // New fields
  statusRemarks?: { code?: string; desc: string; date: string }[];
  vehicles?: { numberOfVehicles: number };
  rating?: string;
}

interface AllabolagAccount {
  year: number;
  periodStart: string;
  periodEnd: string;
  currency: string;
  accounts: { code: string; amount: string | null }[];
}

function parseAmount(value: string | null): number | null {
  if (value === null || value === "-" || value === "") return null;
  const cleaned = value.replace(/,/g, ".").replace(/\s/g, "");
  if (cleaned.endsWith("%")) {
    return parseFloat(cleaned.replace("%", ""));
  }
  return parseFloat(cleaned);
}

function parseAddress(addr?: {
  addressLine?: string;
  boxAddressLine?: string;
  zipCode?: string;
  postPlace?: string;
}): CompanyAddress | undefined {
  if (!addr) return undefined;
  return {
    street: addr.addressLine || undefined,
    boxAddress: addr.boxAddressLine || undefined,
    zipCode: addr.zipCode || undefined,
    city: addr.postPlace || undefined,
    country: "Sverige",
  };
}

function parsePerson(person?: AllabolagRole): CompanyPerson | undefined {
  if (!person) return undefined;
  return {
    name: person.name,
    role: person.role,
    birthDate: person.birthDate,
    id: person.id,
    type: person.type as "Person" | "Company" | undefined,
    businessPerson: person.businessPerson,
  };
}

function parseRoleGroup(
  roleGroups: AllabolagRoleGroup[] | undefined,
  groupName: string
): CompanyPerson[] | undefined {
  if (!roleGroups) return undefined;

  const group = roleGroups.find((g) => g.name === groupName);
  if (!group) return undefined;

  return group.roles.map((r) => ({
    name: r.name,
    role: r.role,
    birthDate: r.birthDate,
    id: r.id,
    type: r.type as "Person" | "Company" | undefined,
    businessPerson: r.businessPerson,
  }));
}

function parseAccounts(
  accounts: AllabolagAccount[] | undefined,
  translations: Record<string, string>
): AnnualReport[] {
  if (!accounts) return [];

  return accounts.map((acc) => ({
    year: acc.year,
    periodStart: acc.periodStart,
    periodEnd: acc.periodEnd,
    currency: acc.currency || "SEK",
    accounts: acc.accounts.map(
      (a): AccountEntry => ({
        code: a.code,
        codeName: translations[a.code] || undefined,
        amount: parseAmount(a.amount),
      })
    ),
  }));
}

function extractKeyFigures(accounts: AllabolagAccount[] | undefined): NonNullable<CompanyData["financials"]>["keyFigures"] | undefined {
  if (!accounts || accounts.length === 0) return undefined;

  const latest = accounts[0];
  const getAmount = (code: string): number | undefined => {
    const entry = latest.accounts.find((a) => a.code === code);
    if (!entry || entry.amount === null) return undefined;
    return parseAmount(entry.amount) ?? undefined;
  };

  return {
    ebitda: getAmount("EBITDA"),
    returnOnEquity: getAmount("avk_eget_kapital"),
    returnOnAssets: getAmount("avk_totalt_kapital"),
    growthRate: getAmount("TR"),
    salariesBoard: getAmount("loner_styrelse_vd"),
    salariesOther: getAmount("loner_ovriga"),
    longTermDebt: getAmount("summa_langfristiga_skulder"),
    financialAssets: getAmount("summa_finansiella_anltillg"),
  };
}

interface AllabolagSearchResult {
  orgnr: string;
  name: string;
  legalName?: string;
  companyType?: { name: string };
  status?: { status: string };
  location?: { municipality?: string };
}

/**
 * Search for companies by name on Allabolag
 */
export async function searchAllabolag(query: string): Promise<AllabolagSearchResult[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/what/${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      return [];
    }

    const html = await response.text();

    const match = html.match(
      /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
    );
    if (!match) {
      return [];
    }

    const rawData = JSON.parse(match[1]);
    const searchStore = rawData.props?.pageProps?.hydrationData?.searchStore;
    const companiesData = searchStore?.companies?.companies || [];

    return companiesData.slice(0, 20).map((r: AllabolagSearchResult) => ({
      orgnr: r.orgnr,
      name: r.name || r.legalName || "",
      companyType: r.companyType?.name,
      status: r.status?.status,
      location: r.location?.municipality,
    }));
  } catch (error) {
    console.error("Error searching Allabolag:", error);
    return [];
  }
}

export async function fetchFromAllabolag(orgNr: string): Promise<CompanyData | null> {
  const cleanOrgNr = orgNr.replace("-", "");

  try {
    const response = await fetch(`${BASE_URL}/${cleanOrgNr}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Allabolag returned ${response.status}`);
    }

    const html = await response.text();

    const match = html.match(
      /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
    );
    if (!match) {
      throw new Error("Could not find __NEXT_DATA__ in response");
    }

    const rawData: AllabolagRawData = JSON.parse(match[1]);
    const company = rawData.props.pageProps.company;
    const translations =
      rawData.props.i18n?.initialStore?.sv?.common?.AccountingFigures?.figures
        ?.SE || {};

    // Parse industries
    const industries: CompanyIndustry[] = (company.industries || []).map(
      (ind) => ({
        code: ind.code,
        name: ind.name,
        description: ind.description,
      })
    );

    if (company.currentIndustry && !industries.find(i => i.code === company.currentIndustry?.code)) {
      industries.unshift({
        code: company.currentIndustry.code,
        name: company.currentIndustry.name,
      });
    }

    // Parse announcements
    const announcements: CompanyAnnouncement[] = (
      company.announcements || []
    ).map((ann) => ({
      id: ann.id,
      date: ann.date,
      text: ann.text,
      type: ann.type,
    }));

    // Parse registry status
    const registryStatus: RegistryStatus[] = (company.registryStatusEntries || []).map((entry) => ({
      label: entry.label,
      value: entry.value,
    }));

    // Parse shareholders
    const shareholders: Shareholder[] = (company.shareholders || []).map((sh) => ({
      name: sh.name,
      orgNr: sh.orgnr,
      ownership: sh.ownership,
      votes: sh.votes,
      country: sh.country,
    }));

    // Parse trademarks
    const trademarks: Trademark[] = (rawData.props.pageProps.trademarks?.trademarks || []).map((tm) => ({
      name: tm.name,
      registrationNumber: tm.registrationNumber,
      status: tm.status,
      classes: tm.classes,
      type: tm.type,
      expirationDate: tm.expirationDate,
    }));

    // Parse status remarks (e.g. bankruptcy, liquidation)
    const statusRemarks: StatusRemark[] = (company.statusRemarks || []).map((sr) => ({
      code: sr.code,
      description: sr.desc,
      date: sr.date,
    }));

    // Parse mergers
    const mergers: Merger[] = (company.mergers || []).map((m) => ({
      date: m.date,
      type: m.type,
      description: m.description,
      otherCompanyName: m.otherCompanyName,
      otherCompanyOrgNr: m.otherCompanyOrgnr,
    }));

    // Parse certificates
    const certificates: Certificate[] = (company.certificates || []).map((c) => ({
      name: c.name,
      issuer: c.issuer,
      validUntil: c.validUntil,
    }));

    // Parse related companies
    const relatedCompanies: RelatedCompany[] = (rawData.props.pageProps.relatedCompanies?.companies || []).map((rc) => ({
      orgNr: rc.orgnr,
      name: rc.name,
      relation: rc.relation,
    }));

    // Build company data
    const data: CompanyData = {
      basic: {
        orgNr: company.orgnr,
        name: company.name,
        legalName: company.legalName,
        companyType: {
          code: company.companyType?.code || "",
          name: company.companyType?.name || "",
          parentCode: company.companyType?.parentCode,
        },
        status: {
          active: company.status?.statusCode === "ACTIVE",
          status: company.status?.status || "",
          statusDate: company.status?.statusDate,
        },
        registrationDate: company.registrationDate,
        foundationDate: company.foundationDate,
        foundationYear: company.foundationYear,
        purpose: company.purpose,
        tagLine: company.tagLine || undefined,
        description: company.description || undefined,
      },
      postalAddress: parseAddress(company.postalAddress),
      visitorAddress: parseAddress(company.visitorAddress),
      legalPostalAddress: parseAddress(company.legalPostalAddress),
      legalVisitorAddress: parseAddress(company.legalVisitorAddress),
      contact: {
        phone: company.phone || undefined,
        phone2: company.phone2 || undefined,
        mobile: company.mobile || undefined,
        fax: company.faxNumber || undefined,
        email: company.email || undefined,
        website: company.homePage || undefined,
        socialMedia: company.socialMediaLinks
          ? {
              facebook: company.socialMediaLinks.facebook,
              linkedin: company.socialMediaLinks.linkedin,
              twitter: company.socialMediaLinks.twitter,
              instagram: company.socialMediaLinks.instagram,
              youtube: company.socialMediaLinks.youtube,
            }
          : undefined,
      },
      location: company.location
        ? {
            county: company.location.county,
            municipality: company.location.municipality,
            countryPart: company.location.countryPart,
            coordinates: company.location.coordinates as [number, number],
          }
        : undefined,
      domicile: company.domicile
        ? {
            municipality: company.domicile.municipality,
            county: company.domicile.county,
          }
        : undefined,
      industries,
      naceIndustries: company.naceIndustries,
      people: {
        chairman: parsePerson(company.roles?.chairman),
        ceo: parsePerson(company.roles?.manager),
        contactPerson: parsePerson(company.contactPerson),
        boardMembers: parseRoleGroup(company.roles?.roleGroups, "Board"),
        management: parseRoleGroup(company.roles?.roleGroups, "Management"),
        auditors: parseRoleGroup(company.roles?.roleGroups, "Revision"),
        otherRoles: parseRoleGroup(company.roles?.roleGroups, "Other"),
        signatories: company.signatories,
        procuration: company.procuration,
        numberOfRoles: company.roles?.numberOfRoles,
      },
      shareholders: {
        list: shareholders.length > 0 ? shareholders : undefined,
        totalCount: company.totalShareholders,
        lastUpdated: company.shareholdersLastUpdatedDate,
      },
      financials: {
        revenue: company.revenue,
        profit: company.profit,
        employees: company.employees,
        numberOfEmployees: company.numberOfEmployees,
        shareCapital: company.shareCapital,
        estimatedTurnover: company.estimatedTurnover,
        turnoverYear: company.turnoverYear,
        annualReports: parseAccounts(company.companyAccounts, translations),
        corporateAccounts: parseAccounts(company.corporateAccounts, translations),
        keyFigures: extractKeyFigures(company.companyAccounts),
      },
      flags: {
        mortgages: company.mortgages,
        paymentRemarks: company.paymentRemarks,
        vatRegistered: company.registeredForVat,
        vatDescription: company.registeredForVatDescription,
        marketingProtection: company.marketingProtection,
        gaselle: company.gaselle,
        registeredForPayrollTax: company.registeredForPayrollTax,
        registeredForNav: company.registeredForNav,
      },
      statusRemarks: statusRemarks.length > 0 ? statusRemarks : undefined,
      vehicles: company.vehicles?.numberOfVehicles ? company.vehicles : undefined,
      rating: company.rating || undefined,
      registryStatus,
      announcements,
      corporateStructure: company.corporateStructure
        ? {
            numberOfCompanies: company.corporateStructure.numberOfCompanies,
            numberOfSubsidiaries: company.corporateStructure.numberOfSubsidiaries,
            parentCompanyName: company.corporateStructure.parentCompanyName,
            parentCompanyOrgNr: company.corporateStructure.parentCompanyOrganisationNumber,
            parentCompanyCountry: company.corporateStructure.parentCompanyCountryCode,
          }
        : undefined,
      businessUnits: (company.businessUnits || []).map((bu) => ({
        id: bu.businessUnitId,
        name: bu.name,
        type: bu.businessUnitType,
      })),
      trademarks: trademarks.length > 0 ? trademarks : undefined,
      mergers: mergers.length > 0 ? mergers : undefined,
      certificates: certificates.length > 0 ? certificates : undefined,
      relatedCompanies: relatedCompanies.length > 0 ? relatedCompanies : undefined,
      alternativeNames: company.alternativeNames?.length ? company.alternativeNames : undefined,
      // annualReportLinks are fetched from Bolagsverket API, not Allabolag
      sources: {
        allabolag: true,
      },
    };

    return data;
  } catch (error) {
    console.error("Error fetching from Allabolag:", error);
    throw error;
  }
}
