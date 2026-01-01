"use client";

import { CompareBar } from "@/components/bolag/compare-button";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CompareBar />
    </>
  );
}
