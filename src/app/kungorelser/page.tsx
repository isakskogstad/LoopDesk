"use client";

import { AnnouncementList } from "@/components/kungorelser";

export default function KungorelserPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Kungörelser
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sök och bevaka företagskundgörelser från Bolagsverket
          </p>
        </header>

        {/* Main Content */}
        <AnnouncementList />
      </div>
    </main>
  );
}
