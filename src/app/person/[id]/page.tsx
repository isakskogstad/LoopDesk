"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Building2, Briefcase, Calendar, ExternalLink, ChevronLeft } from "lucide-react";

interface PersonRole {
  id: string;
  orgNumber: string;
  companyName: string;
  roleType: string;
  roleTitle: string;
  roleGroup: string;
  isActive: boolean;
  isPrimary: boolean;
}

interface PersonData {
  id: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  birthYear: number | null;
  personType: string;
  allabolagId: string | null;
  totalCompanies: number;
  activeCompanies: number;
  totalBoardSeats: number;
  roles: PersonRole[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PersonPage({ params }: PageProps) {
  const { id } = use(params);
  const [data, setData] = useState<PersonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerson = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/person/${id}`);
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
  }, [id]);

  const formatOrgNr = (orgNr: string) => {
    const clean = orgNr.replace(/\D/g, "");
    if (clean.length === 10) return `${clean.slice(0, 6)}-${clean.slice(6)}`;
    return orgNr;
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleBadgeVariant = (roleType: string): "default" | "secondary" | "outline" => {
    if (roleType === "CEO" || roleType === "CHAIRMAN") return "default";
    if (roleType === "BOARD_MEMBER" || roleType === "DEPUTY_CEO") return "secondary";
    return "outline";
  };

  const getRoleLabel = (roleType: string): string => {
    const labels: Record<string, string> = {
      CEO: "VD",
      DEPUTY_CEO: "Vice VD",
      CHAIRMAN: "Ordforande",
      VICE_CHAIRMAN: "Vice ordforande",
      BOARD_MEMBER: "Styrelseledamot",
      BOARD_DEPUTY: "Styrelsesuppleant",
      AUDITOR: "Revisor",
      DEPUTY_AUDITOR: "Revisorssuppleant",
      SIGNATORY: "Firmatecknare",
      OTHER: "Ovrig",
    };
    return labels[roleType] || roleType;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/"><ChevronLeft className="w-4 h-4 mr-1" /> Tillbaka</Link>
            </Button>
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
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/"><ChevronLeft className="w-4 h-4 mr-1" /> Tillbaka</Link>
            </Button>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{error || "Personen hittades inte"}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const activeRoles = data.roles.filter((r) => r.isActive);
  const inactiveRoles = data.roles.filter((r) => !r.isActive);

  // Group roles by company
  const rolesByCompany = activeRoles.reduce((acc, role) => {
    if (!acc[role.orgNumber]) {
      acc[role.orgNumber] = { companyName: role.companyName, roles: [] };
    }
    acc[role.orgNumber].roles.push(role);
    return acc;
  }, {} as Record<string, { companyName: string; roles: PersonRole[] }>);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back button */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/"><ChevronLeft className="w-4 h-4 mr-1" /> Tillbaka</Link>
          </Button>
        </div>

        {/* Person header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xl shadow-lg">
                {getInitials(data.name)}
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl mb-1">{data.name}</CardTitle>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {data.birthYear && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Fodd {data.birthYear}
                    </span>
                  )}
                  {data.personType === "EXECUTIVE" && (
                    <Badge variant="default">Ledande befattning</Badge>
                  )}
                </div>
              </div>
              {data.allabolagId && (
                <a
                  href={`https://www.allabolag.se/befattningshavare/${data.allabolagId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="text-2xl font-bold text-primary">{data.activeCompanies}</div>
                <div className="text-xs text-muted-foreground">Aktiva bolag</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="text-2xl font-bold">{data.totalBoardSeats}</div>
                <div className="text-xs text-muted-foreground">Styrelseposter</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="text-2xl font-bold">{data.totalCompanies}</div>
                <div className="text-xs text-muted-foreground">Totalt</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active engagements */}
        {Object.keys(rolesByCompany).length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                Aktiva engagemang
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(rolesByCompany).map(([orgNr, { companyName, roles }]) => (
                  <Link
                    key={orgNr}
                    href={`/bolag/${orgNr}`}
                    className="block p-4 rounded-lg border hover:bg-secondary/60 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{companyName}</p>
                        <p className="text-sm text-muted-foreground">{formatOrgNr(orgNr)}</p>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {roles.map((role) => (
                          <Badge
                            key={role.id}
                            variant={getRoleBadgeVariant(role.roleType)}
                          >
                            {getRoleLabel(role.roleType)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inactive engagements */}
        {inactiveRoles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-muted-foreground" />
                Tidigare engagemang
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inactiveRoles.map((role) => (
                  <Link
                    key={role.id}
                    href={`/bolag/${role.orgNumber}`}
                    className="block p-3 rounded-lg border hover:bg-secondary/60 dark:hover:bg-gray-800 opacity-60 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{role.companyName}</p>
                        <p className="text-sm text-muted-foreground">{formatOrgNr(role.orgNumber)}</p>
                      </div>
                      <Badge variant="secondary">{getRoleLabel(role.roleType)}</Badge>
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
