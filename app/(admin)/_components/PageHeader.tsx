import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
  /** Secondary, lower-emphasis link — e.g. "Edit page settings" pointing at a related settings page. */
  secondaryHref?: string;
  secondaryLabel?: string;
  /** For a secondary link to the public site: opens in a new tab, so the admin page stays where it is. */
  secondaryNewTab?: boolean;
  /** A secondary control that isn't a link — e.g. a button that opens a dialog. Shown before the primary action. */
  secondary?: React.ReactNode;
}

/** Title + count/subtitle on the left, primary "+ New" action (and an optional secondary link) on the right. */
export function PageHeader({ title, subtitle, actionHref, actionLabel, secondaryHref, secondaryLabel, secondaryNewTab, secondary }: Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="text-[26px] font-bold tracking-tight text-foreground leading-none">{title}</h1>
        {subtitle && <p className="text-[13.5px] text-muted-foreground mt-2.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {secondary}
        {secondaryHref && secondaryLabel && secondaryNewTab && (
          <a
            href={secondaryHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card text-foreground text-[13px] font-semibold px-4 py-2 hover:bg-muted transition-colors"
          >
            {secondaryLabel}
            <ExternalLink size={13} />
          </a>
        )}
        {secondaryHref && secondaryLabel && !secondaryNewTab && (
          <Link
            href={secondaryHref}
            className="rounded-full border border-border bg-card text-foreground text-[13px] font-semibold px-4 py-2 hover:bg-muted transition-colors"
          >
            {secondaryLabel}
          </Link>
        )}
        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="rounded-full bg-foreground text-background text-[13px] font-semibold px-4 py-2 hover:bg-foreground/85 transition-colors"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
