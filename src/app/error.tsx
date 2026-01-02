"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-xl p-8 text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertTriangle size={48} className="text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-foreground mb-3">
          Något gick fel
        </h1>

        {/* Error Message */}
        <p className="text-muted-foreground mb-6">
          Ett oväntat fel uppstod. Försök att ladda om sidan eller gå tillbaka till startsidan.
        </p>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 p-4 bg-secondary rounded-lg text-left">
            <p className="text-sm font-mono text-foreground break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={18} />
            Försök igen
          </button>
          <a
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors"
          >
            <Home size={18} />
            Hem
          </a>
        </div>
      </div>
    </div>
  );
}
