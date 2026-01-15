"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react";
import Link from "next/link";

type CompanyMap = Record<string, string>; // name -> orgNumber

interface CompanyLinkerContextType {
  companies: CompanyMap;
  isLoading: boolean;
}

const CompanyLinkerContext = createContext<CompanyLinkerContextType>({
  companies: {},
  isLoading: true,
});

export function CompanyLinkerProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<CompanyMap>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const res = await fetch("/api/bolag/company-names");
        if (res.ok) {
          const data = await res.json();
          setCompanies(data.companies || {});
        }
      } catch (error) {
        console.error("Failed to fetch company names:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCompanies();
  }, []);

  return (
    <CompanyLinkerContext.Provider value={{ companies, isLoading }}>
      {children}
    </CompanyLinkerContext.Provider>
  );
}

export function useCompanyLinker() {
  return useContext(CompanyLinkerContext);
}

interface LinkedTextProps {
  text: string;
  className?: string;
}

export function LinkedText({ text, className }: LinkedTextProps) {
  const { companies, isLoading } = useCompanyLinker();

  const linkedContent = useMemo(() => {
    if (isLoading || !text || Object.keys(companies).length === 0) {
      return text;
    }

    // Sort company names by length (longest first) to avoid partial matches
    const sortedNames = Object.keys(companies).sort((a, b) => b.length - a.length);

    // Build regex pattern - escape special chars and join with OR
    const escapedNames = sortedNames.map(name =>
      name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );

    if (escapedNames.length === 0) return text;

    const pattern = new RegExp(`(${escapedNames.join('|')})`, 'gi');
    const parts = text.split(pattern);

    return parts.map((part, index) => {
      // Check if this part matches a company name (case-insensitive)
      const matchedName = sortedNames.find(
        name => name.toLowerCase() === part.toLowerCase()
      );

      if (matchedName) {
        const orgNumber = companies[matchedName];
        return (
          <Link
            key={index}
            href={`/bolag/${orgNumber}`}
            className="text-primary hover:underline font-medium"
          >
            {part}
          </Link>
        );
      }

      return part;
    });
  }, [text, companies, isLoading]);

  if (typeof linkedContent === "string") {
    return <span className={className}>{linkedContent}</span>;
  }

  return <span className={className}>{linkedContent}</span>;
}
