"use client";

import { Children, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/app/lib/utils";

/* Long lists are shown ten rows at a time. Use PagedBody in place of a
   table's <tbody> — each takes
   the rows as children exactly as the plain element would, and adds the
   Previous / page numbers / Next footer once there are more rows than fit on
   one page. With ten or fewer, nothing extra is shown. */

export const PAGE_SIZE = 10;

function usePage(children: React.ReactNode) {
  const rows = Children.toArray(children);
  const [page, setPage] = useState(0);
  const lastPage = Math.max(0, Math.ceil(rows.length / PAGE_SIZE) - 1);
  // Clamped rather than reset, so deleting the last row of the last page steps back one page.
  const current = Math.min(page, lastPage);
  const start = current * PAGE_SIZE;
  return { visible: rows.slice(start, start + PAGE_SIZE), total: rows.length, current, lastPage, start, setPage };
}

/** Page numbers to offer: first, last and the ones around the current page; null marks a gap. */
function pageNumbers(current: number, lastPage: number): (number | null)[] {
  const wanted = [0, current - 1, current, current + 1, lastPage].filter((p) => p >= 0 && p <= lastPage);
  const pages = [...new Set(wanted)].sort((a, b) => a - b);
  const out: (number | null)[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) out.push(null);
    out.push(p);
  });
  return out;
}

const edgeButton =
  "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card text-[12.5px] font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:hover:bg-card";
const pageButton =
  "min-w-8 h-8 px-2 rounded-lg text-[12.5px] font-medium tabular-nums text-muted-foreground hover:bg-muted hover:text-foreground transition-colors";

interface PagerProps {
  total: number;
  current: number;
  lastPage: number;
  start: number;
  setPage: (page: number) => void;
}

/** Previous on the left, page numbers in the middle, Next on the right. */
function Pager({ total, current, lastPage, start, setPage }: PagerProps) {
  return (
    <nav className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border" aria-label={`Pages. Showing ${start + 1} to ${Math.min(start + PAGE_SIZE, total)} of ${total}`}>
      <button type="button" className={edgeButton} disabled={current === 0} onClick={() => setPage(current - 1)}>
        <ArrowLeft size={13} />
        Previous
      </button>
      <div className="flex items-center gap-1">
        {pageNumbers(current, lastPage).map((p, i) =>
          p === null ? (
            <span key={`gap-${i}`} className="px-1 text-[12.5px] text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              aria-current={p === current ? "page" : undefined}
              className={cn(pageButton, p === current && "border border-border bg-card font-semibold text-foreground")}
              onClick={() => setPage(p)}
            >
              {p + 1}
            </button>
          )
        )}
      </div>
      <button type="button" className={edgeButton} disabled={current === lastPage} onClick={() => setPage(current + 1)}>
        Next
        <ArrowRight size={13} />
      </button>
    </nav>
  );
}

/** A table's <tbody>, ten rows at a time. Children are the <tr> rows. */
export function PagedBody({ children, className }: { children: React.ReactNode; className?: string }) {
  const { visible, ...pager } = usePage(children);
  return (
    <>
      <tbody className={className}>{visible}</tbody>
      {pager.total > PAGE_SIZE && (
        <tfoot>
          <tr>
            {/* Wider than any table here, so the footer always runs the full width. */}
            <td colSpan={100} className="p-0">
              <Pager {...pager} />
            </td>
          </tr>
        </tfoot>
      )}
    </>
  );
}

