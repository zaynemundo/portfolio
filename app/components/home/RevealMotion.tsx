"use client";

import { useEffect } from "react";

/**
 * Reveals every `.site-reveal` element as it scrolls into view.
 * The `js-site-reveal-ready` class is added pre-paint by the theme init script
 * in app/layout.tsx, so server-rendered content never flashes.
 */
export function RevealMotion() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".site-reveal"));

    if (typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
