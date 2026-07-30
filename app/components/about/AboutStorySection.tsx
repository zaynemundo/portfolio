"use client";

import { useRef, useEffect } from "react";
import { Reveal } from "@/app/components/Reveal";
import { AboutPortrait } from "./AboutPortrait";
import { AboutChapter } from "./AboutChapter";
import { useAboutStory } from "@/app/hooks/useAboutStory";
import { aboutChapters } from "@/app/data/aboutChapters";

interface Props {
  /** Uploaded portrait URL from SiteSettings — null shows a placeholder. */
  portraitUrl?: string | null;
}

/**
 * Scroll-driven About storytelling section.
 *
 * Desktop: portrait sticks on the left while chapters scroll on the right.
 *   – IntersectionObserver selects the chapter with the highest visibility ratio.
 *   – Portrait crop and scale shift subtly per chapter.
 *   – Chapter counter updates in the portrait column.
 *
 * Mobile: linear stack, no sticky behaviour, all chapters fully opaque.
 * Reduced-motion: all transitions disabled, chapters remain fully opaque.
 */
export function AboutStorySection({ portraitUrl }: Props) {
  const {
    activeIndex,
    activeChapter,
    formattedActiveChapter,
    formattedTotalChapters,
    setActiveChapter,
  } = useAboutStory(aboutChapters);

  /* refs to each chapter <article> for the IntersectionObserver */
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    /* Map of chapterIndex → current intersectionRatio */
    const ratioMap = new Map<number, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(
            (entry.target as HTMLElement).dataset.chapterIndex,
          );
          if (entry.isIntersecting) {
            ratioMap.set(idx, entry.intersectionRatio);
          } else {
            ratioMap.delete(idx);
          }
        });

        /* Pick the chapter with the highest intersection ratio */
        if (ratioMap.size > 0) {
          let best = 0;
          let bestRatio = -1;
          ratioMap.forEach((ratio, idx) => {
            if (ratio > bestRatio) {
              bestRatio = ratio;
              best = idx;
            }
          });
          setActiveChapter(best);
        }
      },
      {
        root: null,
        rootMargin: "-30% 0px -30% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    chapterRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [setActiveChapter]);

  return (
    <section
      id="about"
      className="about-story pt-20"
      aria-label="About"
    >
      <div className="about-story__container">

        {/* ── Two-column layout ───────────────────────────────────────── */}
        <div className="about-story__layout">

          {/* Portrait column — sticky on desktop */}
          <aside
            className="about-story__visual"
            aria-label="About Zaira Mundo"
          >
            <Reveal className="about-story__portrait-wrap">
              <AboutPortrait
                state={activeChapter.portraitState}
                portraitUrl={portraitUrl}
              />
            </Reveal>

          </aside>

          {/* Chapter scroll column */}
          <div className="about-story__chapters">
            {aboutChapters.map((chapter, i) => (
              <AboutChapter
                key={chapter.id}
                chapter={chapter}
                index={i}
                isActive={i === activeIndex}
                ref={(el) => {
                  chapterRefs.current[i] = el;
                }}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
