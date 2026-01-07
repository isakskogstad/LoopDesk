"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { ToolType } from "./shared/types";

interface ToolContextValue {
  activeTool: ToolType | null;
  openTool: (tool: ToolType) => void;
  closeTool: () => void;
}

const ToolContext = createContext<ToolContextValue | null>(null);

export function ToolProvider({ children }: { children: ReactNode }) {
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);

  const openTool = useCallback((tool: ToolType) => {
    setActiveTool(tool);
  }, []);

  const closeTool = useCallback(() => {
    setActiveTool(null);
  }, []);

  return (
    <ToolContext.Provider value={{ activeTool, openTool, closeTool }}>
      {children}
    </ToolContext.Provider>
  );
}

export function useTools() {
  const context = useContext(ToolContext);
  if (!context) {
    throw new Error("useTools must be used within a ToolProvider");
  }
  return context;
}
