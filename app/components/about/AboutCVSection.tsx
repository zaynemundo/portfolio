"use client";

import { useRef, useEffect } from "react";
import { Reveal } from "@/app/components/Reveal";
import { AboutPortrait } from "./AboutPortrait";
import { AboutCVChapter } from "./AboutCVChapter";
import { useAboutCVStory } from "@/app/hooks/useAboutCVStory";
import { aboutCVChapters } from "@/app/data/aboutCVChapters";
import type { ExpEntry } from "./ExperienceTimeline";
import type { SkillItem } from "./ToolsGroups";

interface Props {
  portraitUrl?: string | null;
  cvPath: string;
  dbExperience: ExpEntry[];
  dbSkills: SkillItem[];
}

/**
 * Scroll-driven About & Experience section — 6 chapters.
 *
 * Desktop: portrait sticks on the left while chapters scroll on the right.
 *   – IntersectionObserver selects the chapter with the highest visibility ratio.
 *   – Portrait crop and scale shift subtly per chapter.
 *   – Chapter counter updates in the portrait column.
 *
 * Mobile: linear stack, no sticky behaviour, all chapters fully opaque.
 * Reduced-motion: all transitions disabled, chapters remain fully opaque.
 */
export function AboutCVSection({
  portraitUrl,
  cvPath,
  dbExperience,
  dbSkills,
}: Props) {
  const {
    activeIndex,
    activeChapter,
    formattedActiveChapter,
    formattedTotalChapters,
    setActiveChapter,
  } = useAboutCVStory(aboutCVChapters);

  const chapterRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
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
      className="about-cv"
      aria-labelledby="about-cv-heading"
    >
      <div className="about-cv__container">

        {/* ── Section header ──────────────────────────────────────────── */}
        <header className="about-cv__header">
          <Reveal delay={60}>
            <h2 id="about-cv-heading" className="about-cv__heading">
              Bridging visual thinking and technical execution across every project.
            </h2>
          </Reveal>

          <Reveal delay={120}>
            <p className="about-cv__summary">
              A curated overview of my background, capabilities, and
              professional experience.
            </p>
          </Reveal>
        </header>

        {/* ── Two-column layout ───────────────────────────────────────── */}
        <div className="about-cv__layout">

          {/* Portrait column — sticky on desktop */}
          <aside
            className="about-cv__visual"
            aria-label="About Zaira Mundo"
          >
            <Reveal className="about-cv__portrait-wrap">
              <AboutPortrait
                state={activeChapter.portraitState}
                portraitUrl={portraitUrl}
              />
            </Reveal>

          </aside>

          {/* Chapter scroll column */}
          <div className="about-cv__chapters">
            {aboutCVChapters.map((chapter, i) => (
              <AboutCVChapter
                key={chapter.id}
                chapter={chapter}
                index={i}
                isActive={i === activeIndex}
                dbExperience={dbExperience}
                dbSkills={dbSkills}
                cvPath={cvPath}
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
