"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Search, Grid3X3, List, Users, Briefcase, Award, TrendingUp, Building2 } from "lucide-react";
import { NewsDeskHeader } from "@/components/news-desk";
import { GradientMesh, ThemeToggle } from "@/components/news-desk";
import { PersonCard, PersonCardSkeleton, type PersonType } from "@/components/people";

type FilterTab = "all" | "EXECUTIVE" | "BOARD_MEMBER" | "FOUNDER" | "INVESTOR";
type ViewMode = "grid" | "list";

interface Person {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  location?: string;
  imageUrl?: string;
  personType: PersonType;
  totalCompanies: number;
  totalBoardSeats: number;
  activeCompanies: number;
}

// Demo data - will be replaced with API call
const demoPeople: Person[] = [
  {
    id: "1",
    name: "Peter Carlsson",
    firstName: "Peter",
    lastName: "Carlsson",
    title: "Grundare & VD, Northvolt",
    location: "Stockholm",
    personType: "FOUNDER",
    totalCompanies: 4,
    totalBoardSeats: 6,
    activeCompanies: 3,
  },
  {
    id: "2",
    name: "Sebastian Siemiatkowski",
    firstName: "Sebastian",
    lastName: "Siemiatkowski",
    title: "VD, Klarna",
    location: "Stockholm",
    personType: "EXECUTIVE",
    totalCompanies: 2,
    totalBoardSeats: 4,
    activeCompanies: 2,
  },
  {
    id: "3",
    name: "Jacob de Geer",
    firstName: "Jacob",
    lastName: "de Geer",
    title: "Medgrundare, iZettle",
    location: "Stockholm",
    personType: "FOUNDER",
    totalCompanies: 5,
    totalBoardSeats: 8,
    activeCompanies: 4,
  },
  {
    id: "4",
    name: "Cristina Stenbeck",
    firstName: "Cristina",
    lastName: "Stenbeck",
    title: "Styrelseordforande, Kinnevik",
    location: "Stockholm",
    personType: "BOARD_MEMBER",
    totalCompanies: 3,
    totalBoardSeats: 12,
    activeCompanies: 3,
  },
  {
    id: "5",
    name: "Daniel Ek",
    firstName: "Daniel",
    lastName: "Ek",
    title: "Grundare & VD, Spotify",
    location: "Stockholm",
    personType: "FOUNDER",
    totalCompanies: 6,
    totalBoardSeats: 5,
    activeCompanies: 4,
  },
  {
    id: "6",
    name: "Niklas Zennstrom",
    firstName: "Niklas",
    lastName: "Zennstrom",
    title: "Medgrundare, Skype & Atomico",
    location: "London",
    personType: "INVESTOR",
    totalCompanies: 12,
    totalBoardSeats: 8,
    activeCompanies: 10,
  },
  {
    id: "7",
    name: "Marcus Wallenberg",
    firstName: "Marcus",
    lastName: "Wallenberg",
    title: "Styrelseordforande, SEB",
    location: "Stockholm",
    personType: "BOARD_MEMBER",
    totalCompanies: 8,
    totalBoardSeats: 15,
    activeCompanies: 7,
  },
  {
    id: "8",
    name: "Martin Lorentzon",
    firstName: "Martin",
    lastName: "Lorentzon",
    title: "Medgrundare, Spotify",
    location: "Stockholm",
    personType: "FOUNDER",
    totalCompanies: 4,
    totalBoardSeats: 3,
    activeCompanies: 2,
  },
];

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: "all", label: "Alla" },
  { id: "EXECUTIVE", label: "VD" },
  { id: "BOARD_MEMBER", label: "Styrelse" },
  { id: "FOUNDER", label: "Grundare" },
  { id: "INVESTOR", label: "Investerare" },
];

