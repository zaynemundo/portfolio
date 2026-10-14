"use client";

import { ArrowDown, ArrowUp, Check, ChevronDown, GripVertical, Plus, Trash2 } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { cardClass } from "@/app/(admin)/_components/ui/Card";

/* How the Website workspace's content pages (Home, About, the Work page) are
   laid out. Each thing that can be edited is a Section: what it is and where
   it shows on the site on the left, its fields in a card on the right, and
   the card's own Save in its footer. Lists inside a section (scenes, roles,
   logos) are a stack of ItemCards with the same header and buttons. */

export const labelClass = "block text-[12px] font-medium text-foreground/80 mb-1.5";
export const hintClass = "text-[12px] text-muted-foreground mt-1.5";
export const fieldClass =
  "w-full rounded-lg bg-background border border-border px-3 py-2 text-[13.5px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors";
export const areaClass = `${fieldClass} resize-y leading-relaxed`;
/** A small outlined button beside a field, e.g. Replace on an upload. */
export const pillButtonClass =
  "flex items-center rounded-full border border-border px-3 py-1.5 text-[12px] font-semibold text-foreground/80 hover:bg-muted transition-colors";

interface SaveState {
  /** Called by the Save button (and by Enter in a field, when the section is a form). */
  onSave: () => void;
  pending: boolean;
  /** True once the last save went through. */
  saved: boolean;
  error?: string | null;
  label?: string;
}

interface SectionProps {
  title: string;
  /** What this part is and where it shows on the public site. */
  description?: React.ReactNode;
  /** Leave out for a section that saves itself, such as an upload. */
  save?: SaveState;
  /** Off for content that is already its own card or cards, e.g. two upload cards side by side. */
  card?: boolean;
  children: React.ReactNode;
}

export function Section({ title, description, save, card = true, children }: SectionProps) {
  const body = card ? (
    // Not clipped, so a dropdown inside can hang past the card's edge.
    <div className={cardClass}>
      <div className="p-5 space-y-4">{children}</div>
      {save && (
        <div className="flex items-center justify-between gap-3 rounded-b-2xl border-t border-border bg-muted/40 px-5 py-3">
          <p className="min-w-0 text-[12.5px]" aria-live="polite">
            {save.error ? (
              <span className="font-medium text-negative" role="alert">{save.error}</span>
            ) : save.saved && !save.pending ? (
              <span className="inline-flex items-center gap-1 font-medium text-positive">
                <Check size={13} />
                Saved
              </span>
            ) : (
              <span className="text-muted-foreground">Changes go live on the site when you save.</span>
            )}
          </p>
          <button
            type="submit"
            disabled={save.pending}
            className="shrink-0 rounded-full bg-foreground text-background text-[13px] font-semibold px-4 py-2 hover:bg-foreground/85 transition-colors disabled:opacity-50"
          >
            {save.pending ? "Saving…" : (save.label ?? "Save")}
          </button>
        </div>
      )}
    </div>
  ) : (
    children
  );

  const layout = (
    <div className="grid gap-x-10 gap-y-3 lg:grid-cols-[230px_minmax(0,1fr)]">
      <div className="lg:pt-1">
        <h2 className="text-[14.5px] font-semibold tracking-tight text-foreground">{title}</h2>
        {description && <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      <div className="min-w-0">{body}</div>
    </div>
  );

  if (!save) return <section>{layout}</section>;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.onSave();
      }}
    >
      {layout}
    </form>
  );
}

/** A stack of Sections (each its own card), with a gap between them. */
export function SectionStack({ children }: { children: React.ReactNode }) {
  return <div className="space-y-10">{children}</div>;
}

/** A labelled field. Pass the input itself as the child. */
export function Field({ label, hint, htmlFor, className, children }: { label: string; hint?: React.ReactNode; htmlFor?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={labelClass}>{label}</label>
      {children}
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}

const iconButton =
  "h-7 w-7 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground";

interface ItemCardProps {
  /** e.g. "Scene 2". */
  label: string;
  /** Shown after the label, e.g. the item's own name. */
  summary?: string;
  onRemove?: () => void;
  /** For a list whose order matters: shows the up / down arrows. Leave `up` or `down` undefined at the ends of the list. */
  move?: { up?: () => void; down?: () => void };
  /** In a grid of cards (see useGridDrag): a grip to drag the card by, in place of the arrows. */
  drag?: { handle: React.ButtonHTMLAttributes<HTMLButtonElement>; lifted: boolean; style?: React.CSSProperties };
  /** With these two, the header folds the card's fields away. */
  collapsed?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
}

/** One entry in a list a section edits: a header with its name and reorder / remove buttons, then its fields. */
export function ItemCard({ label, summary, onRemove, move, drag, collapsed, onToggle, children }: ItemCardProps) {
  const heading = (
    <>
      <span className="text-[12.5px] font-semibold text-foreground">{label}</span>
      {summary && <span className="truncate text-[12.5px] text-muted-foreground">{summary}</span>}
    </>
  );
  return (
    <div
      data-tile={drag ? "" : undefined}
      style={drag?.style}
      className={cn("rounded-xl border bg-background", drag?.lifted ? "border-primary/40 shadow-[0_14px_30px_-8px_rgba(0,0,0,0.25)]" : "border-border/70")}
    >
      <div className="flex items-center gap-1 px-3 py-2">
        {drag && (
          <button
            type="button"
            {...drag.handle}
            aria-label={`Drag to move ${label}, or use the arrow keys`}
            title="Drag to reorder"
            className={cn(iconButton, "-ml-1 touch-none", drag.lifted ? "cursor-grabbing bg-muted text-foreground" : "cursor-grab")}
          >
            <GripVertical size={15} />
          </button>
        )}
        {onToggle ? (
          <button type="button" onClick={onToggle} aria-expanded={!collapsed} className="flex min-w-0 flex-1 items-center gap-2 text-left">
            <ChevronDown size={14} className={cn("shrink-0 text-muted-foreground transition-transform", collapsed && "-rotate-90")} />
            {heading}
          </button>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-2 pl-1">{heading}</div>
        )}
        {move && (
          <>
            <button type="button" onClick={move.up} disabled={!move.up} aria-label={`Move ${label} up`} className={iconButton}>
              <ArrowUp size={14} />
            </button>
            <button type="button" onClick={move.down} disabled={!move.down} aria-label={`Move ${label} down`} className={iconButton}>
              <ArrowDown size={14} />
            </button>
          </>
        )}
        {onRemove && (
          <button type="button" onClick={onRemove} aria-label={`Remove ${label}`} className={cn(iconButton, "hover:bg-negative/10 hover:text-negative")}>
            <Trash2 size={14} />
          </button>
        )}
      </div>
      {!collapsed && <div className="space-y-3 border-t border-border/70 p-4">{children}</div>}
    </div>
  );
}

/** The dashed "+ Add …" button under a list. */
export function AddItemButton({ onClick, children, className }: { onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-[12.5px] font-semibold text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-colors", className)}
    >
      <Plus size={14} />
      {children}
    </button>
  );
}
