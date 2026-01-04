import { NewsFeed } from "@/components/nyheter/news-feed";

export const metadata = {
  title: "Nyheter | LoopDesk",
  description: "Följ de senaste nyheterna från dina bevakade källor",
};

export default function NyheterPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header - minimalist, no icon */}
      <h1 className="font-mono text-2xl font-semibold tracking-tight mb-8">Nyheter</h1>

      {/* News feed */}
      <NewsFeed />
    </div>
  );
}
