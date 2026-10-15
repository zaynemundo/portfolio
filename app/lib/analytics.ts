import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";

/* The numbers behind the Overview's analytics, from the PageView table
 * (recorded by app/api/track). Days are counted in Dubai time. */

export type AnalyticsRange = 7 | 30;

export interface AnalyticsSummary {
  views: number;
  visitors: number;
  /** The same two for the period just before, to compare against. */
  previous: { views: number; visitors: number };
  /** One entry per day, oldest first, including days with no visits. */
  daily: { day: string; views: number; visitors: number }[];
  pages: { path: string; views: number }[];
  referrers: { site: string; views: number }[];
  countries: { code: string; views: number }[];
}

const TIME_ZONE = "Asia/Dubai";

function dubaiDay(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(date);
}

async function load(days: AnalyticsRange): Promise<AnalyticsSummary> {
  const span = days * 24 * 60 * 60 * 1000;
  const since = new Date(Date.now() - span);
  const before = new Date(Date.now() - span * 2);
  const where = { createdAt: { gte: since } };
  const wherePrevious = { createdAt: { gte: before, lt: since } };

  const [daily, views, pages, referrers, countries, prevViews, prevVisitors] = await Promise.all([
    prisma.$queryRaw<{ day: string; views: number; visitors: number }[]>`
      SELECT to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${TIME_ZONE}, 'YYYY-MM-DD') AS day,
             count(*)::int AS views,
             count(DISTINCT "visitorId")::int AS visitors
      FROM "PageView"
      WHERE "createdAt" >= ${since}
      GROUP BY 1
      ORDER BY 1`,
    prisma.pageView.count({ where }),
    prisma.pageView.groupBy({ by: ["path"], where, _count: { _all: true }, orderBy: { _count: { path: "desc" } }, take: 8 }),
    prisma.pageView.groupBy({ by: ["referrer"], where: { ...where, referrer: { not: null } }, _count: { _all: true }, orderBy: { _count: { referrer: "desc" } }, take: 6 }),
    prisma.pageView.groupBy({ by: ["country"], where: { ...where, country: { not: null } }, _count: { _all: true }, orderBy: { _count: { country: "desc" } }, take: 6 }),
    prisma.pageView.count({ where: wherePrevious }),
    prisma.$queryRaw<{ visitors: number }[]>`
      SELECT coalesce(sum(n), 0)::int AS visitors FROM (
        SELECT count(DISTINCT "visitorId") AS n
        FROM "PageView"
        WHERE "createdAt" >= ${before} AND "createdAt" < ${since}
        GROUP BY to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${TIME_ZONE}, 'YYYY-MM-DD')
      ) per_day`,
  ]);

  // Every day in the range, so quiet days show as empty bars rather than disappearing.
  const byDay = new Map(daily.map((d) => [d.day, d]));
  const series: AnalyticsSummary["daily"] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = dubaiDay(new Date(Date.now() - i * 24 * 60 * 60 * 1000));
    series.push(byDay.get(day) ?? { day, views: 0, visitors: 0 });
  }

  return {
    views,
    // The visitor id resets daily, so visitors are counted per day and added up.
    visitors: daily.reduce((sum, d) => sum + d.visitors, 0),
    previous: { views: prevViews, visitors: prevVisitors[0]?.visitors ?? 0 },
    daily: series,
    pages: pages.map((p) => ({ path: p.path, views: p._count._all })),
    referrers: referrers.map((r) => ({ site: r.referrer!, views: r._count._all })),
    countries: countries.map((c) => ({ code: c.country!, views: c._count._all })),
  };
}

/** Cached for five minutes: fresh enough for a portfolio, and the Overview stays quick. */
export const getAnalytics = unstable_cache(load, ["analytics-summary-v3"], { revalidate: 300 });
