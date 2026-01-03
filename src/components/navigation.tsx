"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Newspaper, Building2, LogIn, Eye, Bell, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDarkMode } from "@/lib/hooks/use-dark-mode";

const navItems = [
  {
    href: "/nyheter",
    label: "Nyheter",
    icon: Newspaper,
  },
  {
    href: "/bolag",
    label: "Bolag",
    icon: Building2,
  },
  {
    href: "/bevakning",
    label: "Bevakningslista",
    icon: Eye,
  },
  {
    href: "/bolaghandelser",
    label: "Bolagshändelser",
    icon: Bell,
  },
];

function getUserInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { isDark, toggle, isLoaded } = useDarkMode();

  // Don't show nav on auth pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="nav-logo-icon">LD</div>
            <span className="hidden sm:inline font-display font-bold tracking-tight">LoopDesk</span>
          </Link>

          {/* Nav Links + Auth */}
          <div className="flex items-center gap-4">
            {/* Nav Links */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Theme Toggle */}
            {isLoaded && (
              <button
                onClick={toggle}
                className="theme-toggle-btn"
                aria-label="Växla tema"
              >
                {isDark ? <Sun /> : <Moon />}
              </button>
            )}

            {/* Auth Section */}
            {status === "loading" ? (
              <div className="user-avatar-lg animate-pulse" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="user-avatar-lg">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || ""}
                      />
                    ) : (
                      <span>{getUserInitials(session.user?.name)}</span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{session.user?.name || "Användare"}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/konto">Konto</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/konto/losenord">Byt lösenord</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mörkt läge</span>
                      <Switch
                        checked={isDark}
                        onCheckedChange={toggle}
                        aria-label="Växla mörkt läge"
                      />
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    Logga ut
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">
                  <LogIn className="mr-2 h-4 w-4" />
                  Logga in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
