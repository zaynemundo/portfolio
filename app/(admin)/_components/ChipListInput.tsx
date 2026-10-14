"use client";

import { useEffect, useRef } from "react";
import { Plus, X } from "lucide-react";

interface Props {
  items: string[];
  onChange: (items: string[]) => void;
  /** The singular name of one item, e.g. "service". */
  itemLabel: string;
  placeholder?: string;
}

const chip = "inline-flex items-center rounded-lg border border-border bg-card text-[13px] text-foreground transition-colors";

/**
 * Short words as chips that wrap onto as many rows as they need, instead of
 * one full-width box per row. Each chip is edited in place; Enter starts a new
 * one, Backspace in an empty chip removes it.
 */
export function ChipListInput({ items, onChange, itemLabel, placeholder }: Props) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const focusNext = useRef<number | null>(null);

  // Focus a chip once it has rendered (a new one, or the one before a removed one).
  useEffect(() => {
    if (focusNext.current === null) return;
    inputs.current[focusNext.current]?.focus();
    focusNext.current = null;
  });

  function update(i: number, value: string) {
    onChange(items.map((v, idx) => (idx === i ? value : v)));
  }

  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  function add(at = items.length) {
    onChange([...items.slice(0, at), "", ...items.slice(at)]);
    focusNext.current = at;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span key={i} className={`${chip} pl-3 pr-1 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15`}>
          {/* The hidden copy sizes the box to its text, so each chip is only as wide as its words. */}
          <span className="inline-grid">
            <span aria-hidden className="invisible col-start-1 row-start-1 whitespace-pre py-1.5">{item || placeholder}</span>
            <input
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              value={item}
              placeholder={placeholder}
              size={1}
              onChange={(e) => update(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  add(i + 1);
                } else if (e.key === "Backspace" && item === "") {
                  e.preventDefault();
                  remove(i);
                  focusNext.current = Math.max(0, i - 1);
                }
              }}
              aria-label={`${itemLabel[0].toUpperCase()}${itemLabel.slice(1)} ${i + 1}`}
              className="col-start-1 row-start-1 w-full min-w-0 bg-transparent py-1.5 outline-none placeholder:text-muted-foreground/60"
            />
          </span>
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label={`Remove ${itemLabel} ${i + 1}`}
            className="ml-1 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-negative/10 hover:text-negative transition-colors"
          >
            <X size={13} />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={() => add()}
        className={`${chip} gap-1.5 border-dashed px-3 py-1.5 text-muted-foreground hover:border-primary/50 hover:text-foreground`}
      >
        <Plus size={13} />
        Add {itemLabel}
      </button>
    </div>
  );
}
