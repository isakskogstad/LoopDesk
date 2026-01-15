"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "./styles.css";

/**
 * Tema A: Baserat på uppladdad ny-stil-demo.html
 * Playfair Display för rubriker, Source Serif för ingresser,
 * Inter för body, röd accent #E63946
 */

interface Article {
  id: string;
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

function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="tema-a-article-card">
      <div className="tema-a-article-content">
        <span className="tema-a-category">Nyheter</span>
        <h2 className="tema-a-article-title">{article.title}</h2>
        {article.description && (
          <p className="tema-a-article-lead">{article.description}</p>
        )}
        <p className="tema-a-article-byline">
          <strong>{article.sourceName}</strong> · {formatDate(article.publishedAt)}
        </p>
      </div>
      {article.imageUrl && (
        <div className="tema-a-article-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.imageUrl} alt="" />
        </div>
      )}
    </article>
  );
}

export default function TemaAPage() {
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
      } catch {
        // Ignore fetch errors
      } finally {
        setIsLoading(false);
      }
    }
    fetchArticles();
  }, []);

  return (
    <div className={`tema-a-page ${isDark ? "dark" : ""}`}>
      {/* Header */}
      <header className="tema-a-header">
        <div className="tema-a-logo">LOOP<br />DESK</div>
        <div className="tema-a-nav">
          <Link href="/nyheter" className="tema-a-back-link">
            <ArrowLeft size={16} />
            Tillbaka
          </Link>
          <Link href="/nyheter/tema-b" className="tema-a-back-link">
            Jämför med Tema B →
          </Link>
          <button
            className="tema-a-theme-toggle"
            onClick={() => setIsDark(!isDark)}
            aria-label="Växla tema"
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="tema-a-container">
        {/* Hero */}
        <section className="tema-a-hero">
          <div className="tema-a-badge">Tema A: Uppladdad fil</div>
          <span className="tema-a-category">Nyhetsflöde</span>
          <h1 className="tema-a-heading-xl">
            Redaktionell design med Playfair Display
          </h1>
          <p className="tema-a-lead">
            Detta tema använder samma stil som din uppladdade ny-stil-demo.html fil.
            Playfair Display för rubriker, Source Serif 4 för ingresser, och
            Inter för brödtext. Röd accent (#E63946) för kategorier och viktiga element.
          </p>
        </section>

        {/* Articles */}
        <section>
          <h2 className="tema-a-section-title">Senaste nyheterna</h2>

          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="tema-a-article-card">
                  <div>
                    <div className="tema-a-skeleton" style={{ height: 20, width: 80, marginBottom: 12 }} />
                    <div className="tema-a-skeleton" style={{ height: 40, width: "90%", marginBottom: 12 }} />
                    <div className="tema-a-skeleton" style={{ height: 60, width: "100%", marginBottom: 16 }} />
                    <div className="tema-a-skeleton" style={{ height: 16, width: 150 }} />
                  </div>
                  <div className="tema-a-skeleton" style={{ width: 240, height: 240, borderRadius: 20 }} />
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <p className="tema-a-lead">Inga artiklar hittades.</p>
          ) : (
            articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          )}
        </section>
      </div>
    </div>
  );
}
