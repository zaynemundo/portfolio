import Link from "next/link";

interface Props {
  title: string;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
  /** Secondary, lower-emphasis link — e.g. "Edit page settings" pointing at a related settings page. */
  secondaryHref?: string;
  secondaryLabel?: string;
}

/** Title + count/subtitle on the left, primary "+ New" action (and an optional secondary link) on the right. */
export function PageHeader({ title, subtitle, actionHref, actionLabel, secondaryHref, secondaryLabel }: Props) {
  return (
    <div className="flex items-end justify-between mb-10">
      <div>
        <h1 className="text-[30px] font-bold tracking-tight text-foreground leading-none">{title}</h1>
        {subtitle && <p className="text-[13.5px] text-muted-foreground mt-2.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {secondaryHref && secondaryLabel && (
          <Link
            href={secondaryHref}
            className="rounded-md border border-border text-foreground/70 text-[13px] font-medium px-3.5 py-2 hover:bg-card transition-colors"
          >
            {secondaryLabel}
          </Link>
        )}
        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="rounded-md bg-primary text-primary-foreground text-[13.5px] font-semibold px-4 py-2 hover:bg-primary/90 transition-colors"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
