"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log critical error
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="sv">
      <body>
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="p-4 bg-red-100 rounded-full">
                <AlertTriangle size={48} className="text-red-600" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-semibold text-foreground mb-3">
              Kritiskt fel
            </h1>

            {/* Error Message */}
            <p className="text-muted-foreground mb-6">
              Ett kritiskt fel uppstod i applikationen. Vänligen ladda om sidan.
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === "development" && (
              <div className="mb-6 p-4 bg-secondary rounded-lg text-left">
                <p className="text-sm font-mono text-foreground break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
                {error.stack && (
                  <details className="mt-3">
                    <summary className="text-xs text-muted-foreground cursor-pointer">
                      Stack trace
                    </summary>
                    <pre className="mt-2 text-xs text-muted-foreground overflow-auto max-h-40">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={reset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw size={18} />
                Ladda om
              </button>
              <button
                onClick={() => window.location.href = "/"}
                className="px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors"
              >
                Tillbaka till startsidan
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
