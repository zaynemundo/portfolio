"use client";

/**
 * Wraps a shared image so it can be looked at but not casually saved: the
 * watermark line is laid over it in a repeating slant, and right-click and
 * drag-to-desktop are switched off. A screenshot still works — it just carries
 * the watermark.
 */
export function ViewOnly({ watermark, children }: { watermark: string; children: React.ReactNode }) {
  return (
    <div className="relative select-none overflow-hidden" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()}>
      {children}
      <div aria-hidden="true" className="pointer-events-none absolute -inset-1/2 flex flex-wrap content-start gap-x-16 gap-y-20 -rotate-[28deg] opacity-[0.22]">
        {Array.from({ length: 160 }, (_, i) => (
          <span key={i} className="whitespace-nowrap text-[14px] font-bold text-zinc-600 mix-blend-difference">
            {watermark}
          </span>
        ))}
      </div>
    </div>
  );
}
