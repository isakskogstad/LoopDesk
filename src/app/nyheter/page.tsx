import { NewsFeed } from "@/components/nyheter/news-feed";

export const metadata = {
  title: "Nyheter | LoopDesk",
  description: "Följ de senaste nyheterna från dina bevakade källor",
};

interface PageProps {
  searchParams: Promise<{ addFeed?: string }>;
}

export default async function NyheterPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const addFeedUrl = params.addFeed;

  return (
    <div className="container-responsive py-6 md:py-8">
      {/* Header - using standardized typography */}
      <div className="page-header">
        <h1 className="page-title">Nyheter</h1>
      </div>

      {/* News feed */}
      <NewsFeed initialAddFeedUrl={addFeedUrl} />
    </div>
  );
}
