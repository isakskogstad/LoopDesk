import Link from "next/link";
import { Newspaper, Building2, TrendingUp, Search, Rss, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Välkommen till <span className="text-primary">LoopDesk</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Din centrala hub för nyhetsbevakning och bolagsinformation.
          Håll koll på marknaden med realtidsuppdateringar.
        </p>
      </div>

      {/* Main Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
        {/* Nyheter Card */}
        <Link href="/nyheter" className="group">
          <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <Newspaper className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">
                Nyheter
              </CardTitle>
              <CardDescription>
                Följ nyheter från över 100 källor i realtid
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Rss className="h-4 w-4" />
                  RSS-flöden från svenska medier
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Sociala medier via RSSHub
                </li>
                <li className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Sök och filtrera nyheter
                </li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        {/* Bolag Card */}
        <Link href="/bolag" className="group">
          <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-green-500" />
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">
                Bolagsinformation
              </CardTitle>
              <CardDescription>
                Utforska svenska företag och deras nyckeltal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Sök på namn eller organisationsnummer
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Bokslut, nyckeltal och trender
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Styrelse, ägare och personprofiler
                </li>
              </ul>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Features */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-6">Funktioner</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="font-medium mb-1">Realtidsuppdateringar</div>
            <div className="text-sm text-muted-foreground">Automatisk uppdatering var 60:e sekund</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="font-medium mb-1">Jämför företag</div>
            <div className="text-sm text-muted-foreground">Jämför upp till 3 företag sida vid sida</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="font-medium mb-1">Offline-stöd</div>
            <div className="text-sm text-muted-foreground">Fungerar även utan internet</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="font-medium mb-1">Sökord-bevakning</div>
            <div className="text-sm text-muted-foreground">Få notiser när specifika ord nämns</div>
          </div>
        </div>
      </div>
    </div>
  );
}
