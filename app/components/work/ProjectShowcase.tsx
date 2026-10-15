"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useReducedMotion } from "@/app/components/motion/useReducedMotion";
import {
  setActiveProject,
  setTotal,
  setOverProjects,
} from "@/app/hooks/useActiveProject";
import type { ProjectCard } from "@/app/lib/projects";
import { optimizedImage, optimizedSrc } from "@/app/lib/image-src";

interface Props {
  projects: ProjectCard[];
}

/**
 * Full-screen sticky showcase — one project at a time.
 *
 * Scroll drives crossfade transitions between projects.
 * Each project gets 100vh of scroll distance.
 * The sticky frame pins the viewport while content transitions.
 *
 * Videos play only while their project is active; all others are paused.
 * Active project index is communicated to the global nav via useActiveProject.
 */
export function ProjectShowcase({ projects }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const reduced = useReducedMotion();
  const [totalProgress, setTotalProgress] = useState(0);

  const n = projects.length;
  const centerPoint = totalProgress * n;
  const activeIndex = Math.min(Math.floor(centerPoint), n - 1);

  /* ── Report total to nav ─────────────────────────────────────────── */
  useEffect(() => {
    setTotal(n);
    return () => setTotal(0);
  }, [n]); // setTotal is a stable module-level function

  /* ── Report active index to nav ──────────────────────────────────── */
  useEffect(() => {
    setActiveProject(activeIndex);
  }, [activeIndex]); // setActiveProject is stable

  /* ── Report section visibility to nav ───────────────────────────── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOverProjects(entry.isIntersecting),
      { threshold: 0.01 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []); // setOverProjects is stable; containerRef never changes

  /* ── Scroll progress ─────────────────────────────────────────────── */
  useEffect(() => {
    if (n === 0) return;
    let raf: number | null = null;

    const compute = () => {
      raf = null;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = Math.max(el.offsetHeight - window.innerHeight, 1);
      const p = Math.min(Math.max(-rect.top / scrollable, 0), 1);
      setTotalProgress(p);
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
  }, [n]);

  /* ── Video play / pause ──────────────────────────────────────────── */
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (reduced) {
        // Reduced motion: never autoplay
        video.pause();
        return;
      }
      if (i === activeIndex) {
        if (video.paused) {
          // readyState 0 (HAVE_NOTHING) means the browser never actually
          // started fetching — an explicit load() kicks it off. play()
          // alone doesn't reliably trigger this in every browser.
          if (video.readyState === 0) video.load();
          video.play().catch(() => {
            /* autoplay may be blocked — poster remains visible */
          });
        }
      } else {
        if (!video.paused) video.pause();
      }
    });
  }, [activeIndex, reduced]);

  /* ── Reduced motion: simple stacked list ────────────────────────── */
  if (reduced) {
    return (
      <div className="showcase showcase--reduced" aria-live="off">
        {projects.map((p) => (
          <article key={p.slug} className="showcase__card-reduced">
            <div className="showcase__card-media-reduced">
              {(p.poster ?? p.images?.[0]) ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  {...optimizedImage(p.poster ?? p.images![0])}
                  alt={p.imageAlt ?? p.name}
                  className="showcase__card-img"
                  loading="lazy"
                />
              ) : (
                <div className="showcase__card-placeholder" aria-hidden="true">
                  <span>{p.name.slice(0, 2).toUpperCase()}</span>
                </div>
              )}
            </div>
            <div className="showcase__card-info-reduced">
              <div>
                <span className="showcase__card-category">
                  {p.category}
                  <span className="showcase__card-dot" aria-hidden="true">·</span>
                  {p.year}
                </span>
                <h3 className="showcase__card-title">
                  <Link href={`/work/${p.slug}`}>{p.name}</Link>
                </h3>
                {p.role && <p className="showcase__card-role">{p.role}</p>}
              </div>
              <Link href={`/work/${p.slug}`} className="showcase__card-cta">
                View project
                <ArrowIcon />
              </Link>
            </div>
          </article>
        ))}
      </div>
    );
  }

  /* ── Full crossfade showcase ─────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      className="showcase"
      style={{ height: `${(n + 0.5) * 100}vh` }}
    >
      <div className="showcase__sticky">
        {/* ── Cards viewport ─────────────────────────────────────── */}
        <div className="showcase__viewport">
          {projects.map((p, i) => {
            const t = centerPoint - i;

            // Tight crossfade to prevent overlapping double-exposures between adjacent projects
            let opacity: number;
            if (t < -0.05) opacity = 0;
            else if (t < 0.05) opacity = (t + 0.05) / 0.1;
            else if (t < 0.95) opacity = 1;
            else if (t < 1.05) opacity = (1.05 - t) / 0.1;
            else opacity = 0;

            // Scale: settle from 1.04 → 1.0 as project enters
            const scaleRaw = t < 0 ? 1.04 : t < 0.5 ? 1.04 - 0.04 * (t / 0.5) : 1;
            const scale = Math.max(scaleRaw, 1);

            const isVisible = opacity > 0.01;
            const isCurrent = i === activeIndex;
            // Fall back to the placeholder reel when no project-specific video is set
            const videoMp4 = p.videoMp4 ?? "/hero-banner-1.mp4";
            const videoWebm = p.videoWebm;

            return (
              <div
                key={p.slug}
                className="showcase__card"
                style={{
                  opacity: isCurrent ? 1 : opacity,
                  visibility: isVisible ? "visible" : "hidden",
                  pointerEvents: isCurrent ? "all" : "none",
                }}
                role="group"
                aria-label={`Project ${i + 1} of ${n}: ${p.name}`}
                aria-hidden={!isCurrent}
              >
                {/* ── Media ───────────────────────────────────────── */}
                <div
                  className="showcase__card-media"
                  style={{
                    transform: `scale(${scale})`,
                    willChange: isVisible ? "transform" : "auto",
                  }}
                >
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el;
                    }}
                    className="showcase__card-video"
                    muted
                    loop
                    playsInline
                    preload="none"
                    poster={optimizedSrc(p.poster ?? p.images?.[0])}
                    aria-label={`${p.name} project preview`}
                  >
                    {videoWebm && (
                      <source src={videoWebm} type="video/webm" />
                    )}
                    <source src={videoMp4} type="video/mp4" />
                  </video>

                  {/* Gradient overlay — ensures text readability over media */}
                  <div className="showcase__card-gradient" aria-hidden="true" />
                </div>

                {/* ── Info bar ────────────────────────────────────── */}
                <div
                  className="showcase__card-info"
                  style={{
                    opacity: isCurrent ? 1 : 0,
                    transition: "opacity 0.2s ease-out",
                  }}
                >
                  <div className="showcase__card-info-left">
                    <span className="showcase__card-num" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="showcase__card-category">
                      {p.category}
                      <span className="showcase__card-dot" aria-hidden="true">·</span>
                      {p.year}
                    </span>
                    <h3 className="showcase__card-title">
                      <Link
                        href={`/work/${p.slug}`}
                        tabIndex={isCurrent ? 0 : -1}
                      >
                        {p.name}
                      </Link>
                    </h3>
                    {p.role && (
                      <p className="showcase__card-role">{p.role}</p>
                    )}
                  </div>

                  <div className="showcase__card-info-right">
                    <Link
                      href={`/work/${p.slug}`}
                      className="showcase__card-cta"
                      tabIndex={isCurrent ? 0 : -1}
                    >
                      View project
                      <ArrowIcon />
                    </Link>
                    {p.liveUrl && (
                      <a
                        href={p.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="showcase__card-ext"
                        tabIndex={isCurrent ? 0 : -1}
                      >
                        Visit site
                        <ExternalIcon />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Progress bar ───────────────────────────────────────── */}
        <div className="showcase__progress-track" role="presentation">
          <div
            className="showcase__progress-fill"
            style={{ width: `${totalProgress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Icons ────────────────────────────────────────────────────────────────── */

function ArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 7h10M8 3l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 12L12 2M12 2H5M12 2v7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
