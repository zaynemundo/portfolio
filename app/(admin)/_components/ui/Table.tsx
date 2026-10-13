import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/app/lib/utils";

/* A list inside a Card reads top-down in three steps, each with its own look
   so they can't be mistaken for one another:

     1. CardHeader (ui/Card) — what the list is, and its buttons.
     2. THead — the column names, small and grey, over a hairline.
     3. The rows — the actual records, on the plain surface.

   The table itself goes inside a CardFrame (ui/Card), which runs it edge to
   edge in the card.

   Build new lists from these rather than restyling a table by hand. */

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn("w-full text-left", className)} {...props} />;
}

/** The column-name band. Children are the `Th` cells. */
export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-border">{children}</tr>
    </thead>
  );
}

interface ThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: "left" | "right";
}

export function Th({ align = "left", className, ...props }: ThProps) {
  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-2.5 text-[12px] font-medium text-muted-foreground whitespace-nowrap",
        align === "right" && "text-right",
        className
      )}
      {...props}
    />
  );
}

export type SortDirection = "asc" | "desc";

interface SortThProps extends ThProps {
  /** This column is the one the list is currently sorted by. */
  active: boolean;
  direction: SortDirection;
  onSort: () => void;
}

/** A column name that sorts the list when clicked; clicking the active one flips the order. */
export function SortTh({ active, direction, onSort, align, className, children, ...props }: SortThProps) {
  return (
    <Th align={align} className={className} aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"} {...props}>
      <button
        type="button"
        onClick={onSort}
        className={cn("inline-flex items-center gap-1 hover:text-foreground transition-colors", active && "text-foreground")}
      >
        {children}
        {/* Stacked up/down chevrons; the one for the current order lights up. */}
        <span aria-hidden className="inline-flex flex-col -space-y-1.5">
          <ChevronUp size={12} className={active && direction === "asc" ? "text-primary" : "text-muted-foreground/40"} />
          <ChevronDown size={12} className={active && direction === "desc" ? "text-primary" : "text-muted-foreground/40"} />
        </span>
      </button>
    </Th>
  );
}
