/* Small SVG charts for the Overview. No chart library: they're drawn on the
 * server from the numbers, so they add nothing to the page's JavaScript. */

const W = 600;
const H = 180;

/** A rounded-up top for the y axis, so gridlines land on tidy numbers. */
function niceMax(value: number): number {
  if (value <= 4) return 4;
  const step = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / step) * step;
}

function points(values: number[], max: number, width: number, height: number): [number, number][] {
  const n = values.length;
  return values.map((v, i) => [n === 1 ? width / 2 : (i / (n - 1)) * width, height - (v / max) * height]);
}

const path = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/** Views as a filled area and visitors as a line, day by day. */
export function TrafficChart({ days }: { days: { day: string; views: number; visitors: number }[] }) {
  const max = niceMax(Math.max(...days.map((d) => d.views)));
  const views = points(days.map((d) => d.views), max, W, H);
  const visitors = points(days.map((d) => d.visitors), max, W, H);
  const label = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const ticks = [max, max / 2, 0];
  const slot = W / days.length;

  return (
    <div>
      <div className="flex gap-3">
        {/* The y axis: three tidy values. */}
        <div className="flex h-44 flex-col justify-between py-0 text-right text-[10.5px] tabular-nums text-muted-foreground">
          {ticks.map((t) => <span key={t} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">{Math.round(t)}</span>)}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-44 w-full overflow-visible" role="img" aria-label="Page views and visitors per day">
          {ticks.map((t) => (
            <line key={t} x1={0} x2={W} y1={H - (t / max) * H} y2={H - (t / max) * H} className="stroke-border" strokeDasharray={t === 0 ? undefined : "3 4"} vectorEffect="non-scaling-stroke" />
          ))}
          <path d={`${path(views)} L${W},${H} L0,${H} Z`} className="fill-primary/15" />
          <path d={path(views)} fill="none" className="stroke-primary" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          <path d={path(visitors)} fill="none" className="stroke-foreground/45" strokeWidth={1.5} strokeDasharray="4 4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          {/* One invisible column per day, so hovering anywhere shows that day's numbers. */}
          {days.map((d, i) => (
            <rect key={d.day} x={i * slot} y={0} width={slot} height={H} fill="transparent" className="hover:fill-primary/[0.06]">
              <title>{`${label(d.day)}: ${d.views} views, ${d.visitors} visitors`}</title>
            </rect>
          ))}
        </svg>
      </div>
      <div className="mt-2 flex justify-between pl-8 text-[11px] tabular-nums text-muted-foreground">
        <span>{label(days[0].day)}</span>
        {days.length > 2 && <span>{label(days[Math.floor(days.length / 2)].day)}</span>}
        <span>Today</span>
      </div>
      <div className="mt-3 flex gap-4 text-[12px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded-full bg-primary" />Page views</span>
        <span className="flex items-center gap-1.5"><span className="h-0 w-4 border-t-2 border-dashed border-foreground/45" />Visitors</span>
      </div>
    </div>
  );
}

/** A tiny line for a stat card. */
export function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  const pts = points(values, max, 100, 28);
  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="h-7 w-full overflow-visible" aria-hidden>
      <path d={`${path(pts)} L100,28 L0,28 Z`} className="fill-primary/10" />
      <path d={path(pts)} fill="none" className="stroke-primary" strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

const DONUT_COLOURS = ["stroke-primary", "stroke-primary/45", "stroke-foreground/25", "stroke-foreground/15"];
const DOT_COLOURS = ["bg-primary", "bg-primary/45", "bg-foreground/25", "bg-foreground/15"];

/** Shares of a whole as a ring, with a legend. */
export function Donut({ parts, empty }: { parts: { label: string; value: number }[]; empty: string }) {
  const total = parts.reduce((sum, p) => sum + p.value, 0);
  const r = 15.9155; // a circumference of 100, so each share is its own percentage
  let offset = 25; // start at twelve o'clock

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 42 42" className="h-28 w-28 shrink-0 -rotate-0" role="img" aria-label={total ? parts.map((p) => `${p.label} ${Math.round((p.value / total) * 100)}%`).join(", ") : empty}>
        <circle cx="21" cy="21" r={r} fill="none" className="stroke-muted" strokeWidth="5" />
        {total > 0 &&
          parts.map((p, i) => {
            const share = (p.value / total) * 100;
            const ring = (
              <circle
                key={p.label}
                cx="21"
                cy="21"
                r={r}
                fill="none"
                className={DONUT_COLOURS[i % DONUT_COLOURS.length]}
                strokeWidth="5"
                strokeDasharray={`${share} ${100 - share}`}
                strokeDashoffset={offset}
              />
            );
            offset -= share;
            return ring;
          })}
        <text x="21" y="22.5" textAnchor="middle" className="fill-foreground text-[6px] font-bold">{total || "–"}</text>
      </svg>
      <ul className="min-w-0 flex-1 space-y-1.5 text-[13px]">
        {total === 0 ? (
          <li className="text-muted-foreground">{empty}</li>
        ) : (
          parts.map((p, i) => (
            <li key={p.label} className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT_COLOURS[i % DOT_COLOURS.length]}`} />
              <span className="min-w-0 flex-1 truncate text-foreground">{p.label}</span>
              <span className="tabular-nums text-muted-foreground">{Math.round((p.value / total) * 100)}%</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
