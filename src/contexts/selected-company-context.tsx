"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface SelectedCompany {
  orgNr: string;
  name: string;
}

interface SelectedCompanyContextType {
  selectedCompany: SelectedCompany | null;
  setSelectedCompany: (company: SelectedCompany | null) => void;
  clearSelectedCompany: () => void;
}

const SelectedCompanyContext = createContext<SelectedCompanyContextType | undefined>(undefined);

export function SelectedCompanyProvider({ children }: { children: ReactNode }) {
  const [selectedCompany, setSelectedCompany] = useState<SelectedCompany | null>(null);

  const clearSelectedCompany = () => setSelectedCompany(null);

  return (
    <SelectedCompanyContext.Provider value={{ selectedCompany, setSelectedCompany, clearSelectedCompany }}>
      {children}
    </SelectedCompanyContext.Provider>
  );
}

export function useSelectedCompany() {
  const context = useContext(SelectedCompanyContext);
  if (context === undefined) {
    throw new Error("useSelectedCompany must be used within a SelectedCompanyProvider");
  }
  return context;
}
