"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface SearchItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface Props {
  items: SearchItem[];
  onClose: () => void;
}

/** Lightweight "jump to" search over the admin's own nav items — filters as you
 *  type, arrow keys + Enter to navigate, Escape or backdrop click to dismiss. */
export function CommandPalette({ items, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, query]);

  // Clamped at render time instead of reset via an effect — avoids a
  // setState-in-effect render cascade for what's just a derived value.
  const safeActiveIndex = Math.min(activeIndex, Math.max(results.length - 1, 0));

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function go(href: string) {
    router.push(href);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[safeActiveIndex];
      if (item) go(item.href);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-800">
          <SearchIcon />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Jump to…"
            className="flex-1 bg-transparent text-[14px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
          />
          <kbd className="text-[10.5px] text-zinc-600 border border-zinc-800 rounded px-1.5 py-0.5">Esc</kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto py-1.5">
          {results.length === 0 && (
            <li className="px-4 py-6 text-center text-[13px] text-zinc-600">No matches.</li>
          )}
          {results.map((item, i) => (
            <li key={item.href}>
              <button
                type="button"
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => go(item.href)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] font-medium text-left transition-colors ${
                  i === safeActiveIndex ? "bg-purple-500/10 text-purple-300" : "text-zinc-300"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="text-zinc-500 shrink-0">
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13.5 13.5 17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
