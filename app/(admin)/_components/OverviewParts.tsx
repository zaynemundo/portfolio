import Link from "next/link";
import { Card, CardFrame, CardHeader, cardActionClass } from "@/app/(admin)/_components/ui/Card";

/* Building blocks shared by the two workspace overviews (Freelance and Website). */

export interface StatCell {
  label: string;
  value: string;
  note?: string;
  tone?: "good" | "bad";
  href?: string;
}

/** The headline numbers, one card each. A number that needs attention (tone "bad") gets the black card. */
export function StatStrip({ cells }: { cells: StatCell[] }) {
  return (
    <dl className={`grid grid-cols-2 ${cells.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-3`}>
      {cells.map((cell) => {
        const alert = cell.tone === "bad";
        const surface = alert ? "bg-foreground text-background border-foreground" : "bg-card border-border/60";
        const body = (
          <>
            <dt className={`text-[12px] font-medium ${alert ? "text-background/60" : "text-muted-foreground"}`}>{cell.label}</dt>
            <dd className={`text-[22px] font-bold tracking-tight tabular-nums leading-tight mt-1 ${cell.tone === "good" ? "text-positive" : ""}`}>
              {cell.value}
            </dd>
            {cell.note && <dd className={`text-[11.5px] mt-0.5 ${alert ? "text-background/60" : "text-muted-foreground"}`}>{cell.note}</dd>}
          </>
        );
        return cell.href ? (
          <Link key={cell.label} href={cell.href} className={`block rounded-2xl border px-4 py-3.5 transition-opacity hover:opacity-85 ${surface}`}>
            {body}
          </Link>
        ) : (
          <div key={cell.label} className={`rounded-2xl border px-4 py-3.5 ${surface}`}>
            {body}
          </div>
        );
      })}
    </dl>
  );
}

/** A titled card with an optional link on the right and a fallback line when it has nothing to show. */
export function Panel({
  title, actionHref, actionLabel, empty, isEmpty, framed = true, children,
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
  empty: string;
  isEmpty: boolean;
  /** Off when the content brings its own frame, as a DataTable does. */
  framed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader
        title={title}
        action={actionHref && actionLabel && <Link href={actionHref} className={cardActionClass}>{actionLabel}</Link>}
      />
      {isEmpty ? <p className="px-5 pb-5 text-[13px] text-muted-foreground">{empty}</p> : framed ? <CardFrame>{children}</CardFrame> : children}
    </Card>
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
    neutral: "bg-warning/15 text-warning",
    bad: "bg-negative/12 text-negative",
    warn: "bg-warning/15 text-warning",
    brand: "bg-primary/15 text-primary",
    good: "bg-positive/12 text-positive",
  }[tagTone];

  return (
    <Link href={href} className="flex items-center gap-3 px-5 py-2.5 border-b border-border/70 last:border-b-0 hover:bg-primary/[0.06] transition-colors">
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
