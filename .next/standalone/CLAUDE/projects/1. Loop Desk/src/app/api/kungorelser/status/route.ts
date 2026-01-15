import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getScrapeStats } from "@/lib/kungorelser";
import { getScheduleState, getSchedulerLimits } from "@/lib/kungorelser/scheduler";
import { prisma } from "@/lib/db";

/**
 * GET /api/kungorelser/status
 *
 * Get status of kungörelser scraper including schedule state, watched companies, and 2captcha balance
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get scrape stats from database
    const stats = await getScrapeStats();

    // Get schedule state
    const schedule = await getScheduleState();
    const limits = getSchedulerLimits();

    // Get counts
    const [announcementCount, watchedCompanyCount] = await Promise.all([
      prisma.announcement.count(),
      prisma.watchedCompany.count(),
    ]);

    // Check 2captcha configuration and balance
    const twocaptchaKey = process.env.TWOCAPTCHA_API_KEY;
    const twocaptchaStatus = {
      configured: false,
      balance: 0,
      error: null as string | null,
    };

    if (twocaptchaKey) {
      twocaptchaStatus.configured = true;

      try {
        const balanceUrl = new URL("https://2captcha.com/res.php");
        balanceUrl.searchParams.set("key", twocaptchaKey);
        balanceUrl.searchParams.set("action", "getbalance");
        balanceUrl.searchParams.set("json", "1");

        const response = await fetch(balanceUrl.toString());
        const result = await response.json();

        if (result.status === 1) {
          twocaptchaStatus.balance = parseFloat(result.request);
        } else {
          twocaptchaStatus.error = result.request;
        }
      } catch (error) {
        twocaptchaStatus.error = error instanceof Error ? error.message : "Unknown error";
      }
    }

    // Check Playwright/browser availability
    const browserStatus = {
      available: false,
      error: null as string | null,
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const playwright = require('playwright-core');
      browserStatus.available = !!playwright.chromium;
    } catch (error) {
      browserStatus.error = error instanceof Error ? error.message : "Playwright not available";
    }

    return NextResponse.json({
      announcementCount,
      watchedCompanyCount,
      schedule,
      limits,
      stats: {
        totalSearches: stats.totalSearches,
        successfulSearches: stats.totalAnnouncements,
        failedSearches: stats.errors,
      },
      scraper: {
        ...stats,
        config: {
          detailDelayMs: parseInt(process.env.SCRAPER_DETAIL_DELAY_MS || '2000', 10),
          maxCaptchaRetries: parseInt(process.env.SCRAPER_MAX_CAPTCHA_RETRIES || '10', 10),
          navigationTimeout: parseInt(process.env.SCRAPER_NAVIGATION_TIMEOUT || '60000', 10),
          useProxy: process.env.SCRAPER_USE_PROXY === 'true',
        },
      },
      twocaptcha: twocaptchaStatus,
      browser: browserStatus,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        playwrightPath: process.env.PLAYWRIGHT_BROWSERS_PATH || 'default',
      },
    });
  } catch (error) {
    console.error("Error getting kungörelser status:", error);
    return NextResponse.json(
      {
        error: "Failed to get status",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
