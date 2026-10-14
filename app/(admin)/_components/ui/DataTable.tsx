"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronLeft, GripVertical, Search, X } from "lucide-react";
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
     - optionally, a handle at the start of each row to drag it into a new
       order: the row follows the pointer, the others slide aside, a dashed
       slot marks where it will land, and the order saves on drop

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
  /** Turns on dragging rows into a new order. Called with every row's id, in the new order, after each move; a server action can be passed straight in. */
  onReorder?: (ids: string[]) => Promise<{ ok: boolean }>;
}

/** A row being dragged: where it started, the slot it's over, and the rows' places when the drag began. */
interface Drag {
  id: string;
  from: number;
  to: number;
  startY: number;
  dy: number;
  slots: { top: number; height: number }[];
  /** Released, and gliding into place. */
  dropping: boolean;
}

/** How long a dropped row takes to glide into its slot. */
const DROP_MS = 160;

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

export function DataTable({ columns, rows: givenRows, filters = [], searchPlaceholder = "Search…", toolbar = "auto", defaultSort, inset = true, tableClassName, onReorder }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [chosen, setChosen] = useState<Record<string, string[]>>({});
  const [sort, setSort] = useState(defaultSort ?? null);

  // Reordering. `order` holds the ids as last dragged, so a move shows at once
  // rather than after the save; rows added or removed since fall in at the end
  // or drop out.
  const [order, setOrder] = useState<string[] | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [saveState, setSaveState] = useState<"saved" | "failed" | null>(null);
  const [saving, startSaving] = useTransition();
  const rows = useMemo(() => {
    if (!order) return givenRows;
    const byId = new Map(givenRows.map((r) => [r.id, r]));
    const kept = order.flatMap((id) => byId.get(id) ?? []);
    return [...kept, ...givenRows.filter((r) => !order.includes(r.id))];
  }, [givenRows, order]);

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
  // Dragging only makes sense on the whole list in its saved order.
  const canReorder = !!onReorder && !sort && !narrowed;

  function move(fromId: string, toId: string) {
    const ids = rows.map((r) => r.id);
    const from = ids.indexOf(fromId);
    const to = ids.indexOf(toId);
    if (from < 0 || to < 0 || from === to || !onReorder) return;
    const before = order;
    const next = [...ids];
    next.splice(from, 1);
    next.splice(to, 0, fromId);
    setOrder(next);
    setSaveState(null);
    startSaving(async () => {
      const result = await onReorder(next).catch(() => ({ ok: false }));
      if (!result.ok) {
        setOrder(before);
        setSaveState("failed");
        return;
      }
      setSaveState("saved");
      router.refresh();
    });
  }

  /** Pointer down on a row's handle: measure the rows on show, then follow the pointer. */
  function startDrag(e: React.PointerEvent<HTMLButtonElement>, index: number) {
    if (!canReorder || e.button !== 0 || drag) return;
    const frame = frameRef.current;
    if (!frame) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const frameTop = frame.getBoundingClientRect().top;
    const slots = Array.from(frame.querySelectorAll<HTMLTableRowElement>("tbody > tr[data-row]")).map((tr) => {
      const rect = tr.getBoundingClientRect();
      return { top: rect.top - frameTop, height: rect.height };
    });
    setDrag({ id: visible[index].id, from: index, to: index, startY: e.clientY, dy: 0, slots, dropping: false });
  }

  function followPointer(e: React.PointerEvent) {
    if (!drag || drag.dropping) return;
    const { slots, from } = drag;
    const first = slots[0].top;
    const last = slots[slots.length - 1];
    // Kept inside the table, so the row can't be dragged off the end.
    const dy = Math.max(first - slots[from].top, Math.min(last.top + last.height - slots[from].height - slots[from].top, e.clientY - drag.startY));
    const middle = slots[from].top + slots[from].height / 2 + dy;
    let to = from;
    slots.forEach((slot, i) => {
      const slotMiddle = slot.top + slot.height / 2;
      if (i > from && middle > slotMiddle) to = i;
      if (i < from && middle < slotMiddle && to >= from) to = i;
    });
    setDrag({ ...drag, dy, to });
  }

  /** Where the dragged row will land, measured from the top of the table. */
  function slotTop(d: Drag) {
    const { slots, from, to } = d;
    return to > from ? slots[to].top + slots[to].height - slots[from].height : slots[to].top;
  }

  function endDrag(cancel = false) {
    if (!drag || drag.dropping) return;
    if (cancel || drag.to === drag.from) {
      setDrag({ ...drag, to: drag.from, dy: 0, dropping: true });
      window.setTimeout(() => setDrag(null), DROP_MS);
      return;
    }
    // Glide into the slot, then put the row there for real.
    const landed = drag;
    setDrag({ ...drag, dy: slotTop(drag) - drag.slots[drag.from].top, dropping: true });
    window.setTimeout(() => {
      move(landed.id, visible[landed.to].id);
      setDrag(null);
    }, DROP_MS);
  }

  /** How far a row that isn't being dragged moves aside to open the slot. */
  function shiftFor(index: number): number {
    if (!drag) return 0;
    const { from, to, slots } = drag;
    if (from < to && index > from && index <= to) return -slots[from].height;
    if (to < from && index >= to && index < from) return slots[from].height;
    return 0;
  }

  function clear() {
    setQuery("");
    setChosen({});
  }

  return (
    <>
      {showToolbar && (searchable || filters.length > 0) && (
        <div className={cn("flex flex-col gap-2 mb-4", inset && "mx-5")}>
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            {narrowed ? (
              <p className="mr-auto text-[12.5px] text-muted-foreground tabular-nums">
                {visible.length} of {rows.length}
              </p>
            ) : onReorder ? (
              <p className="mr-auto text-[12.5px] text-muted-foreground" aria-live="polite">
                {saving ? (
                  "Saving the order…"
                ) : saveState === "failed" ? (
                  <span className="font-medium text-negative" role="alert">The order couldn&apos;t be saved. Try again.</span>
                ) : saveState === "saved" ? (
                  <span className="inline-flex items-center gap-1 font-medium text-positive"><Check size={13} />Order saved</span>
                ) : drag ? (
                  `Drop to move it to position ${drag.to + 1}.`
                ) : sort ? (
                  <>Sorted by a column. <button type="button" onClick={() => setSort(null)} className="font-medium text-primary hover:underline">Back to your order</button> to drag rows.</>
                ) : null}
              </p>
            ) : null}
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

      <CardFrame inset={inset} ref={frameRef} className="relative">
        {/* The slot the dragged row will land in. */}
        {drag && drag.to !== drag.from && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-2 rounded-lg border-2 border-dashed border-primary/50 bg-primary/[0.06] transition-[top] duration-200 ease-out"
            style={{ top: slotTop(drag) + 3, height: drag.slots[drag.from].height - 6 }}
          />
        )}
        <Table className={tableClassName}>
          <THead>
            {onReorder && <Th className="w-8 pl-3 pr-0"><span className="sr-only">Order</span></Th>}
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
                <td colSpan={columns.length + (onReorder ? 1 : 0)} className="px-4 py-8 text-center text-[13px] text-muted-foreground">
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
              visible.map((row, i) => {
                const lifted = drag?.id === row.id;
                const style: React.CSSProperties | undefined = drag
                  ? lifted
                    ? {
                        transform: `translateY(${drag.dy}px)`,
                        transition: drag.dropping ? `transform ${DROP_MS}ms ease-out` : "none",
                        position: "relative",
                        zIndex: 10,
                      }
                    : { transform: `translateY(${shiftFor(i)}px)`, transition: "transform 200ms ease-out", position: "relative" }
                  : undefined;
                return (
                  <tr
                    key={row.id}
                    data-row
                    style={style}
                    onClick={row.href || row.onClick ? (e) => openRow(row, e) : undefined}
                    className={cn(
                      DEFAULT_ROW,
                      (row.href || row.onClick) && "cursor-pointer",
                      // Table rows can't take a box-shadow, so the lift is a drop-shadow filter on the row and a hairline drawn inside its cells (a border would widen the columns).
                      lifted && "[filter:drop-shadow(0_10px_18px_rgba(0,0,0,0.16))] [&>td]:bg-card [&>td]:shadow-[inset_0_1px_0_var(--color-border),inset_0_-1px_0_var(--color-border)]",
                      drag && "hover:bg-transparent",
                      row.className
                    )}
                  >
                    {onReorder && (
                      <td className="w-8 pl-3 pr-0">
                        <button
                          type="button"
                          disabled={!canReorder}
                          onPointerDown={(e) => startDrag(e, i)}
                          onPointerMove={followPointer}
                          onPointerUp={() => endDrag()}
                          onPointerCancel={() => endDrag(true)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape" && drag) return endDrag(true);
                            const step = e.key === "ArrowUp" ? -1 : e.key === "ArrowDown" ? 1 : 0;
                            const neighbour = visible[i + step];
                            if (!step || !neighbour || drag) return;
                            e.preventDefault();
                            move(row.id, neighbour.id);
                          }}
                          aria-label="Drag to reorder, or use the up and down arrow keys"
                          title={canReorder ? "Drag to reorder" : "Clear the sort and search to reorder"}
                          className={cn(
                            "flex h-7 w-6 touch-none items-center justify-center rounded-md text-muted-foreground/60 hover:bg-muted hover:text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent",
                            lifted ? "cursor-grabbing bg-muted text-foreground" : "cursor-grab"
                          )}
                        >
                          <GripVertical size={15} />
                        </button>
                      </td>
                    )}
                    {row.cells}
                  </tr>
                );
              })
            )}
          </PagedBody>
        </Table>
      </CardFrame>
    </>
  );
}
