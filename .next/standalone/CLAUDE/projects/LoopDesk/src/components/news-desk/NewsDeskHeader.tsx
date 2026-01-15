"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Volume2, VolumeX, PanelRight } from "lucide-react";
import { useState } from "react";

interface NewsDeskHeaderProps {
  onPanelToggle: () => void;
  panelBadgeCount?: number;
}

const navLinks = [
  { href: "/", label: "Flodet" },
  { href: "/personer", label: "Personer" },
  { href: "/bolag", label: "Bolag" },
  { href: "/bevakning", label: "Bevakning" },
];

export function NewsDeskHeader({ onPanelToggle, panelBadgeCount = 7 }: NewsDeskHeaderProps) {
  const pathname = usePathname();
  const [soundEnabled, setSoundEnabled] = useState(false);

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  return (
    <header className="news-desk-header">
      <Link href="/" className="logo-with-accent">
        <span className="block">Loop</span>
        <span className="block">Desk</span>
      </Link>

      <nav className="news-desk-nav">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`news-desk-nav-link ${pathname === link.href ? "active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex-1" />

      <div className="live-indicator">
        <span className="live-dot" />
        LIVE
      </div>

      <div className="flex items-center gap-2">
        <button
          className={`sound-toggle ${soundEnabled ? "active" : ""}`}
          onClick={toggleSound}
          title="Notifikationsljud"
        >
          {soundEnabled ? (
            <Volume2 size={20} />
          ) : (
            <VolumeX size={20} />
          )}
        </button>

        <button className="icon-btn" title="Sok">
          <Search size={20} />
        </button>

        <button
          className="panel-toggle-btn"
          onClick={onPanelToggle}
          title="Redaktionspanel"
        >
          <PanelRight size={20} />
          {panelBadgeCount > 0 && (
            <span className="badge">{panelBadgeCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}
