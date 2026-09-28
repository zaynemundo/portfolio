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
        title={label}
        className="h-8 w-8 flex items-center justify-center rounded-full bg-secondary/60 text-foreground/70 hover:text-white hover:bg-secondary transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M12.5 4.5 6 10l6.5 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    );
  }

  return (
    <Link href={href} className="text-[12.5px] text-muted-foreground hover:text-foreground/70 transition-colors">
      ← {label}
    </Link>
  );
}
