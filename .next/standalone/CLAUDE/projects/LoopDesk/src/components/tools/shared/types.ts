export type ToolType =
  | "allabolag"
  | "bolagsverket"
  | "vinnova"
  | "kungorelser"
  | "rss";

export type ToolStatus = "idle" | "running" | "success" | "error";

export type LogEntryType = "info" | "success" | "warning" | "error";

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: LogEntryType;
}

export interface ToolTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface ToolConfig {
  id: ToolType;
  name: string;
  description: string;
  shortcut?: string;
}

export const TOOL_CONFIGS: Record<ToolType, ToolConfig> = {
  allabolag: {
    id: "allabolag",
    name: "Allabolag",
    description: "Scrapa bolagsdata",
    shortcut: "A",
  },
  bolagsverket: {
    id: "bolagsverket",
    name: "Bolagsverket",
    description: "Officiell bolagsinfo",
    shortcut: "B",
  },
  vinnova: {
    id: "vinnova",
    name: "Vinnova",
    description: "Projektfinansiering",
    shortcut: "V",
  },
  kungorelser: {
    id: "kungorelser",
    name: "Kungörelser",
    description: "Konkurs & likvidation",
    shortcut: "K",
  },
  rss: {
    id: "rss",
    name: "RSS-hanterare",
    description: "Hantera nyhetsflöden",
    shortcut: "R",
  },
};
