import Link from "next/link";
import { Card, CardHeader } from "@/app/(admin)/_components/ui/Card";
import { TrafficChart } from "@/app/(admin)/_components/Charts";
import type { AnalyticsRange, AnalyticsSummary } from "@/app/lib/analytics";
import { cn } from "@/app/lib/utils";

const NUMBER = new Intl.NumberFormat("en-GB");
const COUNTRY = new Intl.DisplayNames(["en"], { type: "region" });

/** "/work/pno-marinas" → "P&O Marinas"; other pages get a plain name. */
function pageName(path: string, caseStudies: Map<string, string>): string {
  const match = path.match(/^\/(?:work|projects)\/([^/]+)/);
  if (match) return caseStudies.get(match[1]) ?? path;
  const named: Record<string, string> = { "/": "Home", "/work": "Work", "/projects": "Work", "/insights": "Insights", "/blog": "Insights" };
  return named[path] ?? path;
}

function countryName(code: string): string {
  try {
    return COUNTRY.of(code) ?? code;
  } catch {
    return code;
  }
}

/** A list of names with a bar showing each one's share of the top entry. */
function BarList({ rows, empty }: { rows: { label: string; detail?: string; value: number }[]; empty: string }) {
  if (rows.length === 0) return <p className="px-5 pb-5 text-[13px] text-muted-foreground">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <ul className="space-y-1.5 px-5 pb-5">
      {rows.map((row) => (
        <li key={row.label + (row.detail ?? "")} className="relative flex items-center justify-between gap-3 overflow-hidden rounded-md px-2.5 py-1.5 text-[13px]">
          <span className="absolute inset-y-0 left-0 rounded-md bg-primary/10" style={{ width: `${(row.value / max) * 100}%` }} aria-hidden />
          <span className="relative min-w-0 truncate text-foreground">
            {row.label}
            {row.detail && <span className="text-muted-foreground"> {row.detail}</span>}
          </span>
          <span className="relative shrink-0 tabular-nums text-muted-foreground">{NUMBER.format(row.value)}</span>
        </li>
      ))}
    </ul>
  );
}

/** Change against the period before, or nothing when there's nothing to compare. */
function change(now: number, before: number): { text: string; up: boolean } | null {
  if (before === 0) return null;
  const pct = Math.round(((now - before) / before) * 100);
  return { text: `${pct > 0 ? "+" : ""}${pct}%`, up: pct >= 0 };
}

/** One headline figure in the traffic card's header, with its change against the period before. */
function Figure({ label, value, before, days, swatch }: { label: string; value: number; before: number; days: number; swatch: React.ReactNode }) {
  const delta = change(value, before);
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
        {swatch}
        {label}
      </dt>
      <dd className="mt-1 flex items-baseline gap-2">
        <span className="text-[26px] font-bold leading-none tracking-tight tabular-nums">{NUMBER.format(value)}</span>
        {delta && (
          <span className={cn("text-[12px] font-semibold tabular-nums", delta.up ? "text-positive" : "text-negative")} title={`Compared with the ${days} days before`}>
            {delta.text}
          </span>
        )}
      </dd>
    </div>
  );
}

function ListCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader title={title} />
      {children}
    </Card>
  );
}

export function AnalyticsSection({ data, days, caseStudies }: { data: AnalyticsSummary; days: AnalyticsRange; caseStudies: Map<string, string> }) {
  const referred = data.referrers.reduce((sum, r) => sum + r.views, 0);
  const direct = Math.max(0, data.views - referred);
  const sources = [...data.referrers.map((r) => ({ label: r.site, value: r.views })), ...(direct ? [{ label: "Direct", detail: "typed in, bookmarks, apps", value: direct }] : [])].sort(
    (a, b) => b.value - a.value,
  );

  return (
    <section className="space-y-3">
      {/* The headline numbers sit on the chart they describe, with the period switch beside them. */}
      <div className="grid gap-3 lg:grid-cols-3">
        <Card padded className="lg:col-span-2">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <dl className="flex gap-8">
              <Figure label="Page views" value={data.views} before={data.previous.views} days={days} swatch={<span className="h-0.5 w-3 rounded-full bg-primary" />} />
              <Figure
                label="Visitors"
                value={data.visitors}
                before={data.previous.visitors}
                days={days}
                swatch={<span className="w-3 border-t-2 border-dashed border-foreground/45" />}
              />
            </dl>
            <div className="flex rounded-full border border-border bg-background p-0.5 text-[12px] font-semibold">
              {([7, 30] as const).map((n) => (
                <Link
                  key={n}
                  href={n === 7 ? "?" : `?days=${n}`}
                  scroll={false}
                  className={cn("rounded-full px-3 py-1 transition-colors", days === n ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
                >
                  {n} days
                </Link>
              ))}
            </div>
          </div>
          <TrafficChart days={data.daily} empty={data.views === 0 ? `No visits in the last ${days} days yet.` : undefined} />
        </Card>

        <ListCard title="Top pages">
          <BarList
            rows={data.pages.map((p) => ({ label: pageName(p.path, caseStudies), detail: pageName(p.path, caseStudies) === p.path ? undefined : p.path, value: p.views }))}
            empty="Pages appear here once people visit."
          />
        </ListCard>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ListCard title="Sources">
          <BarList rows={sources} empty="Where visitors come from: LinkedIn, Google, or straight in." />
        </ListCard>
        <ListCard title="Countries">
          <BarList rows={data.countries.map((c) => ({ label: countryName(c.code), value: c.views }))} empty="Where in the world visitors are." />
        </ListCard>
      </div>
    </section>
  );
}
