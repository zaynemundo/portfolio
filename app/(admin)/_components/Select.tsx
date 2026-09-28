"use client";

import { useEffect, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  /** Rendered as an extra row at the bottom of the list, styled distinctly (e.g. "+ Add new client…"). */
  extraAction?: { label: string; onSelect: () => void };
}

/** Custom dropdown replacing native <select> — the OS renders native option
 *  popups with its own styling that can't be reached by CSS, which looked
 *  inconsistent with the rest of the app. */
export function Select({ value, onChange, options, placeholder, className, extraAction }: Props) {
  const [open, setOpen] = useState(false);
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

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={
          className ??
          "w-full flex items-center justify-between gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-[13.5px] text-foreground/90 hover:bg-secondary transition-colors"
        }
      >
        <span className={`truncate ${selected ? "" : "text-muted-foreground/70"}`}>{selected?.label ?? placeholder ?? "Select…"}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 rounded-lg border border-border bg-card shadow-xl py-1 max-h-64 overflow-y-auto">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-[13.5px] transition-colors ${
                o.value === value ? "text-foreground bg-secondary" : "text-foreground/70 hover:bg-secondary"
              }`}
            >
              {o.label}
            </button>
          ))}
          {extraAction && (
            <>
              <div className="h-px bg-secondary my-1 mx-1" />
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  extraAction.onSelect();
                }}
                className="w-full text-left px-3 py-2 text-[13.5px] text-success hover:bg-secondary transition-colors"
              >
                {extraAction.label}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
