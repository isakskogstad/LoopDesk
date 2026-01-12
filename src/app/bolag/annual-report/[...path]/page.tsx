"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AnnualReportViewer() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Path segments: orgNr/filename
  const pathSegments = params.path as string[];
  const orgNrFolder = pathSegments?.[0] || "";
  const fileName = pathSegments?.[1] || "";

  // Construct the Supabase storage URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rpjmsncjnhtnjnycabys.supabase.co";
  const fileUrl = `${supabaseUrl}/storage/v1/object/public/annual-reports/${orgNrFolder}/${fileName}`;

  // Extract year and org number for display
  const yearMatch = fileName.match(/\.(\d{4})\./);
  const year = yearMatch ? yearMatch[1] : "";
  const orgNrFormatted = fileName.match(/^(\d{6}-\d{4})/)?.[1] || orgNrFolder;

  useEffect(() => {
    // Check if iframe loaded successfully
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError("Kunde inte ladda årsredovisningen");
  };

  if (!orgNrFolder || !fileName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Ogiltig URL</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/bevakning">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tillbaka
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold">
              Årsredovisning {year}
            </h1>
            <p className="text-sm text-muted-foreground">{orgNrFormatted}</p>
          </div>
        </div>
        <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Ladda ner
          </Button>
        </a>
      </header>

      {/* Content */}
      <main className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Laddar årsredovisning...</span>
            </div>
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">Öppna i nytt fönster</Button>
              </a>
            </div>
          </div>
        ) : (
          <iframe
            src={fileUrl}
            className="w-full h-full border-0"
            style={{ minHeight: "calc(100vh - 65px)" }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={`Årsredovisning ${year} - ${orgNrFormatted}`}
          />
        )}
      </main>
    </div>
  );
}
