/**
 * 2Captcha Stats Module
 * Fetches balance and usage statistics from 2captcha API
 *
 * Ported from original twocaptcha-stats.js
 */

const API_KEY = process.env.TWOCAPTCHA_API_KEY || '';

export interface CaptchaStats {
  hour: number;
  volume: number;
  money: number;
}

export interface ProxyInfo {
  totalTrafficMB: number;
  usedTrafficMB: number;
  remainingTrafficMB: number;
  whitelistedIPs: string[];
}

export interface StatsResult {
  hours: number;
  captchaCount: number;
  captchaCost: number;
}

export interface BudgetReport {
  balance: number;
  captcha: {
    last1h: { count: number; cost: number };
    last24h: { count: number; cost: number };
  };
  proxy: {
    totalTrafficMB: number;
    usedTrafficMB: number;
    remainingTrafficMB: number;
    estimatedCost: number;
  };
  totals: {
    last1h: number;
    last24h: number;
  };
  timestamp: string;
}

/**
 * Get current account balance
 */
export async function getBalance(): Promise<number> {
  if (!API_KEY) return 0;

  try {
    const url = new URL('https://2captcha.com/res.php');
    url.searchParams.set('key', API_KEY);
    url.searchParams.set('action', 'getbalance');
    url.searchParams.set('json', '1');

    const response = await fetch(url.toString());
    const result = await response.json();

    if (result.status === 1) {
      return parseFloat(result.request);
    }
    return 0;
  } catch (error) {
    console.error('[2captcha-stats] Error getting balance:', error);
    return 0;
  }
}

/**
 * Get proxy account info (traffic usage)
 */
export async function getProxyInfo(): Promise<ProxyInfo> {
  if (!API_KEY) {
    return { totalTrafficMB: 0, usedTrafficMB: 0, remainingTrafficMB: 0, whitelistedIPs: [] };
  }

  try {
    const url = new URL('https://api.2captcha.com/proxy');
    url.searchParams.set('key', API_KEY);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status === 'OK' && data.data) {
      return {
        totalTrafficMB: data.data.total_flow || 0,
        usedTrafficMB: data.data.use_flow || 0,
        remainingTrafficMB: data.data.last_flow || 0,
        whitelistedIPs: data.data.ip_white || [],
      };
    }
  } catch (error) {
    console.error('[2captcha-stats] Error getting proxy info:', error);
  }

  return { totalTrafficMB: 0, usedTrafficMB: 0, remainingTrafficMB: 0, whitelistedIPs: [] };
}

/**
 * Get captcha solving statistics for a specific date
 */
export async function getCaptchaStats(date: Date | string): Promise<CaptchaStats[]> {
  if (!API_KEY) return [];

  try {
    const dateStr = date instanceof Date
      ? date.toISOString().split('T')[0]
      : date;

    const url = new URL('https://2captcha.com/res.php');
    url.searchParams.set('key', API_KEY);
    url.searchParams.set('action', 'getstats');
    url.searchParams.set('date', dateStr);

    const response = await fetch(url.toString());
    const data = await response.text();

    // Parse XML response
    const stats: CaptchaStats[] = [];
    const regex = /<stats[^>]*hour="(\d+)"[^>]*><volume>(\d+)<\/volume><money>([\d.]+)<\/money><\/stats>/g;
    let match;

    while ((match = regex.exec(data)) !== null) {
      stats.push({
        hour: parseInt(match[1]),
        volume: parseInt(match[2]),
        money: parseFloat(match[3]),
      });
    }

    return stats;
  } catch (error) {
    console.error('[2captcha-stats] Error getting captcha stats:', error);
    return [];
  }
}

/**
 * Get aggregated statistics for last N hours
 */
export async function getStatsLastHours(hours = 24): Promise<StatsResult> {
  const now = new Date();
  const currentHour = now.getHours();

  // Get today's stats
  const todayStats = await getCaptchaStats(now);

  // Get yesterday's stats if needed
  let yesterdayStats: CaptchaStats[] = [];
  if (hours > currentHour + 1) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterdayStats = await getCaptchaStats(yesterday);
  }

  // Calculate stats for requested period
  let totalVolume = 0;
  let totalMoney = 0;

  // Hours from today
  const hoursFromToday = Math.min(hours, currentHour + 1);
  for (let i = currentHour; i >= currentHour - hoursFromToday + 1 && i >= 0; i--) {
    const stat = todayStats.find(s => s.hour === i);
    if (stat) {
      totalVolume += stat.volume;
      totalMoney += stat.money;
    }
  }

  // Hours from yesterday if needed
  const hoursFromYesterday = hours - hoursFromToday;
  if (hoursFromYesterday > 0) {
    for (let i = 23; i >= 24 - hoursFromYesterday && i >= 0; i--) {
      const stat = yesterdayStats.find(s => s.hour === i);
      if (stat) {
        totalVolume += stat.volume;
        totalMoney += stat.money;
      }
    }
  }

  return {
    hours,
    captchaCount: totalVolume,
    captchaCost: Math.round(totalMoney * 1000) / 1000,
  };
}

/**
 * Get full budget report
 */
export async function getBudgetReport(): Promise<BudgetReport> {
  try {
    const [balance, proxyInfo, stats1h, stats24h] = await Promise.all([
      getBalance(),
      getProxyInfo(),
      getStatsLastHours(1),
      getStatsLastHours(24),
    ]);

    // Proxy cost calculation (approximate: $3/GB for residential)
    const proxyPricePerGB = 3.0;
    const proxyUsedGB = proxyInfo.usedTrafficMB / 1024;
    const proxyCostEstimate = Math.round(proxyUsedGB * proxyPricePerGB * 1000) / 1000;

    return {
      balance: Math.round(balance * 100) / 100,
      captcha: {
        last1h: {
          count: stats1h.captchaCount,
          cost: stats1h.captchaCost,
        },
        last24h: {
          count: stats24h.captchaCount,
          cost: stats24h.captchaCost,
        },
      },
      proxy: {
        totalTrafficMB: proxyInfo.totalTrafficMB,
        usedTrafficMB: proxyInfo.usedTrafficMB,
        remainingTrafficMB: proxyInfo.remainingTrafficMB,
        estimatedCost: proxyCostEstimate,
      },
      totals: {
        last1h: Math.round(stats1h.captchaCost * 1000) / 1000,
        last24h: Math.round((stats24h.captchaCost + proxyCostEstimate) * 1000) / 1000,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[2captcha-stats] Error getting budget report:', error);
    throw error;
  }
}

export default {
  getBalance,
  getProxyInfo,
  getCaptchaStats,
  getStatsLastHours,
  getBudgetReport,
};
