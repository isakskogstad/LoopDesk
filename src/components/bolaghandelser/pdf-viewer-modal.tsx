"use client";

import { useEffect, useCallback } from "react";
import { X, ExternalLink, Download, ZoomIn, ZoomOut } from "lucide-react";

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title?: string;
}

export function PdfViewerModal({ isOpen, onClose, pdfUrl, title }: PdfViewerModalProps) {
  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  }, [onClose]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full h-full max-w-5xl max-h-[90vh] mx-4 my-4 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between bg-card border border-border rounded-t-xl px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-sm font-semibold truncate">
              {title || "Protokoll"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Open in new tab */}
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              title="Öppna i ny flik"
            >
              <ExternalLink size={18} />
            </a>
            {/* Download */}
            <a
              href={pdfUrl}
              download
              className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              title="Ladda ner"
            >
              <Download size={18} />
            </a>
            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              title="Stäng (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PDF iframe */}
        <div className="flex-1 bg-card border-x border-b border-border rounded-b-xl overflow-hidden">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            className="w-full h-full"
            title={title || "PDF-dokument"}
          />
        </div>
      </div>
    </div>
  );
}
