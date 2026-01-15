"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Search, Grid3X3, List, Users, Briefcase, Award, TrendingUp, Building2 } from "lucide-react";
import { GradientMesh } from "@/components/news-desk";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    setMounted(true);
    // Fetch persons from API
    async function fetchPersons() {
      try {
        const response = await fetch("/api/person");
        if (response.ok) {
          const data = await response.json();
          setPeople(data.persons || []);
        }
      } catch (error) {
        console.error("Error fetching persons:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPersons();
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
    </>
  );
}
