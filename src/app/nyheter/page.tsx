import { Newspaper } from "lucide-react";
import { NewsFeed } from "@/components/nyheter/news-feed";

export const metadata = {
  title: "Nyheter | LoopDesk",
  description: "Följ de senaste nyheterna från dina bevakade källor",
};

export default function NyheterPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <Newspaper className="w-5 h-5 text-blue-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Nyheter</h1>
      </div>

      {/* News feed */}
      <NewsFeed />
    </div>
  );
}
