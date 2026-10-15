/* Small charts for the admin overviews. No chart library: they are drawn on the
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

/** Views as a filled area and visitors as a dashed line, day by day. Hover a day for its numbers. */
export function TrafficChart({ days, empty }: { days: { day: string; views: number; visitors: number }[]; empty?: string }) {
  const max = niceMax(Math.max(...days.map((d) => d.views)));
  const views = points(days.map((d) => d.views), max, W, H);
  const visitors = points(days.map((d) => d.visitors), max, W, H);
  const label = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const ticks = [max, max / 2, 0];

  return (
    <div>
      <div className="relative flex gap-3">
        {/* The y axis: each value sits level with its gridline. */}
        <div className="relative h-44 w-6 shrink-0 text-right text-[10.5px] tabular-nums text-muted-foreground">
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: `${(1 - t / max) * 100}%` }}>
              {Math.round(t)}
            </span>
          ))}
        </div>
        <div className="relative h-44 w-full">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full overflow-visible" role="img" aria-label="Page views and visitors per day">
            {ticks.map((t) => (
              <line key={t} x1={0} x2={W} y1={H - (t / max) * H} y2={H - (t / max) * H} className="stroke-border" strokeDasharray={t === 0 ? undefined : "3 4"} vectorEffect="non-scaling-stroke" />
            ))}
            <path d={`${path(views)} L${W},${H} L0,${H} Z`} className="fill-primary/15" />
            <path d={path(views)} fill="none" className="stroke-primary" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
            <path d={path(visitors)} fill="none" className="stroke-foreground/45" strokeWidth={1.5} strokeDasharray="4 4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          </svg>

          {/* One column per day, laid over the chart in HTML so the dots stay round
              however wide the chart is. Hovering a day enlarges its dots and shows its numbers. */}
          {days.map((d, i) => {
            const x = days.length === 1 ? 50 : (i / (days.length - 1)) * 100;
            const width = 100 / days.length;
            const yViews = (1 - d.views / max) * 100;
            const yVisitors = (1 - d.visitors / max) * 100;
            const tipBelow = yViews < 30; // near the top: show the card under the dot so it isn't cut off
            const align = i === 0 ? "left-1/2" : i === days.length - 1 ? "right-1/2" : "left-1/2 -translate-x-1/2"; // first and last open inwards
            return (
              <div
                key={d.day}
                className="group absolute inset-y-0 -translate-x-1/2"
                style={{ left: `${x}%`, width: `${width}%` }}
                tabIndex={0}
                aria-label={`${label(d.day)}: ${d.views} page views, ${d.visitors} visitors`}
              >
                <span className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-primary/30 opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100" />
                <span
                  className="pointer-events-none absolute left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-foreground/45 transition-transform group-hover:scale-150 group-focus:scale-150"
                  style={{ top: `${yVisitors}%` }}
                />
                <span
                  className="pointer-events-none absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-primary shadow-sm transition-transform group-hover:scale-150 group-focus:scale-150"
                  style={{ top: `${yViews}%` }}
                />
                <div
                  className={`pointer-events-none absolute z-10 w-max rounded-lg border border-border bg-card px-3 py-2 text-[12px] shadow-lg opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100 ${align}`}
                  style={tipBelow ? { top: `calc(${yViews}% + 14px)` } : { bottom: `calc(${100 - yViews}% + 14px)` }}
                >
                  <p className="mb-1 font-semibold text-foreground">{label(d.day)}</p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span className="tabular-nums font-semibold text-foreground">{d.views}</span> page view{d.views === 1 ? "" : "s"}
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-foreground/45" />
                    <span className="tabular-nums font-semibold text-foreground">{d.visitors}</span> visitor{d.visitors === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            );
          })}

          {empty && (
            <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-[12.5px] text-muted-foreground">{empty}</p>
          )}
        </div>
      </div>
      <div className="mt-2 flex justify-between pl-9 text-[11px] tabular-nums text-muted-foreground">
        <span>{label(days[0].day)}</span>
        {days.length > 2 && <span>{label(days[Math.floor(days.length / 2)].day)}</span>}
        <span>Today</span>
      </div>
    </div>
  );
}

/**
 * Side-by-side bars per group (e.g. income and expenses per month). Always
 * drawn, so an empty period shows as a flat baseline rather than a gap.
 */
export function GroupedBars({
  groups, series, format, label,
}: {
  /** One per group, oldest first; `current` highlights it (e.g. this month). */
  groups: { label: string; values: number[]; current?: boolean }[];
  /** Bar colours per series: full strength for the current group, faded for the rest. */
  series: { name: string; bar: string; faded: string; dot: string }[];
  format: (value: number) => string;
  label: string;
}) {
  const max = Math.max(0, ...groups.flatMap((g) => g.values));
  return (
    <div>
      <div className="flex h-40 items-end gap-3 border-b border-border" role="img" aria-label={label}>
        {groups.map((g) => (
          <div
            key={g.label}
            className="flex h-full min-w-0 flex-1 items-end justify-center gap-1"
            title={`${g.label}: ${g.values.map((v, i) => `${format(v)} ${series[i].name.toLowerCase()}`).join(", ")}`}
          >
            {g.values.map((v, i) => (
              <div
                key={series[i].name}
                className={`w-full max-w-7 rounded-t-lg rounded-b-sm ${g.current ? series[i].bar : series[i].faded}`}
                style={{ height: max ? `${Math.max(v > 0 ? 3 : 0, (v / max) * 100)}%` : 0 }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-3">
        {groups.map((g) => (
          <span key={g.label} className={`flex-1 text-center text-[11.5px] ${g.current ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{g.label}</span>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-[12px] text-muted-foreground">
        {series.map((s) => (
          <span key={s.name} className="inline-flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${s.dot}`} aria-hidden="true" />{s.name}</span>
        ))}
        {max > 0 && <span className="ml-auto tabular-nums">Highest: {format(max)}</span>}
      </div>
    </div>
  );
}
