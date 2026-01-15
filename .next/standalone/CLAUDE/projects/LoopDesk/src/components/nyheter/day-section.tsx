"use client";

interface DaySectionProps {
    label: string;
    articleCount?: number;
}

export function DaySection({ label, articleCount }: DaySectionProps) {
    return (
        <div className="flex items-center gap-4 py-2 animate-in fade-in duration-500">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {label}
            </span>
            {articleCount !== undefined && (
                <span className="text-[10px] text-muted-foreground/60">
                    {articleCount} {articleCount === 1 ? 'artikel' : 'artiklar'}
                </span>
            )}
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
        </div>
    );
}

// Helper to group articles by day
export function groupArticlesByDay<T extends { publishedAt: Date | string }>(
    articles: T[]
): { label: string; articles: T[] }[] {
    const now = new Date();
    const today = now.toDateString();

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const groups: Map<string, { label: string; articles: T[]; sortKey: number }> = new Map();

    for (const article of articles) {
        const date = new Date(article.publishedAt);
        const dateStr = date.toDateString();

        let label: string;
        let sortKey: number;

        if (dateStr === today) {
            label = "Idag";
            sortKey = 0;
        } else if (dateStr === yesterdayStr) {
            label = "Igår";
            sortKey = 1;
        } else if (date > weekAgo) {
            label = "Denna vecka";
            sortKey = 2;
        } else {
            // Group by month for older
            const monthYear = date.toLocaleDateString("sv-SE", { month: "long", year: "numeric" });
            label = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
            // Sort older groups by date descending
            sortKey = 100 - Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30));
        }

        if (!groups.has(label)) {
            groups.set(label, { label, articles: [], sortKey });
        }
        groups.get(label)!.articles.push(article);
    }

    // Sort groups by sortKey and return
    return Array.from(groups.values())
        .sort((a, b) => a.sortKey - b.sortKey)
        .map(({ label, articles }) => ({ label, articles }));
}
