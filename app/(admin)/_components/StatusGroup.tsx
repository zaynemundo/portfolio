interface Props {
  label: string;
  count: number;
  dotClassName: string;
  children: React.ReactNode;
}

/** A labeled group for a status-grouped list table (ClickUp-style) — a
 *  header row with a colored dot, the group label, and a count, followed by
 *  that group's own borderless table. Each list page renders one of these
 *  per status value instead of a single flat table. Always expanded — no
 *  collapse toggle (removed per feedback: it added interaction for no real
 *  benefit when most lists only ever show one or two groups anyway). */
export function StatusGroup({ label, count, dotClassName, children }: Props) {
  if (count === 0) return null;

  return (
    <div className="mb-6 last:mb-0">
      <div className="flex items-center gap-2 py-2">
        <span className={`h-2 w-2 rounded-full shrink-0 ${dotClassName}`} aria-hidden="true" />
        <span className="text-[11.5px] font-semibold uppercase tracking-wider text-foreground/80">{label}</span>
        <span className="text-[11.5px] text-muted-foreground">{count}</span>
      </div>
      {children}
    </div>
  );
}
