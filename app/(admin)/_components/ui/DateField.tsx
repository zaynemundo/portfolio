"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/app/lib/utils";

/* The admin's date picker, used in place of the browser's own (which looks
   different in every browser and can't be styled). A field that shows the
   chosen date and opens a small calendar: arrows to step a month, the month
   and the year each open a grid to jump further, and Today / Clear sit
   underneath.

   The value is the same text a native date input gives: "2026-10-13", or ""
   for no date. With granularity "month" it picks a whole month instead and
   the value is "2026-10". */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));
const PANEL_WIDTH = 288;
/** Roughly how tall the calendar is, to decide whether it fits under the field. */
const PANEL_HEIGHT = 350;
const YEARS_BACK = 15;
const YEARS_AHEAD = 10;

const pad = (n: number) => String(n).padStart(2, "0");
const dayValue = (year: number, month: number, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;

function parse(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(value);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3] ?? 1) };
}

/** Six weeks of days, Monday first, padded with the neighbouring months. */
function calendarDays(year: number, month: number) {
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(year, month, i - lead + 1);
    return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate(), inMonth: date.getMonth() === month };
  });
}

const DEFAULT_TRIGGER =
  "w-full rounded-lg bg-background border border-border px-3 py-2 text-[13.5px] text-foreground focus:outline-none focus:border-ring transition-colors";
const cellBase = "h-8 rounded-lg text-[12.5px] tabular-nums transition-colors";
const navButton = "h-7 w-7 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors";
const headButton = "rounded-md px-1.5 py-0.5 text-[13.5px] font-semibold text-foreground hover:bg-muted transition-colors";
const footButton = "rounded-md px-2 py-1 text-[12px] font-semibold transition-colors";

interface Props {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  /** Pick a day (default) or a whole month. */
  granularity?: "day" | "month";
  /** A required field can't be cleared, and blocks its form from submitting while empty. */
  required?: boolean;
  placeholder?: string;
  "aria-label"?: string;
  title?: string;
  /** Replaces the field's own look, to match the form it sits in. */
  className?: string;
  /** Leaves out the calendar icon, for a tight spot such as a table cell. */
  compact?: boolean;
  /** Off for a field that should only be as wide as its date, e.g. beside other controls in a row. */
  fullWidth?: boolean;
}

