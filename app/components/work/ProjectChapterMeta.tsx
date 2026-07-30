import Link from "next/link";
import type { Project } from "@/app/lib/projects";

type MetaProject = Pick<
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
  liveUrl?: string | null;
  client?: string;
};

interface Props {
  project: MetaProject;
  num: string;
  layout: string;
  progress: number;
  reducedMotion: boolean;
  /**
   * Which section to render:
   * - "all": full stacked layout (split)
   * - "header": number + tag + title only (above image)
   * - "footer": role + desc + tech + CTA (below image)
   */
  section?: "all" | "header" | "footer";
}

/**
 * Typography and metadata for a single project chapter.
 *
 * Supports split rendering: header above image, footer below image.
 * All values are scrubbed by scroll progress.
 */
export function ProjectChapterMeta({
  project,
  num,
  layout,
  progress,
  reducedMotion,
  section = "all",
}: Props) {
  const {
    slug,
    name,
    tagline,
    category,
    year,
    role,
    workType,
    technologies,
    liveUrl,
  } = project;

  const ease = (t: number) => 1 - (1 - t) * (1 - t);
  const r = reducedMotion;
  const wc = r ? "auto" : "transform, opacity";

  /* ── Progress mapping ──────────────────────────────────────
   * 0–0.2     entering viewport
   * 0.2–0.85  sticky scrub
   * 0.85–1.0  exit recession
   * ───────────────────────────────────────────────────────── */
  const numP = ease(Math.min(progress / 0.18, 1));
  const tagP = ease(Math.min(Math.max(0, (progress - 0.06) / 0.18), 1));
  const titleP = ease(Math.min(Math.max(0, (progress - 0.12) / 0.28), 1));
  const roleP = ease(Math.min(Math.max(0, (progress - 0.45) / 0.2), 1));
  const descP = ease(Math.min(Math.max(0, (progress - 0.5) / 0.2), 1));
  const techP = ease(Math.min(Math.max(0, (progress - 0.58) / 0.17), 1));
  const ctaP = ease(Math.min(Math.max(0, (progress - 0.62) / 0.18), 1));

  const exitP = Math.max(0, (progress - 0.85) / 0.15);
  const exitO = 1 - exitP * 0.3;

  /* ── Split lateral motion ────────────────────────────────── */
  const splitP = ease(Math.min(Math.max(0, (progress - 0.05) / 0.35), 1));
  const splitX = r || layout !== "split" ? 0 : -40 * (1 - splitP);

  const showHeader = section === "all" || section === "header";
  const showFooter = section === "all" || section === "footer";

  // In "all" mode (split), number is large; in "header" mode, number is compact
  const isCompactNum = section === "header";

  return (
    <div
      className={`project-chapter-meta ${section !== "all" ? `project-chapter-meta--${section}` : ""}`}
      style={{
        transform: layout === "split" ? `translateX(${splitX}px)` : undefined,
        willChange: layout === "split" ? wc : undefined,
      }}
    >
      {showHeader && (
        <>
          {/* Number */}
          <span
            className={`project-chapter-meta__num ${isCompactNum ? "project-chapter-meta__num--compact" : ""}`}
            style={{
              opacity: r ? (isCompactNum ? 0.35 : 0.1) : (isCompactNum ? 0.15 + 0.25 * numP : 0.04 + 0.08 * numP),
              transform: r ? "none" : `translateY(${(isCompactNum ? 20 : 35) * (1 - numP)}px)`,
              willChange: wc,
            }}
            aria-hidden="true"
          >
            {num}
          </span>

          {/* Tag */}
          <div
            className="project-chapter-meta__tag"
            style={{
              opacity: r ? 1 : tagP * exitO,
              transform: r ? "none" : `translateY(${16 * (1 - tagP)}px)`,
              willChange: wc,
            }}
          >
            <span className="project-chapter-meta__tag-rule" aria-hidden="true" />
            <span>{category}</span>
            <span className="project-chapter-meta__dot" aria-hidden="true">·</span>
            <span>{year}</span>
            {workType && (
              <>
                <span className="project-chapter-meta__dot" aria-hidden="true">·</span>
                <span>{workType}</span>
              </>
            )}
          </div>

          {/* Title mask reveal */}
          <div className="project-chapter-meta__title-mask">
            <h3
              className="project-chapter-meta__title"
              style={{
                opacity: r ? 1 : titleP * exitO,
                transform: r ? "none" : `translateY(${110 * (1 - titleP)}%)`,
                willChange: wc,
              }}
            >
              <Link href={`/work/${slug}`} className="project-chapter-meta__title-link">
                {name}
              </Link>
            </h3>
          </div>
        </>
      )}

      {showFooter && (
        <>
          {/* Role */}
          {role && (
            <p
              className="project-chapter-meta__role"
              style={{
                opacity: r ? 1 : roleP * exitO,
                transform: r ? "none" : `translateY(${12 * (1 - roleP)}px)`,
                willChange: wc,
              }}
            >
              {role}
            </p>
          )}

          {/* Tagline */}
          <p
            className="project-chapter-meta__desc"
            style={{
              opacity: r ? 1 : descP * exitO,
              transform: r ? "none" : `translateY(${12 * (1 - descP)}px)`,
              willChange: wc,
            }}
          >
            {tagline}
          </p>

          {/* Bottom bar: tech + CTA side by side */}
          <div
            className="project-chapter-meta__bottom"
            style={{
              opacity: r ? 1 : Math.min(techP, ctaP) * exitO,
              willChange: wc,
            }}
          >
            {/* Tech tags */}
            {technologies && technologies.length > 0 && (
              <div className="project-chapter-meta__tech">
                {technologies.slice(0, 5).map((t) => (
                  <span key={t} className="project-chapter-meta__tech-tag">{t}</span>
                ))}
                {technologies.length > 5 && (
                  <span className="project-chapter-meta__tech-tag project-chapter-meta__tech-tag--more">
                    +{technologies.length - 5}
                  </span>
                )}
              </div>
            )}

            {/* CTA */}
            <div className="project-chapter-meta__cta">
              <Link href={`/work/${slug}`} className="project-chapter-meta__cta-link">
                View case study
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="project-chapter-meta__cta-arrow">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              {liveUrl && (
                <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="project-chapter-meta__cta-external">
                  Visit site
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 12L12 2M12 2H5M12 2v7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
