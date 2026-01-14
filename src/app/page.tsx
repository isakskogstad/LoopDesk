"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper, Building2, Eye, Bell } from "lucide-react";
import { PlatformSettings } from "@/components/platform-settings";

const sections = [
  {
    href: "/nyheter",
    title: "Nyheter",
    description: "Aggregerat nyhetsflöde från dina valda källor. Håll dig uppdaterad med branschnyheter och marknadsrörelser.",
    icon: Newspaper,
    span: true, // Spans full width (asymmetric grid)
  },
  {
    href: "/bolag",
    title: "Bolag",
    description: "Sök och utforska företagsinformation. Nyckeltal, styrelse, ägare och finansiell historik.",
    icon: Building2,
  },
  {
    href: "/bevakning",
    title: "Bevakningslista",
    description: "Dina bevakade bolag samlade på ett ställe. Få notiser vid förändringar och viktiga händelser.",
    icon: Eye,
  },
  {
    href: "/bolaghandelser",
    title: "Bolagshändelser",
    description: "Kungörelser, registreringar och andra officiella bolagshändelser från Bolagsverket.",
    icon: Bell,
  },
];

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Redirect unauthenticated users to login
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (!mounted || status === "loading") {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-[1000px] mx-auto px-6 py-16 sm:py-20">
          <div className="animate-pulse">
            <div className="h-12 bg-muted rounded w-80 mb-4" />
            <div className="h-5 bg-muted rounded w-56 mb-14" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="h-44 bg-muted rounded-xl sm:col-span-2" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 bg-muted rounded-xl" />
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
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1000px] mx-auto px-6 py-16 sm:py-20">
        <header className="page-header">
          <h1 className="page-title">Välkommen tillbaka</h1>
          <p className="page-subtitle">Välj en sektion för att komma igång</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 stagger-fade-in">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className={`section-card group ${section.span ? "sm:col-span-2" : ""}`}
            >
              <div className="section-icon">
                <section.icon strokeWidth={1.5} />
              </div>
              <h2 className="section-title">{section.title}</h2>
              <p className="section-description">{section.description}</p>
            </Link>
          ))}

          {/* Platform Settings Card */}
          <PlatformSettings variant="card" />
        </div>
      </div>
    </main>
  );
}
