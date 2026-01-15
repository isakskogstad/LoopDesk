import useSWR from 'swr';
import type { CompanyFinancialsResponse } from './types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

const fetcher = async (url: string): Promise<CompanyFinancialsResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch company financials');
  }
  return res.json();
};

export function useCompanyFinancials(orgNumber: string | null, years: number = 5) {
  const { data, error, isLoading, mutate } = useSWR<CompanyFinancialsResponse>(
    orgNumber
      ? `${SUPABASE_URL}/functions/v1/get-company-financials?orgNumber=${orgNumber}&years=${years}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Utility functions for formatting
export function formatCurrency(value: number | null | undefined, decimals: number = 0): string {
  if (value === null || value === undefined) return '–';

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1_000_000_000) {
    return `${sign}${(absValue / 1_000_000_000).toFixed(decimals)} mdr`;
  }
  if (absValue >= 1_000_000) {
    return `${sign}${(absValue / 1_000_000).toFixed(decimals)} MSEK`;
  }
  if (absValue >= 1_000) {
    return `${sign}${(absValue / 1_000).toFixed(decimals)} TSEK`;
  }
  return `${sign}${absValue.toFixed(decimals)} SEK`;
}

export function formatPercent(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined) return '–';
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number | null | undefined, decimals: number = 0): string {
  if (value === null || value === undefined) return '–';
  return value.toLocaleString('sv-SE', { maximumFractionDigits: decimals });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'Safe': 'var(--green)',
    'Strong': 'var(--green)',
    'Excellent': 'var(--green)',
    'Good': 'var(--blue)',
    'Grey': 'var(--orange)',
    'Adequate': 'var(--orange)',
    'Moderate': 'var(--orange)',
    'Distress': 'var(--accent)',
    'Weak': 'var(--accent)',
    'High': 'var(--accent)',
    'Low': 'var(--green)',
  };
  return colors[status] || 'var(--text-muted)';
}

export function getStatusBgColor(status: string): string {
  const colors: Record<string, string> = {
    'Safe': 'var(--green-soft)',
    'Strong': 'var(--green-soft)',
    'Excellent': 'var(--green-soft)',
    'Good': 'var(--blue-soft)',
    'Grey': 'var(--orange-soft)',
    'Adequate': 'var(--orange-soft)',
    'Moderate': 'var(--orange-soft)',
    'Distress': 'var(--accent-soft)',
    'Weak': 'var(--accent-soft)',
    'High': 'var(--accent-soft)',
    'Low': 'var(--green-soft)',
  };
  return colors[status] || 'var(--bg-muted)';
}