export function DateField({
  value, onChange, id, granularity = "day", required, placeholder, "aria-label": ariaLabel, title, className, compact, fullWidth = true,
}: Props) {
  const monthOnly = granularity === "month";
  const selected = parse(value);

  const [panel, setPanel] = useState<{ top: number; left: number; up: boolean; host: Element } | null>(null);
  const [view, setView] = useState({ year: 2000, month: 0 });
  const [picking, setPicking] = useState<"day" | "month" | "year">("day");
  const [today, setToday] = useState({ year: 2000, month: 0, day: 1 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const open = panel !== null;

  useEffect(() => {
    if (!open) return;
    const close = () => setPanel(null);
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (!triggerRef.current?.contains(target) && !panelRef.current?.contains(target)) close();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      // Only the calendar closes — not a dialog it happens to be inside.
      e.stopPropagation();
      close();
      triggerRef.current?.focus();
    }
    function handleScroll(e: Event) {
      // The year grid scrolls inside the calendar; anything else moving means the field has moved.
      if (!panelRef.current?.contains(e.target as Node)) close();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey, true);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey, true);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  function toggle() {
    if (open || !triggerRef.current) {
      setPanel(null);
      return;
    }
    const now = new Date();
    const current = { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
    setToday(current);
    setView(selected ? { year: selected.year, month: selected.month } : { year: current.year, month: current.month });
    setPicking(monthOnly ? "month" : "day");

    const rect = triggerRef.current.getBoundingClientRect();
    const up = window.innerHeight - rect.bottom < PANEL_HEIGHT && rect.top > window.innerHeight - rect.bottom;
    setPanel({
      top: up ? rect.top - 6 : rect.bottom + 6,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - PANEL_WIDTH - 8)),
      up,
      // Kept inside the admin wrapper, which is where the colours are defined.
      host: triggerRef.current.closest(".admin-root") ?? document.body,
    });
  }

  function choose(next: string) {
    onChange(next);
    setPanel(null);
    triggerRef.current?.focus();
  }

  function step(by: number) {
    if (picking === "month") {
      setView({ ...view, year: view.year + by });
      return;
    }
    const moved = new Date(view.year, view.month + by, 1);
    setView({ year: moved.getFullYear(), month: moved.getMonth() });
  }

  function pickMonth(month: number) {
    if (monthOnly) choose(`${view.year}-${pad(month + 1)}`);
    else {
      setView({ ...view, month });
      setPicking("day");
    }
  }

  const display = selected
    ? monthOnly
      ? `${MONTHS[selected.month]} ${selected.year}`
      : `${selected.day} ${MONTHS_SHORT[selected.month]} ${selected.year}`
    : "";
  const emptyLabel = placeholder ?? (monthOnly ? "Choose a month" : "Choose a date");

  const years: number[] = [];
  for (let y = today.year - YEARS_BACK; y <= today.year + YEARS_AHEAD; y++) years.push(y);
  if (!years.includes(view.year)) years.push(view.year);
  years.sort((a, b) => a - b);

  const chosenClass = "bg-primary text-primary-foreground font-semibold";
  const idleClass = "text-foreground/85 hover:bg-primary/10";

  return (
    <span className={cn("relative inline-flex align-middle", fullWidth && "w-full")}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel ? `${ariaLabel}: ${display || "not set"}` : undefined}
        title={title}
        className={cn("inline-flex items-center justify-between gap-2 text-left", className ?? DEFAULT_TRIGGER, open && "border-ring")}
      >
        <span className={cn("truncate", !display && "text-muted-foreground/70")}>{display || emptyLabel}</span>
        {!compact && <CalendarDays size={15} aria-hidden className="shrink-0 text-muted-foreground" />}
      </button>
      {required && (
        // Lets the browser's own "please fill in this field" stop the form while there is no date.
        <input
          tabIndex={-1}
          aria-hidden="true"
          required
          value={value}
          onChange={() => {}}
          onFocus={() => triggerRef.current?.focus()}
          className="pointer-events-none absolute bottom-0 left-4 h-px w-px border-0 bg-transparent p-0 opacity-0"
        />
      )}

      {panel &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label={monthOnly ? "Choose a month" : "Choose a date"}
            style={{ position: "fixed", top: panel.top, left: panel.left, width: PANEL_WIDTH, transform: panel.up ? "translateY(-100%)" : undefined }}
            className="z-[60] rounded-2xl border border-border bg-popover p-3 text-popover-foreground shadow-xl"
          >
            <div className="mb-2 flex items-center justify-between">
              <button type="button" onClick={() => step(-1)} aria-label={picking === "month" ? "Previous year" : "Previous month"} className={cn(navButton, picking === "year" && "invisible")}>
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-0.5">
                {picking === "day" && (
                  <button type="button" onClick={() => setPicking("month")} className={headButton}>
                    {MONTHS[view.month]}
                  </button>
                )}
                <button type="button" onClick={() => setPicking(picking === "year" ? (monthOnly ? "month" : "day") : "year")} className={headButton}>
                  {view.year}
                </button>
              </div>
              <button type="button" onClick={() => step(1)} aria-label={picking === "month" ? "Next year" : "Next month"} className={cn(navButton, picking === "year" && "invisible")}>
                <ChevronRight size={16} />
              </button>
            </div>

            {picking === "year" && (
              <div className="grid max-h-56 grid-cols-4 gap-1 overflow-y-auto">
                {years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => {
                      setView({ ...view, year });
                      setPicking(monthOnly ? "month" : "day");
                    }}
                    className={cn(cellBase, year === view.year ? chosenClass : idleClass)}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}

            {picking === "month" && (
              <div className="grid grid-cols-3 gap-1">
                {MONTHS_SHORT.map((name, month) => {
                  const isChosen = monthOnly ? selected?.year === view.year && selected.month === month : view.month === month;
                  const isNow = today.year === view.year && today.month === month;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => pickMonth(month)}
                      className={cn(cellBase, "h-9", isChosen ? chosenClass : isNow ? "font-semibold text-primary ring-1 ring-inset ring-primary/50 hover:bg-primary/10" : idleClass)}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            )}

            {picking === "day" && (
              <div className="grid grid-cols-7 gap-y-0.5">
                {DAYS.map((day) => (
                  <span key={day} className="pb-1 text-center text-[11px] font-medium text-muted-foreground">
                    {day}
                  </span>
                ))}
                {calendarDays(view.year, view.month).map((cell) => {
                  const isChosen = selected?.year === cell.year && selected.month === cell.month && selected.day === cell.day;
                  const isToday = today.year === cell.year && today.month === cell.month && today.day === cell.day;
                  return (
                    <button
                      key={`${cell.month}-${cell.day}`}
                      type="button"
                      onClick={() => choose(dayValue(cell.year, cell.month, cell.day))}
                      aria-pressed={isChosen}
                      className={cn(
                        cellBase,
                        isChosen
                          ? chosenClass
                          : isToday
                            ? "font-semibold text-primary ring-1 ring-inset ring-primary/50 hover:bg-primary/10"
                            : cell.inMonth
                              ? idleClass
                              : "text-muted-foreground/50 hover:bg-primary/10"
                      )}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              {required ? (
                <span />
              ) : (
                <button type="button" onClick={() => choose("")} disabled={!value} className={cn(footButton, "text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent")}>
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => choose(monthOnly ? `${today.year}-${pad(today.month + 1)}` : dayValue(today.year, today.month, today.day))}
                className={cn(footButton, "text-primary hover:bg-primary/10")}
              >
                {monthOnly ? "This month" : "Today"}
              </button>
            </div>
          </div>,
          panel.host
        )}
    </span>
  );
}
