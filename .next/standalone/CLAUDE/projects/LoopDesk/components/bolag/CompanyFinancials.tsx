'use client';

import { useState } from 'react';
import { useCompanyFinancials } from './use-company-financials';
import { QuickStats } from './QuickStats';
import { HighlightCards } from './HighlightCards';
import { OverviewSection } from './OverviewSection';
import { ValuationSection } from './ValuationSection';
import { StrengthSection } from './StrengthSection';
import { TrendSection } from './TrendSection';
import styles from './company-financials.module.css';

interface CompanyFinancialsProps {
  orgNumber: string;
  companyName?: string;
}

type TabId = 'overview' | 'valuation' | 'analysis';

export function CompanyFinancials({ orgNumber, companyName }: CompanyFinancialsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const { data, isLoading, error } = useCompanyFinancials(orgNumber);

  if (isLoading) {
    return (
      <div className={styles.emptyState}>
        <p>Laddar finansiell data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <p>Kunde inte ladda finansiell data</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.emptyState}>
        <p>Ingen finansiell data tillgänglig</p>
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Översikt' },
    { id: 'valuation', label: 'Värdering' },
    { id: 'analysis', label: 'Finansiell analys' },
  ];

  return (
    <div>
      {/* Quick Stats Row */}
      <QuickStats
        metrics={data.metrics}
        incomeStatement={data.incomeStatement}
        avgEmployees={data.avgEmployees}
        latestYear={data.latestYear}
      />

      {/* Highlight Cards */}
      <HighlightCards
        valuation={data.valuation}
        strength={data.strength}
        trends={data.trends}
      />

      {/* Tab Navigation */}
      <nav className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab Panels */}
      <div className={`${styles.tabPanel} ${activeTab === 'overview' ? styles.active : ''}`}>
        <OverviewSection
          metrics={data.metrics}
          balanceSheet={data.balanceSheet}
          incomeStatement={data.incomeStatement}
          history={data.history}
        />
      </div>

      <div className={`${styles.tabPanel} ${activeTab === 'valuation' ? styles.active : ''}`}>
        <ValuationSection
          valuation={data.valuation}
          metrics={data.metrics}
          incomeStatement={data.incomeStatement}
        />
      </div>

      <div className={`${styles.tabPanel} ${activeTab === 'analysis' ? styles.active : ''}`}>
        <StrengthSection
          strength={data.strength}
          metrics={data.metrics}
        />
        <TrendSection
          trends={data.trends}
          history={data.history}
          metrics={data.metrics}
        />
      </div>
    </div>
  );
}

export default CompanyFinancials;
