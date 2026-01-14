"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark, ExternalLink } from "lucide-react";
import "./styles.css";

/**
 * Tema B: Baserat på ny-stil skill
 * NewYorker-inspirerat (med Playfair Display fallback),
 * större typografiska kontraster, mer editorial känsla,
 * luftigare layout med starkare hierarki
 */

interface Article {
  id: string;
  url: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  publishedAt: Date | string;
  sourceName: string;
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
}

function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  if (featured) {
    return (
      <article className="tema-b-featured-article">
        {article.imageUrl && (
          <div className="tema-b-featured-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.imageUrl} alt="" />
            <div className="tema-b-featured-overlay" />
          </div>
        )}
        <div className="tema-b-featured-content">
          <span className="tema-b-category-badge">Huvudnyhet</span>
          <h2 className="tema-b-featured-title">{article.title}</h2>
          {article.description && (
            <p className="tema-b-featured-lead">{article.description}</p>
          )}
          <div className="tema-b-featured-meta">
            <span className="tema-b-source">{article.sourceName}</span>
            <span className="tema-b-divider">·</span>
            <span className="tema-b-date">{formatDate(article.publishedAt)}</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="tema-b-article-row">
      <div className="tema-b-article-time">
        <span className="tema-b-time">{formatTime(article.publishedAt)}</span>
      </div>
      <div className="tema-b-article-main">
        <div className="tema-b-article-text">
          <span className="tema-b-category-inline">{article.sourceName}</span>
          <h3 className="tema-b-article-title">{article.title}</h3>
          {article.description && (
            <p className="tema-b-article-excerpt">{article.description}</p>
          )}
        </div>
        {article.imageUrl && (
          <div className="tema-b-article-thumb">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.imageUrl} alt="" />
          </div>
        )}
      </div>
      <div className="tema-b-article-actions">
        <button className="tema-b-icon-btn" aria-label="Spara">
          <Bookmark size={16} />
        </button>
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="tema-b-icon-btn" aria-label="Öppna">
          <ExternalLink size={16} />
        </a>
      </div>
    </article>
  );
}

export default function TemaBPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch("/api/nyheter?limit=10&fast=true");
        if (response.ok) {
          const data = await response.json();
          setArticles(data.articles || []);
        }
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchArticles();
  }, []);

  const featuredArticle = articles[0];
  const regularArticles = articles.slice(1);

  return (
    <div className={`tema-b-page ${isDark ? "dark" : ""}`}>
        {/* Header */}
        <header className="tema-b-header">
          <div className="tema-b-masthead">LoopDesk</div>
          <nav className="tema-b-nav">
            <Link href="/nyheter" className="tema-b-nav-link">
              <ArrowLeft size={14} />
              Tillbaka
            </Link>
            <Link href="/nyheter/tema-a" className="tema-b-nav-link">
              ← Jämför med Tema A
            </Link>
            <button
              className="tema-b-theme-btn"
              onClick={() => setIsDark(!isDark)}
              aria-label="Växla tema"
            >
              {isDark ? "☀️" : "🌙"}
            </button>
          </nav>
        </header>

        {/* Main Content */}
        <main className="tema-b-container">
          {/* Hero */}
          <section className="tema-b-hero">
            <div className="tema-b-theme-badge">
              <span>Tema B</span>
              <span>·</span>
              <span>NY-STIL SKILL</span>
            </div>
            <h1 className="tema-b-hero-title">
              Editorial med dramatisk typografi
            </h1>
            <p className="tema-b-hero-lead">
              Detta tema följer ny-stil skill med starkare hierarki, större kontraster,
              och mer NewYorker-inspirerad känsla. Samma färgpalett men mer
              dramatisk presentation med bättre luftighet.
            </p>
          </section>

          {/* Section Header */}
          <div className="tema-b-section-header">
            <span className="tema-b-section-label">Senaste nytt</span>
            <div className="tema-b-section-line" />
          </div>

          {isLoading ? (
            <div style={{ padding: "48px 0" }}>
              <div className="tema-b-skeleton" style={{ height: 400, borderRadius: 28, marginBottom: 48 }} />
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr 140px", gap: 24, padding: "28px 0", borderBottom: "1px solid var(--stroke-light)" }}>
                  <div className="tema-b-skeleton" style={{ height: 16, width: 50 }} />
                  <div>
                    <div className="tema-b-skeleton" style={{ height: 12, width: 80, marginBottom: 12 }} />
                    <div className="tema-b-skeleton" style={{ height: 28, width: "80%", marginBottom: 12 }} />
                    <div className="tema-b-skeleton" style={{ height: 40, width: "100%" }} />
                  </div>
                  <div className="tema-b-skeleton" style={{ height: 100, borderRadius: 12 }} />
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <p className="tema-b-hero-lead" style={{ textAlign: "center", padding: "60px 0" }}>
              Inga artiklar hittades.
            </p>
          ) : (
            <>
              {/* Featured Article */}
              {featuredArticle && (
                <ArticleCard article={featuredArticle} featured />
              )}

              {/* Regular Articles */}
              <div>
                {regularArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </>
          )}
        </main>
    </div>
  );
}
