import { NewsFeed } from "@/components/nyheter/news-feed";

export const metadata = {
  title: "Nyheter | LoopDesk",
  description: "Följ de senaste nyheterna från dina bevakade källor",
};

export default function NyheterPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="page-wrapper page-content">
        <header className="page-header">
          <h1 className="page-title">Nyheter</h1>
        </header>

        <NewsFeed />
      </div>
    </main>
  );
}
