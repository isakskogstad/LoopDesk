"use client";

import { cn } from "@/lib/utils";
import type { ToolType, ToolTab } from "./types";

interface ToolTabsProps {
  tool: ToolType;
  tabs: ToolTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function ToolTabs({
  tool,
  tabs,
  activeTab,
  onTabChange,
  className,
}: ToolTabsProps) {
  return (
    <div className={cn("tool-tabs", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className="tool-tab"
          data-tool={tool}
          data-active={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
