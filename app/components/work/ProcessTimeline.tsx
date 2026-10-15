"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll-aware wrapper for the numbered process timeline.
 *
 * Strategy — hybrid IO + passive scroll:
 *   - IntersectionObserver (full viewport, threshold 0) maintains a live Set
 *     of which steps are currently visible. It fires on enter/leave.
 *   - A rAF-throttled scroll listener runs pickActive() on every scroll frame.
 *     pickActive() only calls getBoundingClientRect on the visible subset,
 *     so it's cheap even with many steps.
 *   - This combination means active state updates both when steps enter/leave
 *     view AND continuously while scrolling through them in either direction.
 *
 * DOM contract — elements must carry these data attributes:
 *   data-step        outer row for each phase
 *   data-step-circle the number circle
 *   data-step-line   the connecting line below (absent on last step)
 *   data-step-content the step's heading and body, dimmed while not active
 *
 * Respects prefers-reduced-motion (transitions disabled, states still update).
 * No layout shifts — only color/background/opacity mutations on existing elements.
 */

function applyActive(
  steps: HTMLElement[],
  activeIdx: number,
  motion: boolean,
  lineProgress = 0,
) {
  steps.forEach((step, i) => {
    const circle   = step.querySelector<HTMLElement>("[data-step-circle]");
    const progress = step.querySelector<HTMLElement>("[data-step-progress]");
    const content  = step.querySelector<HTMLElement>("[data-step-content]");

    if (circle) {
      if (!motion) circle.style.transition = "none";
      if (i === activeIdx) {
        circle.style.backgroundColor = "#8B5CF6";
        circle.style.borderColor     = "#8B5CF6";
        circle.style.color           = "#ffffff";
      } else {
        circle.style.backgroundColor = "";
        circle.style.borderColor     = "";
        circle.style.color           = "";
      }
    }

    // The step being read is at full strength; the rest sit back.
    if (content) {
      content.style.transition = motion ? "opacity 0.45s ease-in-out" : "none";
      content.style.opacity    = i === activeIdx ? "1" : "0.35";
    }

    if (progress) {
      if (i < activeIdx) {
        progress.style.height = "100%";
      } else if (i === activeIdx) {
        progress.style.height = `${lineProgress * 100}%`;
      } else {
        progress.style.height = "0%";
      }
    }
  });
}

export function ProcessTimeline({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const steps = Array.from(
      container.querySelectorAll<HTMLElement>("[data-step]"),
    );
    if (!steps.length) return;

    // Live set of steps that currently have any pixel inside the viewport
    const visible = new Set<HTMLElement>();
    let lastActive = 0;
    let rafId: number | null = null;

    function pickActive() {
      // Fall back to all steps if the visible set is empty (e.g. zoomed out)
      const candidates = visible.size > 0 ? [...visible] : steps;
      const mid = window.innerHeight / 2;

      let best = lastActive;
      let bestDist = Infinity;

      candidates.forEach((step) => {
        const idx = steps.indexOf(step);
        if (idx === -1) return;
        const rect = step.getBoundingClientRect();
        const centre = rect.top + rect.height / 2;
        const dist = Math.abs(centre - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = idx;
        }
      });

      // Compute how far we've scrolled through the current step toward the next
      let lineProgress = 0;
      if (best < steps.length - 1) {
        const currentRect = steps[best].getBoundingClientRect();
        const nextRect    = steps[best + 1].getBoundingClientRect();
        const currentCenter = currentRect.top + currentRect.height / 2;
        const nextCenter    = nextRect.top    + nextRect.height    / 2;
        lineProgress = Math.max(0, Math.min(1, (mid - currentCenter) / (nextCenter - currentCenter)));
      }

      if (best !== lastActive) {
        lastActive = best;
      }
      applyActive(steps, best, !reducedMotion, lineProgress);
    }

    // IntersectionObserver — full viewport, just maintains `visible`
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) visible.add(e.target as HTMLElement);
          else visible.delete(e.target as HTMLElement);
        });
        pickActive();
      },
      { rootMargin: "0px", threshold: 0 },
    );

    steps.forEach((s) => observer.observe(s));

    // Scroll listener — rAF throttled, only calls pickActive()
    function onScroll() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        pickActive();
        rafId = null;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    // Set initial state
    applyActive(steps, 0, !reducedMotion, 0);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