export default function PersonerPage() {
  const { status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    setMounted(true);
    // Simulate API call
    setTimeout(() => {
      setPeople(demoPeople);
      setIsLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const filteredPeople = useMemo(() => {
    return people.filter((person) => {
      const matchesSearch =
        searchQuery === "" ||
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.location?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        activeFilter === "all" || person.personType === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [people, searchQuery, activeFilter]);

  const stats = useMemo(() => {
    return {
      total: people.length,
      executives: people.filter((p) => p.personType === "EXECUTIVE").length,
      boardMembers: people.filter((p) => p.personType === "BOARD_MEMBER").length,
      investors: people.filter((p) => p.personType === "INVESTOR").length,
      founders: people.filter((p) => p.personType === "FOUNDER").length,
    };
  }, [people]);

  const filterCounts = useMemo(() => {
    return {
      all: people.length,
      EXECUTIVE: people.filter((p) => p.personType === "EXECUTIVE").length,
      BOARD_MEMBER: people.filter((p) => p.personType === "BOARD_MEMBER").length,
      FOUNDER: people.filter((p) => p.personType === "FOUNDER").length,
      INVESTOR: people.filter((p) => p.personType === "INVESTOR").length,
    };
  }, [people]);

  if (!mounted || status === "loading") {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <GradientMesh />
        <div className="news-desk-header">
          <div className="h-8 w-24 bg-muted rounded animate-pulse" />
        </div>
        <div className="max-w-[1400px] mx-auto px-10 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-14 bg-muted rounded w-80" />
            <div className="stats-grid">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <>
      <GradientMesh />

      <NewsDeskHeader
        onPanelToggle={() => setPanelOpen(!panelOpen)}
        panelBadgeCount={0}
      />

      <main className="min-h-[calc(100vh-73px)]">
        {/* Hero Section */}
        <section className="max-w-[1400px] mx-auto px-10 pt-12 pb-8">
          <div className="max-w-[720px]">
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] uppercase text-accent mb-5">
              <span className="w-6 h-0.5 bg-accent rounded" />
              Impact People
            </span>
            <h1 className="page-title mb-5">Nyckelpersoner</h1>
            <p className="page-subtitle">
              Utforska VD:ar, styrelsemedlemmar, grundare och investerare i svenska bolag
            </p>
          </div>
        </section>

        {/* Stats Dashboard */}
        <section className="max-w-[1400px] mx-auto px-10 pb-8">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon total">
                <Users size={22} />
              </div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Totalt</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon ceo">
                <Briefcase size={22} />
              </div>
              <div className="stat-value">{stats.executives}</div>
              <div className="stat-label">VD:ar</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon board">
                <Award size={22} />
              </div>
              <div className="stat-value">{stats.boardMembers}</div>
              <div className="stat-label">Styrelse</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon investor">
                <TrendingUp size={22} />
              </div>
              <div className="stat-value">{stats.investors}</div>
              <div className="stat-label">Investerare</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon company">
                <Building2 size={22} />
              </div>
              <div className="stat-value">{stats.founders}</div>
              <div className="stat-label">Grundare</div>
            </div>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="max-w-[1400px] mx-auto px-10 pb-6">
          <div className="flex items-center gap-4 flex-wrap mb-4">
            {/* Search */}
            <div className="flex-1 min-w-[280px] relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                size={20}
              />
              <input
                type="text"
                placeholder="Sok efter namn, titel eller plats..."
                className="w-full py-4 px-5 pl-12 bg-card border border-border rounded-lg text-base text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* View Toggle */}
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Rutnatsvy"
              >
                <Grid3X3 size={18} />
              </button>
              <button
                className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                title="Listvy"
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                className={`filter-tab ${activeFilter === tab.id ? "active" : ""}`}
                onClick={() => setActiveFilter(tab.id)}
              >
                {tab.label}
                <span className="count">{filterCounts[tab.id]}</span>
              </button>
            ))}
          </div>
        </section>

        {/* People Grid */}
        <section className="max-w-[1400px] mx-auto px-10 pb-16">
          {isLoading ? (
            <div className={`people-grid ${viewMode === "list" ? "list-view" : ""}`}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <PersonCardSkeleton key={i} viewMode={viewMode} />
              ))}
            </div>
          ) : filteredPeople.length === 0 ? (
            <div className="empty-state py-16">
              <Users className="empty-state-icon" size={64} />
              <h3 className="empty-state-title">Inga personer hittades</h3>
              <p className="empty-state-description">
                Prova att andra dina sokkriterier eller filter
              </p>
            </div>
          ) : (
            <div className={`people-grid ${viewMode === "list" ? "list-view" : ""}`}>
              {filteredPeople.map((person) => (
                <PersonCard key={person.id} {...person} viewMode={viewMode} />
              ))}
            </div>
          )}
        </section>
      </main>

      <ThemeToggle />
    </>
  );
}
