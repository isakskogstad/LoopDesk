"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BarChart3, FileText, Building2 } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: "overview", label: "Översikt", icon: <Building2 className="h-4 w-4" /> },
  { id: "economy", label: "Ekonomi", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "documents", label: "Dokument", icon: <FileText className="h-4 w-4" /> },
];

interface CompanyTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function CompanyTabs({ activeTab, onTabChange }: CompanyTabsProps) {
  return (
    <div className="company-tabs-container mb-6">
      <div className="company-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "tab-button",
              activeTab === tab.id && "active"
            )}
          >
            <span className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface TabPanelProps {
  id: string;
  activeTab: string;
  children: React.ReactNode;
}

export function TabPanel({ id, activeTab, children }: TabPanelProps) {
  if (id !== activeTab) return null;

  return (
    <div className="tab-panel active" role="tabpanel" aria-labelledby={`tab-${id}`}>
      {children}
    </div>
  );
}
