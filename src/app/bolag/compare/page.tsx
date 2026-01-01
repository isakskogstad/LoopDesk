"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/bolag/breadcrumbs";
import type { CompanyData } from "@/lib/bolag";

function CompareContent() {
  const searchParams = useSearchParams();
  const companiesParam = searchParams.get("companies");
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      if (!companiesParam) return;

      const orgNrs = companiesParam.split(",").slice(0, 3);
      setLoading(true);

      const results = await Promise.all(
        orgNrs.map(async (orgNr) => {
          try {
            const res = await fetch(`/api/bolag/company/${orgNr}`);
            if (res.ok) return res.json();
            return null;
          } catch {
            return null;
          }
        })
      );

      setCompanies(results.filter(Boolean));
      setLoading(false);
    };

    fetchCompanies();
  }, [companiesParam]);

  if (!companiesParam) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">Inga företag valda för jämförelse</p>
          <Link href="/">
            <Button className="mt-4">Sök företag</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={`compare-skeleton-${n}`} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  const formatAmount = (value: string | undefined): string => {
    if (!value) return "-";
    const num = parseInt(value.replace(/\D/g, ""), 10);
    if (isNaN(num)) return value;
    if (Math.abs(num) >= 1000) return `${(num / 1000).toFixed(0)} MSEK`;
    return `${num} TSEK`;
  };

  const formatOrgNr = (orgNr: string) => {
    const clean = orgNr.replace(/\D/g, "");
    if (clean.length === 10) return `${clean.slice(0, 6)}-${clean.slice(6)}`;
    return orgNr;
  };

  const getKeyFigure = (data: CompanyData, key: string): number | undefined => {
    const kf = data.financials?.keyFigures;
    if (!kf) return undefined;
    return kf[key as keyof typeof kf] as number | undefined;
  };

  const metrics = [
    { label: "Omsättning", getValue: (d: CompanyData) => formatAmount(d.financials?.revenue) },
    { label: "Resultat", getValue: (d: CompanyData) => formatAmount(d.financials?.profit) },
    { label: "Anställda", getValue: (d: CompanyData) => d.financials?.employees || "-" },
    { label: "Aktiekapital", getValue: (d: CompanyData) => d.financials?.shareCapital ? `${d.financials.shareCapital.toLocaleString("sv-SE")} SEK` : "-" },
    { label: "EBITDA", getValue: (d: CompanyData) => { const v = getKeyFigure(d, "ebitda"); return v ? `${(v / 1000).toFixed(0)} MSEK` : "-"; } },
    { label: "Avkastning eget kapital", getValue: (d: CompanyData) => { const v = getKeyFigure(d, "returnOnEquity"); return v ? `${v.toFixed(1)}%` : "-"; } },
    { label: "Avkastning totalt kapital", getValue: (d: CompanyData) => { const v = getKeyFigure(d, "returnOnAssets"); return v ? `${v.toFixed(1)}%` : "-"; } },
    { label: "Tillväxt", getValue: (d: CompanyData) => { const v = getKeyFigure(d, "growthRate"); return v ? `${v.toFixed(1)}%` : "-"; } },
    { label: "Grundat", getValue: (d: CompanyData) => d.basic.foundationYear || "-" },
    { label: "Bransch", getValue: (d: CompanyData) => d.industries?.[0]?.name || "-" },
    { label: "Ort", getValue: (d: CompanyData) => d.location?.municipality || d.domicile?.municipality || "-" },
  ];

  // Find best values for highlighting
  const findBest = (values: (number | undefined)[]): number => {
    const valid = values.filter((v): v is number => v !== undefined);
    if (valid.length === 0) return -1;
    return values.indexOf(Math.max(...valid));
  };

  return (
    <div className="space-y-6">
      {/* Company Headers */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <Card key={company.basic.orgNr}>
            <CardHeader className="pb-3">
              <Link href={`/bolag/${company.basic.orgNr}`} className="hover:underline">
                <CardTitle className="text-lg">{company.basic.name}</CardTitle>
              </Link>
              <p className="text-sm text-gray-500">{formatOrgNr(company.basic.orgNr)}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant={company.basic.status.active ? "default" : "secondary"}>
                  {company.basic.status.status}
                </Badge>
                <Badge variant="outline">{company.basic.companyType.name}</Badge>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Jämförelse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th scope="col" className="text-left py-3 px-2 text-sm font-medium text-gray-500">Nyckeltal</th>
                  {companies.map((c) => (
                    <th key={c.basic.orgNr} scope="col" className="text-right py-3 px-2 text-sm font-medium">
                      <span className="hidden sm:inline">{c.basic.name.length > 20 ? `${c.basic.name.slice(0, 20)}...` : c.basic.name}</span>
                      <span className="sm:hidden">{c.basic.name.length > 10 ? `${c.basic.name.slice(0, 10)}...` : c.basic.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, idx) => {
                  const values = companies.map((c) => {
                    const val = metric.getValue(c);
                    if (val === "-") return undefined;
                    const num = parseFloat(val.replace(/[^\d.-]/g, ""));
                    return isNaN(num) ? undefined : num;
                  });
                  const bestIdx = findBest(values);

                  return (
                    <tr key={metric.label} className={idx % 2 === 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""}>
                      <th scope="row" className="py-3 px-2 text-sm text-gray-600 dark:text-gray-400 font-normal text-left">{metric.label}</th>
                      {companies.map((c, i) => (
                        <td
                          key={c.basic.orgNr}
                          className={`text-right py-3 px-2 text-sm font-medium ${
                            bestIdx === i ? "text-green-600 dark:text-green-400" : ""
                          }`}
                        >
                          {metric.getValue(c)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Status Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Status & Flaggor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${companies.length}, 1fr)` }}>
            {companies.map((company) => (
              <div key={company.basic.orgNr} className="space-y-2">
                {company.flags?.paymentRemarks && (
                  <Badge variant="destructive">Betalningsanmärkningar</Badge>
                )}
                {company.flags?.gaselle && (
                  <Badge className="bg-yellow-500">Gasellföretag</Badge>
                )}
                {company.flags?.vatRegistered && (
                  <Badge variant="outline">Momsregistrerad</Badge>
                )}
                {company.flags?.registeredForPayrollTax && (
                  <Badge variant="outline">Arbetsgivaravgift</Badge>
                )}
                {company.flags?.mortgages && (
                  <Badge variant="secondary">Företagsinteckningar</Badge>
                )}
                {!company.flags?.paymentRemarks && !company.flags?.gaselle && !company.flags?.vatRegistered && (
                  <span className="text-sm text-gray-400">Inga flaggor</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ComparePage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Breadcrumbs
          items={[
            { label: "Hem", href: "/" },
            { label: "Jämför bolag" },
          ]}
        />

        <h1 className="text-2xl font-bold mb-6">Jämför företag</h1>

        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <CompareContent />
        </Suspense>
      </div>
    </main>
  );
}
