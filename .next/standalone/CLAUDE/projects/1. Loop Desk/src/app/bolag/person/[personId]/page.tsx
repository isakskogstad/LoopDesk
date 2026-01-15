"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/bolag/breadcrumbs";

interface CompanyEngagement {
  orgNr: string;
  companyName: string;
  role: string;
  active: boolean;
}

interface PersonData {
  name: string;
  id: string;
  engagements: CompanyEngagement[];
}

interface PageProps {
  params: Promise<{ personId: string }>;
}

export default function PersonPage({ params }: PageProps) {
  const { personId } = use(params);
  const searchParams = useSearchParams();
  const personName = searchParams.get("name") || "";
  const [data, setData] = useState<PersonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerson = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/bolag/person/${personId}?name=${encodeURIComponent(personName)}`
        );
        if (!response.ok) {
          setError("Kunde inte hitta personen");
          return;
        }
        const personData = await response.json();
        setData(personData);
      } catch {
        setError("Ett fel uppstod");
      } finally {
        setLoading(false);
      }
    };

    fetchPerson();
  }, [personId]);

  const formatOrgNr = (orgNr: string) => {
    const clean = orgNr.replace(/\D/g, "");
    if (clean.length === 10) return `${clean.slice(0, 6)}-${clean.slice(6)}`;
    return orgNr;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm">&larr; Tillbaka</Button>
            </Link>
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((n) => (
                <Skeleton key={`skeleton-${n}`} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm">&larr; Tillbaka</Button>
            </Link>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">{error || "Personen hittades inte"}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const activeEngagements = data.engagements.filter((e) => e.active);
  const inactiveEngagements = data.engagements.filter((e) => !e.active);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Breadcrumbs personName={data.name} />

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{data.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {data.engagements.length} företagsengagemang
            </p>
          </CardHeader>
        </Card>

        {activeEngagements.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Aktiva engagemang</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeEngagements.map((eng) => (
                  <Link
                    key={`active-${eng.orgNr}-${eng.role}`}
                    href={`/bolag/${eng.orgNr}`}
                    className="block p-3 rounded-lg border hover:bg-secondary/60 dark:hover:bg-gray-800"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{eng.companyName}</p>
                        <p className="text-sm text-muted-foreground">{formatOrgNr(eng.orgNr)}</p>
                      </div>
                      <Badge variant="outline">{eng.role}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {inactiveEngagements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tidigare engagemang</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inactiveEngagements.map((eng) => (
                  <Link
                    key={`inactive-${eng.orgNr}-${eng.role}`}
                    href={`/bolag/${eng.orgNr}`}
                    className="block p-3 rounded-lg border hover:bg-secondary/60 dark:hover:bg-gray-800 opacity-60"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{eng.companyName}</p>
                        <p className="text-sm text-muted-foreground">{formatOrgNr(eng.orgNr)}</p>
                      </div>
                      <Badge variant="secondary">{eng.role}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
