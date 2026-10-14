"use client";

import { useRef, useState } from "react";

/** A tile being dragged: where it started, the place it's over, and every tile's box when the drag began. */
interface Drag {
  from: number;
  to: number;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  boxes: { left: number; top: number; width: number; height: number }[];
  /** Released, and gliding into place. */
  dropping: boolean;
}

/** How long a dropped tile takes to glide into its place. */
const DROP_MS = 180;

/** The order the tiles would take if the dragged one were dropped now: tile index → place. */
function placeOf(index: number, from: number, to: number): number {
  if (index === from) return to;
  if (from < to && index > from && index <= to) return index - 1;
  if (to < from && index >= to && index < from) return index + 1;
  return index;
}

/**
 * Drag-to-reorder for a grid of tiles. Put `gridRef` on the grid (it needs
 * `position: relative`), `data-tile` and `tileStyle(i)` on each tile, spread
 * `handleProps(i)` on each tile's grip button, and render `dropTarget` inside
 * the grid. The arrow keys on a focused grip move its tile one place too.
 */
export function useGridDrag(count: number, moveTo: (from: number, to: number) => void) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);

  function move(from: number, to: number) {
    if (from !== to && to >= 0 && to < count) moveTo(from, to);
  }

  function startDrag(e: React.PointerEvent<HTMLButtonElement>, index: number) {
    if (e.button !== 0 || drag || !gridRef.current) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const grid = gridRef.current.getBoundingClientRect();
    const boxes = Array.from(gridRef.current.querySelectorAll<HTMLElement>("[data-tile]")).map((tile) => {
      const r = tile.getBoundingClientRect();
      return { left: r.left - grid.left, top: r.top - grid.top, width: r.width, height: r.height };
    });
    setDrag({ from: index, to: index, startX: e.clientX, startY: e.clientY, dx: 0, dy: 0, boxes, dropping: false });
  }

  function followPointer(e: React.PointerEvent) {
    if (!drag || drag.dropping) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const own = drag.boxes[drag.from];
    const x = own.left + own.width / 2 + dx;
    const y = own.top + own.height / 2 + dy;
    // The place whose middle is nearest the dragged tile's middle.
    let to = drag.from;
    let best = Infinity;
    drag.boxes.forEach((b, i) => {
      const d = Math.hypot(b.left + b.width / 2 - x, b.top + b.height / 2 - y);
      if (d < best) { best = d; to = i; }
    });
    setDrag({ ...drag, dx, dy, to });
  }

  function endDrag(cancel = false) {
    if (!drag || drag.dropping) return;
    const to = cancel ? drag.from : drag.to;
    const own = drag.boxes[drag.from];
    // Glide into the place, then move the tile there for real.
    setDrag({ ...drag, to, dx: drag.boxes[to].left - own.left, dy: drag.boxes[to].top - own.top, dropping: true });
    window.setTimeout(() => {
      move(drag.from, to);
      setDrag(null);
    }, DROP_MS);
  }

  /** Where each tile sits while a drag is on: the dragged one under the pointer, the rest slid into their new places. */
  function tileStyle(index: number): React.CSSProperties | undefined {
    if (!drag) return undefined;
    if (index === drag.from) {
      return {
        transform: `translate(${drag.dx}px, ${drag.dy}px)`,
        transition: drag.dropping ? `transform ${DROP_MS}ms ease-out` : "none",
        position: "relative",
        zIndex: 10,
      };
    }
    const own = drag.boxes[index];
    const place = drag.boxes[placeOf(index, drag.from, drag.to)];
    return { transform: `translate(${place.left - own.left}px, ${place.top - own.top}px)`, transition: "transform 220ms ease-out" };
  }

  function handleProps(index: number): React.ButtonHTMLAttributes<HTMLButtonElement> {
    return {
      onPointerDown: (e) => startDrag(e, index),
      onPointerMove: followPointer,
      onPointerUp: () => endDrag(),
      onPointerCancel: () => endDrag(true),
      onKeyDown: (e) => {
        if (e.key === "Escape" && drag) return endDrag(true);
        const step = e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : 0;
        if (!step || drag) return;
        e.preventDefault();
        move(index, index + step);
      },
    };
  }

  /** The place the dragged tile will land in. */
  const dropTarget = drag && drag.to !== drag.from && (
    <div
      aria-hidden
      className="pointer-events-none absolute rounded-xl border-2 border-dashed border-primary/50 bg-primary/[0.06] transition-[left,top] duration-200 ease-out"
      style={{ left: drag.boxes[drag.to].left, top: drag.boxes[drag.to].top, width: drag.boxes[drag.to].width, height: drag.boxes[drag.to].height }}
    />
  );

  return { gridRef, liftedIndex: drag?.from ?? null, tileStyle, handleProps, dropTarget };
}
