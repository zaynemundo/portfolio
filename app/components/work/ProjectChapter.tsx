"use client";

import { useRef, useState, useEffect } from "react";
import type { Project } from "@/app/lib/projects";
import { useReducedMotion } from "@/app/components/motion/useReducedMotion";
import { ProjectChapterMedia } from "./ProjectChapterMedia";
import { ProjectChapterMeta } from "./ProjectChapterMeta";

/* ── Types ─────────────────────────────────────────────────────────── */

export type ProjectCard = Pick<
  Project,
  | "slug"
  | "name"
  | "tagline"
  | "category"
  | "year"
  | "technologies"
  | "role"
  | "workType"
> & {
  images?: string[];
  imageAlt?: string;
  liveUrl?: string | null;
  theme?: Project["theme"];
  logo?: Project["logo"];
  client?: string;
  /** Highlight video — WebM source (preferred) */
  videoWebm?: string;
  /** Highlight video — MP4 source (fallback) */
  videoMp4?: string;
  /** Poster frame shown before / instead of video */
  poster?: string;
};

type LayoutVariant = "framed" | "split" | "layered";

interface Props {
  project: ProjectCard;
  index: number;
  total: number;
}

function getLayoutVariant(project: ProjectCard, index: number): LayoutVariant {
  if (project.images && project.images.length >= 2 && index % 3 === 2) {
    return "layered";
  }
  return index % 2 === 0 ? "framed" : "split";
}

const BG_TONES = [
  { bg: "#fafafa", dark: false },
  { bg: "#f8f7f4", dark: false },
  { bg: "#f4f4f5", dark: false },
  { bg: "#f0f1f3", dark: false },
];

/* ── Component ─────────────────────────────────────────────────────── */

export function ProjectChapter({ project, index }: Props) {
  const containerRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const layout = getLayoutVariant(project, index);
  const num = String(index + 1).padStart(2, "0");
  const theme = project.theme ?? BG_TONES[index % BG_TONES.length];

  return (
    <article
      ref={containerRef}
      className={`project-chapter project-chapter--${layout}`}
      style={{
        ["--chapter-bg" as string]: theme.bg,
        ["--chapter-dark" as string]: theme.dark ? "1" : "0",
      }}
      aria-label={`Project: ${project.name}`}
    >
      <div className="project-chapter__sticky">
        <div className="project-chapter__inner">
          <ProjectChapterClient
            project={project}
            layout={layout}
            num={num}
            containerRef={containerRef}
            reduced={reduced}
          />
        </div>
      </div>
    </article>
  );
}

/* ── Client child — scroll-driven progress ─────────────────────────── */

function ProjectChapterClient({
  project,
  layout,
  num,
  containerRef,
  reduced,
}: {
  project: ProjectCard;
  layout: LayoutVariant;
  num: string;
  containerRef: React.RefObject<HTMLElement | null>;
  reduced: boolean;
}) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (reduced) return;

    let raf: number | null = null;

    const compute = () => {
      raf = null;
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrollable = Math.max(el.offsetHeight - vh, 1);

      let p: number;
      if (rect.top >= vh) {
        p = 0;
      } else if (rect.top > 0) {
        // Entering viewport: 0 → 0.2
        p = (1 - rect.top / vh) * 0.2;
      } else {
        // Sticky phase: 0.2 → 1.0
        const stickyP = Math.min(-rect.top / scrollable, 1);
        p = 0.2 + stickyP * 0.8;
      }

      setScrollProgress(Math.min(Math.max(p, 0), 1));
    };

    const onScroll = () => {
      if (raf !== null) return;
      raf = requestAnimationFrame(compute);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    compute();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [containerRef, reduced]);

  const progress = reduced ? 1 : scrollProgress;

  const mediaProps = {
    images: project.images ?? [],
    imageAlt: project.imageAlt ?? project.name,
    projectName: project.name,
    layout,
    progress,
  };

  const metaProps = {
    project,
    num,
    layout,
    progress,
    reducedMotion: reduced,
  };

  /* ── Split layout: full meta + image side by side ────────── */
  if (layout === "split") {
    return (
      <>
        <ProjectChapterMeta {...metaProps} section="all" />
        <ProjectChapterMedia {...mediaProps} />
      </>
    );
  }

  /* ── Framed / Layered: header → image → footer ──────────── */
  return (
    <>
      <ProjectChapterMeta {...metaProps} section="header" />
      <ProjectChapterMedia {...mediaProps} />
      <ProjectChapterMeta {...metaProps} section="footer" />
    </>
  );
}
