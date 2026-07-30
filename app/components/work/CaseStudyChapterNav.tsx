"use client";

import { useEffect, useState } from "react";

export interface Chapter {
  label: string;
  id: string;
}

/**
 * Sticky vertical chapter tracker for rich case studies.
 *
 * - Fixed left-side position, only visible at 2xl (≥1536px) where there is
 *   enough left-margin to avoid overlapping the content grid.
 * - Uses IntersectionObserver to track the active section as the reader scrolls.
 * - Click / keyboard activates smooth scroll to that section.
 * - Fully respects prefers-reduced-motion (smooth scroll removed, active state still works).
 * - Renders nothing when fewer than 2 chapters are present.
 */
export function CaseStudyChapterNav({ chapters }: { chapters: Chapter[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (chapters.length < 2) return;

    const els = chapters
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => el !== null);

    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost intersecting section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      // Top 10% already scrolled past; bottom 65% not yet in view → active zone is 25% wide
      { rootMargin: "-10% 0px -65% 0px", threshold: 0 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [chapters]);

  if (chapters.length < 2) return null;

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="Case study chapters"
      className="hidden 2xl:block fixed left-10 top-1/2 -translate-y-1/2 z-40"
    >
      <ol className="flex flex-col gap-5 list-none m-0 p-0">
        {chapters.map((c) => {
          const isActive = activeId === c.id;
          return (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(c.id);
                }}
                aria-current={isActive ? "location" : undefined}
                className={[
                  "flex items-center gap-3 no-underline group/ch transition-opacity duration-200",
                  isActive ? "opacity-100" : "opacity-30 hover:opacity-65",
                ].join(" ")}
              >
                {/* Animated dash — extends when active */}
                <span
                  className={[
                    `block h-px flex-shrink-0 transition-all duration-300 ${isActive ? "bg-[#8B5CF6]" : "bg-zinc-400"}`,
                    isActive ? "w-7" : "w-3 group-hover/ch:w-5",
                  ].join(" ")}
                  aria-hidden="true"
                />
                {/* Label */}
                <span
                  className={[
                    "text-[10px] font-semibold tracking-[0.1em] uppercase whitespace-nowrap transition-colors duration-200",
                    isActive ? "text-[#8B5CF6]" : "text-zinc-500",
                  ].join(" ")}
                >
                  {c.label}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
