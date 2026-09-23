import Link from "next/link";

interface Props {
  title: string;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
}

/** Title + count/subtitle on the left, primary "+ New" action on the right. */
export function PageHeader({ title, subtitle, actionHref, actionLabel }: Props) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-[22px] font-semibold text-zinc-100">{title}</h1>
        {subtitle && <p className="text-[13px] text-zinc-500 mt-1">{subtitle}</p>}
      </div>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-4 py-2 hover:bg-white transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
