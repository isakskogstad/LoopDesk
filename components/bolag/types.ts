// Types for company financial data from Edge Function

export interface CompanyMetrics {
  profitMargin: number | null;
  operatingMargin: number | null;
  ebitdaMargin: number | null;
  roe: number | null;
  roa: number | null;
  solidityRatio: number | null;
  currentRatio: number | null;
  quickRatio: number | null;
  debtRatio: number | null;
  interestCoverage: number | null;
  revenuePerEmployee: number | null;
  assetTurnover: number | null;
  ebitda: number;
  ebit: number;
  bookValue: number;
  revenueGrowth: number | null;
  netIncomeGrowth: number | null;
}

export interface ValuationRange {
  low: number;
  mid: number;
  high: number;
  multiple: number;
}

export interface CompanyValuation {
  bookValue: number;
  ebitda: number;
  evRevenueRange: ValuationRange;
  evEbitdaRange: ValuationRange;
  peRange: ValuationRange | null;
  impliedMultiples: {
    evRevenue: number | null;
    evEbitda: number;
    pe: number | null;
  };
}

export interface AltmanZ {
  score: number;
  status: 'Safe' | 'Grey' | 'Distress';
}

export interface PiotroskiF {
  score: number;
  details: string[];
}

export interface RatioWithStatus {
  value: number;
  status: string;
}

export interface CompanyStrength {
  altmanZ: AltmanZ | null;
  piotroskiF: PiotroskiF | null;
  interestCoverage: RatioWithStatus | null;
  currentRatio: RatioWithStatus | null;
  quickRatio: RatioWithStatus | null;
  debtRatio: RatioWithStatus | null;
  overall: 'Strong' | 'Adequate' | 'Weak' | null;
}

export interface CompanyTrends {
  revenueCAGR: number | null;
  netIncomeCAGR: number | null;
  marginChange: number;
  solidityChange: number;
  yearsAnalyzed: number;
}

export interface BalanceSheet {
  assets: {
    fixed: number;
    accountsReceivable: number;
    otherReceivables: number;
    inventory: number;
    cashAndBank: number;
    total: number;
  };
  equityAndLiabilities: {
    equity: number;
    longTermLiabilities: number;
    accountsPayable: number;
    currentLiabilities: number;
    total: number;
  };
}

export interface IncomeStatement {
  revenue: number;
  rawMaterialCosts: number;
  personnelCosts: number;
  otherExternalCosts: number;
  depreciation: number;
  operatingResult: number;
  resultAfterFinancial: number;
  netIncome: number;
}

export interface HistoricalData {
  fiscalYear: number;
  revenue: number | null;
  netIncome: number | null;
  totalAssets: number | null;
  equity: number | null;
  solidityRatio: number | null;
  avgEmployees: number | null;
}

export interface CompanyFinancialsResponse {
  orgNumber: string;
  latestYear: number | null;
  avgEmployees: number | null;
  metrics: CompanyMetrics | null;
  valuation: CompanyValuation | null;
  strength: CompanyStrength;
  trends: CompanyTrends | null;
  balanceSheet: BalanceSheet | null;
  incomeStatement: IncomeStatement | null;
  history: HistoricalData[];
}
