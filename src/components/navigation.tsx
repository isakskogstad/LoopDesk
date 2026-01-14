"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Newspaper, Building2, LogIn, Eye, Bell, Sun, Moon, User, Key, LogOut, Menu, X } from "lucide-react";
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
    label: "Investerar-databaser",
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Track scroll position for header blur effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial position
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Don't show nav on auth pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <>
    <nav className={cn(
      "sticky top-0 z-50 border-b transition-all duration-300",
      isScrolled
        ? "border-border/50 bg-background/80 backdrop-blur-xl shadow-sm"
        : "border-transparent bg-background/95 backdrop-blur-sm"
    )}>
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="nav-logo-icon">LD</div>
            <span className="hidden sm:inline font-display font-bold tracking-tight">LoopDesk</span>
          </Link>

          {/* Desktop Nav Links + Auth */}
          <div className="hidden md:flex items-center gap-4">
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
                      "relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    <item.icon className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isActive && "scale-110 text-[hsl(355,82%,56%)]"
                    )} />
                    <span>{item.label}</span>
                    {/* Active indicator - Tema A red accent */}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[hsl(355,82%,56%)] rounded-full animate-in fade-in slide-in-from-bottom-1 duration-200" />
                    )}
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
                  <button className="user-avatar-lg ring-2 ring-transparent hover:ring-border transition-all duration-200">
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
                <DropdownMenuContent
                  align="end"
                  className="w-64 glass shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
                  sideOffset={8}
                >
                  {/* User info header */}
                  <div className="px-3 py-3 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                        {session.user?.image ? (
                          <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-medium">{getUserInitials(session.user?.name)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{session.user?.name || "Användare"}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {session.user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <DropdownMenuItem asChild className="cursor-pointer gap-2 px-3 py-2">
                      <Link href="/konto">
                        <User className="w-4 h-4" />
                        Kontoinställningar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer gap-2 px-3 py-2">
                      <Link href="/konto/losenord">
                        <Key className="w-4 h-4" />
                        Byt lösenord
                      </Link>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator className="bg-border/50" />

                  {/* Theme toggle */}
                  <div className="px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        <span className="text-sm">Mörkt läge</span>
                      </div>
                      <Switch
                        checked={isDark}
                        onCheckedChange={toggle}
                        aria-label="Växla mörkt läge"
                      />
                    </div>
                  </div>

                  <DropdownMenuSeparator className="bg-border/50" />

                  {/* Logout */}
                  <div className="py-1">
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="cursor-pointer gap-2 px-3 py-2 text-destructive focus:text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      Logga ut
                    </DropdownMenuItem>
                  </div>
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

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-2">
            {/* Theme Toggle - Mobile */}
            {isLoaded && (
              <button
                onClick={toggle}
                className="theme-toggle-btn w-9 h-9"
                aria-label="Växla tema"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {/* User avatar - Mobile */}
            {status !== "loading" && session && (
              <Link href="/konto" className="user-avatar-sm">
                {session.user?.image ? (
                  <img src={session.user.image} alt={session.user.name || ""} />
                ) : (
                  <span className="text-xs">{getUserInitials(session.user?.name)}</span>
                )}
              </Link>
            )}

            {/* Hamburger menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-foreground hover:bg-secondary transition-colors"
              aria-label={isMobileMenuOpen ? "Stäng meny" : "Öppna meny"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>

    {/* Mobile Menu Overlay */}
    {isMobileMenuOpen && (
      <div className="fixed inset-0 z-40 md:hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu panel */}
        <div className="absolute top-14 left-0 right-0 bottom-0 bg-background border-t border-border overflow-y-auto animate-in slide-in-from-top-2 duration-200">
          <div className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className={cn(
                    "h-5 w-5",
                    isActive && "text-foreground"
                  )} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="h-px bg-border mx-4 my-2" />

          {/* User section - Mobile */}
          <div className="p-4 space-y-2">
            {session ? (
              <>
                {/* User info */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/50">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                    {session.user?.image ? (
                      <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-medium">{getUserInitials(session.user?.name)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{session.user?.name || "Användare"}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                  </div>
                </div>

                <Link
                  href="/konto"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span>Kontoinställningar</span>
                </Link>

                <Link
                  href="/konto/losenord"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Key className="h-5 w-5" />
                  <span>Byt lösenord</span>
                </Link>

                {/* Theme toggle row */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-secondary/30">
                  <div className="flex items-center gap-3">
                    {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    <span className="text-base font-medium">Mörkt läge</span>
                  </div>
                  <Switch
                    checked={isDark}
                    onCheckedChange={toggle}
                    aria-label="Växla mörkt läge"
                  />
                </div>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signOut({ callbackUrl: "/login" });
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-destructive hover:bg-destructive/10 transition-all w-full"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logga ut</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-foreground text-background text-base font-medium transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LogIn className="h-5 w-5" />
                <span>Logga in</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
