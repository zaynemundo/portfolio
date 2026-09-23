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
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-[22px] font-semibold text-zinc-100">{title}</h1>
        {subtitle && <p className="text-[13px] text-zinc-500 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {secondaryHref && secondaryLabel && (
          <Link
            href={secondaryHref}
            className="rounded-lg border border-zinc-800 text-zinc-300 text-[13px] font-medium px-3.5 py-2 hover:bg-zinc-900 transition-colors"
          >
            {secondaryLabel}
          </Link>
        )}
        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-4 py-2 hover:bg-white transition-colors"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
