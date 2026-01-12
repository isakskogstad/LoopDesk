"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Filter,
  X,
  MapPin,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  Users,
  ExternalLink,
  Briefcase,
  Landmark,
  Database,
  Lock,
  ArrowRight,
  Loader2,
  Globe,
  Linkedin,
  Mail,
  Phone,
  Map,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatOrgNr } from "@/lib/utils";
import styles from "./investors.module.css";

// Types
interface FamilyOffice {
  id: string;
  orgNumber: string | null;
  name: string;
  family: string | null;
  impactNiche: string | null;
  portfolioCompanies: string | null;
  description: string | null;
  familyStory: string | null;
  founded: number | null;
  keyPeople: string | null;
  coInvestors: string | null;
  region: string | null;
  website: string | null;
  linkedin: string | null;
  email: string | null;
  phone: string | null;
  hasLogo: boolean;
}

interface VCCompany {
  id: string;
  orgNumber: string | null;
  name: string;
  type: string | null;
  impactNiche: string | null;
  portfolioCompanies: string | null;
  description: string | null;
  history: string | null;
  portfolioExamples: string | null;
  notableDeals: string | null;
  website: string | null;
  office: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  readMoreUrl: string | null;
  sources: string | null;
  hasLogo: boolean;
}

interface CompanyOwner {
  orgNumber: string;
  entityName: string | null;
  entityType: string | null;
  percentage: number | null;
}

interface CompanyDirector {
  orgNumber: string;
  name: string | null;
  function: string | null;
}

interface BeneficialOwnerData {
  orgNumber: string;
  entityName: string | null;
  percentageVotesMin: number | null;
  percentageVotesMax: number | null;
}

interface WatchedCompany {
  id: string;
  orgNumber: string;
  name: string;
  hasLogo: boolean;
  impactNiche?: string | null;
  city?: string | null;
  ceo?: string | null;
  startYear?: string | null;
  fundraising?: string | null;
  totalFunding?: string | null;
  latestFundingRound?: string | null;
  latestFundingDate?: string | null;
  latestValuation?: string | null;
  turnover2024?: string | null;
  profit2024?: string | null;
  turnover2023?: string | null;
  profit2023?: string | null;
  growth2023to2024?: string | null;
  largestOwners?: string | null;
  totalFundingNum?: number | null;
  latestValuationNum?: number | null;
  turnover2024Num?: number | null;
  profit2024Num?: number | null;
  growthNum?: number | null;
  legalName?: string | null;
  companyType?: string | null;
  status?: string | null;
  registrationDate?: string | null;
  chairman?: string | null;
  employees?: number | null;
  address?: string | null;
  postalCode?: string | null;
  municipality?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  sniCode?: string | null;
  sniDescription?: string | null;
  paymentRemarks?: boolean | null;
  fSkatt?: boolean | null;
  momsRegistered?: boolean | null;
  parentCompany?: string | null;
  subsidiaryCount?: number | null;
  shareCapital?: number | null;
  lastEnriched?: string | null;
  enrichmentError?: string | null;
  // Enriched data from Eivora
  owners?: CompanyOwner[];
  directors?: CompanyDirector[];
  beneficialOwners?: BeneficialOwnerData[];
  ownerCount?: number;
  directorCount?: number;
}

interface FilterOption {
  name: string | null;
  count: number;
}

type DatabaseType = "family-offices" | "vc-databas" | "investors" | null;
type SortField = "name" | "impactNiche" | "city" | "turnover2024Num" | "profit2024Num" | "latestValuationNum" | "totalFundingNum" | "growthNum" | "startYear" | "employees";

// Database definitions with Impact Loop descriptions
const databases = [
  {
    id: "family-offices" as const,
    title: "Family Offices",
    description: "Exklusivt för Impact Loops Builder- och Investor-medlemmar. Ta del av hela databasen över Sveriges family office-investerarbolag som investerar i impact.",
    icon: Landmark,
    badge: "Builder & Investor",
  },
  {
    id: "vc-databas" as const,
    title: "VC-databas",
    description: "Exklusivt för Impact Loops Builder- och Investor-medlemmar. Databas med Sveriges riskkapitalbolag som investerar i impact – och vilka nischer.",
    icon: Briefcase,
    badge: "Builder & Investor",
  },
  {
    id: "investors" as const,
    title: "Impact-bolag",
    description: "Exklusivt för Impact Loops Investor-medlemmar. 1 200 impact-bolag med tillhörande data – samt regelbundet dealflow och vilka bolag som söker kapital.",
    icon: Database,
    badge: "Investor",
  },
];

// Niche color palette - subtle, professional colors
const nicheColors = [
  { bg: "rgba(59, 130, 246, 0.12)", text: "#3b82f6" },   // blue
  { bg: "rgba(16, 185, 129, 0.12)", text: "#10b981" },   // emerald
  { bg: "rgba(139, 92, 246, 0.12)", text: "#8b5cf6" },   // violet
  { bg: "rgba(245, 158, 11, 0.12)", text: "#f59e0b" },   // amber
  { bg: "rgba(236, 72, 153, 0.12)", text: "#ec4899" },   // pink
  { bg: "rgba(6, 182, 212, 0.12)", text: "#06b6d4" },    // cyan
  { bg: "rgba(249, 115, 22, 0.12)", text: "#f97316" },   // orange
  { bg: "rgba(34, 197, 94, 0.12)", text: "#22c55e" },    // green
  { bg: "rgba(168, 85, 247, 0.12)", text: "#a855f7" },   // purple
  { bg: "rgba(20, 184, 166, 0.12)", text: "#14b8a6" },   // teal
];

