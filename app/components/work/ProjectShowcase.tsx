"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useReducedMotion } from "@/app/components/motion/useReducedMotion";
import {
  setActiveProject,
  setTotal,
  setOverProjects,
} from "@/app/hooks/useActiveProject";
import type { ProjectCard } from "./ProjectChapter";

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
function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

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

  /* ── Snap to nearest project when scrolling stops ───────────────────
   *
   * After 600 ms of idle scroll, check if centerPoint has a fractional
   * part (we're mid-crossfade between two projects). If so:
   *   – fraction ≥ 0.5 → snap forward to the next project
   *   – fraction < 0.5 → snap back to the current project
   *
   * The isAutoScrolling guard stops the smooth-scroll from re-triggering
   * the idle timer (smooth-scroll fires its own scroll events).
   * Disabled under prefers-reduced-motion.
   *
   * ────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (reduced || n === 0) return;

    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let isAutoScrolling = false;

    const snapToNearest = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const scrollable = Math.max(el.offsetHeight - window.innerHeight, 1);
      const p = Math.min(Math.max(-rect.top / scrollable, 0), 1);

      /* Not inside the active scroll zone of the showcase */
      if (p <= 0 || p >= 1) return;

      const centerPt = p * n;

      /* Round to the nearest "i + 0.5" snap point where exactly one
       * project is fully visible (opacity = 1, zero crossfade overlap).
       * Threshold sits at integer centerPt values — the 50/50 mid-cross-
       * fade point — so the snap commits to the next project the moment
       * the user crosses it. */
      const snappedIndex = Math.max(0, Math.min(n - 1, Math.round(centerPt - 0.5)));
      const targetCenterPt = snappedIndex + 0.5;

      /* Already at (or within 2% of) the correct snap point — do nothing */
      if (Math.abs(centerPt - targetCenterPt) < 0.02) return;

      const targetP = targetCenterPt / n;
      /* Document-relative top of the showcase container */
      const containerDocTop = rect.top + window.scrollY;
      const targetScrollY = containerDocTop + targetP * scrollable;

      isAutoScrolling = true;
      window.scrollTo({ top: targetScrollY, behavior: "smooth" });

      /* Release the guard after the smooth scroll finishes (~700 ms) */
      setTimeout(() => {
        isAutoScrolling = false;
      }, 700);
    };

    const onScroll = () => {
      /* Ignore scroll events fired by our own smooth scroll */
      if (isAutoScrolling) return;
      if (idleTimer !== null) clearTimeout(idleTimer);
      idleTimer = setTimeout(snapToNearest, 600);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (idleTimer !== null) clearTimeout(idleTimer);
    };
  }, [n, reduced]);

  /* ── Auto-advance through slides on first entry ──────────────────────
   *
   * Once the showcase first scrolls into view (and only the first time —
   * a ref guards against re-triggering if the user scrolls back up into
   * it later), automatically scroll through the remaining projects one
   * at a time. Any real user input (wheel, touch, arrow/space/page keys)
   * cancels it immediately and hands control back permanently.
   *
   * Disabled under prefers-reduced-motion, same as the rest of the
   * component's scroll-driven motion.
   * ────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (reduced || n <= 1) return;

    let cancelled = false;
    let started = false;
    let detachInputListeners: (() => void) | null = null;

    const scrollToIndex = (idx: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = Math.max(el.offsetHeight - window.innerHeight, 1);
      const targetP = (idx + 0.5) / n;
      const containerDocTop = rect.top + window.scrollY;
      const targetScrollY = containerDocTop + targetP * scrollable;
      window.scrollTo({ top: targetScrollY, behavior: "smooth" });
    };

    const DWELL_MS = 2200; // time to "read" each slide before advancing
    const SCROLL_SETTLE_MS = 700; // roughly how long the smooth scroll takes

    const runAutoplay = async () => {
      for (let i = 1; i < n; i++) {
        await sleep(DWELL_MS);
        if (cancelled) return;
        scrollToIndex(i);
        await sleep(SCROLL_SETTLE_MS);
      }
    };

    const cancelAutoplay = () => {
      cancelled = true;
      detachInputListeners?.();
    };

    /* Only listen for cancel-worthy input while autoplay is actually
       running — attaching these for the component's whole lifetime would
       mean the ordinary scrolling a user does just to reach this section
       cancels autoplay before it ever gets a chance to start. */
    const attachInputListeners = () => {
      const onUserInput = () => cancelAutoplay();
      window.addEventListener("wheel", onUserInput, { passive: true });
      window.addEventListener("touchstart", onUserInput, { passive: true });
      window.addEventListener("keydown", onUserInput);
      detachInputListeners = () => {
        window.removeEventListener("wheel", onUserInput);
        window.removeEventListener("touchstart", onUserInput);
        window.removeEventListener("keydown", onUserInput);
      };
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        // Only kick off if we're still at (or very near) the first slide —
        // avoids re-launching autoplay mid-showcase on reload/fast-scroll.
        const rect = entry.boundingClientRect;
        const scrollable = Math.max((containerRef.current?.offsetHeight ?? 0) - window.innerHeight, 1);
        const p = Math.min(Math.max(-rect.top / scrollable, 0), 1);
        if (p * n > 0.5) return;
        started = true;
        attachInputListeners();
        runAutoplay().finally(() => detachInputListeners?.());
      },
      { threshold: 0.01 },
    );
    const el = containerRef.current;
    if (el) observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
      detachInputListeners?.();
    };
  }, [n, reduced]);

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
                  src={p.poster ?? p.images![0]}
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
                    preload="auto"
                    poster={p.poster ?? p.images?.[0]}
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
                        href={`/projects/${p.slug}`}
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
                      href={`/projects/${p.slug}`}
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
