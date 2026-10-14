"use client";

import { useState } from "react";
import { Modal } from "@/app/(admin)/_components/Modal";
import { DialogDone } from "@/app/(admin)/_components/DialogActions";
import { AddTile, TileActions, TileFrame } from "@/app/(admin)/_components/Tile";
import { useGridDrag } from "@/app/(admin)/_components/useGridDrag";
import { cn } from "@/app/lib/utils";

function moved<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * A list edited as a grid of tiles: each tile shows a short preview, drags by
 * its handle to reorder, and opens a dialog to edit. The page's own Save
 * button still publishes the changes.
 */
export function TileGridEditor<T>({
  items, onChange, itemLabel, newItem, renderPreview, renderEditor, saveHint, titleOf, renderMeta,
  modalWidth = "max-w-2xl", columns = 2, compact, keyOf, reorder = moved, addTile,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  /** The singular name of one item, e.g. "Role". */
  itemLabel: string;
  /** A blank item for the Add tile, which then opens it in the dialog. Leave out when `addTile` adds items its own way. */
  newItem?: (items: T[]) => T;
  /** What a tile shows. */
  renderPreview: (item: T, index: number) => React.ReactNode;
  /** The dialog's fields; `update` merges a change into this item. */
  renderEditor: (item: T, update: (patch: Partial<T>) => void, index: number) => React.ReactNode;
  /** The name of the page's save button, for the reminder in the dialog. */
  saveHint: string;
  /** The dialog's title for an item, e.g. its name; falls back to "Role 2". */
  titleOf?: (item: T, index: number) => string;
  /** A short note in the tile's bottom row, beside the delete button (e.g. "11 skills"). */
  renderMeta?: (item: T) => React.ReactNode;
  /** The dialog's width class, for editors with wide content. */
  modalWidth?: string;
  columns?: 2 | 4;
  /** Tighter tiles, for previews led by a picture. */
  compact?: boolean;
  /** A stable key per item (an id or URL); the index otherwise. */
  keyOf?: (item: T, index: number) => string | number;
  /** How a drag reorders the list, when moving an item isn't the whole story. */
  reorder?: (items: T[], from: number, to: number) => T[];
  /** Replaces the plain Add tile, e.g. with an upload button or a picker. */
  addTile?: React.ReactNode;
}) {
  const [editing, setEditing] = useState<number | null>(null);
  const { gridRef, liftedIndex, tileStyle, handleProps, dropTarget } = useGridDrag(items.length, (from, to) => onChange(reorder(items, from, to)));
  const current = editing !== null ? items[editing] : undefined;
  const lower = itemLabel.toLowerCase();
  const nameOf = (item: T, i: number) => titleOf?.(item, i) || `${itemLabel} ${i + 1}`;

  return (
    <>
      <div ref={gridRef} className={cn("relative grid gap-3", columns === 4 ? "grid-cols-2 sm:grid-cols-4" : "sm:grid-cols-2")}>
        {dropTarget}
        {items.map((item, i) => (
          <TileFrame key={keyOf?.(item, i) ?? i} lifted={liftedIndex === i} style={tileStyle(i)} compact={compact}>
            <button
              type="button"
              onClick={() => setEditing(i)}
              aria-label={`Edit ${nameOf(item, i)}`}
              className={cn("flex-1 rounded-lg text-left transition-colors", !compact && "p-1 hover:bg-muted/60")}
            >
              {renderPreview(item, i)}
            </button>
            <TileActions
              label={nameOf(item, i)}
              handle={handleProps(i)}
              lifted={liftedIndex === i}
              onEdit={() => setEditing(i)}
              onRemove={() => onChange(items.filter((_, idx) => idx !== i))}
              meta={renderMeta?.(item)}
            />
          </TileFrame>
        ))}
        {addTile ??
          (newItem && (
            <AddTile
              label={`Add ${lower}`}
              onClick={() => {
                onChange([...items, newItem(items)]);
                setEditing(items.length);
              }}
            />
          ))}
      </div>

      {current !== undefined && editing !== null && (
        <Modal open onClose={() => setEditing(null)} title={nameOf(current, editing)} maxWidthClassName={modalWidth}>
          <div className="space-y-4">
            {renderEditor(current, (patch) => onChange(items.map((it, idx) => (idx === editing ? { ...it, ...patch } : it))), editing)}
            <DialogDone onDone={() => setEditing(null)} saveHint={saveHint} />
          </div>
        </Modal>
      )}
    </>
  );
}
