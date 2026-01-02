"use client";

import { useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  Car,
  ChevronDown,
  Facebook,
  Globe,
  IdCard,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Percent,
  Phone,
  Scale,
  Star,
  Twitter,
  TrendingUp,
  Users,
  Youtube,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VinnovaSection } from "@/components/bolag/vinnova-section";
import { RevenueChart } from "@/components/bolag/revenue-chart";
import { FavoriteButton } from "@/components/bolag/favorite-button";
import { CompareButton } from "@/components/bolag/compare-button";
import { CorporateGraph } from "@/components/bolag/corporate-graph";
import { HistoryTimeline } from "@/components/bolag/history-timeline";
import { Breadcrumbs } from "@/components/bolag/breadcrumbs";
import type { CompanyData, AnnualReport, CompanyPerson } from "@/lib/bolag";

interface CompanyPageClientProps {
  orgNr: string;
}

// SWR fetcher with error handling
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error(
      response.status === 404
        ? "Företaget hittades inte"
        : "Kunde inte hämta företagsdata"
    );
    throw error;
  }
  return response.json();
};

export function CompanyPageClient({ orgNr }: CompanyPageClientProps) {
  const { data, error, isLoading } = useSWR<CompanyData>(
    `/api/bolag/company/${orgNr}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute deduplication
    }
  );
  const [showCorporateAccounts, setShowCorporateAccounts] = useState(false);
  const [showBalanceSheet, setShowBalanceSheet] = useState(false);

  // Show skeleton while loading
  if (isLoading) {
    return <CompanyPageSkeleton orgNr={orgNr} />;
  }

  // Show error
  if (error || !data) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm">
                &larr; Tillbaka
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg text-muted-foreground">{error?.message || "Företaget hittades inte"}</p>
              <p className="text-sm text-muted-foreground/70 mt-2">Org.nr: {formatOrgNr(orgNr)}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const hasPaymentRemarks = data.flags?.paymentRemarks;
  const hasSocialMedia =
    Boolean(data.contact?.socialMedia) &&
    Object.values(data.contact!.socialMedia!).some(Boolean);
  const hasContactInfo = Boolean(
    data.postalAddress ||
    data.visitorAddress ||
    data.legalPostalAddress ||
    data.legalVisitorAddress ||
    data.contact?.phone ||
    data.contact?.phone2 ||
    data.contact?.mobile ||
    data.contact?.fax ||
    data.contact?.email ||
    data.contact?.website ||
    hasSocialMedia ||
    data.location?.municipality
  );
  const formatWebsite = (value: string) => {
    const url = value.startsWith("http") ? value : `https://${value}`;
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace(/^www\./, "");
      return { href: url, label: host };
    } catch {
      return { href: url, label: value };
    }
  };

  const sectionLinks = [
    { id: "sektion-ekonomi", label: "Ekonomisk information" },
    { id: "sektion-bolag", label: "Bolagsinfo och kontakt" },
    { id: "sektion-handelser", label: "Händelser och nyheter" },
  ];

  const overviewItems: QuickItem[] = [
    { label: "Org.nr", value: formatOrgNr(data.basic.orgNr), icon: IdCard },
    { label: "Bolagsform", value: data.basic.companyType.name, icon: Building2 },
    { label: "Grundat", value: data.basic.foundationYear, icon: CalendarDays },
    { label: "Anställda", value: data.financials?.employees, icon: Users },
    { label: "Omsättning", value: data.financials?.revenue ? formatAmount(data.financials.revenue) : undefined, icon: TrendingUp },
    { label: "Fordon", value: data.vehicles?.numberOfVehicles, icon: Car },
    { label: "Rating", value: data.rating, icon: Star },
  ].filter((item) => Boolean(item.value)) as QuickItem[];

  const primaryAddress =
    data.visitorAddress ||
    data.postalAddress ||
    data.legalVisitorAddress ||
    data.legalPostalAddress;
  const addressValue = primaryAddress
    ? `${primaryAddress.street}, ${primaryAddress.zipCode} ${primaryAddress.city}`
    : undefined;

  const ceo = data.people?.ceo
    || data.people?.management?.find((person) =>
      person.role?.toLowerCase().includes("vd")
    )
    || data.people?.boardMembers?.find((person) =>
      person.role?.toLowerCase().includes("vd")
    );

  const contactItems: ContactItem[] = [
    data.contact?.website
      ? {
        label: "Webb",
        value: formatWebsite(data.contact.website).label,
        href: formatWebsite(data.contact.website).href,
        icon: Globe,
      }
      : null,
    data.contact?.phone
      ? {
        label: "Telefon",
        value: data.contact.phone,
        href: `tel:${data.contact.phone}`,
        icon: Phone,
      }
      : null,
    data.contact?.email
      ? {
        label: "E-post",
        value: data.contact.email,
        href: `mailto:${data.contact.email}`,
        icon: Mail,
      }
      : null,
  ].filter(Boolean) as ContactItem[];

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center">
          <Breadcrumbs companyName={data.basic.name} />
          <div className="flex gap-2">
            <CompareButton orgNr={data.basic.orgNr} companyName={data.basic.name} />
            <FavoriteButton orgNr={data.basic.orgNr} companyName={data.basic.name} />
          </div>
        </div>

        {/* Payment remarks warning */}
        {hasPaymentRemarks && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-red-600 dark:text-red-400 text-2xl">!</div>
              <div>
                <p className="font-semibold text-red-800 dark:text-red-200">
                  Betalningsanmärkningar
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Detta företag har registrerade betalningsanmärkningar
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status remarks warning (bankruptcy, liquidation, etc.) */}
        {data.statusRemarks && data.statusRemarks.length > 0 && (
          <div className="mb-6 space-y-2">
            {data.statusRemarks.map((remark) => (
              <div
                key={`${remark.code}-${remark.date}`}
                className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="font-semibold text-amber-800 dark:text-amber-200">
                      {remark.description}
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Datum: {formatSwedishDate(remark.date)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-10">
            {/* Dashboard Hero - Combined header + financials */}
            <DashboardHero
              data={data}
              showCorporateAccounts={showCorporateAccounts}
              setShowCorporateAccounts={setShowCorporateAccounts}
              showBalanceSheet={showBalanceSheet}
              setShowBalanceSheet={setShowBalanceSheet}
            />

            {/* ═══════════════════════════════════════════════════════════════
                SEKTION 1: EKONOMISK INFORMATION
            ═══════════════════════════════════════════════════════════════ */}
            <SectionHeader id="sektion-ekonomi" title="Ekonomisk information" kicker="Finansiell översikt" />

            {/* Nyckeltal-kort */}
            {(data.financials?.keyFigures || data.financials?.shareCapital || data.financials?.annualReports?.length) && (
              <Card className="overflow-hidden mb-4">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Beräknade nyckeltal från senaste bokslut */}
                    {(() => {
                      const latestReport = data.financials?.annualReports?.sort((a, b) => b.year - a.year)?.[0];
                      if (!latestReport) return null;

                      const getAccount = (code: string) => latestReport.accounts.find(a => a.code === code)?.amount;
                      const equity = getAccount("EK");
                      const totalAssets = getAccount("ST");
                      const profit = getAccount("DR");
                      const revenue = getAccount("SDI") || getAccount("NOS");
                      const employees = getAccount("ANT");

                      const soliditet = equity && totalAssets && totalAssets !== 0 ? (equity / totalAssets) * 100 : null;
                      const vinstmarginal = profit && revenue && revenue !== 0 ? (profit / revenue) * 100 : null;
                      const revenuePerEmployee = revenue && employees && employees > 0 ? revenue / employees : null;

                      if (!soliditet && !vinstmarginal && !revenuePerEmployee) return null;

                      return (
                        <div>
                          <p className="text-section mb-3">Balansräkningstal ({latestReport.year})</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {soliditet !== null && (
                              <div className="p-3 rounded-lg bg-secondary/60 dark:bg-gray-800/50">
                                <p className="text-xs text-muted-foreground mb-1">Soliditet</p>
                                <p className={`text-lg font-semibold ${soliditet >= 30 ? 'text-emerald-600' : soliditet >= 20 ? 'text-amber-600' : 'text-red-600'}`}>
                                  {soliditet.toFixed(1)}%
                                </p>
                              </div>
                            )}
                            {vinstmarginal !== null && (
                              <div className="p-3 rounded-lg bg-secondary/60 dark:bg-gray-800/50">
                                <p className="text-xs text-muted-foreground mb-1">Vinstmarginal</p>
                                <p className={`text-lg font-semibold ${vinstmarginal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {vinstmarginal.toFixed(1)}%
                                </p>
                              </div>
                            )}
                            {revenuePerEmployee !== null && (
                              <div className="p-3 rounded-lg bg-secondary/60 dark:bg-gray-800/50">
                                <p className="text-xs text-muted-foreground mb-1">Oms/anställd</p>
                                <p className="text-lg font-semibold text-foreground dark:text-foreground">
                                  {(revenuePerEmployee / 1000).toFixed(1)} MSEK
                                </p>
                              </div>
                            )}
                            {equity !== null && equity !== undefined && (
                              <div className="p-3 rounded-lg bg-secondary/60 dark:bg-gray-800/50">
                                <p className="text-xs text-muted-foreground mb-1">Eget kapital</p>
                                <p className={`text-lg font-semibold ${equity >= 0 ? 'text-foreground dark:text-foreground' : 'text-red-600'}`}>
                                  {(equity / 1000).toFixed(1)} MSEK
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                    {/* Lönsamhet och avkastning */}
                    {(data.financials?.keyFigures?.returnOnEquity !== undefined ||
                      data.financials?.keyFigures?.returnOnAssets !== undefined ||
                      data.financials?.keyFigures?.ebitda !== undefined) && (
                      <div>
                        <p className="text-section mb-3">Lönsamhet och avkastning</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {data.financials?.keyFigures?.returnOnEquity !== undefined && (
                            <div className="p-3 rounded-lg bg-secondary/60 dark:bg-gray-800/50">
                              <p className="text-xs text-muted-foreground mb-1">Avkastning EK</p>
                              <p className={`text-lg font-semibold ${data.financials.keyFigures.returnOnEquity >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {data.financials.keyFigures.returnOnEquity.toFixed(1)}%
                              </p>
                            </div>
                          )}
                          {data.financials?.keyFigures?.returnOnAssets !== undefined && (
                            <div className="p-3 rounded-lg bg-secondary/60 dark:bg-gray-800/50">
                              <p className="text-xs text-muted-foreground mb-1">Avkastning TK</p>
                              <p className={`text-lg font-semibold ${data.financials.keyFigures.returnOnAssets >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {data.financials.keyFigures.returnOnAssets.toFixed(1)}%
                              </p>
                            </div>
                          )}
                          {data.financials?.keyFigures?.ebitda !== undefined && (
                            <div className="p-3 rounded-lg bg-secondary/60 dark:bg-gray-800/50">
                              <p className="text-xs text-muted-foreground mb-1">EBITDA</p>
                              <p className={`text-lg font-semibold ${data.financials.keyFigures.ebitda >= 0 ? 'text-foreground dark:text-foreground' : 'text-red-600'}`}>
                                {(data.financials.keyFigures.ebitda / 1000).toFixed(1)} MSEK
                              </p>
                            </div>
                          )}
                          {data.financials?.keyFigures?.growthRate !== undefined && (
                            <div className="p-3 rounded-lg bg-secondary/60 dark:bg-gray-800/50">
                              <p className="text-xs text-muted-foreground mb-1">Tillväxt</p>
                              <p className={`text-lg font-semibold ${data.financials.keyFigures.growthRate >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {data.financials.keyFigures.growthRate >= 0 ? '+' : ''}{data.financials.keyFigures.growthRate.toFixed(1)}%
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Kapital och skulder */}
                    {(data.financials?.shareCapital ||
                      data.financials?.keyFigures?.longTermDebt !== undefined ||
                      data.financials?.keyFigures?.financialAssets !== undefined) && (
                      <div>
                        <p className="text-section mb-3">Kapital och skulder</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {data.financials?.shareCapital && (
                            <div className="p-3 rounded-lg bg-secondary/60 dark:bg-gray-800/50">
                              <p className="text-xs text-muted-foreground mb-1">Aktiekapital</p>
                              <p className="text-lg font-semibold text-foreground dark:text-foreground">
                                {data.financials.shareCapital >= 1000
                                  ? `${(data.financials.shareCapital / 1000).toFixed(1)} MSEK`
                                  : `${data.financials.shareCapital} TSEK`}
                              </p>
                            </div>
                          )}
                          {data.financials?.keyFigures?.longTermDebt !== undefined && (
                            <div className="p-3 rounded-lg bg-secondary/60 dark:bg-gray-800/50">
                              <p className="text-xs text-muted-foreground mb-1">Långfristiga skulder</p>
                              <p className="text-lg font-semibold text-foreground dark:text-foreground">
                                {(data.financials.keyFigures.longTermDebt / 1000).toFixed(1)} MSEK
                              </p>
                            </div>
                          )}
                          {data.financials?.keyFigures?.financialAssets !== undefined && (
                            <div className="p-3 rounded-lg bg-secondary/60 dark:bg-gray-800/50">
                              <p className="text-xs text-muted-foreground mb-1">Finansiella tillgångar</p>
                              <p className="text-lg font-semibold text-foreground dark:text-foreground">
                                {(data.financials.keyFigures.financialAssets / 1000).toFixed(1)} MSEK
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Löner */}
                    {(data.financials?.keyFigures?.salariesBoard !== undefined ||
                      data.financials?.keyFigures?.salariesOther !== undefined) && (
                      <div>
                        <p className="text-section mb-3">Löner och ersättningar</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {data.financials?.keyFigures?.salariesBoard !== undefined && (
                            <div className="p-3 rounded-lg bg-secondary/60 dark:bg-gray-800/50">
                              <p className="text-xs text-muted-foreground mb-1">Styrelse och VD</p>
                              <p className="text-lg font-semibold text-foreground dark:text-foreground">
                                {(data.financials.keyFigures.salariesBoard / 1000).toFixed(1)} MSEK
                              </p>
                            </div>
                          )}
                          {data.financials?.keyFigures?.salariesOther !== undefined && (
                            <div className="p-3 rounded-lg bg-secondary/60 dark:bg-gray-800/50">
                              <p className="text-xs text-muted-foreground mb-1">Övriga anställda</p>
                              <p className="text-lg font-semibold text-foreground dark:text-foreground">
                                {(data.financials.keyFigures.salariesOther / 1000).toFixed(1)} MSEK
                              </p>
                            </div>
                          )}
                          {data.financials?.keyFigures?.salariesBoard !== undefined &&
                           data.financials?.keyFigures?.salariesOther !== undefined && (
                            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                              <p className="text-xs text-muted-foreground mb-1">Totalt löner</p>
                              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                {((data.financials.keyFigures.salariesBoard + data.financials.keyFigures.salariesOther) / 1000).toFixed(1)} MSEK
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Extra info */}
                    {(data.financials?.estimatedTurnover || data.financials?.turnoverYear) && (
                      <div className="pt-4 border-t border-border dark:border-gray-800">
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {data.financials?.estimatedTurnover && (
                            <span>Omsättningsintervall: <span className="font-medium text-foreground">{data.financials.estimatedTurnover}</span></span>
                          )}
                          {data.financials?.turnoverYear && (
                            <span>Senaste bokslut: <span className="font-medium text-foreground">{data.financials.turnoverYear}</span></span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ägare och koncernstruktur */}
            <Card className="overflow-hidden">
              <CardContent className="p-6 space-y-8">
                {/* Ägare */}
                {data.shareholders?.list && data.shareholders.list.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-section flex items-center gap-2">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        Ägare
                      </p>
                      {data.shareholders.totalCount && (
                        <span className="text-xs text-muted-foreground">{data.shareholders.totalCount} ägare totalt</span>
                      )}
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Namn</TableHead>
                          <TableHead className="text-right">Kapital</TableHead>
                          <TableHead className="text-right">Röster</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.shareholders.list.slice(0, 8).map((owner) => (
                          <TableRow key={owner.orgNr || owner.name}>
                            <TableCell>
                              {owner.orgNr ? (
                                <Link href={`/bolag/${owner.orgNr}`} className="text-blue-600 hover:underline">
                                  {owner.name}
                                </Link>
                              ) : (
                                owner.name
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {owner.ownership ? `${owner.ownership.toFixed(1)}%` : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              {owner.votes ? `${owner.votes.toFixed(1)}%` : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Koncernstruktur */}
                {(data.corporateStructure?.parentCompanyName || data.corporateStructure?.numberOfSubsidiaries) && (
                  <div className="pt-6 border-t border-border dark:border-gray-800">
                    <CorporateGraph data={data} />
                  </div>
                )}

                {/* Kopplade bolag */}
                {data.relatedCompanies && data.relatedCompanies.length > 0 && (
                  <div className="pt-6 border-t border-border dark:border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-section flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        Kopplade bolag
                      </p>
                      <span className="text-xs text-muted-foreground">{data.relatedCompanies.length} st</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                      {data.relatedCompanies.slice(0, 6).map((company, index) => (
                        <Link
                          key={`${company.orgNr}-${index}`}
                          href={`/bolag/${company.orgNr}`}
                          className="flex items-center gap-3 p-3 rounded-lg bg-secondary/60 dark:bg-gray-800/50 hover:bg-secondary dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground dark:text-foreground truncate">{company.name}</p>
                            <p className="text-xs text-muted-foreground">{company.relation || "Kopplat bolag"}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    {data.relatedCompanies.length > 6 && (
                      <p className="text-xs text-muted-foreground mt-2">+ {data.relatedCompanies.length - 6} fler</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ═══════════════════════════════════════════════════════════════
                SEKTION 2: BOLAGSINFO OCH KONTAKT
            ═══════════════════════════════════════════════════════════════ */}
            <SectionHeader id="sektion-bolag" title="Bolagsinfo och kontakt" kicker="Historik, juridik, verksamhet" />
            <Card className="overflow-hidden">
              <CardContent className="p-6 space-y-8">
                {/* Varning om inteckningar */}
                {data.flags?.mortgages && (
                  <div className="flex flex-wrap gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm">
                      <span className="status-dot status-dot-warning" />
                      Företagsinteckningar
                    </div>
                  </div>
                )}

                {/* Registreringar */}
                {(data.registryStatus || data.flags?.vatRegistered || data.flags?.registeredForPayrollTax || data.flags?.gaselle) && (
                  <div>
                    <p className="text-section mb-3">Registreringar</p>
                    <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                      {data.flags?.vatRegistered && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10">
                          <span className="status-dot status-dot-active" />
                          <span className="text-sm text-foreground">Momsregistrerad</span>
                        </div>
                      )}
                      {data.flags?.registeredForPayrollTax && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10">
                          <span className="status-dot status-dot-active" />
                          <span className="text-sm text-foreground">Arbetsgivaravgift</span>
                        </div>
                      )}
                      {data.flags?.gaselle && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/50 dark:bg-amber-900/10">
                          <Star className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-sm text-foreground">Gasellföretag</span>
                        </div>
                      )}
                      {data.flags?.marketingProtection && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 dark:bg-gray-800/30">
                          <span className="status-dot status-dot-inactive" />
                          <span className="text-sm text-foreground">Reklamsparr</span>
                        </div>
                      )}
                      {data.registryStatus?.filter((rs) => {
                        if (rs.label === "registeredForVat" && data.flags?.vatRegistered) return false;
                        if (rs.label === "registeredForPayrollTax" && data.flags?.registeredForPayrollTax) return false;
                        return true;
                      }).map((rs) => {
                        const labelMap: Record<string, string> = {
                          registeredForVat: "Momsregistrerad",
                          registeredForPrepayment: "F-skatt",
                          registeredForPayrollTax: "Arbetsgivaravgift",
                        };
                        return (
                          <div key={rs.label} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 dark:bg-gray-800/30">
                            <span className={`status-dot ${rs.value ? "status-dot-active" : "status-dot-inactive"}`} />
                            <span className="text-sm text-foreground">{labelMap[rs.label] || rs.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Fusioner */}
                {data.mergers && data.mergers.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-section">Fusioner och förvärv</p>
                      <span className="text-xs text-muted-foreground">{data.mergers.length} st</span>
                    </div>
                    <div className="space-y-2">
                      {data.mergers.map((m) => (
                        <div key={`${m.type}-${m.date}`} className="flex items-center justify-between p-2 rounded-lg bg-secondary/60 dark:bg-gray-800/50">
                          <div>
                            <p className="text-sm font-medium text-foreground dark:text-foreground">{m.type}</p>
                            {m.otherCompanyName && <p className="text-xs text-blue-600 dark:text-blue-400">{m.otherCompanyName}</p>}
                          </div>
                          <p className="text-xs text-muted-foreground">{formatSwedishDate(m.date)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Styrelse och ledning */}
                {data.people && (
                  <div className="pt-6 border-t border-border dark:border-gray-800">
                    <p className="text-section mb-4 flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Styrelse och ledning
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {data.people.ceo && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/10">
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                            {data.people.ceo.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                          </div>
                          <div>
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">VD</p>
                            {data.people.ceo.id ? (
                              <Link href={`/bolag/person/${data.people.ceo.id}?name=${encodeURIComponent(data.people.ceo.name)}`} className="text-sm font-medium text-foreground dark:text-foreground hover:text-blue-600">
                                {data.people.ceo.name}
                              </Link>
                            ) : (
                              <p className="text-sm font-medium text-foreground dark:text-foreground">{data.people.ceo.name}</p>
                            )}
                          </div>
                        </div>
                      )}
                      {data.people.chairman && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10">
                          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                            {data.people.chairman.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                          </div>
                          <div>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Ordförande</p>
                            {data.people.chairman.id ? (
                              <Link href={`/bolag/person/${data.people.chairman.id}?name=${encodeURIComponent(data.people.chairman.name)}`} className="text-sm font-medium text-foreground dark:text-foreground hover:text-blue-600">
                                {data.people.chairman.name}
                              </Link>
                            ) : (
                              <p className="text-sm font-medium text-foreground dark:text-foreground">{data.people.chairman.name}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {data.people.boardMembers && data.people.boardMembers.length > 0 && (
                      <details className="mt-3 group">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1">
                          <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
                          {data.people.boardMembers.length} styrelseledamöter
                        </summary>
                        <div className="mt-2 grid gap-1 sm:grid-cols-2">
                          {data.people.boardMembers.slice(0, 6).map((m, index) => (
                            <div key={`${m.id || m.name}-${index}`} className="text-sm text-muted-foreground py-1">
                              {m.id ? (
                                <Link href={`/bolag/person/${m.id}?name=${encodeURIComponent(m.name)}`} className="hover:text-blue-600">{m.name}</Link>
                              ) : m.name}
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                )}

                {/* Verksamhetsbeskrivning */}
                {(data.basic.purpose || data.basic.description) && (
                  <div className="pt-6 border-t border-border dark:border-gray-800">
                    <p className="text-section mb-3">Verksamhet</p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {data.basic.purpose || data.basic.description}
                    </p>
                  </div>
                )}

                {/* Bransch och SNI-koder */}
                {((data.industries && data.industries.length > 0) || (data.naceIndustries && data.naceIndustries.length > 0)) && (
                  <div className="pt-6 border-t border-border dark:border-gray-800">
                    <p className="text-section mb-3">Bransch och SNI-koder</p>
                    <div className="flex flex-wrap gap-2">
                      {data.industries?.map((ind, idx) => (
                        <div key={`${ind.code}-${idx}`} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${idx === 0 ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" : "bg-secondary text-foreground"}`}>
                          <span className="font-mono text-xs">{ind.code}</span>
                          <span>{ind.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifikat och varumärken */}
                {((data.certificates && data.certificates.length > 0) || (data.trademarks && data.trademarks.length > 0)) && (
                  <div className="pt-6 border-t border-border dark:border-gray-800">
                    <div className="flex flex-wrap gap-2">
                      {data.certificates?.map((cert) => (
                        <div key={cert.name} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm">
                          <Star className="h-3.5 w-3.5" />
                          <span>{cert.name}</span>
                        </div>
                      ))}
                      {data.trademarks?.slice(0, 4).map((tm, idx) => (
                        <div key={tm.registrationNumber || tm.name || `tm-${idx}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-sm">
                          <span>{tm.name}</span>
                        </div>
                      ))}
                      {data.trademarks && data.trademarks.length > 4 && (
                        <span className="inline-flex items-center px-3 py-1.5 text-xs text-muted-foreground">+{data.trademarks.length - 4} fler varumärken</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Kontaktuppgifter */}
                {hasContactInfo && (
                  <div className="pt-6 border-t border-border dark:border-gray-800">
                    <p className="text-section mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      Kontakt
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {(data.visitorAddress || data.legalVisitorAddress) && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/60 dark:bg-gray-800/50">
                          <MapPin className="h-4 w-4 text-muted-foreground/70 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-foreground">
                            {(() => {
                              const addr = data.visitorAddress || data.legalVisitorAddress;
                              return addr ? <><p>{addr.street}</p><p>{addr.zipCode} {addr.city}</p></> : null;
                            })()}
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        {data.contact?.phone && (
                          <a href={`tel:${data.contact.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                            <Phone className="h-4 w-4" />{data.contact.phone}
                          </a>
                        )}
                        {data.contact?.email && (
                          <a href={`mailto:${data.contact.email}`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                            <Mail className="h-4 w-4" />{data.contact.email}
                          </a>
                        )}
                        {data.contact?.website && (
                          <a href={data.contact.website.startsWith("http") ? data.contact.website : `https://${data.contact.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                            <Globe className="h-4 w-4" />{formatWebsite(data.contact.website).label}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Historik */}
                <div className="pt-6 border-t border-border dark:border-gray-800">
                  <HistoryTimeline data={data} />
                </div>
              </CardContent>
            </Card>

            {/* ═══════════════════════════════════════════════════════════════
                SEKTION 3: HÄNDELSER OCH NYHETER
            ═══════════════════════════════════════════════════════════════ */}
            <SectionHeader id="sektion-handelser" title="Händelser och nyheter" kicker="Aktuellt och historik" />

            {/* Vinnova-projekt */}
            <VinnovaSection companyName={data.basic.name} orgNr={data.basic.orgNr} />

            {/* Digitala årsredovisningar */}
            <AnnualReportsCard orgNr={data.basic.orgNr} />

            {/* Kungörelser */}
            {data.announcements && data.announcements.length > 0 && (() => {
              const filteredAnnouncements = data.announcements.filter((ann) => {
                const text = (ann.text || "").toLowerCase();
                const irrelevantPatterns = ["telefonnummer", "telefon", "faxnummer", "fax", "e-postadress", "e-post", "email", "adress", "address", "kontaktuppgift"];
                return !irrelevantPatterns.some((pattern) => text.includes(pattern));
              });
              if (filteredAnnouncements.length === 0) return null;

              return (
                <Card className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-section">Kungörelser från Bolagsverket</p>
                      <span className="text-xs text-muted-foreground">{filteredAnnouncements.length} st</span>
                    </div>
                    <div className="relative pl-4 border-l-2 border-border space-y-3">
                      {filteredAnnouncements.slice(0, 5).map((ann, index) => (
                        <div key={ann.id || `ann-${index}`} className="relative">
                          <div className={`absolute -left-[9px] top-1.5 w-2.5 h-2.5 rounded-full ${index === 0 ? "bg-blue-500" : "bg-muted-foreground/40 dark:bg-gray-600"}`} />
                          <p className="text-xs text-muted-foreground mb-0.5">{formatSwedishDate(ann.date)}</p>
                          <p className="text-sm text-foreground">{ann.text}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Datakällor */}
            <div className="text-sm text-muted-foreground">
              <p>
                Datakällor:{" "}
                {data.sources.allabolag && <Badge variant="outline" className="mr-1">Allabolag</Badge>}
                {data.sources.bolagsverket && <Badge variant="outline" className="mr-1">Bolagsverket</Badge>}
                <Badge variant="outline">Vinnova</Badge>
              </p>
            </div>
          </div>

          <aside className="space-y-6 self-start">
            <QuickFactsCard
              quickItems={overviewItems}
              contactItems={contactItems}
              flags={data.flags}
              address={addressValue}
              ceoName={ceo?.name}
            />
            <div className="lg:sticky lg:top-6">
              <SectionNavCard sections={sectionLinks} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function SectionHeader({ title, id, kicker }: { title: string; id?: string; kicker?: string }) {
  return (
    <div id={id} className="section-header scroll-mt-24">
      <div>
        {kicker && <p className="section-kicker">{kicker}</p>}
        <h2 className="section-title">{title}</h2>
      </div>
    </div>
  );
}

type QuickItem = {
  label: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
};

type ContactItem = {
  label: string;
  value: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

function QuickFactsCard({
  quickItems,
  contactItems,
  flags,
  address,
  ceoName,
}: {
  quickItems: QuickItem[];
  contactItems: ContactItem[];
  flags?: CompanyData["flags"];
  address?: string;
  ceoName?: string;
}) {
  if (quickItems.length === 0 && contactItems.length === 0 && !flags && !address && !ceoName) {
    return null;
  }

  return (
    <div className="summary-card animate-fade-in">
      <h3 className="text-title text-foreground dark:text-foreground mb-4">Översikt</h3>

      <div className="space-y-1">
        {quickItems.slice(0, 6).map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="summary-item">
              <div className="summary-icon">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-label">{item.label}</p>
                <p className="text-value text-foreground dark:text-foreground truncate">{item.value}</p>
              </div>
            </div>
          );
        })}

        {address && (
          <div className="summary-item">
            <div className="summary-icon">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-label">Adress</p>
              <p className="text-value text-foreground dark:text-foreground text-sm leading-snug">{address}</p>
            </div>
          </div>
        )}

        {ceoName && (
          <div className="summary-item">
            <div className="summary-icon">
              <Users className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-label">VD</p>
              <p className="text-value text-foreground dark:text-foreground">{ceoName}</p>
            </div>
          </div>
        )}
      </div>

      {/* Contact links */}
      {contactItems.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border dark:border-gray-800">
          <p className="text-section mb-3">Kontakt</p>
          <div className="space-y-2">
            {contactItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors group"
                >
                  <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="hover:underline">{item.value}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionNavCard({ sections }: { sections: { id: string; label: string }[] }) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (sections.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120; // Offset for sticky header

      // Find the section that's currently in view
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
          return;
        }
      }
      setActiveSection(sections[0]?.id || null);
    };

    handleScroll(); // Initial check
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  if (sections.length === 0) return null;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Innehåll</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(e) => handleClick(e, section.id)}
              className={`block text-sm py-1.5 px-2 rounded-md transition-colors ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60 dark:text-muted-foreground/50 dark:hover:text-white dark:hover:bg-gray-800"
              }`}
            >
              {section.label}
            </a>
          );
        })}
      </CardContent>
    </Card>
  );
}

function CompanyPageSkeleton({ orgNr }: { orgNr: string }) {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost" size="sm">
              &larr; Tillbaka
            </Button>
          </Link>
          <Skeleton className="h-9 w-9 rounded" />
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-10">
            {/* Header skeleton */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={`metric-skeleton-${n}`} className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Grid skeleton */}
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2].map((n) => (
                <Card key={`card-skeleton-${n}`}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[1, 2, 3].map((m) => (
                      <div key={`content-skeleton-${n}-${m}`} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* People skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2].map((n) => (
                    <div key={`people-skeleton-${n}`} className="space-y-3">
                      <Skeleton className="h-4 w-20" />
                      {[1, 2, 3].map((m) => (
                        <div key={`people-row-${n}-${m}`} className="flex justify-between">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Loading indicator */}
            <div className="text-center text-sm text-muted-foreground">
              Laddar företagsdata för {formatOrgNr(orgNr)}...
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-28" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <Skeleton key={`sidebar-skeleton-${n}`} className="h-4 w-full" />
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-20" />
              </CardHeader>
              <CardContent className="space-y-2">
                {[1, 2, 3].map((n) => (
                  <Skeleton key={`flags-skeleton-${n}`} className="h-4 w-24" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

function formatOrgNr(orgNr: string): string {
  const clean = orgNr.replace(/\D/g, "");
  if (clean.length === 10) {
    return `${clean.slice(0, 6)}-${clean.slice(6)}`;
  } else if (clean.length === 12) {
    return `${clean.slice(0, 8)}-${clean.slice(8)}`;
  }
  return orgNr;
}

function formatSwedishDate(dateStr: string | undefined): string {
  if (!dateStr) return "";

  try {
    // Handle different date formats
    let date: Date;

    // Check if it's already in DD.MM.YYYY format
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split(".");
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      date = new Date(dateStr);
    }

    if (isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function extractDomain(website: string | undefined): string | null {
  if (!website) return null;
  try {
    // Add protocol if missing
    const url = website.startsWith("http") ? website : `https://${website}`;
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function CompanyLogo({ domain, companyName }: { domain: string | null; companyName: string }) {
  const [hasError, setHasError] = useState(false);
  const initials = companyName
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  if (!domain || hasError) {
    // Fallback: show initials
    return (
      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
        {initials || "?"}
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-card border border-border p-2 shadow-sm overflow-hidden">
      <img
        src={`https://logo.clearbit.com/${domain}?size=80`}
        alt={`${companyName} logotyp`}
        className="w-full h-full object-contain"
        onError={() => setHasError(true)}
        loading="lazy"
      />
    </div>
  );
}

// Industry benchmarks for comparison
const industryBenchmarks: Record<string, { returnOnEquity: number; profitMargin: number }> = {
  "62": { returnOnEquity: 25, profitMargin: 10 },
  "63": { returnOnEquity: 20, profitMargin: 8 },
  "46": { returnOnEquity: 15, profitMargin: 3 },
  "47": { returnOnEquity: 12, profitMargin: 2 },
  "41": { returnOnEquity: 18, profitMargin: 4 },
  "43": { returnOnEquity: 20, profitMargin: 5 },
  "70": { returnOnEquity: 25, profitMargin: 8 },
  default: { returnOnEquity: 15, profitMargin: 5 },
};

interface DashboardHeroProps {
  data: CompanyData;
  showCorporateAccounts: boolean;
  setShowCorporateAccounts: (show: boolean | ((prev: boolean) => boolean)) => void;
  showBalanceSheet: boolean;
  setShowBalanceSheet: (show: boolean | ((prev: boolean) => boolean)) => void;
}

// Sparkline component for mini trend charts
function Sparkline({ data, color = "#3b82f6", height = 24 }: { data: number[]; color?: string; height?: number }) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 60;
  const padding = 2;

  const points = data.map((value, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="inline-block ml-2 opacity-70">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DashboardHero({
  data,
  showCorporateAccounts,
  setShowCorporateAccounts,
  showBalanceSheet,
  setShowBalanceSheet,
}: DashboardHeroProps) {
  const keyFigures = data.financials?.keyFigures;
  const hasReports = data.financials?.annualReports && data.financials.annualReports.length > 0;
  const reports = data.financials?.annualReports || [];

  // Get industry comparison data
  const industryCode = data.industries?.[0]?.code?.slice(0, 2) || "";
  const benchmark = industryBenchmarks[industryCode] || industryBenchmarks.default;
  const industryName = data.industries?.[0]?.name || "";

  // Calculate YoY changes from annual reports
  const getYoYChange = (accountCode: string): { change: number; hasData: boolean } => {
    if (reports.length < 2) return { change: 0, hasData: false };
    const sorted = [...reports].sort((a, b) => b.year - a.year);
    const thisYear = sorted[0]?.accounts?.find(a => a.code === accountCode)?.amount ?? undefined;
    const lastYear = sorted[1]?.accounts?.find(a => a.code === accountCode)?.amount ?? undefined;
    if (thisYear === undefined || lastYear === undefined || lastYear === 0) return { change: 0, hasData: false };
    return { change: ((thisYear - lastYear) / Math.abs(lastYear)) * 100, hasData: true };
  };

  // Get sparkline data (last 5 years)
  const getSparklineData = (accountCode: string): number[] => {
    if (reports.length < 2) return [];
    return [...reports]
      .sort((a, b) => a.year - b.year)
      .slice(-5)
      .map(r => r.accounts?.find(a => a.code === accountCode)?.amount ?? 0)
      .filter((v): v is number => v !== 0 && v !== null);
  };

  const revenueYoY = getYoYChange("SDI");
  const profitYoY = getYoYChange("DR");
  const revenueSparkline = getSparklineData("SDI");
  const profitSparkline = getSparklineData("DR");

  const getComparisonLabel = (value: number | undefined, benchmarkValue: number): { label: string; color: string; percent: number } | null => {
    if (value === undefined) return null;
    const diff = ((value - benchmarkValue) / benchmarkValue) * 100;
    const percent = Math.min(100, Math.max(0, (value / (benchmarkValue * 2)) * 100));
    if (diff > 20) return { label: "Topp 25%", color: "text-emerald-600", percent };
    if (diff > 0) return { label: "Över snitt", color: "text-emerald-500", percent };
    if (diff > -20) return { label: "Genomsnitt", color: "text-muted-foreground", percent };
    return { label: "Under snitt", color: "text-amber-600", percent };
  };

  // Contact quick links
  const quickLinks = [
    data.contact?.website && {
      icon: Globe,
      href: data.contact.website.startsWith("http") ? data.contact.website : `https://${data.contact.website}`,
      label: "Webb"
    },
    data.contact?.email && {
      icon: Mail,
      href: `mailto:${data.contact.email}`,
      label: "E-post"
    },
    data.contact?.phone && {
      icon: Phone,
      href: `tel:${data.contact.phone.replace(/\s/g, "")}`,
      label: data.contact.phone
    },
  ].filter(Boolean) as { icon: typeof Globe; href: string; label: string }[];

  // All metrics in one unified row
  const allMetrics = [
    data.financials?.revenue && {
      label: "Omsättning",
      value: formatAmount(data.financials.revenue),
      highlight: true,
      yoy: revenueYoY,
      sparkline: revenueSparkline,
      sparkColor: "#3b82f6",
    },
    data.financials?.profit && {
      label: "Resultat",
      value: formatAmount(data.financials.profit),
      positive: !data.financials.profit.trim().startsWith("-"),
      yoy: profitYoY,
      sparkline: profitSparkline,
      sparkColor: "#10b981",
    },
    keyFigures?.ebitda !== undefined && {
      label: "EBITDA",
      value: `${(keyFigures.ebitda / 1000).toFixed(1)} MSEK`,
      positive: keyFigures.ebitda > 0,
    },
    keyFigures?.growthRate !== undefined && {
      label: "Tillväxt",
      value: `${keyFigures.growthRate >= 0 ? "+" : ""}${keyFigures.growthRate.toFixed(1)}%`,
      positive: keyFigures.growthRate > 0,
    },
    data.financials?.employees && {
      label: "Anställda",
      value: data.financials.employees,
    },
  ].filter(Boolean) as { label: string; value: string; highlight?: boolean; positive?: boolean; yoy?: { change: number; hasData: boolean }; sparkline?: number[]; sparkColor?: string }[];

  return (
    <Card className="overflow-hidden animate-fade-in">
      {/* Header section with gradient background */}
      <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-800 dark:via-gray-900 dark:to-blue-900/10 p-6 border-b border-border dark:border-gray-800">
        {/* Top row: Badges */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            {data.flags?.gaselle && (
              <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-0 shadow-sm">
                Gasellföretag
              </Badge>
            )}
          </div>
          <Badge
            variant={data.basic.status.active ? "default" : "secondary"}
            className={data.basic.status.active ? "bg-emerald-500/90 hover:bg-emerald-500" : ""}
          >
            <span className={`status-dot mr-2 ${data.basic.status.active ? "status-dot-active" : "status-dot-warning"}`} />
            {data.basic.status.status}
          </Badge>
        </div>

        {/* Company name with logo */}
        <div className="flex items-center gap-4 mb-2">
          <CompanyLogo
            domain={extractDomain(data.contact?.website)}
            companyName={data.basic.name}
          />
          <h1 className="text-display text-foreground dark:text-foreground">
            {data.basic.name}
          </h1>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-4">
          <span className="text-mono">{formatOrgNr(data.basic.orgNr)}</span>
          <span className="text-muted-foreground/50">|</span>
          <span>{data.basic.companyType.name}</span>
          {data.basic.foundationYear && (
            <>
              <span className="text-muted-foreground/50">|</span>
              <span>Grundat {data.basic.foundationYear}</span>
            </>
          )}
          {data.domicile?.municipality && (
            <>
              <span className="text-muted-foreground/50">|</span>
              <span>{data.domicile.municipality}</span>
            </>
          )}
          {data.people?.ceo && (
            <>
              <span className="text-muted-foreground/50">|</span>
              <span>VD: {data.people.ceo.name}</span>
            </>
          )}
        </div>

        {data.alternativeNames && data.alternativeNames.length > 0 && (
          <p className="text-sm text-muted-foreground/70 mb-4">
            Tidigare: {data.alternativeNames.join(", ")}
          </p>
        )}

        {/* Quick links */}
        {quickLinks.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-blue-600 dark:text-muted-foreground/70 dark:hover:text-blue-400 transition-colors bg-white/60 dark:bg-gray-800/60 px-2.5 py-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-800"
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="max-w-[150px] truncate">{link.label}</span>
                </a>
              );
            })}
          </div>
        )}
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Unified metrics row with sparklines and YoY */}
        {allMetrics.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 stagger-fade-in">
            {allMetrics.map((metric) => (
              <div
                key={metric.label}
                className={`hero-metric transition-lift ${
                  metric.highlight ? "ring-1 ring-blue-200/50 dark:ring-blue-800/50" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-label">{metric.label}</p>
                  {metric.sparkline && metric.sparkline.length >= 2 && (
                    <Sparkline data={metric.sparkline} color={metric.sparkColor} height={20} />
                  )}
                </div>
                <p className={`text-value-lg ${
                  metric.positive === false ? "text-red-600" :
                  metric.positive === true ? "text-emerald-600" :
                  "text-foreground dark:text-foreground"
                }`}>
                  {metric.value}
                </p>
                {metric.yoy?.hasData && (
                  <p className={`text-xs mt-1 ${
                    metric.yoy.change > 0 ? "text-emerald-600" :
                    metric.yoy.change < 0 ? "text-red-500" : "text-muted-foreground"
                  }`}>
                    {metric.yoy.change > 0 ? "▲" : metric.yoy.change < 0 ? "▼" : "−"} {Math.abs(metric.yoy.change).toFixed(1)}% YoY
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Chart */}
        {hasReports && data.financials!.annualReports!.length > 1 && (
          <div className="bg-secondary/50 dark:bg-gray-800/30 rounded-xl p-4 border border-border dark:border-gray-800">
            <RevenueChart reports={data.financials!.annualReports!} />
          </div>
        )}

        {/* Industry comparison */}
        {keyFigures && (
          <div className="space-y-6">
            {/* Visual industry comparison with progress bars */}
            {keyFigures?.returnOnEquity !== undefined && (
              <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-indigo-900/20 dark:to-purple-900/10 rounded-xl p-4 border border-indigo-100/50 dark:border-indigo-800/30">
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-400 mb-1">Branschjämförelse</p>
                {industryName && (
                  <p className="text-xs text-muted-foreground mb-4">{industryName}</p>
                )}
                <div className="space-y-4">
                  {/* Return on equity comparison */}
                  {(() => {
                    const comp = getComparisonLabel(keyFigures.returnOnEquity, benchmark.returnOnEquity);
                    const companyPercent = Math.min(100, Math.max(5, (keyFigures.returnOnEquity / (benchmark.returnOnEquity * 2)) * 100));
                    const benchmarkPercent = 50; // benchmark is always at 50% of the scale
                    return (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-muted-foreground">Avkastning EK</span>
                          <span className={`text-xs font-medium ${comp?.color || ""}`}>{comp?.label}</span>
                        </div>
                        <div className="relative h-2 bg-secondary dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="absolute h-full bg-indigo-500 rounded-full transition-all"
                            style={{ width: `${companyPercent}%` }}
                          />
                          <div
                            className="absolute h-full w-0.5 bg-muted-foreground/50 dark:bg-secondary/600"
                            style={{ left: `${benchmarkPercent}%` }}
                            title="Branschsnitt"
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{keyFigures.returnOnEquity.toFixed(1)}%</span>
                          <span className="text-xs text-muted-foreground/70">Snitt: {benchmark.returnOnEquity}%</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Growth comparison */}
                  {keyFigures.growthRate !== undefined && (() => {
                    const comp = getComparisonLabel(keyFigures.growthRate, benchmark.profitMargin);
                    const companyPercent = Math.min(100, Math.max(5, ((keyFigures.growthRate + 20) / 40) * 100));
                    const benchmarkPercent = Math.min(100, Math.max(5, ((benchmark.profitMargin + 20) / 40) * 100));
                    return (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-muted-foreground">Tillväxt</span>
                          <span className={`text-xs font-medium ${comp?.color || ""}`}>{comp?.label}</span>
                        </div>
                        <div className="relative h-2 bg-secondary dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`absolute h-full rounded-full transition-all ${keyFigures.growthRate >= 0 ? "bg-emerald-500" : "bg-amber-500"}`}
                            style={{ width: `${companyPercent}%` }}
                          />
                          <div
                            className="absolute h-full w-0.5 bg-muted-foreground/50 dark:bg-secondary/600"
                            style={{ left: `${benchmarkPercent}%` }}
                            title="Branschsnitt"
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className={`text-xs font-medium ${keyFigures.growthRate >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}`}>
                            {keyFigures.growthRate >= 0 ? "+" : ""}{keyFigures.growthRate.toFixed(1)}%
                          </span>
                          <span className="text-xs text-muted-foreground/70">Snitt: {benchmark.profitMargin}%</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Return on assets - simpler display */}
                  {keyFigures.returnOnAssets !== undefined && (
                    <div className="pt-2 border-t border-indigo-100 dark:border-indigo-800/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Avkastning TK</span>
                        <span className="text-xs font-medium text-foreground">{keyFigures.returnOnAssets.toFixed(1)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Expandable detailed financials */}
        {hasReports && (
          <details className="group">
            <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground/40 transition-colors py-2">
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              Visa historiska bokslut
            </summary>
            <div className="mt-4 space-y-4 animate-fade-in">
              <FinancialsTable reports={data.financials!.annualReports!} orgNr={data.basic.orgNr} />

              {/* Koncernbokslut */}
              {data.financials?.corporateAccounts && data.financials.corporateAccounts.length > 0 && (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCorporateAccounts((prev) => !prev)}
                  >
                    {showCorporateAccounts ? "Dölj koncernbokslut" : "Visa koncernbokslut"}
                  </Button>
                  {showCorporateAccounts && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Koncernbokslut</p>
                      <CorporateFinancialsTable reports={data.financials.corporateAccounts} />
                    </div>
                  )}
                </div>
              )}

              {/* Balansräkning */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBalanceSheet((prev) => !prev)}
                >
                  {showBalanceSheet ? "Dölj balansräkning" : "Visa balansräkning"}
                </Button>
                {showBalanceSheet && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Balansräkning (TSEK)</p>
                    <BalanceSheetTable reports={data.financials!.annualReports!} />
                  </div>
                )}
              </div>
            </div>
          </details>
        )}

        {/* No financial data message */}
        {!hasReports && !keyFigures && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Bokslutsdata saknas för detta företag.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function formatAmount(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "-";

  // Parse number, preserving negative sign
  let num: number;
  if (typeof value === "number") {
    num = value;
  } else {
    // Keep minus sign when parsing
    const isNegative = value.trim().startsWith("-");
    const digits = value.replace(/[^\d]/g, "");
    num = parseInt(digits, 10);
    if (isNegative) num = -num;
  }

  if (isNaN(num)) return String(value);

  const absNum = Math.abs(num);
  const prefix = num < 0 ? "−" : ""; // Use proper minus sign (−) for negative

  if (absNum >= 1000) {
    return `${prefix}${(absNum / 1000).toFixed(0)} MSEK`;
  }
  return `${prefix}${absNum} TSEK`;
}

function AdditionalFinancialsCard({
  financials,
}: {
  financials: NonNullable<CompanyData["financials"]>;
}) {
  const formatMsek = (value: number) => `${(value / 1000).toFixed(0)} MSEK`;

  const items = [
    financials.numberOfEmployees
      ? { label: "Anställda (senast)", value: financials.numberOfEmployees }
      : null,
    financials.estimatedTurnover
      ? { label: "Omsättningsintervall", value: financials.estimatedTurnover }
      : null,
    financials.turnoverYear
      ? { label: "Omsättningsår", value: String(financials.turnoverYear) }
      : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const extraKeyFigures = [
    financials.keyFigures?.salariesBoard
      ? { label: "Löner styrelse/VD", value: formatMsek(financials.keyFigures.salariesBoard) }
      : null,
    financials.keyFigures?.salariesOther
      ? { label: "Löner övriga", value: formatMsek(financials.keyFigures.salariesOther) }
      : null,
    financials.keyFigures?.longTermDebt
      ? { label: "Långfristiga skulder", value: formatMsek(financials.keyFigures.longTermDebt) }
      : null,
    financials.keyFigures?.financialAssets
      ? { label: "Finansiella tillgångar", value: formatMsek(financials.keyFigures.financialAssets) }
      : null,
  ].filter(Boolean) as { label: string; value: string }[];

  if (items.length === 0 && extraKeyFigures.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Övrig ekonomi</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="text-lg font-semibold">{item.value}</p>
          </div>
        ))}
        {extraKeyFigures.map((item) => (
          <div key={item.label}>
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="text-lg font-semibold">{item.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function BusinessUnitsCard({
  businessUnits,
}: {
  businessUnits: NonNullable<CompanyData["businessUnits"]>;
}) {
  if (!businessUnits || businessUnits.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Affärsenheter</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2">
          {businessUnits.map((unit, index) => (
            <div
              key={unit.id || `${unit.name}-${unit.type}-${index}`}
              className="p-2 rounded border"
            >
              <p className="text-sm font-medium">{unit.name}</p>
              <p className="text-xs text-muted-foreground">{unit.type}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function OrganisationOverviewCard({
  structure,
  businessUnits,
}: {
  structure?: CompanyData["corporateStructure"];
  businessUnits?: CompanyData["businessUnits"];
}) {
  const hasUnits = Boolean(businessUnits && businessUnits.length > 0);
  const hasStructure = Boolean(structure);
  if (!hasUnits && !hasStructure) return null;

  const hasParent = structure?.parentCompanyName && structure?.parentCompanyOrgNr;
  const hasSubsidiaries = structure?.numberOfSubsidiaries && structure.numberOfSubsidiaries > 0;
  const hasGroup = structure?.numberOfCompanies && structure.numberOfCompanies > 1;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Organisation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(hasParent || hasSubsidiaries || hasGroup) && (
          <div className="flex flex-wrap gap-6">
            {hasParent && structure?.parentCompanyOrgNr && (
              <div>
                <p className="text-sm text-muted-foreground">Moderbolag</p>
                <Link
                  href={`/bolag/${structure.parentCompanyOrgNr}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {structure.parentCompanyName}
                </Link>
              </div>
            )}
            {hasSubsidiaries && (
              <div>
                <p className="text-sm text-muted-foreground">Dotterbolag</p>
                <p className="font-medium">{structure?.numberOfSubsidiaries} st</p>
              </div>
            )}
            {hasGroup && (
              <div>
                <p className="text-sm text-muted-foreground">Bolag i koncernen</p>
                <p className="font-medium">{structure?.numberOfCompanies} st</p>
              </div>
            )}
          </div>
        )}

        {hasUnits && businessUnits && (
          <div className="grid gap-2 sm:grid-cols-2">
            {businessUnits.map((unit, index) => (
              <div
                key={unit.id || `${unit.name}-${unit.type}-${index}`}
                className="p-2 rounded border"
              >
                <p className="text-sm font-medium">{unit.name}</p>
                <p className="text-xs text-muted-foreground">{unit.type}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CorporateStructureCard({
  structure,
}: {
  structure: NonNullable<CompanyData["corporateStructure"]>;
}) {
  const hasParent = structure.parentCompanyName && structure.parentCompanyOrgNr;
  const hasSubsidiaries = structure.numberOfSubsidiaries && structure.numberOfSubsidiaries > 0;
  const hasGroup = structure.numberOfCompanies && structure.numberOfCompanies > 1;

  if (!hasParent && !hasSubsidiaries && !hasGroup) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Koncernstruktur</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-6">
          {hasParent && (
            <div>
              <p className="text-sm text-muted-foreground">Moderbolag</p>
              <Link
                href={`/bolag/${structure.parentCompanyOrgNr}`}
                className="text-blue-600 hover:underline font-medium"
              >
                {structure.parentCompanyName}
              </Link>
            </div>
          )}
          {hasSubsidiaries && (
            <div>
              <p className="text-sm text-muted-foreground">Dotterbolag</p>
              <p className="font-medium">{structure.numberOfSubsidiaries} st</p>
            </div>
          )}
          {hasGroup && (
            <div>
              <p className="text-sm text-muted-foreground">Bolag i koncernen</p>
              <p className="font-medium">{structure.numberOfCompanies} st</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RegistryStatusList({
  registryStatus,
  omitLabels,
}: {
  registryStatus: CompanyData["registryStatus"];
  omitLabels?: string[];
}) {
  if (!registryStatus || registryStatus.length === 0) return null;

  const labelMap: Record<string, string> = {
    registeredForVat: "Momsregistrerad",
    registeredForPrepayment: "F-skatt",
    registeredForPayrollTax: "Arbetsgivaravgift",
  };

  const filtered = omitLabels?.length
    ? registryStatus.filter((rs) => !omitLabels.includes(rs.label))
    : registryStatus;

  if (filtered.length === 0) return null;

  return (
    <div className="flex flex-nowrap gap-2 text-sm overflow-x-auto">
      {filtered.map((rs) => {
        const label = labelMap[rs.label] || rs.label;
        return (
          <div
            key={rs.label}
            className="inline-flex items-center gap-2 rounded-md border border-border dark:border-gray-800 px-2 py-1"
          >
            <span
              className={`flex h-2 w-2 rounded-full ${rs.value ? "bg-emerald-500" : "bg-muted-foreground/40"}`}
            />
            <span className="text-muted-foreground dark:text-muted-foreground/40">
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function RegistryStatusCard({ registryStatus }: { registryStatus: CompanyData["registryStatus"] }) {
  if (!registryStatus || registryStatus.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Registreringar</CardTitle>
      </CardHeader>
      <CardContent>
        <RegistryStatusList registryStatus={registryStatus} />
      </CardContent>
    </Card>
  );
}

function PeopleCard({ people }: { people: NonNullable<CompanyData["people"]> }) {
  // Get initials for avatar
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Hero person component for VD/Chairman
  const HeroPerson = ({ person, title }: { person: CompanyPerson; title: string }) => (
    <div className="bento-box card-interactive group">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
          {getInitials(person.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-section text-blue-600 dark:text-blue-400 mb-0.5">{title}</p>
          {person.id ? (
            <Link
              href={`/bolag/person/${person.id}?name=${encodeURIComponent(person.name)}`}
              className="text-value text-foreground dark:text-foreground hover:text-blue-600 transition-colors block truncate"
            >
              {person.name}
            </Link>
          ) : (
            <p className="text-value text-foreground dark:text-foreground truncate">{person.name}</p>
          )}
        </div>
      </div>
    </div>
  );

  // Compact person row for board members etc.
  const CompactPerson = ({ person, role }: { person: CompanyPerson; role?: string }) => (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-secondary/60 dark:hover:bg-gray-800/50 transition-colors group">
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-muted-foreground">
        {getInitials(person.name)}
      </div>
      <div className="flex-1 min-w-0">
        {person.id ? (
          <Link
            href={`/bolag/person/${person.id}?name=${encodeURIComponent(person.name)}`}
            className="text-sm font-medium text-foreground dark:text-foreground hover:text-blue-600 transition-colors block truncate"
          >
            {person.name}
          </Link>
        ) : (
          <p className="text-sm font-medium text-foreground dark:text-foreground truncate">{person.name}</p>
        )}
        {role && <p className="text-xs text-muted-foreground truncate">{role}</p>}
      </div>
    </div>
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-title flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            Styrelse & Ledning
          </CardTitle>
          {people.numberOfRoles && (
            <span className="text-xs bg-secondary text-muted-foreground px-2.5 py-1 rounded-full">
              {people.numberOfRoles} roller
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hero section for key people */}
        {(people.ceo || people.chairman) && (
          <div className="grid gap-3 sm:grid-cols-2 stagger-fade-in">
            {people.ceo && <HeroPerson person={people.ceo} title="VD" />}
            {people.chairman && <HeroPerson person={people.chairman} title="Ordförande" />}
          </div>
        )}

        {/* Board members in compact grid */}
        {people.boardMembers && people.boardMembers.length > 0 && (
          <div>
            <p className="text-section mb-3">Styrelseledamoter</p>
            <div className="grid gap-1 sm:grid-cols-2">
              {people.boardMembers
                .filter(m => m.role !== "Ordförande")
                .slice(0, 6)
                .map((member) => (
                  <CompactPerson key={member.id || member.name} person={member} role={member.role} />
                ))}
            </div>
            {people.boardMembers.filter(m => m.role !== "Ordförande").length > 6 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                + {people.boardMembers.filter(m => m.role !== "Ordförande").length - 6} fler ledamoter
              </p>
            )}
          </div>
        )}

        {/* Other management */}
        {people.management && people.management.filter(m => m.role !== "Verkställande direktör").length > 0 && (
          <div>
            <p className="text-section mb-3">Övrig ledning</p>
            <div className="grid gap-1 sm:grid-cols-2">
              {people.management.filter(m => m.role !== "Verkställande direktör").map((member) => (
                <CompactPerson key={`mgmt-${member.id || member.name}`} person={member} role={member.role} />
              ))}
            </div>
          </div>
        )}

        {/* Auditors */}
        {people.auditors && people.auditors.length > 0 && (
          <div className="pt-4 border-t border-border dark:border-gray-800">
            <p className="text-section mb-3">Revisorer</p>
            <div className="grid gap-1 sm:grid-cols-2">
              {people.auditors.map((auditor) => (
                <CompactPerson key={`auditor-${auditor.id || auditor.name}`} person={auditor} role={auditor.role} />
              ))}
            </div>
          </div>
        )}

        {/* Signatories in collapsible section */}
        {(people.signatories?.length || people.procuration?.length) && (
          <details className="pt-4 border-t border-border dark:border-gray-800 group">
            <summary className="text-section cursor-pointer flex items-center gap-2 hover:text-foreground dark:hover:text-muted-foreground/50 transition-colors">
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              Firmateckning & Prokura
            </summary>
            <div className="mt-3 space-y-3">
              {people.signatories && people.signatories.length > 0 && (
                <div className="bg-secondary/50 dark:bg-gray-800/30 rounded-lg p-3">
                  <p className="text-label mb-2">Firmateckning</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {people.signatories.map((sig, idx) => (
                      <p key={`sig-${idx}-${sig.slice(0, 20)}`}>{sig}</p>
                    ))}
                  </div>
                </div>
              )}
              {people.procuration && people.procuration.length > 0 && (
                <div className="bg-secondary/50 dark:bg-gray-800/30 rounded-lg p-3">
                  <p className="text-label mb-2">Prokura</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {people.procuration.map((proc, idx) => (
                      <p key={`proc-${idx}-${proc.slice(0, 20)}`}>{proc}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

function PersonRow({ person, title }: { person: CompanyPerson; title?: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      {person.id ? (
        <Link
          href={`/bolag/person/${person.id}?name=${encodeURIComponent(person.name)}`}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          {person.name}
        </Link>
      ) : (
        <span className="text-sm font-medium">{person.name}</span>
      )}
      <span className="text-xs text-muted-foreground">{title || person.role}</span>
    </div>
  );
}

function RelatedCompaniesCard({ relatedCompanies }: { relatedCompanies: NonNullable<CompanyData["relatedCompanies"]> }) {
  if (!relatedCompanies || relatedCompanies.length === 0) return null;

  // Group by relation type
  const grouped = relatedCompanies.reduce((acc, rc) => {
    const relation = rc.relation || "Övrigt";
    if (!acc[relation]) acc[relation] = [];
    acc[relation].push(rc);
    return acc;
  }, {} as Record<string, typeof relatedCompanies>);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          Kopplade bolag
        </CardTitle>
        <p className="text-sm text-muted-foreground">{relatedCompanies.length} kopplade bolag</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(grouped).map(([relation, companies]) => (
          <div key={relation}>
            <p className="text-section mb-2">{relation}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {companies.slice(0, 6).map((company) => (
                <Link
                  key={company.orgNr}
                  href={`/bolag/${company.orgNr}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/60 dark:hover:bg-gray-800/50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-muted-foreground">
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground dark:text-foreground group-hover:text-blue-600 transition-colors truncate">
                      {company.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">{formatOrgNr(company.orgNr)}</p>
                  </div>
                </Link>
              ))}
            </div>
            {companies.length > 6 && (
              <p className="text-xs text-muted-foreground mt-2">+ {companies.length - 6} fler</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AnnualReportsCard({ orgNr }: { orgNr: string }) {
  const [reports, setReports] = useState<{ year: number; dokumentId: string; period: string }[]>([]);
  const [status, setStatus] = useState<"loading" | "available" | "none">("loading");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`/api/bolag/annual-reports?orgNr=${encodeURIComponent(orgNr)}`);
        const data = await response.json();
        if (response.ok && Array.isArray(data.reports) && data.reports.length > 0) {
          const mapped = data.reports
            .map((r: { dokumentId: string; year: number | null; period: string }) => ({
              year: r.year ?? parseInt(r.period?.slice(0, 4) || "", 10),
              dokumentId: r.dokumentId,
              period: r.period,
            }))
            .filter((r: { year: number }) => r.year)
            .sort((a: { year: number }, b: { year: number }) => b.year - a.year);
          setReports(mapped);
          setStatus("available");
        } else {
          setStatus("none");
        }
      } catch {
        setStatus("none");
      }
    };
    fetchReports();
  }, [orgNr]);

  if (status === "loading") {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-5 w-48 bg-secondary dark:bg-gray-700 rounded" />
            <div className="h-4 w-32 bg-secondary dark:bg-gray-700 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "none" || reports.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-section flex items-center gap-2">
            <Scale className="h-4 w-4 text-muted-foreground" />
            Digitala årsredovisningar
          </p>
          <span className="text-xs text-muted-foreground">{reports.length} st från Bolagsverket</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {reports.slice(0, 6).map((report) => (
            <a
              key={report.dokumentId}
              href={`/api/bolag/annual-reports/${encodeURIComponent(report.dokumentId)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/60 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground dark:text-foreground group-hover:text-blue-600">
                  Årsredovisning {report.year}
                </p>
                <p className="text-xs text-muted-foreground">Öppna PDF</p>
              </div>
            </a>
          ))}
        </div>
        {reports.length > 6 && (
          <p className="text-xs text-muted-foreground mt-3">+ {reports.length - 6} äldre årsredovisningar tillgängliga i bokslutssektionen</p>
        )}
      </CardContent>
    </Card>
  );
}

function ShareholdersCard({ shareholders }: { shareholders: NonNullable<CompanyData["shareholders"]> }) {
  if (!shareholders.list || shareholders.list.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ägare</CardTitle>
        {shareholders.totalCount && (
          <p className="text-sm text-muted-foreground">{shareholders.totalCount} ägare totalt</p>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Namn</TableHead>
              <TableHead className="text-right">Kapital</TableHead>
              <TableHead className="text-right">Röster</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shareholders.list.slice(0, 10).map((owner) => (
              <TableRow key={owner.orgNr || owner.name}>
                <TableCell>
                  {owner.orgNr ? (
                    <Link href={`/bolag/${owner.orgNr}`} className="text-blue-600 hover:underline">
                      {owner.name}
                    </Link>
                  ) : (
                    owner.name
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {owner.ownership ? `${owner.ownership.toFixed(1)}%` : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {owner.votes ? `${owner.votes.toFixed(1)}%` : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function FinancialsTable({ reports, orgNr }: { reports: AnnualReport[]; orgNr: string }) {
  const sortedReports = [...reports].sort((a, b) => b.year - a.year).slice(0, 5);
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const [annualReports, setAnnualReports] = useState<{ year: number; dokumentId: string }[]>([]);
  const [annualReportsStatus, setAnnualReportsStatus] = useState<"loading" | "available" | "none">("loading");

  const getAccountAmount = (report: AnnualReport, code: string): number | null => {
    const account = report.accounts.find(a => a.code === code);
    if (!account || account.amount === null) return null;
    return account.amount / 1000;
  };

  const formatAmount = (value: number | null) => {
    if (value === null) return "-";
    // Use proper minus sign (−) for negative values
    const prefix = value < 0 ? "−" : "";
    return `${prefix}${Math.abs(value).toFixed(0)} MSEK`;
  };

  useEffect(() => {
    const fetchAnnualReports = async () => {
      setAnnualReportsStatus("loading");
      try {
        const response = await fetch(
          `/api/bolag/annual-reports?orgNr=${encodeURIComponent(orgNr)}`
        );
        const data = await response.json();
        if (response.ok && Array.isArray(data.reports)) {
          const mapped = data.reports
            .map((report: { dokumentId: string; year: number | null; period: string }) => {
              const yearFromPeriod = report.year ?? parseInt(report.period?.slice(0, 4) || "", 10);
              if (!yearFromPeriod) return null;
              return { year: yearFromPeriod, dokumentId: report.dokumentId };
            })
            .filter((item: { year: number; dokumentId: string } | null): item is { year: number; dokumentId: string } => Boolean(item));
          setAnnualReports(mapped);
          setAnnualReportsStatus(mapped.length > 0 ? "available" : "none");
        } else {
          setAnnualReportsStatus("none");
        }
      } catch {
        setAnnualReports([]);
        setAnnualReportsStatus("none");
      }
    };

    fetchAnnualReports();
  }, [orgNr]);

  return (
    <div className="rounded-xl border border-border/80 dark:border-gray-800 overflow-hidden">
      {/* Clean header for key columns */}
      <div className="grid grid-cols-5 gap-4 px-5 py-3 bg-secondary/80 dark:bg-gray-800/50 border-b border-border/70 dark:border-gray-700/60">
        <div className="text-section">År</div>
        <div className="text-section text-right">Omsättning</div>
        <div className="text-section text-right">Resultat</div>
        <div className="text-section text-right">Anställda</div>
        <div className="text-section text-center">Detaljer</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {sortedReports.map((report, index) => {
          const revenue = getAccountAmount(report, "SDI");
          const profit = getAccountAmount(report, "DR");
          const prev = sortedReports[index + 1];
          const prevRevenue = prev ? getAccountAmount(prev, "SDI") : null;
          const delta = revenue !== null && prevRevenue !== null ? revenue - prevRevenue : null;
          const employees = report.accounts.find(a => a.code === "ANT")?.amount;
          const salaryVd = getAccountAmount(report, "loner_styrelse_vd");
          const salaryOther = getAccountAmount(report, "loner_ovriga");
          const isExpanded = expandedYear === report.year;
          const reportYear = Number(report.year);
          const annualReport = annualReports.find((item) =>
            Number.isFinite(reportYear) ? item.year === reportYear : String(item.year) === String(report.year)
          );

          return (
            <div key={report.year}>
              {/* Main row */}
              <div
                onClick={() => setExpandedYear(isExpanded ? null : report.year)}
                className={`grid grid-cols-5 gap-4 px-5 py-4 cursor-pointer transition-all ${
                  index === 0 ? "bg-blue-50/50 dark:bg-blue-900/10" : "hover:bg-secondary/80 dark:hover:bg-gray-800/30"
                } ${isExpanded ? "bg-secondary/60 dark:bg-gray-800/40" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-value font-semibold">{report.year}</span>
                  {index === 0 && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                      Senaste
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-value">{formatAmount(revenue)}</span>
                  {delta !== null && (
                    <span className={`text-xs ml-2 ${delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {delta >= 0 ? "+" : ""}{delta.toFixed(0)}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className={`text-value ${
                    profit === null ? "" : profit >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}>
                    {formatAmount(profit)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-value">{employees ?? "-"}</span>
                </div>
                <div className="flex justify-center">
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground/70 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </div>
              </div>

              {/* Expandable detail panel */}
              <div
                className="collapse-content"
                data-open={isExpanded}
              >
                <div>
                  <div className="table-detail-panel">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-label mb-1">Löner styrelse/VD</p>
                        <p className="text-value">{salaryVd !== null ? `${salaryVd.toFixed(0)} TSEK` : "-"}</p>
                      </div>
                      <div>
                        <p className="text-label mb-1">Löner övriga</p>
                        <p className="text-value">{salaryOther !== null ? `${salaryOther.toFixed(0)} TSEK` : "-"}</p>
                      </div>
                      <div>
                        <p className="text-label mb-1">Omsättningstrend</p>
                        <div className="flex items-end gap-1 mt-2">
                          {sortedReports.slice(0, 5).map((spark, i) => {
                            const sparkValue = getAccountAmount(spark, "SDI");
                            const allValues = sortedReports.map((s) => getAccountAmount(s, "SDI")).filter((v): v is number => v !== null);
                            const max = allValues.length ? Math.max(...allValues) : 1;
                            const height = sparkValue === null ? 4 : Math.max(4, Math.round((sparkValue / max) * 28));
                            return (
                              <span
                                key={`${report.year}-detail-spark-${i}`}
                                className={`inline-block w-3 rounded-sm transition-all ${
                                  i === index ? "bg-blue-500" : "bg-secondary dark:bg-gray-700"
                                }`}
                                style={{ height }}
                              />
                            );
                          })}
                        </div>
                      </div>
                      {annualReportsStatus !== "none" && (
                        <div>
                          <p className="text-label mb-1">Årsredovisning</p>
                          {annualReport ? (
                            <a
                              href={`/api/bolag/annual-reports/${encodeURIComponent(annualReport.dokumentId)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Hämta PDF
                            </a>
                          ) : (
                            <span className="text-sm text-muted-foreground/70">Ej tillgänglig</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CorporateFinancialsTable({ reports }: { reports: AnnualReport[] }) {
  const sortedReports = [...reports].sort((a, b) => b.year - a.year).slice(0, 5);

  const getAccountAmount = (report: AnnualReport, code: string): number | null => {
    const account = report.accounts.find((a) => a.code === code);
    if (!account || account.amount === null) return null;
    return account.amount / 1000;
  };

  const formatAmount = (value: number | null) => {
    if (value === null) return "-";
    // Use proper minus sign (−) for negative values
    const prefix = value < 0 ? "−" : "";
    return `${prefix}${Math.abs(value).toFixed(0)} MSEK`;
  };

  return (
    <div className="overflow-x-auto rounded-md border border-border dark:border-gray-800">
      <div className="max-h-[360px] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-border/70 dark:border-gray-700/60">
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground border-l border-border/70 dark:border-gray-700/60 first:border-l-0">
                År
              </TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wide text-blue-600/80 border-l border-border/70 dark:border-gray-700/60 first:border-l-0">
                Omsättning
              </TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wide text-emerald-600/80 border-l border-border/70 dark:border-gray-700/60 first:border-l-0">
                Resultat
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground border-l border-border/70 dark:border-gray-700/60 first:border-l-0">
                Trend
              </TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wide text-muted-foreground border-l border-border/70 dark:border-gray-700/60 first:border-l-0">
                Anställda
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {sortedReports.map((report, index) => {
            const revenue = getAccountAmount(report, "SDI");
            const profit = getAccountAmount(report, "DR");
            const prev = sortedReports[index + 1];
            const prevRevenue = prev ? getAccountAmount(prev, "SDI") : null;
            const delta = revenue !== null && prevRevenue !== null ? revenue - prevRevenue : null;
            return (
              <TableRow
                key={report.year}
                className={`border-b border-border dark:border-gray-800 ${index % 2 === 0 ? "bg-secondary/60 dark:bg-gray-900/40" : "bg-card"} hover:bg-secondary/60 dark:hover:bg-gray-800/40 ${index === 0 ? "shadow-sm ring-1 ring-blue-200/70" : ""}`}
              >
                <TableCell className="font-medium border-l border-border/70 dark:border-gray-700/60 first:border-l-0">{report.year}</TableCell>
                <TableCell className="text-right border-l border-border/70 dark:border-gray-700/60 first:border-l-0">{formatAmount(revenue)}</TableCell>
                <TableCell
                  className={`text-right border-l border-border/70 dark:border-gray-700/60 first:border-l-0 ${profit === null ? "" : profit >= 0 ? "text-emerald-600" : "text-red-600"}`}
                >
                  {formatAmount(profit)}
                </TableCell>
                <TableCell className="border-l border-border/70 dark:border-gray-700/60 first:border-l-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs ${
                        delta === null ? "text-muted-foreground/70" : delta >= 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {delta === null ? "–" : `${delta >= 0 ? "+" : ""}${delta.toFixed(0)} MSEK`}
                    </span>
                    <div className="flex items-end gap-0.5">
                      {sortedReports.slice(0, 5).map((spark, i) => {
                        const sparkValue = getAccountAmount(spark, "SDI");
                        const allValues = sortedReports.map((s) => getAccountAmount(s, "SDI")).filter((v): v is number => v !== null);
                        const max = allValues.length ? Math.max(...allValues) : 1;
                        const height = sparkValue === null ? 2 : Math.max(2, Math.round((sparkValue / max) * 16));
                        return (
                          <span
                            key={`${report.year}-spark-${i}`}
                            className={`inline-block w-1 rounded-sm ${i === index ? "bg-blue-600" : "bg-muted-foreground/40 dark:bg-gray-600"}`}
                            style={{ height }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right border-l border-border/70 dark:border-gray-700/60 first:border-l-0">
                  {report.accounts.find((a) => a.code === "ANT")?.amount ?? "-"}
                </TableCell>
              </TableRow>
            );
          })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function BalanceSheetTable({ reports }: { reports: AnnualReport[] }) {
  const sortedReports = [...reports].sort((a, b) => b.year - a.year).slice(0, 5);

  const getAccountAmount = (report: AnnualReport, code: string): number | null => {
    const account = report.accounts.find((a) => a.code === code);
    if (!account || account.amount === null) return null;
    return account.amount;
  };

  const formatAmount = (value: number | null) => {
    if (value === null) return "-";
    // Use proper minus sign (−) for negative values
    const prefix = value < 0 ? "−" : "";
    return `${prefix}${Math.abs(value).toLocaleString("sv-SE")}`;
  };

  // Balance sheet items with their codes and labels
  const balanceSheetItems = [
    { code: "EK", label: "Eget kapital" },
    { code: "SIK", label: "Summa skulder" },
    { code: "SLG", label: "Långfristiga skulder" },
    { code: "SKO", label: "Kortfristiga skulder" },
    { code: "ST", label: "Summa tillgångar" },
    { code: "summa_omsattningstillgangar", label: "Omsättningstillgångar" },
    { code: "summa_anlaggningstillgangar", label: "Anläggningstillgångar" },
  ];

  return (
    <div className="overflow-x-auto rounded-md border border-border dark:border-gray-800">
      <div className="max-h-[400px] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-border/70 dark:border-gray-700/60">
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground border-l border-border/70 dark:border-gray-700/60 first:border-l-0">
                Post
              </TableHead>
              {sortedReports.map((report) => (
                <TableHead
                  key={report.year}
                  className="text-right text-xs uppercase tracking-wide text-muted-foreground border-l border-border/70 dark:border-gray-700/60"
                >
                  {report.year}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {balanceSheetItems.map((item, index) => {
              // Check if any report has data for this item
              const hasData = sortedReports.some((report) => getAccountAmount(report, item.code) !== null);
              if (!hasData) return null;

              return (
                <TableRow
                  key={item.code}
                  className={`border-b border-border dark:border-gray-800 ${
                    index % 2 === 0 ? "bg-secondary/60 dark:bg-gray-900/40" : "bg-card"
                  } hover:bg-secondary/60 dark:hover:bg-gray-800/40`}
                >
                  <TableCell className="font-medium text-sm border-l border-border/70 dark:border-gray-700/60 first:border-l-0">
                    {item.label}
                  </TableCell>
                  {sortedReports.map((report) => {
                    const value = getAccountAmount(report, item.code);
                    const isNegative = value !== null && value < 0;
                    return (
                      <TableCell
                        key={report.year}
                        className={`text-right text-sm border-l border-border/70 dark:border-gray-700/60 ${
                          isNegative ? "text-red-600" : ""
                        }`}
                      >
                        {formatAmount(value)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
