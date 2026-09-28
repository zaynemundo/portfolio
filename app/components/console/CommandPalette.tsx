"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { searchAll, type SearchResult } from "@/app/actions/search";

interface NavSearchItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface ResultRow {
  href: string;
  label: string;
  category: string;
}

interface Props {
  items: NavSearchItem[];
  onClose: () => void;
}

const DEBOUNCE_MS = 250;

/** Top-bar search: shows nav destinations by default, and once you type 2+
 *  characters, also searches across content (blog posts, case studies, notes,
 *  clients, freelance projects, invoices, inquiries) via the searchAll action. */
export function CommandPalette({ items, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [contentResults, setContentResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q ? items.filter((item) => item.label.toLowerCase().includes(q)) : items;
    return matches.map((item) => ({ href: item.href, label: item.label, category: "Pages" }));
  }, [items, query]);

  const trimmedQuery = query.trim();
  const effectiveContentResults = trimmedQuery.length < 2 ? [] : contentResults;
  const results: ResultRow[] = [...navMatches, ...effectiveContentResults];

  const safeActiveIndex = Math.min(activeIndex, Math.max(results.length - 1, 0));

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (trimmedQuery.length < 2) return;

    debounceRef.current = setTimeout(() => {
      setIsSearching(true);
      searchAll(trimmedQuery).then((rows) => {
        setContentResults(rows);
        setIsSearching(false);
      });
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [trimmedQuery]);

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

  // Group results by category, preserving first-seen order.
  const grouped: { category: string; rows: ResultRow[] }[] = [];
  for (const row of results) {
    let group = grouped.find((g) => g.category === row.category);
    if (!group) {
      group = { category: row.category, rows: [] };
      grouped.push(group);
    }
    group.rows.push(row);
  }

  let rowCursor = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
          <SearchIcon />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search everything…"
            className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          />
          {isSearching && <span className="h-3.5 w-3.5 rounded-full border-2 border-border border-t-primary animate-spin" aria-hidden="true" />}
          <kbd className="text-[10.5px] text-muted-foreground/70 border border-border rounded px-1.5 py-0.5">Esc</kbd>
        </div>
        <div className="max-h-96 overflow-y-auto py-1.5">
          {results.length === 0 && (
            <p className="px-4 py-6 text-center text-[13px] text-muted-foreground/70">
              {query.trim().length >= 2 && isSearching ? "Searching…" : "No matches."}
            </p>
          )}
          {grouped.map((group) => (
            <div key={group.category}>
              <p className="px-4 pt-2.5 pb-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.category}
              </p>
              <ul>
                {group.rows.map((row) => {
                  const i = rowCursor++;
                  return (
                    <li key={`${row.category}-${row.href}-${row.label}`}>
                      <button
                        type="button"
                        onMouseEnter={() => setActiveIndex(i)}
                        onClick={() => go(row.href)}
                        className={`w-full flex items-center gap-2.5 px-4 py-2 text-[13.5px] font-medium text-left transition-colors truncate ${
                          i === safeActiveIndex ? "bg-primary/10 text-primary" : "text-foreground/70"
                        }`}
                      >
                        {row.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="text-muted-foreground shrink-0">
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13.5 13.5 17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
