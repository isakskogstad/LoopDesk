import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { SessionProvider } from "@/components/providers/session-provider";
import { PageTransition } from "@/components/ui/page-transition";
import { ToolProvider } from "@/components/tools/ToolProvider";
import { ToolHost } from "@/components/tools/ToolHost";
import { PersonLinkerProvider } from "@/components/person-linker";
import { ChatPanel } from "@/components/chat/ChatPanel";
import "./globals.css";

// All fonts loaded via CSS @import in globals.css

export const metadata: Metadata = {
  title: "LoopDesk - Nyheter & Bolagsinformation",
  description: "Nyheter, bolagsinformation och mer - allt på ett ställe",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <head>
        <meta name="theme-color" content="#FEFDFB" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased">
        {/* Gradient Mesh Background */}
        <div className="gradient-mesh" aria-hidden="true">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>

        <SessionProvider>
          <PersonLinkerProvider>
            <ToolProvider>
              <Navigation />
              <main className="container-fluid section-spacing">
                <PageTransition>{children}</PageTransition>
              </main>
              <ToolHost />
              <ChatPanel />
            </ToolProvider>
          </PersonLinkerProvider>
        </SessionProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
