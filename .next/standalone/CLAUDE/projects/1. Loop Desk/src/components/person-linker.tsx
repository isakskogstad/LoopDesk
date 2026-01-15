"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react";
import Link from "next/link";

interface PersonInfo {
  id: string;
  allabolagId?: string | null;
}

type PersonMap = Record<string, PersonInfo>; // name -> { id, allabolagId }

interface PersonLinkerContextType {
  persons: PersonMap;
  isLoading: boolean;
}

const PersonLinkerContext = createContext<PersonLinkerContextType>({
  persons: {},
  isLoading: true,
});

export function PersonLinkerProvider({ children }: { children: ReactNode }) {
  const [persons, setPersons] = useState<PersonMap>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPersons() {
      try {
        const res = await fetch("/api/person/names");
        if (res.ok) {
          const data = await res.json();
          setPersons(data.persons || {});
        }
      } catch (error) {
        console.error("Failed to fetch person names:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPersons();
  }, []);

  return (
    <PersonLinkerContext.Provider value={{ persons, isLoading }}>
      {children}
    </PersonLinkerContext.Provider>
  );
}

export function usePersonLinker() {
  return useContext(PersonLinkerContext);
}

interface PersonLinkProps {
  name: string;
  className?: string;
  /** Optional: if we already know the person ID */
  personId?: string;
  /** Optional: Allabolag ID for external link */
  allabolagId?: string;
}

/**
 * PersonLink - renders a person's name as a clickable link to their profile
 * If personId is provided, uses that directly
 * Otherwise, looks up the person in the PersonLinkerContext
 */
export function PersonLink({ name, className, personId, allabolagId }: PersonLinkProps) {
  const { persons, isLoading } = usePersonLinker();

  // If we have a personId prop (internal DB ID), use it directly
  if (personId) {
    return (
      <Link
        href={`/person/${personId}`}
        className={className || "text-primary hover:underline font-medium"}
      >
        {name}
      </Link>
    );
  }

  // Wait for context to load before deciding
  if (isLoading) {
    return <span className={className}>{name}</span>;
  }

  // Priority 1: Look up by name in context (person exists in our DB)
  const personInfo = persons[name];
  if (personInfo) {
    return (
      <Link
        href={`/person/${personInfo.id}`}
        className={className || "text-primary hover:underline font-medium"}
      >
        {name}
      </Link>
    );
  }

  // Priority 2: If we have an allabolagId, link to the allabolag-based page (fallback)
  if (allabolagId) {
    return (
      <Link
        href={`/bolag/person/${allabolagId}?name=${encodeURIComponent(name)}`}
        className={className || "text-primary hover:underline font-medium"}
      >
        {name}
      </Link>
    );
  }

  // No match found - render as plain text
  return <span className={className}>{name}</span>;
}

interface LinkedPersonTextProps {
  text: string;
  className?: string;
}

/**
 * LinkedPersonText - automatically converts person names in text to links
 * Similar to LinkedText for companies, but for persons
 */
export function LinkedPersonText({ text, className }: LinkedPersonTextProps) {
  const { persons, isLoading } = usePersonLinker();

  const linkedContent = useMemo(() => {
    if (isLoading || !text || Object.keys(persons).length === 0) {
      return text;
    }

    // Sort person names by length (longest first) to avoid partial matches
    const sortedNames = Object.keys(persons).sort((a, b) => b.length - a.length);

    // Build regex pattern - escape special chars and join with OR
    const escapedNames = sortedNames.map(name =>
      name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );

    if (escapedNames.length === 0) return text;

    const pattern = new RegExp(`(${escapedNames.join('|')})`, 'gi');
    const parts = text.split(pattern);

    return parts.map((part, index) => {
      // Check if this part matches a person name (case-insensitive)
      const matchedName = sortedNames.find(
        name => name.toLowerCase() === part.toLowerCase()
      );

      if (matchedName) {
        const personInfo = persons[matchedName];
        return (
          <Link
            key={index}
            href={`/person/${personInfo.id}`}
            className="text-primary hover:underline font-medium"
          >
            {part}
          </Link>
        );
      }

      return part;
    });
  }, [text, persons, isLoading]);

  if (typeof linkedContent === "string") {
    return <span className={className}>{linkedContent}</span>;
  }

  return <span className={className}>{linkedContent}</span>;
}
