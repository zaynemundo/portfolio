"use client";

import { useEffect, useRef } from "react";

export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const handler = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const el = barRef.current;
        if (!el) { ticking = false; return; }
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const pct = h > 0 ? Math.min(window.scrollY / h, 1) : 0;
        el.style.width = `${(pct * 100).toFixed(1)}%`;
        ticking = false;
      });
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return <div ref={barRef} className="reading-progress" aria-hidden="true" />;
}
