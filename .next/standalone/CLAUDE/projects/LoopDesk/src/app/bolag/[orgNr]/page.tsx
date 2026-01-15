import { CompanyPageClient } from "@/components/bolag/company-page-client";

interface PageProps {
  params: Promise<{ orgNr: string }>;
}

export default async function CompanyPage({ params }: PageProps) {
  const { orgNr } = await params;

  return <CompanyPageClient orgNr={orgNr} />;
}
