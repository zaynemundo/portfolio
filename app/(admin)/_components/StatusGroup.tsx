"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

interface Props {
  label: string;
  count: number;
  dotClassName: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/** A collapsible, labeled group for a status-grouped list table (ClickUp-style)
 *  — a header row with a colored dot, the group label, and a count, followed
 *  by that group's own table when expanded. Each list page renders one of
 *  these per status value instead of a single flat table. */
export function StatusGroup({ label, count, dotClassName, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  if (count === 0) return null;

  return (
    <div className="mb-4 last:mb-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full py-2 text-left"
      >
        <ChevronRight size={13} className={`text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
        <span className={`h-2 w-2 rounded-full shrink-0 ${dotClassName}`} aria-hidden="true" />
        <span className="text-[11.5px] font-semibold uppercase tracking-wider text-foreground/80">{label}</span>
        <span className="text-[11.5px] text-muted-foreground">{count}</span>
      </button>
      {open && <div className="border border-border rounded-xl overflow-hidden">{children}</div>}
    </div>
  );
}
