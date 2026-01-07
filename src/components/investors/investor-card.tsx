"use client";

import { useState } from "react";
import {
  ChevronDown,
  Building2,
  MapPin,
  Calendar,
  User,
  Globe,
  Linkedin,
  Mail,
  Phone,
  ExternalLink,
  Briefcase,
} from "lucide-react";
import styles from "@/app/bevakning/investors.module.css";

export interface InvestorCardData {
  id: string;
  name: string;
  subtitle?: string | null;
  tags?: string[];
  description?: string | null;
  background?: string | null;
  focusAreas?: string[];
  portfolioCompanies?: string[];
  coInvestors?: string | null;
  notableDeals?: string | null;
  // Metadata
  region?: string | null;
  office?: string | null;
  founded?: number | null;
  type?: string | null;
  keyPeople?: string | null;
  // Contact
  website?: string | null;
  linkedin?: string | null;
  email?: string | null;
  phone?: string | null;
  readMoreUrl?: string | null;
}

interface InvestorCardProps {
  data: InvestorCardData;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function InvestorCard({ data, isExpanded = false, onToggle }: InvestorCardProps) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const expanded = onToggle ? isExpanded : localExpanded;
  const handleToggle = onToggle || (() => setLocalExpanded(!localExpanded));

  const location = data.region || data.office;
  const hasContact = data.website || data.linkedin || data.email || data.phone || data.readMoreUrl;

  return (
    <div className={styles.investorCard}>
      {/* Header - always visible */}
      <button className={styles.cardHeader} onClick={handleToggle}>
        <div className={styles.cardHeaderLeft}>
          <div className={styles.cardLogo}>
            {data.type === "VC" ? (
              <Briefcase />
            ) : (
              <Building2 />
            )}
          </div>
          <div className={styles.cardInfo}>
            <div className={styles.cardName}>{data.name}</div>
            {data.subtitle && (
              <div className={styles.cardSubtitle}>{data.subtitle}</div>
            )}
          </div>
        </div>

        <div className={styles.cardHeaderRight}>
          {data.tags && data.tags.length > 0 && (
            <div className={styles.cardTags}>
              {data.tags.slice(0, 2).map((tag, i) => (
                <span key={i} className={styles.cardTag}>{tag}</span>
              ))}
              {data.tags.length > 2 && (
                <span className={styles.cardTagMore}>+{data.tags.length - 2}</span>
              )}
            </div>
          )}
          <ChevronDown className={`${styles.expandIcon} ${expanded ? styles.expanded : ""}`} />
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className={styles.cardContent}>
          {/* Main content */}
          <div>
            {data.description && (
              <div className={styles.contentSection}>
                <div className={styles.contentLabel}>Om</div>
                <p className={styles.contentText}>{data.description}</p>
              </div>
            )}

            {data.background && (
              <div className={styles.contentSection}>
                <div className={styles.contentLabel}>Bakgrund</div>
                <p className={styles.contentText}>{data.background}</p>
              </div>
            )}

            {data.focusAreas && data.focusAreas.length > 0 && (
              <div className={styles.contentSection}>
                <div className={styles.contentLabel}>Investeringsfokus</div>
                <div className={styles.contentTags}>
                  {data.focusAreas.map((area, i) => (
                    <span key={i} className={styles.contentTag}>{area}</span>
                  ))}
                </div>
              </div>
            )}

            {data.portfolioCompanies && data.portfolioCompanies.length > 0 && (
              <div className={styles.contentSection}>
                <div className={styles.contentLabel}>Portföljbolag</div>
                <p className={styles.contentText}>
                  {data.portfolioCompanies.join(", ")}
                </p>
              </div>
            )}

            {data.coInvestors && (
              <div className={styles.contentSection}>
                <div className={styles.contentLabel}>Co-investorer</div>
                <p className={styles.contentText}>{data.coInvestors}</p>
              </div>
            )}

            {data.notableDeals && data.notableDeals !== "—" && (
              <div className={styles.contentSection}>
                <div className={styles.contentLabel}>Notabla affärer</div>
                <p className={styles.contentText}>{data.notableDeals}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className={styles.cardSidebar}>
            {/* Metadata box */}
            {(location || data.founded || data.keyPeople || data.type) && (
              <div className={styles.sidebarBox}>
                {data.type && (
                  <div className={styles.sidebarItem}>
                    <Briefcase />
                    <span>{data.type}</span>
                  </div>
                )}
                {location && (
                  <div className={styles.sidebarItem}>
                    <MapPin />
                    <span>{location}</span>
                  </div>
                )}
                {data.founded && (
                  <div className={styles.sidebarItem}>
                    <Calendar />
                    <span>Grundat {data.founded}</span>
                  </div>
                )}
                {data.keyPeople && (
                  <div className={styles.sidebarItem}>
                    <User />
                    <span>{data.keyPeople}</span>
                  </div>
                )}
              </div>
            )}

            {/* Contact links */}
            {hasContact && (
              <div className={styles.contactLinks}>
                {data.website && data.website !== "#" && (
                  <a
                    href={data.website.startsWith("http") ? data.website : `https://${data.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.contactLink}
                  >
                    <Globe />
                    Hemsida
                  </a>
                )}
                {data.linkedin && data.linkedin !== "#" && (
                  <a
                    href={data.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.contactLink}
                  >
                    <Linkedin />
                    LinkedIn
                  </a>
                )}
                {data.email && (
                  <a href={`mailto:${data.email}`} className={styles.contactLink}>
                    <Mail />
                    E-post
                  </a>
                )}
                {data.phone && (
                  <a href={`tel:${data.phone}`} className={styles.contactLink}>
                    <Phone />
                    Ring
                  </a>
                )}
                {data.readMoreUrl && (
                  <a
                    href={data.readMoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.contactLink}
                  >
                    <ExternalLink />
                    Läs mer
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
