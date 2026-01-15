"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  NewsCard,
  RightPanel,
  GradientMesh,
} from "@/components/news-desk";

// Demo data - replace with real data from API
const demoArticles = [
  {
    id: "1",
    title: '"Vi sag det komma" - insidan av Northvolts kollaps',
    lead: "DN har talat med anstallda, investerare och tidigare chefer om vad som gick fel.",
    category: "Exklusivt reportage",
    source: "Dagens Nyheter",
    sourceType: "default" as const,
    timeAgo: "2 timmar sedan",
    imageUrl: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=800&h=600&fit=crop",
    companyTag: { name: "Northvolt", watched: true, href: "/bolag/northvolt" },
    size: "feature" as const,
    expandableContent: {
      paragraphs: [
        "Northvolt, som grundades 2016 av tidigare Tesla-chefen Peter Carlsson, har lange setts som Europas hopp i batteriravet. Men bakom kulisserna har problemen hopat sig.",
        'Enligt kallor inom bolaget har produktionsproblem, forseningar och en aggressiv expansion lett till en ohallbar situation. "Vi visste att det skulle bli tufft, men ingen vagade saga ifran", sager en anonym kalla.',
      ],
      relatedArticles: [
        { title: "Tidslinje: Northvolts vag till konkurs", href: "#" },
        { title: "Wallenbergs reaktion pa LinkedIn", href: "#" },
      ],
    },
  },
  {
    id: "2",
    title: "Northvolt AB forsatts i konkurs",
    lead: "Stockholms tingsratt har fattat beslut efter ansokan fran bolaget sjalvt.",
    category: "Konkurs",
    source: "Bolagsverket",
    sourceType: "gov" as const,
    timeAgo: "Just nu",
    imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop",
    size: "large" as const,
  },
  {
    id: "3",
    title: "EQT planerar notering av tva portfoljbolag",
    category: "Bors",
    source: "DI",
    sourceType: "default" as const,
    timeAgo: "3h",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&h=280&fit=crop",
    companyTag: { name: "EQT", watched: true, href: "/bolag/eqt" },
    size: "medium" as const,
  },
  {
    id: "4",
    title: "Klarna hojer varderingen till 65 miljarder",
    category: "IPO",
    source: "Breakit",
    sourceType: "default" as const,
    timeAgo: "4h",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=280&fit=crop",
    companyTag: { name: "Klarna", watched: true, href: "/bolag/klarna" },
    size: "medium" as const,
  },
  {
    id: "5",
    title: "Ny ordforande i Spotify efter avgang",
    category: "Styrelse",
    source: "Bolagsverket",
    sourceType: "gov" as const,
    timeAgo: "6h",
    size: "compact" as const,
  },
  {
    id: "6",
    title: "H2 Green Steel genomfor nyemission",
    category: "Emission",
    source: "DI",
    sourceType: "default" as const,
    timeAgo: "8h",
    size: "compact" as const,
  },
];

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (!mounted || status === "loading") {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <GradientMesh />
        <div className="news-desk-header">
          <div className="h-8 w-24 bg-muted rounded animate-pulse" />
        </div>
        <div className="max-w-[1400px] mx-auto px-10 py-12">
          <div className="animate-pulse">
            <div className="h-14 bg-muted rounded w-80 mb-4" />
            <div className="h-6 bg-muted rounded w-96 mb-12" />
            <div className="news-feed-grid">
              <div className="col-span-12 h-96 bg-muted rounded-2xl" />
              <div className="col-span-6 h-72 bg-muted rounded-xl" />
              <div className="col-span-4 h-64 bg-muted rounded-lg" />
              <div className="col-span-4 h-64 bg-muted rounded-lg" />
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

      <main
        className="min-h-[calc(100vh-73px)] transition-[margin-right] duration-[450ms]"
        style={{ marginRight: panelOpen ? "var(--panel-width)" : 0 }}
      >
        <div className="max-w-[1400px] mx-auto px-10 py-12">
          <header className="mb-12">
            <h1 className="page-title relative inline-block">
              Senaste nytt
              <span className="absolute bottom-[-4px] left-0 w-[60px] h-[3px] bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-accent-gold)] rounded-full" />
            </h1>
            <p className="page-subtitle">
              Bevakade bolag, personer och amnen i realtid
            </p>
          </header>

          <div className="news-feed-grid">
            {demoArticles.map((article, index) => (
              <NewsCard
                key={article.id}
                {...article}
                style={{
                  animationDelay: `${index * 0.06}s`,
                }}
              />
            ))}
          </div>
        </div>
      </main>

      <RightPanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
}
