"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronLeft, Search, X } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { Table, THead, Th, SortTh, type SortDirection } from "./Table";
import { PagedBody, PAGE_SIZE } from "./Paged";
import { CardFrame } from "./Card";

/* The one table every admin list is built from. On top of the Card / THead /
   rows look it adds what makes a long list findable:

     - a search box, and a Filters menu where the list has something to
       filter by (status, type, client…): pick what to filter by, tick the
       values wanted, Apply — each one in force shows as a chip underneath
     - column names that sort when clicked
     - a click anywhere on a row to open it
     - ten rows at a time, with page buttons

   The page still writes each row's cells as ordinary <td>s; alongside them it
   says what text the row is found by, what each column sorts on, and which
   filter values it has. That keeps this usable from server pages. */

export interface DataColumn {
  label?: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

export interface DataRow {
  id: string;
  /** The row's <td> cells. */
  cells: React.ReactNode;
  className?: string;
  /** Where clicking anywhere on the row goes: the page that opens or edits it. */
  href?: string;
  /** For a row that opens something in place (a dialog) instead of going to a page. Links, buttons and menus inside the row keep their own clicks either way. */
  onClick?: () => void;
  /** Everything the search box should match this row on. */
  search?: string;
  /** One entry per column: the value that column sorts by. Leave an entry undefined for a column that can't be sorted; null means "blank", and sorts last. */
  sort?: (string | number | null | undefined)[];
  /** This row's value for each filter, by the filter's key. */
  filters?: Record<string, string>;
}

export interface DataFilter {
  key: string;
  /** What the filter is called in the menu and on its chip, e.g. "Status". */
  label: string;
  options: { value: string; label: string }[];
}

interface Props {
  columns: DataColumn[];
  rows: DataRow[];
  filters?: DataFilter[];
  searchPlaceholder?: string;
  /** "auto" (default) shows the search and filters only once the list is long enough to need paging; "always" suits a page's main list. */
  toolbar?: "always" | "auto" | "never";
  /** Sort to start with. Without it rows keep the order they were given in until a column is clicked. */
  defaultSort?: { column: number; direction: SortDirection };
  /** Off when the table sits in a container with its own padding. */
  inset?: boolean;
  tableClassName?: string;
}

const DEFAULT_ROW = "border-b border-border/70 last:border-b-0 hover:bg-primary/[0.06]";

/** The pill search box, with a clear button once there's something typed. */
function SearchBox({ value, onChange, placeholder, className }: { value: string; onChange: (value: string) => void; placeholder: string; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <Search size={14} aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        style={{ outline: "none" }}
        className="w-full h-9 rounded-full bg-card border-0 ring-1 ring-border pl-9 pr-9 text-[12.5px] text-foreground placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring transition-shadow"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

/**
 * The "Filters" pill and its menu. Two steps: choose what to filter by, then
 * tick the values wanted and Apply. With only one thing to filter by it opens
 * straight on the values.
 */
function FilterMenu({ filters, chosen, onApply }: { filters: DataFilter[]; chosen: Record<string, string[]>; onApply: (key: string, values: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [fieldKey, setFieldKey] = useState<string | null>(null);
  const [ticked, setTicked] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function pick(key: string | null) {
    setFieldKey(key);
    setTicked(key ? (chosen[key] ?? []) : []);
  }

  function toggle() {
    if (!open) pick(filters.length === 1 ? filters[0].key : null);
    setOpen(!open);
  }

  const field = filters.find((f) => f.key === fieldKey) ?? null;

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className={cn(
          "h-9 px-4 rounded-full inline-flex items-center gap-1.5 border border-border bg-card text-[12.5px] font-semibold text-foreground hover:bg-muted transition-colors",
          open && "bg-muted"
        )}
      >
        Filters <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-30 w-56 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg p-2">
          {!field ? (
            <div className="flex flex-col">
              <p className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Filter by</p>
              {filters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => pick(f.key)}
                  className="w-full text-left px-2 py-1.5 text-[13px] font-medium rounded-md text-foreground/80 hover:bg-muted transition-colors"
                >
                  {f.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1 p-1">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
                {filters.length > 1 && (
                  <button type="button" onClick={() => pick(null)} aria-label="Back" className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                )}
                <span className="text-[13px] font-semibold">{field.label}</span>
              </div>
              <div className="flex flex-col max-h-48 overflow-y-auto gap-1">
                {field.options.map((option) => {
                  const selected = ticked.includes(option.value);
                  return (
                    <label key={option.value} className="flex items-center gap-2 w-full px-2 py-1.5 text-[13px] rounded-md hover:bg-muted cursor-pointer">
                      <span className={cn("h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-colors", selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card")}>
                        {selected && <Check size={12} />}
                      </span>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selected}
                        onChange={(e) => setTicked(e.target.checked ? [...ticked, option.value] : ticked.filter((v) => v !== option.value))}
                      />
                      <span className="text-foreground/80 truncate">{option.label}</span>
                    </label>
                  );
                })}
              </div>
              <div className="mt-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    onApply(field.key, ticked);
                    setOpen(false);
                  }}
                  className="w-full h-8 rounded-lg bg-primary text-primary-foreground text-[12px] font-semibold hover:bg-primary/90 transition-colors"
                >
                  Apply filter
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function compareValues(a: string | number, b: string | number): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { sensitivity: "base", numeric: true });
}

export function DataTable({ columns, rows, filters = [], searchPlaceholder = "Search…", toolbar = "auto", defaultSort, inset = true, tableClassName }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [chosen, setChosen] = useState<Record<string, string[]>>({});
  const [sort, setSort] = useState(defaultSort ?? null);

  const sortable = useMemo(() => columns.map((_, i) => rows.some((r) => r.sort?.[i] !== undefined)), [columns, rows]);
  const searchable = rows.some((r) => r.search !== undefined);
  const showToolbar = toolbar === "always" || (toolbar === "auto" && rows.length > PAGE_SIZE);

  const visible = useMemo(() => {
    const terms = [query].map((q) => q.trim().toLowerCase()).filter(Boolean);
    const matched = rows.filter((row) => {
      for (const filter of filters) {
        const want = chosen[filter.key];
        if (want?.length && !want.includes(row.filters?.[filter.key] ?? "")) return false;
      }
      const haystack = (row.search ?? "").toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
    if (!sort) return matched;
    const { column, direction } = sort;
    return [...matched].sort((a, b) => {
      const left = a.sort?.[column];
      const right = b.sort?.[column];
      const blankLeft = left === null || left === undefined || left === "";
      const blankRight = right === null || right === undefined || right === "";
      // Blanks stay at the bottom whichever way the column is sorted.
      if (blankLeft || blankRight) return blankLeft === blankRight ? 0 : blankLeft ? 1 : -1;
      const order = compareValues(left, right);
      return direction === "asc" ? order : -order;
    });
  }, [rows, filters, chosen, query, sort]);

  function sortBy(column: number) {
    if (sort?.column === column) {
      setSort({ column, direction: sort.direction === "asc" ? "desc" : "asc" });
      return;
    }
    // Numbers are more useful biggest-first; text reads A–Z.
    const sample = rows.find((r) => r.sort?.[column] !== null && r.sort?.[column] !== undefined)?.sort?.[column];
    setSort({ column, direction: typeof sample === "number" ? "desc" : "asc" });
  }

  function openRow(row: DataRow, e: React.MouseEvent) {
    // Anything in the row with a click of its own keeps it, and dragging to select text isn't a click.
    if ((e.target as HTMLElement).closest("a, button, input, select, textarea, label, [role='menu']")) return;
    if (window.getSelection()?.toString()) return;
    if (row.onClick) row.onClick();
    else if (row.href) {
      if (e.metaKey || e.ctrlKey) window.open(row.href, "_blank");
      else router.push(row.href);
    }
  }

  const active = filters.filter((f) => chosen[f.key]?.length);
  const narrowed = query.trim() !== "" || active.length > 0;
  const nothingMatches = visible.length === 0;

  function clear() {
    setQuery("");
    setChosen({});
  }

  return (
    <>
      {showToolbar && (searchable || filters.length > 0) && (
        <div className={cn("flex flex-col gap-2 mb-4", inset && "mx-5")}>
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            {narrowed && (
              <p className="mr-auto text-[12.5px] text-muted-foreground tabular-nums">
                {visible.length} of {rows.length}
              </p>
            )}
            {searchable && <SearchBox value={query} onChange={setQuery} placeholder={searchPlaceholder} className="w-72 max-w-full" />}
            {filters.length > 0 && <FilterMenu filters={filters} chosen={chosen} onApply={(key, values) => setChosen({ ...chosen, [key]: values })} />}
          </div>

          {active.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setChosen({})} className="text-[12px] font-semibold text-primary hover:underline">
                Clear all
              </button>
              {active.map((filter) => (
                <span key={filter.key} className="inline-flex items-center h-8 pl-4 pr-2 rounded-full border border-border bg-card shadow-xs text-[13px]">
                  <span className="text-muted-foreground mr-1.5">{filter.label}:</span>
                  <span className="font-semibold text-foreground mr-2">
                    {chosen[filter.key].map((value) => filter.options.find((o) => o.value === value)?.label ?? value).join(", ")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setChosen({ ...chosen, [filter.key]: [] })}
                    aria-label={`Remove ${filter.label} filter`}
                    className="p-0.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <CardFrame inset={inset}>
        <Table className={tableClassName}>
          <THead>
            {columns.map((column, i) =>
              sortable[i] ? (
                <SortTh
                  key={i}
                  align={column.align}
                  className={column.className}
                  active={sort?.column === i}
                  direction={sort?.column === i ? sort.direction : "asc"}
                  onSort={() => sortBy(i)}
                >
                  {column.label}
                </SortTh>
              ) : (
                <Th key={i} align={column.align} className={column.className}>
                  {column.label}
                </Th>
              )
            )}
          </THead>
          {/* Keyed so any change to what's listed starts again from page one. */}
          <PagedBody key={`${query}|${JSON.stringify(chosen)}|${sort?.column}|${sort?.direction}`}>
            {nothingMatches ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-[13px] text-muted-foreground">
                  Nothing here matches.
                  {narrowed && (
                    <>
                      {" "}
                      <button type="button" onClick={clear} className="font-medium text-primary hover:text-primary/80 transition-colors">
                        Clear filters
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr
                  key={row.id}
                  onClick={row.href || row.onClick ? (e) => openRow(row, e) : undefined}
                  className={cn(DEFAULT_ROW, (row.href || row.onClick) && "cursor-pointer", row.className)}
                >
                  {row.cells}
                </tr>
              ))
            )}
          </PagedBody>
        </Table>
      </CardFrame>
    </>
  );
}
