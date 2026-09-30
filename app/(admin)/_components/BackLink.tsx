import Link from "next/link";

interface Props {
  href: string;
  label: string;
  /** Circular icon-only button (just the arrow, no text) — Apple-Notes-style. */
  iconOnly?: boolean;
}

export function BackLink({ href, label, iconOnly }: Props) {
  if (iconOnly) {
    return (
      <Link
        href={href}
        aria-label={label}
        className="group relative h-8 w-8 flex items-center justify-center rounded-full bg-secondary/60 text-foreground/70 hover:text-white hover:bg-secondary transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M12.5 4.5 6 10l6.5 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span
          role="tooltip"
          className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background opacity-0 transition-opacity delay-300 group-hover:opacity-100"
        >
          {label}
        </span>
      </Link>
    );
  }

  return (
    <Link href={href} className="text-[12.5px] text-muted-foreground hover:text-foreground/70 transition-colors">
      ← {label}
    </Link>
  );
}
