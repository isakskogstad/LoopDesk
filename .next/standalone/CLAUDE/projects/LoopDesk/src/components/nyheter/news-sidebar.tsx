"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Category {
    id: string;
    name: string;
    count: number;
}

interface Company {
    id: string;
    name: string;
    orgNumber: string;
    articleCount?: number;
}

interface Source {
    sourceId: string;
    sourceName: string;
    count: number;
    faviconUrl?: string;
}

interface NewsSidebarProps {
    categories?: Category[];
    companies?: Company[];
    sources?: Source[];
    selectedCategory?: string;
    selectedCompany?: string;
    selectedSource?: string;
    onCategoryChange?: (id: string | undefined) => void;
    onCompanyChange?: (id: string | undefined) => void;
    onSourceChange?: (id: string | undefined) => void;
    totalArticles?: number;
}

export function NewsSidebar({
    categories = [],
    companies = [],
    sources = [],
    selectedCategory,
    selectedCompany,
    selectedSource,
    onCategoryChange,
    onCompanyChange,
    onSourceChange,
    totalArticles = 0,
}: NewsSidebarProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <aside
            className={`
                sticky top-20 self-start
                border-l border-border pl-4
                transition-all duration-300 ease-out
                ${isExpanded ? "w-[260px]" : "w-12"}
            `}
        >
            {/* Toggle button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-9 h-9 rounded-lg border border-border bg-background
                           flex items-center justify-center
                           text-muted-foreground hover:text-foreground
                           hover:border-muted-foreground hover:bg-secondary
                           transition-all duration-200 mb-4"
            >
                {isExpanded ? (
                    <ChevronRight className="w-4 h-4" />
                ) : (
                    <ChevronLeft className="w-4 h-4" />
                )}
            </button>

            {/* Sidebar content - only visible when expanded */}
            <div
                className={`
                    transition-all duration-300
                    ${isExpanded
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 translate-x-5 pointer-events-none"
                    }
                `}
            >
                {/* Categories */}
                {categories.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
                            Kategorier
                        </h3>
                        <div className="flex flex-col gap-0.5">
                            <button
                                onClick={() => onCategoryChange?.(undefined)}
                                className={`
                                    flex items-center justify-between px-2.5 py-2 rounded-lg text-xs
                                    transition-all duration-200
                                    ${!selectedCategory
                                        ? "bg-foreground text-background"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-1"
                                    }
                                `}
                            >
                                <span>Alla</span>
                                <span className="text-[10px] font-medium opacity-60">{totalArticles}</span>
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => onCategoryChange?.(cat.id)}
                                    className={`
                                        flex items-center justify-between px-2.5 py-2 rounded-lg text-xs
                                        transition-all duration-200
                                        ${selectedCategory === cat.id
                                            ? "bg-foreground text-background"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-1"
                                        }
                                    `}
                                >
                                    <span>{cat.name}</span>
                                    <span className="text-[10px] font-medium opacity-60">{cat.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Watched companies */}
                {companies.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
                            Bevakade bolag
                        </h3>
                        <div className="flex flex-col gap-1">
                            {companies.slice(0, 5).map((company) => (
                                <button
                                    key={company.id}
                                    onClick={() => onCompanyChange?.(
                                        selectedCompany === company.id ? undefined : company.id
                                    )}
                                    className={`
                                        flex items-center gap-2 px-2 py-1.5 rounded-lg border text-[11px]
                                        transition-all duration-200
                                        ${selectedCompany === company.id
                                            ? "border-foreground bg-foreground/5"
                                            : "border-border hover:border-muted-foreground hover:bg-secondary hover:translate-x-1"
                                        }
                                    `}
                                >
                                    <div className="w-[18px] h-[18px] rounded bg-secondary flex items-center justify-center text-[8px] font-semibold text-muted-foreground">
                                        {company.name.charAt(0)}
                                    </div>
                                    <span className="flex-1 font-medium truncate">{company.name}</span>
                                    {company.articleCount !== undefined && (
                                        <span className="text-[9px] text-muted-foreground">
                                            {company.articleCount}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sources */}
                {sources.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
                            Källor
                        </h3>
                        <div className="flex flex-wrap gap-1">
                            {sources.slice(0, 8).map((source) => (
                                <button
                                    key={source.sourceId}
                                    onClick={() => onSourceChange?.(
                                        selectedSource === source.sourceId ? undefined : source.sourceId
                                    )}
                                    className={`
                                        flex items-center gap-1 px-2 py-1 rounded-md border text-[10px]
                                        transition-all duration-200
                                        ${selectedSource === source.sourceId
                                            ? "border-foreground bg-foreground/5"
                                            : "border-border text-muted-foreground hover:border-muted-foreground hover:bg-secondary"
                                        }
                                    `}
                                >
                                    {source.faviconUrl && (
                                        <img
                                            src={source.faviconUrl}
                                            alt=""
                                            className="w-3 h-3 rounded-sm"
                                        />
                                    )}
                                    <span>{source.sourceName}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