function getNicheColor(niche: string | null | undefined): { bg: string; text: string } {
  if (!niche) return { bg: "var(--secondary)", text: "var(--muted-foreground)" };

  // Simple hash to get consistent color per niche
  let hash = 0;
  const str = niche.toLowerCase().trim();
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % nicheColors.length;
  return nicheColors[index];
}

// Helper functions
function formatSek(value: number | null | undefined): string {
  if (!value && value !== 0) return "-";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} mdkr`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} mkr`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(0)} tkr`;
  return `${value.toLocaleString("sv-SE")} kr`;
}

function formatGrowth(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(0)}%`;
}


export default function InvestorDatabasesPage() {
  const router = useRouter();
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseType>(null);

  // Family Offices state
  const [familyOffices, setFamilyOffices] = useState<FamilyOffice[]>([]);
  const [foLoading, setFoLoading] = useState(false);
  const [foSearch, setFoSearch] = useState("");
  const [foSearchInput, setFoSearchInput] = useState("");
  const [foTotal, setFoTotal] = useState(0);
  const [foExpandedId, setFoExpandedId] = useState<string | null>(null);
  const [foNiches, setFoNiches] = useState<{ name: string; count: number }[]>([]);
  const [foSelectedNiche, setFoSelectedNiche] = useState<string | null>(null);

  // VC Companies state
  const [vcCompanies, setVcCompanies] = useState<VCCompany[]>([]);
  const [vcLoading, setVcLoading] = useState(false);
  const [vcSearch, setVcSearch] = useState("");
  const [vcSearchInput, setVcSearchInput] = useState("");
  const [vcTotal, setVcTotal] = useState(0);
  const [vcExpandedId, setVcExpandedId] = useState<string | null>(null);
  const [vcNiches, setVcNiches] = useState<{ name: string; count: number }[]>([]);
  const [vcSelectedNiche, setVcSelectedNiche] = useState<string | null>(null);

  // Watched companies (investors) state
  const [companies, setCompanies] = useState<WatchedCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<SortField>("turnover2024Num");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [niches, setNiches] = useState<FilterOption[]>([]);
  const [cities, setCities] = useState<FilterOption[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const INITIAL_LIMIT = 30;
  const LOAD_MORE_LIMIT = 20;

  // Fetch Family Offices
  const fetchFamilyOffices = useCallback(async () => {
    setFoLoading(true);
    try {
      const params = new URLSearchParams();
      if (foSearch) params.set("q", foSearch);
      if (foSelectedNiche) params.set("niche", foSelectedNiche);

      const res = await fetch(`/api/investors/family-offices?${params}`);
      if (res.ok) {
        const data = await res.json();
        setFamilyOffices(data.familyOffices);
        setFoTotal(data.total);
        if (data.filters?.niches) {
          setFoNiches(data.filters.niches);
        }
      }
    } catch (error) {
      console.error("Failed to fetch family offices:", error);
    } finally {
      setFoLoading(false);
    }
  }, [foSearch, foSelectedNiche]);

  // Fetch VC Companies
  const fetchVcCompanies = useCallback(async () => {
    setVcLoading(true);
    try {
      const params = new URLSearchParams();
      if (vcSearch) params.set("q", vcSearch);
      if (vcSelectedNiche) params.set("niche", vcSelectedNiche);

      const res = await fetch(`/api/investors/vc?${params}`);
      if (res.ok) {
        const data = await res.json();
        setVcCompanies(data.vcCompanies);
        setVcTotal(data.total);
        if (data.filters?.niches) {
          setVcNiches(data.filters.niches);
        }
      }
    } catch (error) {
      console.error("Failed to fetch VC companies:", error);
    } finally {
      setVcLoading(false);
    }
  }, [vcSearch, vcSelectedNiche]);

  // Fetch Watched Companies
  const fetchCompanies = useCallback(async (reset = false) => {
    if (reset) {
      setIsLoading(true);
      setPage(1);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const currentPage = reset ? 1 : page;
      const limit = reset ? INITIAL_LIMIT : LOAD_MORE_LIMIT;
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(limit),
        sortBy,
        sortOrder,
      });
      if (search) params.set("q", search);
      if (selectedNiche) params.set("impactNiche", selectedNiche);
      if (selectedCity) params.set("city", selectedCity);

      const res = await fetch(`/api/bevakning?${params}`);
      if (res.ok) {
        const data = await res.json();

        if (reset) {
          setCompanies(data.companies);
          setPage(2);
        } else {
          setCompanies(prev => [...prev, ...data.companies]);
          setPage(prev => prev + 1);
        }

        setTotal(data.total);
        setHasMore(data.companies.length === limit && companies.length + data.companies.length < data.total);

        if (data.filters?.impactNiches) {
          setNiches(data.filters.impactNiches);
        }
        if (data.filters?.cities) {
          setCities(data.filters.cities);
        }
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [page, search, sortBy, sortOrder, selectedNiche, selectedCity, companies.length]);

  // Load data based on selected database
  useEffect(() => {
    if (selectedDatabase === "family-offices") {
      fetchFamilyOffices();
    }
  }, [selectedDatabase, foSearch, foSelectedNiche, fetchFamilyOffices]);

  useEffect(() => {
    if (selectedDatabase === "vc-databas") {
      fetchVcCompanies();
    }
  }, [selectedDatabase, vcSearch, vcSelectedNiche, fetchVcCompanies]);

  useEffect(() => {
    if (selectedDatabase === "investors") {
      fetchCompanies(true);
    }
  }, [search, sortBy, sortOrder, selectedNiche, selectedCity, selectedDatabase]);

  // Infinite scroll observer
  useEffect(() => {
    if (selectedDatabase !== "investors") return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          fetchCompanies(false);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, isLoadingMore, fetchCompanies, selectedDatabase]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder(field === "name" || field === "impactNiche" || field === "city" ? "asc" : "desc");
    }
  };

  const handleCompanyClick = (orgNumber: string) => {
    router.push(`/bolag/${orgNumber}`);
  };

  const clearAllFilters = () => {
    setSelectedNiche(null);
    setSelectedCity(null);
    setSearch("");
    setSearchInput("");
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? <ChevronUp className={styles.sortIcon} /> : <ChevronDown className={styles.sortIcon} />;
  };

  const activeFilterCount = (selectedNiche ? 1 : 0) + (selectedCity ? 1 : 0);

  // ============================================
  // RENDER: Database Selector (Landing)
  // ============================================
  if (selectedDatabase === null) {
    return (
      <main className={styles.container}>
        <div className={styles.wrapper}>
          <header className={styles.header}>
            <div className={styles.headerTop}>
              <h1 className={styles.title}>Investerar-databaser</h1>
            </div>
            <p className={styles.subtitle}>
              Utforska Sveriges investerare och impact-bolag. Hitta rätt partner för din nästa affär.
            </p>
          </header>

          <div className={`${styles.selectorGrid} ${styles.fadeIn}`}>
            {databases.map((db) => (
              <button
                key={db.id}
                onClick={() => setSelectedDatabase(db.id)}
                className={styles.databaseCard}
              >
                <div className={styles.exclusiveBadge}>
                  <Lock size={10} />
                  {db.badge}
                </div>
                <div className={styles.cardIcon}>
                  <db.icon />
                </div>
                <h2 className={styles.cardTitle}>{db.title}</h2>
                <p className={styles.cardDescription}>{db.description}</p>
                <ArrowRight className={styles.cardArrow} size={20} />
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // ============================================
  // RENDER: Tab Content with Navigation
  // ============================================
  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>Investerar-databaser</h1>
          </div>

          {/* Tab Navigation */}
          <div className={styles.tabs}>
            {databases.map((db) => (
              <button
                key={db.id}
                onClick={() => setSelectedDatabase(db.id)}
                className={`${styles.tab} ${selectedDatabase === db.id ? styles.active : ""}`}
              >
                <db.icon className={styles.tabIcon} />
                <span>{db.title}</span>
                <span className={styles.tabCount}>
                  {db.id === "family-offices" && foTotal > 0 && `(${foTotal})`}
                  {db.id === "vc-databas" && vcTotal > 0 && `(${vcTotal})`}
                  {db.id === "investors" && total > 0 && `(${total})`}
                </span>
              </button>
            ))}
          </div>
        </header>

        {/* ============================================ */}
        {/* Family Offices Content */}
        {/* ============================================ */}
        {selectedDatabase === "family-offices" && (
          <div className={styles.slideIn}>
            {/* Search */}
            <div className={styles.searchSection}>
              <form
                onSubmit={(e) => { e.preventDefault(); setFoSearch(foSearchInput); }}
                className={styles.searchWrapper}
              >
                <Search className={styles.searchIcon} />
                <input
                  type="text"
                  value={foSearchInput}
                  onChange={(e) => setFoSearchInput(e.target.value)}
                  placeholder="Sök namn, familj eller portföljbolag..."
                  className={styles.searchInput}
                />
              </form>
            </div>

            {/* Filter chips */}
            {foNiches.length > 0 && !foSelectedNiche && (
              <div className={styles.filterChips}>
                {foNiches.slice(0, 10).map((niche) => (
                  <button
                    key={niche.name}
                    onClick={() => setFoSelectedNiche(niche.name)}
                    className={styles.chip}
                  >
                    {niche.name}
                  </button>
                ))}
              </div>
            )}

            {/* Active filters */}
            {foSelectedNiche && (
              <div className={styles.activeFilters}>
                <button
                  onClick={() => setFoSelectedNiche(null)}
                  className={styles.activeFilter}
                >
                  {foSelectedNiche}
                  <X />
                </button>
              </div>
            )}

            {/* Results count */}
            {foTotal > 0 && (
              <p className={styles.resultsCount}>
                <strong>{foTotal}</strong> family offices
              </p>
            )}

            {/* Data Table */}
            <div className={styles.dataTable}>
              {/* Table Header */}
              <div className={`${styles.tableHeader} ${styles.familyOffices}`}>
                <span>Namn</span>
                <span>Familj</span>
                <span>Impact-nisch</span>
                <span>Region</span>
                <span>Grundat</span>
                <span></span>
              </div>

              {/* Table Body */}
              {foLoading ? (
                <div className={styles.loadingState}>
                  <Loader2 className={styles.spinner} />
                </div>
              ) : familyOffices.length === 0 ? (
                <div className={styles.emptyState}>
                  <Landmark className={styles.emptyIcon} />
                  <p className={styles.emptyTitle}>Inga family offices hittades</p>
                  <p className={styles.emptyText}>Prova ett annat sökord eller ta bort filter</p>
                </div>
              ) : (
                <div>
                  {familyOffices.map((fo) => {
                    const isExpanded = foExpandedId === fo.id;
                    return (
                      <div key={fo.id}>
                        {/* Row */}
                        <button
                          onClick={() => setFoExpandedId(isExpanded ? null : fo.id)}
                          className={`${styles.tableRow} ${styles.familyOffices}`}
                        >
                          {/* Name */}
                          <div className={styles.tableCellName}>
                            <ChevronRight className={`${styles.expandIndicator} ${isExpanded ? styles.expanded : ""}`} />
                            <div className={styles.tableCellIcon}>
                              {fo.hasLogo ? (
                                <img
                                  src={`/logos/familyoffice/${fo.id}.png`}
                                  alt=""
                                  className={styles.tableCellLogo}
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                />
                              ) : (
                                <Landmark />
                              )}
                            </div>
                            <div className={styles.tableCellInfo}>
                              <div className={styles.tableCellTitle}>{fo.name}</div>
                              <div className={styles.tableCellSubtitle}>{fo.family || "Family Office"}</div>
                            </div>
                          </div>

                          {/* Family */}
                          <div className={styles.tableCell}>
                            <span className={styles.tableCellText}>{fo.family || "-"}</span>
                          </div>

                          {/* Niche */}
                          <div className={styles.tableCell}>
                            {fo.impactNiche ? (() => {
                              const niche = fo.impactNiche.split(",")[0].trim();
                              const color = getNicheColor(niche);
                              return (
                                <span
                                  className={styles.tableCellBadge}
                                  style={{ backgroundColor: color.bg, color: color.text }}
                                >
                                  {niche}
                                </span>
                              );
                            })() : (
                              <span className={styles.tableCellText}>-</span>
                            )}
                          </div>

                          {/* Region */}
                          <div className={styles.tableCell}>
                            <span className={styles.tableCellText}>{fo.region || "-"}</span>
                          </div>

                          {/* Founded */}
                          <div className={styles.tableCell}>
                            <span className={styles.tableCellText}>{fo.founded || "-"}</span>
                          </div>

                          {/* Links */}
                          <div className={styles.tableCell}>
                            {fo.website && (
                              <a
                                href={fo.website.startsWith("http") ? fo.website : `https://${fo.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.tableCellLink}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Globe />
                              </a>
                            )}
                          </div>
                        </button>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className={styles.rowDetails}>
                            <div className={styles.rowDetailsGrid}>
                              {/* Description */}
                              {fo.description && (
                                <div className={styles.rowDetailsSection}>
                                  <div className={styles.rowDetailsSectionTitle}>Om</div>
                                  <p className={styles.rowDetailsText}>{fo.description}</p>
                                </div>
                              )}

                              {/* Family Story */}
                              {fo.familyStory && (
                                <div className={styles.rowDetailsSection}>
                                  <div className={styles.rowDetailsSectionTitle}>Bakgrund</div>
                                  <p className={styles.rowDetailsText}>{fo.familyStory}</p>
                                </div>
                              )}

                              {/* Focus Areas */}
                              {fo.impactNiche && (
                                <div className={styles.rowDetailsSection}>
                                  <div className={styles.rowDetailsSectionTitle}>Investeringsfokus</div>
                                  <div className={styles.rowDetailsTags}>
                                    {fo.impactNiche.split(",").map((niche, i) => (
                                      <span key={i} className={styles.rowDetailsTag}>{niche.trim()}</span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Portfolio */}
                              {fo.portfolioCompanies && (
                                <div className={styles.rowDetailsSection}>
                                  <div className={styles.rowDetailsSectionTitle}>Portföljbolag</div>
                                  <p className={styles.rowDetailsText}>{fo.portfolioCompanies}</p>
                                </div>
                              )}

                              {/* Key People */}
                              {fo.keyPeople && (
                                <div className={styles.rowDetailsSection}>
                                  <div className={styles.rowDetailsSectionTitle}>Nyckelpersoner</div>
                                  <p className={styles.rowDetailsText}>{fo.keyPeople}</p>
                                </div>
                              )}

                              {/* Contact */}
                              <div className={styles.rowDetailsSection}>
                                <div className={styles.rowDetailsSectionTitle}>Kontakt</div>
                                <div className={styles.rowDetailsLinks}>
                                  {fo.website && (
                                    <a
                                      href={fo.website.startsWith("http") ? fo.website : `https://${fo.website}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={styles.rowDetailsLink}
                                    >
                                      <Globe /> Hemsida
                                    </a>
                                  )}
                                  {fo.linkedin && (
                                    <a href={fo.linkedin} target="_blank" rel="noopener noreferrer" className={styles.rowDetailsLink}>
                                      <Linkedin /> LinkedIn
                                    </a>
                                  )}
                                  {fo.email && (
                                    <a href={`mailto:${fo.email}`} className={styles.rowDetailsLink}>
                                      <Mail /> E-post
                                    </a>
                                  )}
                                  {fo.phone && (
                                    <a href={`tel:${fo.phone}`} className={styles.rowDetailsLink}>
                                      <Phone /> Ring
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* Se bolagsinfo button */}
                              {fo.orgNumber && (
                                <div className={styles.rowDetailsSection}>
                                  <div className={styles.rowDetailsSectionTitle}>Mer info</div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/bolag/${fo.orgNumber}`);
                                    }}
                                    className={styles.rowDetailsAction}
                                  >
                                    <Building2 /> Se bolagsinfo
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* VC Companies Content */}
        {/* ============================================ */}
        {selectedDatabase === "vc-databas" && (
          <div className={styles.slideIn}>
            {/* Search */}
            <div className={styles.searchSection}>
              <form
                onSubmit={(e) => { e.preventDefault(); setVcSearch(vcSearchInput); }}
                className={styles.searchWrapper}
              >
                <Search className={styles.searchIcon} />
                <input
                  type="text"
                  value={vcSearchInput}
                  onChange={(e) => setVcSearchInput(e.target.value)}
                  placeholder="Sök namn eller portföljbolag..."
                  className={styles.searchInput}
                />
              </form>
            </div>

            {/* Filter chips */}
            {vcNiches.length > 0 && !vcSelectedNiche && (
              <div className={styles.filterChips}>
                {vcNiches.slice(0, 10).map((niche) => (
                  <button
                    key={niche.name}
                    onClick={() => setVcSelectedNiche(niche.name)}
                    className={styles.chip}
                  >
                    {niche.name}
                  </button>
                ))}
              </div>
            )}

            {/* Active filters */}
            {vcSelectedNiche && (
              <div className={styles.activeFilters}>
                <button
                  onClick={() => setVcSelectedNiche(null)}
                  className={styles.activeFilter}
                >
                  {vcSelectedNiche}
                  <X />
                </button>
              </div>
            )}

            {/* Results count */}
            {vcTotal > 0 && (
              <p className={styles.resultsCount}>
                <strong>{vcTotal}</strong> VC-bolag
              </p>
            )}

            {/* Data Table */}
            <div className={styles.dataTable}>
              {/* Table Header */}
              <div className={`${styles.tableHeader} ${styles.vc}`}>
                <span>Namn</span>
                <span>Typ</span>
                <span>Impact-nisch</span>
                <span>Kontor</span>
                <span>Affärer</span>
                <span></span>
              </div>

              {/* Table Body */}
              {vcLoading ? (
                <div className={styles.loadingState}>
                  <Loader2 className={styles.spinner} />
                </div>
              ) : vcCompanies.length === 0 ? (
                <div className={styles.emptyState}>
                  <Briefcase className={styles.emptyIcon} />
                  <p className={styles.emptyTitle}>Inga VC-bolag hittades</p>
                  <p className={styles.emptyText}>Prova ett annat sökord eller ta bort filter</p>
                </div>
              ) : (
                <div>
                  {vcCompanies.map((vc) => {
                    const isExpanded = vcExpandedId === vc.id;
                    return (
                      <div key={vc.id}>
                        {/* Row */}
                        <button
                          onClick={() => setVcExpandedId(isExpanded ? null : vc.id)}
                          className={`${styles.tableRow} ${styles.vc}`}
                        >
                          {/* Name */}
                          <div className={styles.tableCellName}>
                            <ChevronRight className={`${styles.expandIndicator} ${isExpanded ? styles.expanded : ""}`} />
                            <div className={styles.tableCellIcon}>
                              {vc.hasLogo ? (
                                <img
                                  src={`/logos/vc/${vc.id}.png`}
                                  alt=""
                                  className={styles.tableCellLogo}
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                />
                              ) : (
                                <Briefcase />
                              )}
                            </div>
                            <div className={styles.tableCellInfo}>
                              <div className={styles.tableCellTitle}>{vc.name}</div>
                              <div className={styles.tableCellSubtitle}>{vc.type || "Venture Capital"}</div>
                            </div>
                          </div>

                          {/* Type */}
                          <div className={styles.tableCell}>
                            {vc.type ? (
                              <span className={styles.tableCellBadge}>{vc.type}</span>
                            ) : (
                              <span className={styles.tableCellText}>-</span>
                            )}
                          </div>

                          {/* Niche */}
                          <div className={styles.tableCell}>
                            {vc.impactNiche ? (() => {
                              const niche = vc.impactNiche.split(",")[0].trim();
                              const color = getNicheColor(niche);
                              return (
                                <span
                                  className={styles.tableCellBadge}
                                  style={{ backgroundColor: color.bg, color: color.text }}
                                >
                                  {niche}
                                </span>
                              );
                            })() : (
                              <span className={styles.tableCellText}>-</span>
                            )}
                          </div>

                          {/* Office */}
                          <div className={styles.tableCell}>
                            <span className={styles.tableCellText}>{vc.office || "-"}</span>
                          </div>

                          {/* Notable deals */}
                          <div className={styles.tableCell}>
                            <span className={styles.tableCellText}>
                              {vc.notableDeals && vc.notableDeals !== "—" ? vc.notableDeals.split(",")[0].trim() : "-"}
                            </span>
                          </div>

                          {/* Links */}
                          <div className={styles.tableCell}>
                            {vc.website && (
                              <a
                                href={vc.website.startsWith("http") ? vc.website : `https://${vc.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.tableCellLink}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Globe />
                              </a>
                            )}
                          </div>
                        </button>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className={styles.rowDetails}>
                            <div className={styles.rowDetailsGrid}>
                              {/* Description */}
                              {vc.description && (
                                <div className={styles.rowDetailsSection}>
                                  <div className={styles.rowDetailsSectionTitle}>Om</div>
                                  <p className={styles.rowDetailsText}>{vc.description}</p>
                                </div>
                              )}

                              {/* History */}
                              {vc.history && (
                                <div className={styles.rowDetailsSection}>
                                  <div className={styles.rowDetailsSectionTitle}>Bakgrund</div>
                                  <p className={styles.rowDetailsText}>{vc.history}</p>
                                </div>
                              )}

                              {/* Focus Areas */}
                              {vc.impactNiche && (
                                <div className={styles.rowDetailsSection}>
                                  <div className={styles.rowDetailsSectionTitle}>Investeringsfokus</div>
                                  <div className={styles.rowDetailsTags}>
                                    {vc.impactNiche.split(",").map((niche, i) => (
                                      <span key={i} className={styles.rowDetailsTag}>{niche.trim()}</span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Portfolio */}
                              {vc.portfolioCompanies && (
                                <div className={styles.rowDetailsSection}>
                                  <div className={styles.rowDetailsSectionTitle}>Portföljbolag</div>
                                  <p className={styles.rowDetailsText}>{vc.portfolioCompanies}</p>
                                </div>
                              )}

                              {/* Notable Deals */}
                              {vc.notableDeals && vc.notableDeals !== "—" && (
                                <div className={styles.rowDetailsSection}>
                                  <div className={styles.rowDetailsSectionTitle}>Notabla affärer</div>
                                  <p className={styles.rowDetailsText}>{vc.notableDeals}</p>
                                </div>
                              )}

                              {/* Contact */}
                              <div className={styles.rowDetailsSection}>
                                <div className={styles.rowDetailsSectionTitle}>Kontakt</div>
                                <div className={styles.rowDetailsLinks}>
                                  {vc.website && (
                                    <a
                                      href={vc.website.startsWith("http") ? vc.website : `https://${vc.website}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={styles.rowDetailsLink}
                                    >
                                      <Globe /> Hemsida
                                    </a>
                                  )}
                                  {vc.linkedin && (
                                    <a href={vc.linkedin} target="_blank" rel="noopener noreferrer" className={styles.rowDetailsLink}>
                                      <Linkedin /> LinkedIn
                                    </a>
                                  )}
                                  {vc.email && (
                                    <a href={`mailto:${vc.email}`} className={styles.rowDetailsLink}>
                                      <Mail /> E-post
                                    </a>
                                  )}
                                  {vc.phone && (
                                    <a href={`tel:${vc.phone}`} className={styles.rowDetailsLink}>
                                      <Phone /> Ring
                                    </a>
                                  )}
                                  {vc.readMoreUrl && (
                                    <a href={vc.readMoreUrl} target="_blank" rel="noopener noreferrer" className={styles.rowDetailsLink}>
                                      <ExternalLink /> Läs mer
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* Se bolagsinfo button */}
                              {vc.orgNumber && (
                                <div className={styles.rowDetailsSection}>
                                  <div className={styles.rowDetailsSectionTitle}>Mer info</div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/bolag/${vc.orgNumber}`);
                                    }}
                                    className={styles.rowDetailsAction}
                                  >
                                    <Building2 /> Se bolagsinfo
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* Impact Companies (Investors) Content */}
        {/* ============================================ */}
        {selectedDatabase === "investors" && (
          <div className={styles.slideIn}>
            {/* Search and Filters */}
            <div className={styles.searchSection}>
              <form
                onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); }}
                className={styles.searchWrapper}
              >
                <Search className={styles.searchIcon} />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Sök bolag, nisch, stad..."
                  className={styles.searchInput}
                />
              </form>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`${styles.filterButton} ${showFilters ? styles.active : ""}`}
              >
                <Filter size={16} />
                Filter
                {activeFilterCount > 0 && (
                  <span className={styles.filterCount}>{activeFilterCount}</span>
                )}
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className={`${styles.filterChips} ${styles.slideIn}`} style={{ marginBottom: "1.5rem" }}>
                {/* Niches */}
                {niches.slice(0, 8).map((niche) => (
                  <button
                    key={niche.name}
                    onClick={() => setSelectedNiche(selectedNiche === niche.name ? null : niche.name)}
                    className={`${styles.chip} ${selectedNiche === niche.name ? styles.active : ""}`}
                  >
                    {niche.name}
                  </button>
                ))}
                {/* Cities */}
                {cities.slice(0, 6).map((city) => (
                  <button
                    key={city.name}
                    onClick={() => setSelectedCity(selectedCity === city.name ? null : city.name)}
                    className={`${styles.chip} ${selectedCity === city.name ? styles.active : ""}`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            )}

            {/* Active Filters */}
            {(search || selectedNiche || selectedCity) && (
              <div className={styles.activeFilters}>
                {search && (
                  <button onClick={() => { setSearch(""); setSearchInput(""); }} className={styles.activeFilter}>
                    Sök: {search}
                    <X />
                  </button>
                )}
                {selectedNiche && (
                  <button onClick={() => setSelectedNiche(null)} className={styles.activeFilter}>
                    {selectedNiche}
                    <X />
                  </button>
                )}
                {selectedCity && (
                  <button onClick={() => setSelectedCity(null)} className={styles.activeFilter}>
                    {selectedCity}
                    <X />
                  </button>
                )}
                <button
                  onClick={clearAllFilters}
                  className={styles.activeFilter}
                  style={{ opacity: 0.6 }}
                >
                  Rensa alla
                </button>
              </div>
            )}

            {/* Results count */}
            {total > 0 && (
              <p className={styles.resultsCount}>
                <strong>{total.toLocaleString("sv-SE")}</strong> impact-bolag
              </p>
            )}

            {/* Data Table */}
            <div className={styles.dataTable}>
              {/* Table Header */}
              <div className={styles.tableHeader} style={{ gridTemplateColumns: "2.5fr 1.5fr 1.5fr 1fr 0.7fr 1.2fr 1.2fr 1.2fr 0.8fr" }}>
                <button className={styles.sortButton} onClick={() => handleSort("name")}>
                  Bolag <SortIcon field="name" />
                </button>
                <span className="text-xs text-muted-foreground">VD</span>
                <button className={styles.sortButton} onClick={() => handleSort("impactNiche")}>
                  Nisch <SortIcon field="impactNiche" />
                </button>
                <button className={styles.sortButton} onClick={() => handleSort("city")}>
                  <MapPin size={12} /> <SortIcon field="city" />
                </button>
                <button className={styles.sortButton} onClick={() => handleSort("employees")}>
                  <Users size={12} /> <SortIcon field="employees" />
                </button>
                <button className={styles.sortButton} onClick={() => handleSort("turnover2024Num")}>
                  Oms. 2024 <SortIcon field="turnover2024Num" />
                </button>
                <button className={styles.sortButton} onClick={() => handleSort("latestValuationNum")}>
                  Värdering <SortIcon field="latestValuationNum" />
                </button>
                <button className={styles.sortButton} onClick={() => handleSort("totalFundingNum")}>
                  Funding <SortIcon field="totalFundingNum" />
                </button>
                <button className={styles.sortButton} onClick={() => handleSort("growthNum")}>
                  Tillväxt <SortIcon field="growthNum" />
                </button>
              </div>

              {/* Table Body */}
              {isLoading ? (
                <div className={styles.loadingState}>
                  <Loader2 className={styles.spinner} />
                </div>
              ) : companies.length === 0 ? (
                <div className={styles.emptyState}>
                  <Database className={styles.emptyIcon} />
                  <p className={styles.emptyTitle}>Inga bolag hittades</p>
                  <p className={styles.emptyText}>Prova ett annat sökord eller ta bort filter</p>
                </div>
              ) : (
                <div>
                  {companies.map((company) => {
                    const isExpanded = expandedId === company.id;
                    return (
                      <div key={company.id}>
                        {/* Row */}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : company.id)}
                          className="w-full grid gap-2 px-4 py-3 hover:bg-secondary/60 transition-colors text-left group border-b border-border last:border-b-0"
                          style={{ gridTemplateColumns: "2.5fr 1.5fr 1.5fr 1fr 0.7fr 1.2fr 1.2fr 1.2fr 0.8fr" }}
                        >
                          {/* Company */}
                          <div className="flex items-center gap-3 min-w-0">
                            <ChevronRight className={`w-4 h-4 text-muted-foreground/50 transition-transform flex-shrink-0 ${isExpanded ? "rotate-90" : ""}`} />
                            <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-secondary rounded-lg overflow-hidden">
                              {company.hasLogo ? (
                                <img
                                  src={`/logos/${company.orgNumber.replace(/-/g, "")}.png`}
                                  alt=""
                                  className="w-7 h-7 object-contain"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                />
                              ) : (
                                <Building2 className="w-4 h-4 text-muted-foreground/50" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground text-sm truncate group-hover:text-blue-600">
                                {company.name}
                              </p>
                              <p className="text-xs text-muted-foreground">{formatOrgNr(company.orgNumber)}</p>
                            </div>
                          </div>

                          {/* VD */}
                          <div className="flex items-center min-w-0">
                            <span className="text-sm text-muted-foreground truncate" title={company.ceo || undefined}>
                              {company.ceo || "-"}
                            </span>
                          </div>

                          {/* Niche */}
                          <div className="hidden lg:flex items-center">
                            {company.impactNiche ? (() => {
                              const niche = company.impactNiche.split(",")[0].trim();
                              const color = getNicheColor(niche);
                              return (
                                <span
                                  className="text-xs font-medium px-2 py-0.5 rounded truncate"
                                  style={{ backgroundColor: color.bg, color: color.text }}
                                >
                                  {niche}
                                </span>
                              );
                            })() : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </div>

                          {/* City with tooltip */}
                          <div className="hidden xl:flex items-center" title={company.address ? `${company.address}, ${company.postalCode || ""} ${company.city || ""}`.trim() : undefined}>
                            <span className="text-sm text-muted-foreground truncate">
                              {company.city || "-"}
                            </span>
                          </div>

                          {/* Employees */}
                          <div className="flex items-center justify-center">
                            <span className="text-sm text-muted-foreground">
                              {company.employees && company.employees > 0 ? company.employees : "-"}
                            </span>
                          </div>

                          {/* Turnover */}
                          <div className="flex items-center justify-end">
                            <span className="text-sm font-medium">{formatSek(company.turnover2024Num)}</span>
                          </div>

                          {/* Valuation */}
                          <div className="hidden sm:flex items-center justify-end">
                            <span className="text-sm text-muted-foreground">{formatSek(company.latestValuationNum)}</span>
                          </div>

                          {/* Funding */}
                          <div className="hidden md:flex items-center justify-end">
                            <span className="text-sm font-medium">{formatSek(company.totalFundingNum)}</span>
                          </div>

                          {/* Growth */}
                          <div className="hidden lg:flex items-center justify-end gap-1">
                            {company.growthNum !== null && company.growthNum !== undefined ? (
                              <>
                                {company.growthNum >= 0 ? (
                                  <TrendingUp className="w-3 h-3 text-muted-foreground" />
                                ) : (
                                  <TrendingDown className="w-3 h-3 text-muted-foreground" />
                                )}
                                <span className="text-sm">{formatGrowth(company.growthNum)}</span>
                              </>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </div>
                        </button>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="px-4 py-4 bg-secondary/40 border-b border-border animate-in slide-in-from-top-2 duration-200">
                            {/* Status badges - only show if meaningful */}
                            {(company.status || company.companyType) && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {company.status && (
                                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                                    {company.status}
                                  </span>
                                )}
                                {company.companyType && (
                                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                                    {company.companyType}
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                              {/* Basic Info + Address */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Grundinfo</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Org.nr</span>
                                    <span className="font-medium">{formatOrgNr(company.orgNumber)}</span>
                                  </div>
                                  {company.ceo && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" />VD</span>
                                      <span className="font-medium">{company.ceo}</span>
                                    </div>
                                  )}
                                  {company.chairman && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Ordförande</span>
                                      <span className="font-medium">{company.chairman}</span>
                                    </div>
                                  )}
                                  {company.employees && company.employees > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />Anställda</span>
                                      <span className="font-medium">{company.employees}</span>
                                    </div>
                                  )}
                                  {company.startYear && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />Grundat</span>
                                      <span className="font-medium">{company.startYear}</span>
                                    </div>
                                  )}
                                  {/* Full address with map link */}
                                  {(company.address || company.city) && (
                                    <div className="pt-2 border-t border-border/50">
                                      <div className="flex items-start gap-2">
                                        <MapPin className="w-3 h-3 mt-1 text-muted-foreground flex-shrink-0" />
                                        <div className="flex-1">
                                          {company.address && <p className="text-foreground">{company.address}</p>}
                                          <p className="text-muted-foreground">{company.postalCode} {company.city}</p>
                                          {company.address && company.city && (
                                            <a
                                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${company.address}, ${company.postalCode || ""} ${company.city}`)}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <Map className="w-3 h-3" /> Visa på karta
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Owners from Eivora */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                  Ägare {company.ownerCount && company.ownerCount > 0 && <span className="text-muted-foreground/70 font-normal">({company.ownerCount})</span>}
                                </h4>
                                <div className="space-y-1.5 text-sm">
                                  {/* Show special message for public companies (börsbolag) with many small shareholders */}
                                  {company.ownerCount && company.ownerCount > 50 ? (
                                    <div className="text-muted-foreground">
                                      <p className="italic">Börsnoterat eller spritt ägande</p>
                                      <p className="text-xs mt-1">{company.ownerCount.toLocaleString("sv-SE")} registrerade ägare</p>
                                    </div>
                                  ) : company.owners && company.owners.length > 0 ? (
                                    <>
                                      {company.owners.slice(0, 6).map((owner, idx) => (
                                        <div key={idx} className="flex justify-between items-center gap-2">
                                          <span className="text-foreground truncate flex-1" title={owner.entityName || undefined}>
                                            {owner.entityName || "Okänd"}
                                          </span>
                                          {/* percentage is stored as decimal (0.5 = 50%), convert to display */}
                                          {owner.percentage !== null && owner.percentage >= 0.01 && owner.percentage <= 1 && (
                                            <span className="text-muted-foreground text-xs whitespace-nowrap">
                                              {(owner.percentage * 100).toFixed(1)}%
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                      {company.owners.length > 6 && (
                                        <p className="text-xs text-muted-foreground">+{company.owners.length - 6} fler...</p>
                                      )}
                                    </>
                                  ) : company.largestOwners ? (
                                    <p className="text-foreground text-sm">{company.largestOwners}</p>
                                  ) : (
                                    <p className="text-muted-foreground/70">Ingen ägarinfo</p>
                                  )}
                                </div>
                              </div>

                              {/* Beneficial Owners */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                  <Shield className="w-3 h-3" /> Verkliga huvudmän
                                </h4>
                                <div className="space-y-1.5 text-sm">
                                  {company.beneficialOwners && company.beneficialOwners.length > 0 ? (
                                    company.beneficialOwners.map((bo, idx) => (
                                      <div key={idx} className="flex justify-between items-center gap-2">
                                        <span className="text-foreground truncate flex-1" title={bo.entityName || undefined}>
                                          {bo.entityName || "Okänd"}
                                        </span>
                                        {(bo.percentageVotesMin !== null || bo.percentageVotesMax !== null) && (
                                          <span className="text-muted-foreground text-xs whitespace-nowrap">
                                            {bo.percentageVotesMin !== null && bo.percentageVotesMax !== null
                                              ? `${bo.percentageVotesMin}-${bo.percentageVotesMax}%`
                                              : bo.percentageVotesMin !== null
                                              ? `>${bo.percentageVotesMin}%`
                                              : `<${bo.percentageVotesMax}%`}
                                          </span>
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-muted-foreground/70">Ingen data</p>
                                  )}
                                </div>
                              </div>

                              {/* Funding + Financials combined */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Finansiellt</h4>
                                <div className="space-y-2 text-sm">
                                  {company.turnover2024 && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Oms. 2024</span>
                                      <span className="font-medium">{company.turnover2024}</span>
                                    </div>
                                  )}
                                  {company.profit2024 && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Resultat 2024</span>
                                      <span className="font-medium">{company.profit2024}</span>
                                    </div>
                                  )}
                                  {company.growth2023to2024 && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Tillväxt</span>
                                      <span className="font-medium">{company.growth2023to2024}</span>
                                    </div>
                                  )}
                                  {company.totalFunding && (
                                    <div className="flex justify-between pt-2 border-t border-border/50">
                                      <span className="text-muted-foreground">Total funding</span>
                                      <span className="font-medium">{company.totalFunding}</span>
                                    </div>
                                  )}
                                  {company.latestValuation && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Värdering</span>
                                      <span className="font-medium">{company.latestValuation}</span>
                                    </div>
                                  )}
                                  {company.latestFundingRound && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Senaste runda</span>
                                      <span className="font-medium">{company.latestFundingRound}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mer info</h4>
                                <div className="space-y-2">
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCompanyClick(company.orgNumber);
                                    }}
                                    className="w-full"
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Se bolagsinfo
                                  </Button>
                                  {company.website && (
                                    <a
                                      href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground py-1.5"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Globe className="w-4 h-4" /> Hemsida
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Load More */}
                  {hasMore && (
                    <div ref={loadMoreRef} className="px-4 py-6 text-center">
                      {isLoadingMore ? (
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Laddar fler...</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground/70">
                          Scrolla för att ladda fler
                        </span>
                      )}
                    </div>
                  )}

                  {/* End of list */}
                  {!hasMore && companies.length > 0 && (
                    <div className="px-4 py-4 text-center text-sm text-muted-foreground/70">
                      Visar alla {companies.length.toLocaleString("sv-SE")} bolag
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
