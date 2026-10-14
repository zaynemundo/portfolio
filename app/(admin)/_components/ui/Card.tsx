import { cn } from "@/app/lib/utils";

/* The admin is laid out card by card: every block on a page — a list, a
   group of fields, a set of numbers — is its own solid card on the grey page,
   with a gap before the next one. Use these rather than a hand-rolled
   bordered div, so every card on every page matches. */

/** The card surface on its own, for when the element has to be something other than a <section> (a <form>, say). */
export const cardClass = "rounded-2xl border border-border/60 bg-card";

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** Adds the standard inner spacing. Leave off for cards whose content runs edge to edge (tables, row lists). */
  padded?: boolean;
}

export function Card({ padded, className, ...props }: CardProps) {
  return <section className={cn(cardClass, "overflow-hidden", padded && "p-5", className)} {...props} />;
}

interface CardHeaderProps {
  title: React.ReactNode;
  /** Shown beside the title in a lighter weight — usually how many rows there are. */
  count?: number;
  description?: React.ReactNode;
  /** Link or button for the card, right-aligned. */
  action?: React.ReactNode;
  /** Something before the title, e.g. a status dot. */
  leading?: React.ReactNode;
  className?: string;
}

/** A card's top row: its title on the left, its buttons on the right. It has no line under it — the framed table or fields below start their own block. */
export function CardHeader({ title, count, description, action, leading, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3 px-5 pt-5 pb-4", className)}>
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-[14.5px] font-semibold tracking-tight text-foreground">
          {leading}
          <span className="truncate">{title}</span>
          {count !== undefined && <span className="text-[13px] font-normal text-muted-foreground tabular-nums">{count}</span>}
        </h2>
        {description && <p className="text-[12.5px] text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {action && <div className="shrink-0 flex items-center gap-2 text-[12.5px] font-medium">{action}</div>}
    </div>
  );
}

interface CardFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Off when the list sits in a card that has its own p-5 padding. */
  inset?: boolean;
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * Where a table or row list sits in a card: edge to edge, under a hairline
 * that separates it from the title and toolbar above. There is no box around
 * it — the card itself is the box. `inset={false}` is for a card that has
 * its own p-5 padding, which the list has to break out of to reach the edges.
 */
export function CardFrame({ inset = true, className, ...props }: CardFrameProps) {
  return (
    <div
      className={cn("border-t border-border overflow-hidden overflow-x-auto rounded-b-2xl", !inset && "-mx-5 -mb-5", className)}
      {...props}
    />
  );
}

/** The tinted bar a page's tabs sit in. */
export const tabBarClass = "inline-flex flex-wrap items-center gap-0.5 rounded-xl border border-border bg-card p-1 mb-6";

/** One tab in a `tabBarClass` bar — the current one is filled in black. */
export function tabClass(active: boolean) {
  return cn(
    "rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
    active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
  );
}

/** Classes for a link used as a CardHeader action — an outlined pill. */
export const cardActionClass =
  "rounded-full border border-border bg-card px-3.5 py-1.5 text-[12.5px] font-semibold text-foreground hover:bg-muted transition-colors";
