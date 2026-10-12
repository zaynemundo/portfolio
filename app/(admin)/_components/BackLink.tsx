import Link from "next/link";

interface Props {
  href: string;
  label: string;
  /** Pill with a chevron — used at the top of detail pages. The label stays visible so it's clear where "back" goes. */
  iconOnly?: boolean;
}

export function BackLink({ href, label, iconOnly }: Props) {
  if (iconOnly) {
    return (
      <Link
        href={href}
        className="inline-flex h-8 items-center gap-1 rounded-full bg-secondary/60 pl-2 pr-3.5 text-[12.5px] font-medium text-foreground/70 hover:text-foreground hover:bg-secondary transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M12.5 4.5 6 10l6.5 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {label}
      </Link>
    );
  }

  return (
    <Link href={href} className="text-[12.5px] text-muted-foreground hover:text-foreground/70 transition-colors">
      ← {label}
    </Link>
  );
}
