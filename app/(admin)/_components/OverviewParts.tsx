import Link from "next/link";

/* Building blocks shared by the two workspace overviews (Freelance and Website). */

export interface StatCell {
  label: string;
  value: string;
  note?: string;
  tone?: "good" | "bad";
  href?: string;
}

/** A single bordered strip of headline numbers. */
export function StatStrip({ cells }: { cells: StatCell[] }) {
  return (
    <dl className={`grid grid-cols-2 ${cells.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-px rounded-xl border border-border bg-border overflow-hidden`}>
      {cells.map((cell) => {
        const body = (
          <>
            <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/70">{cell.label}</dt>
            <dd
              className={`text-[20px] font-semibold tabular-nums leading-tight mt-1 ${
                cell.tone === "bad" ? "text-destructive" : cell.tone === "good" ? "text-success" : "text-foreground"
              }`}
            >
              {cell.value}
            </dd>
            {cell.note && <dd className="text-[11.5px] text-muted-foreground mt-0.5">{cell.note}</dd>}
          </>
        );
        return cell.href ? (
          <Link key={cell.label} href={cell.href} className="block px-4 py-3.5 bg-card hover:bg-muted/60 transition-colors">
            {body}
          </Link>
        ) : (
          <div key={cell.label} className="px-4 py-3.5 bg-card">
            {body}
          </div>
        );
      })}
    </dl>
  );
}

/** A titled card with an optional link on the right and a fallback line when it has nothing to show. */
export function Panel({
  title, actionHref, actionLabel, empty, isEmpty, children,
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
  empty: string;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card/40">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <h2 className="text-[13.5px] font-semibold text-foreground">{title}</h2>
        {actionHref && actionLabel && (
          <Link href={actionHref} className="text-[12.5px] font-medium text-primary hover:text-primary/80 transition-colors">
            {actionLabel}
          </Link>
        )}
      </div>
      {isEmpty ? <p className="px-5 py-4 text-[13px] text-muted-foreground">{empty}</p> : children}
    </section>
  );
}

/** One clickable line inside a Panel: a tag, the main text, and something right-aligned. */
export function PanelRow({
  href, tag, tagTone = "neutral", primary, secondary, right, rightTone,
}: {
  href: string;
  tag?: string;
  tagTone?: "neutral" | "bad" | "warn" | "brand" | "good";
  primary: string;
  secondary?: string;
  right?: string;
  rightTone?: "bad";
}) {
  const tagClass = {
    neutral: "bg-secondary text-muted-foreground",
    bad: "bg-destructive/15 text-destructive",
    warn: "bg-amber-500/15 text-amber-600",
    brand: "bg-primary/15 text-primary",
    good: "bg-success/15 text-success",
  }[tagTone];

  return (
    <Link href={href} className="flex items-center gap-3 px-5 py-2.5 border-b border-border/70 last:border-b-0 hover:bg-muted/50 transition-colors">
      {tag && <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${tagClass}`}>{tag}</span>}
      <span className="min-w-0 flex-1 truncate text-[13px] text-foreground/90">
        {primary}
        {secondary && <span className="text-muted-foreground"> · {secondary}</span>}
      </span>
      {right && (
        <span className={`shrink-0 text-[12.5px] tabular-nums ${rightTone === "bad" ? "text-destructive font-medium" : "text-muted-foreground"}`}>
          {right}
        </span>
      )}
    </Link>
  );
}
