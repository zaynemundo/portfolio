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

type VisitRow = { createdAt: Date; visitorId: string };

/** Views per day, plus the set of visitors per day (the visitor id changes daily). */
function groupByDay(rows: VisitRow[]): Map<string, { views: number; visitors: Set<string> }> {
  const byDay = new Map<string, { views: number; visitors: Set<string> }>();
  for (const row of rows) {
    const day = dubaiDay(row.createdAt);
    const entry = byDay.get(day) ?? { views: 0, visitors: new Set<string>() };
    entry.views += 1;
    entry.visitors.add(row.visitorId);
    byDay.set(day, entry);
  }
  return byDay;
}

async function load(days: AnalyticsRange): Promise<AnalyticsSummary> {
  const span = days * 24 * 60 * 60 * 1000;
  const since = new Date(Date.now() - span);
  const before = new Date(Date.now() - span * 2);
  const where = { createdAt: { gte: since } };
  const wherePrevious = { createdAt: { gte: before, lt: since } };

  // Daily numbers are grouped here rather than in raw SQL so the same code
  // runs on SQLite/D1 and on Postgres.
  const [visits, pages, referrers, countries, previousVisits] = await Promise.all([
    prisma.pageView.findMany({ where, select: { createdAt: true, visitorId: true } }),
    prisma.pageView.groupBy({ by: ["path"], where, _count: { _all: true }, orderBy: { _count: { path: "desc" } }, take: 8 }),
    prisma.pageView.groupBy({ by: ["referrer"], where: { ...where, referrer: { not: null } }, _count: { _all: true }, orderBy: { _count: { referrer: "desc" } }, take: 6 }),
    prisma.pageView.groupBy({ by: ["country"], where: { ...where, country: { not: null } }, _count: { _all: true }, orderBy: { _count: { country: "desc" } }, take: 6 }),
    prisma.pageView.findMany({ where: wherePrevious, select: { createdAt: true, visitorId: true } }),
  ]);

  const byDay = groupByDay(visits);
  const daily = [...byDay].map(([day, entry]) => ({ day, views: entry.views, visitors: entry.visitors.size }));

  // Every day in the range, so quiet days show as empty bars rather than disappearing.
  const dailyMap = new Map(daily.map((d) => [d.day, d]));
  const series: AnalyticsSummary["daily"] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = dubaiDay(new Date(Date.now() - i * 24 * 60 * 60 * 1000));
    series.push(dailyMap.get(day) ?? { day, views: 0, visitors: 0 });
  }

  const previousByDay = groupByDay(previousVisits);
  const previousVisitors = [...previousByDay.values()].reduce((sum, entry) => sum + entry.visitors.size, 0);

  return {
    views: visits.length,
    // The visitor id resets daily, so visitors are counted per day and added up.
    visitors: daily.reduce((sum, d) => sum + d.visitors, 0),
    previous: { views: previousVisits.length, visitors: previousVisitors },
    daily: series,
    pages: pages.map((p) => ({ path: p.path, views: p._count._all })),
    referrers: referrers.map((r) => ({ site: r.referrer!, views: r._count._all })),
    countries: countries.map((c) => ({ code: c.country!, views: c._count._all })),
  };
}

/** Cached for five minutes: fresh enough for a portfolio, and the Overview stays quick. */
export const getAnalytics = unstable_cache(load, ["analytics-summary-v4"], { revalidate: 300 });
