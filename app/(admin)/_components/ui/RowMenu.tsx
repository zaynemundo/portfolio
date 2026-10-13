"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/app/lib/utils";

/* The "…" at the end of a table row. A row with more than one thing to do to
   it (edit, delete, archive…) keeps them in this menu rather than side by
   side; a row with a single action can show that action on its own.

   The menu is drawn outside the table, on top of the page, so it is never cut
   off by the table's edge on the last row or covered by the row below. */

const MENU_WIDTH = 168;

export const rowMenuItemClass = (danger = false) =>
  cn(
    "w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors disabled:opacity-50",
    danger ? "text-negative hover:bg-negative/10" : "text-foreground/90 hover:bg-muted"
  );

export function RowMenu({ label = "More options", disabled, children }: { label?: string; disabled?: boolean; children: React.ReactNode }) {
  const [position, setPosition] = useState<{ top: number; left: number; up: boolean; host: Element } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const open = position !== null;

  useEffect(() => {
    if (!open) return;
    const close = () => setPosition(null);
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (!ref.current?.contains(target) && !menuRef.current?.contains(target)) close();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    // It's pinned to where the button was, so it can't follow the page.
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    if (open) {
      setPosition(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    // Opens upwards when there isn't room underneath.
    const up = window.innerHeight - rect.bottom < 180;
    // Kept inside the admin wrapper, which is where the colours are defined.
    const host = e.currentTarget.closest(".admin-root") ?? document.body;
    setPosition({ top: up ? rect.top - 6 : rect.bottom + 6, left: Math.max(8, rect.right - MENU_WIDTH), up, host });
  }

  return (
    <div ref={ref} className="relative z-10 inline-flex">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        title="More"
        className={cn(
          "h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50",
          open && "bg-muted text-foreground"
        )}
      >
        <MoreHorizontal size={16} />
      </button>

      {position &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            // Choosing anything closes the menu.
            onClick={() => setPosition(null)}
            style={{ position: "fixed", top: position.top, left: position.left, width: MENU_WIDTH, transform: position.up ? "translateY(-100%)" : undefined }}
            className="z-50 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg py-1 text-left"
          >
            {children}
          </div>,
          position.host
        )}
    </div>
  );
}

/** One line in a RowMenu: a link when given `href`, otherwise a button. */
export function RowMenuItem({
  href, onClick, danger, icon, disabled, children,
}: {
  href?: string;
  onClick?: () => void;
  /** For deleting and the like: shown in red. */
  danger?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const body = (
    <>
      {icon}
      {children}
    </>
  );
  return href ? (
    <Link href={href} role="menuitem" className={rowMenuItemClass(danger)}>
      {body}
    </Link>
  ) : (
    <button type="button" role="menuitem" onClick={onClick} disabled={disabled} className={rowMenuItemClass(danger)}>
      {body}
    </button>
  );
}
