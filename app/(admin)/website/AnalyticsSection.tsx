import Link from "next/link";
import { routes } from "@/app/(admin)/_routes";
import { Card, CardHeader } from "@/app/(admin)/_components/ui/Card";
import { Donut, Sparkline, TrafficChart } from "./Charts";
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

function StatCard({ label, value, before, spark, href, days }: { label: string; value: number; before: number; spark?: number[]; href?: string; days: number }) {
  const delta = change(value, before);
  const body = (
    <>
      <dt className="text-[12px] font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 flex items-baseline gap-2">
        <span className="text-[22px] font-bold leading-tight tracking-tight tabular-nums">{NUMBER.format(value)}</span>
        {delta && (
          <span className={cn("text-[12px] font-semibold tabular-nums", delta.up ? "text-positive" : "text-negative")} title={`Compared with the ${days} days before`}>
            {delta.text}
          </span>
        )}
      </dd>
      {spark && <dd className="mt-2"><Sparkline values={spark} /></dd>}
    </>
  );
  const className = "block rounded-2xl border border-border/60 bg-card px-4 py-3.5";
  return href ? <Link href={href} className={cn(className, "transition-opacity hover:opacity-85")}>{body}</Link> : <div className={className}>{body}</div>;
}

export function AnalyticsSection({ data, days, caseStudies }: { data: AnalyticsSummary; days: AnalyticsRange; caseStudies: Map<string, string> }) {
  const devices = ["desktop", "mobile"].map((d) => ({ label: d === "mobile" ? "Phones" : "Computers", value: data.devices.find((x) => x.device === d)?.views ?? 0 }));
  const referred = data.referrers.reduce((sum, r) => sum + r.views, 0);
  const sources = [...data.referrers.slice(0, 3).map((r) => ({ label: r.site, value: r.views })), { label: "Direct and others", value: Math.max(0, data.views - referred) }].filter((p) => p.value > 0);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-[14.5px] font-semibold tracking-tight text-foreground">Visitors</h2>
        <div className="flex rounded-full border border-border bg-card p-0.5 text-[12px] font-semibold">
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

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Page views" value={data.views} before={data.previous.views} spark={data.daily.map((d) => d.views)} days={days} />
        <StatCard label="Visitors" value={data.visitors} before={data.previous.visitors} spark={data.daily.map((d) => d.visitors)} days={days} />
        <StatCard label="Messages" value={data.messages} before={data.previous.messages} href={routes.inquiries.list} days={days} />
      </dl>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <Card padded className="lg:col-span-2">
          <h3 className="mb-4 text-[14.5px] font-semibold tracking-tight text-foreground">Traffic</h3>
          <TrafficChart days={data.daily} />
        </Card>
        <div className="grid gap-3">
          <Card padded>
            <h3 className="mb-4 text-[14.5px] font-semibold tracking-tight text-foreground">Devices</h3>
            <Donut parts={devices} empty="No visits yet." />
          </Card>
          <Card padded>
            <h3 className="mb-4 text-[14.5px] font-semibold tracking-tight text-foreground">Sources</h3>
            <Donut parts={sources} empty="No visits yet." />
          </Card>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader title="Top pages" />
          <BarList
            rows={data.pages.map((p) => ({ label: pageName(p.path, caseStudies), detail: pageName(p.path, caseStudies) === p.path ? undefined : p.path, value: p.views }))}
            empty="No page views yet."
          />
        </Card>
        <Card>
          <CardHeader title="Countries" />
          <BarList rows={data.countries.map((c) => ({ label: countryName(c.code), value: c.views }))} empty="No countries yet." />
        </Card>
      </div>
    </section>
  );
}
