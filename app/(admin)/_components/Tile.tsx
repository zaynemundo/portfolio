"use client";

import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/app/lib/utils";

/* The pieces every draggable tile grid in the admin is built from: the tile
 * itself, its bottom row of actions, and the dashed "Add" tile at the end.
 * useGridDrag supplies the style and handle props; TileGridEditor puts it all
 * together for lists edited in a dialog. */

export const tileButtonClass =
  "flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors";

/** One tile. It lifts with a shadow while it's being dragged. */
export function TileFrame({
  lifted, style, compact, className, children,
}: {
  lifted: boolean;
  style?: React.CSSProperties;
  /** Tighter padding, for tiles led by a picture. */
  compact?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-tile
      style={style}
      className={cn(
        "flex flex-col rounded-xl border bg-background",
        compact ? "p-2" : "p-3",
        lifted ? "border-primary/40 shadow-[0_14px_30px_-8px_rgba(0,0,0,0.25)]" : "border-border/70",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A tile's bottom row: drag handle, Edit, an optional note, and the bin. */
export function TileActions({
  label, handle, lifted, onEdit, onRemove, meta,
}: {
  /** What the tile is, for screen readers: "P&O Marinas", "image 2". */
  label: string;
  handle: React.ButtonHTMLAttributes<HTMLButtonElement>;
  lifted: boolean;
  onEdit?: () => void;
  onRemove: () => void;
  /** A short note beside the bin, e.g. "11 skills". */
  meta?: React.ReactNode;
}) {
  return (
    <div className="mt-2 flex items-center">
      <button
        type="button"
        {...handle}
        aria-label={`Drag to move ${label}, or use the arrow keys`}
        title="Drag to reorder"
        className={cn(tileButtonClass, "touch-none", lifted ? "cursor-grabbing bg-muted text-foreground" : "cursor-grab")}
      >
        <GripVertical size={15} />
      </button>
      {onEdit && (
        <button type="button" onClick={onEdit} className="ml-1 flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold text-primary hover:bg-primary/10 transition-colors">
          <Pencil size={12} />
          Edit
        </button>
      )}
      {meta ? <span className="ml-auto mr-1 text-[12px] tabular-nums text-muted-foreground">{meta}</span> : null}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className={cn(tileButtonClass, !meta && "ml-auto", "hover:bg-negative/10 hover:text-negative")}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

const addTileClass =
  "flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border px-3 text-center text-[12.5px] font-semibold text-muted-foreground transition-colors";

/** The dashed tile that ends a grid. As a button it adds an item; with `as="div"` it holds its own control (e.g. a picker). */
export function AddTile({
  label, onClick, icon, hint, disabled, minHeight = 96, as = "button", children,
}: {
  label?: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  hint?: string;
  disabled?: boolean;
  minHeight?: number;
  as?: "button" | "div";
  children?: React.ReactNode;
}) {
  const content = (
    <>
      {label && (
        <span className="flex flex-col items-center gap-1.5">
          {icon ?? <Plus size={16} />}
          {label}
        </span>
      )}
      {hint && <span className="text-[11px] font-normal">{hint}</span>}
      {children}
    </>
  );
  if (as === "div") {
    return <div className={cn(addTileClass, "p-4")} style={{ minHeight }}>{content}</div>;
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(addTileClass, "hover:border-primary/50 hover:bg-primary/5 hover:text-primary disabled:opacity-60")}
      style={{ minHeight }}
    >
      {content}
    </button>
  );
}
