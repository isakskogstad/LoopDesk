"use client";

import {
  Building2,
  FileSearch,
  Lightbulb,
  ScrollText,
  Rss,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { TOOL_CONFIGS, type ToolType } from "./types";

interface ToolMenuProps {
  onSelectTool: (tool: ToolType) => void;
}

const TOOL_ICONS: Record<ToolType, React.ReactNode> = {
  allabolag: <Building2 className="w-4 h-4" />,
  bolagsverket: <FileSearch className="w-4 h-4" />,
  vinnova: <Lightbulb className="w-4 h-4" />,
  kungorelser: <ScrollText className="w-4 h-4" />,
  rss: <Rss className="w-4 h-4" />,
};

const TOOL_ORDER: ToolType[] = [
  "allabolag",
  "bolagsverket",
  "kungorelser",
  "vinnova",
  "rss",
];

export function ToolMenu({ onSelectTool }: ToolMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Settings2 className="w-4 h-4" />
          <span className="hidden sm:inline">Verktyg</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="glass shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
        sideOffset={8}
      >
        <div className="tool-menu">
          {TOOL_ORDER.map((toolId) => {
            const config = TOOL_CONFIGS[toolId];
            return (
              <button
                key={toolId}
                className="tool-menu-item"
                onClick={() => onSelectTool(toolId)}
              >
                <div className="tool-menu-icon" data-tool={toolId}>
                  {TOOL_ICONS[toolId]}
                </div>
                <div className="tool-menu-label">
                  <div className="font-medium">{config.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {config.description}
                  </div>
                </div>
                {config.shortcut && (
                  <span className="tool-menu-shortcut">
                    {"\u2318"}{config.shortcut}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
