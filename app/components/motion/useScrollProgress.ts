"use client";

import { useRef, useEffect, useCallback } from "react";

/**
 * Tracks the vertical scroll progress of a container element.
 *
 * Progress is 0 when the container's top edge reaches the viewport top,
 * and 1 when the container's bottom edge reaches the viewport bottom.
 *
 * Uses requestAnimationFrame to avoid layout thrashing and keeps
 * React state out of the hot path — the callback receives the raw
 * progress value so the consumer can write directly to refs / DOM.
 */
export function useScrollProgress(
  containerRef: React.RefObject<HTMLElement | null>,
  onProgress: (progress: number) => void,
) {
  const rafRef = useRef<number | null>(null);
  const cbRef = useRef(onProgress);

  useEffect(() => {
    cbRef.current = onProgress;
  }, [onProgress]);

  const compute = useCallback(() => {
    rafRef.current = null;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scrollable = el.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const p = Math.min(Math.max(-rect.top / scrollable, 0), 1);
    cbRef.current(p);
  }, [containerRef]);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(compute);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    compute();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [compute]);
}
