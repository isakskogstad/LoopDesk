"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToolType } from "./types";

interface ToolPanelProps {
  tool: ToolType;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ToolPanel({
  tool,
  title,
  icon,
  isOpen,
  onClose,
  children,
  className,
}: ToolPanelProps) {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="tool-panel-backdrop" onClick={onClose} />

      {/* Panel */}
      <div className={cn("tool-panel", className)}>
        {/* Header */}
        <div className="tool-header">
          <div className="tool-header-title">
            <div className="tool-header-icon" data-tool={tool}>
              {icon}
            </div>
            <span>{title}</span>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost p-2 rounded-lg"
            aria-label="Stäng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {children}
      </div>
    </>
  );
}
