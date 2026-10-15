"use client";

import { useRef, useEffect, useState, useCallback, useSyncExternalStore } from "react";
import { useScrollProgress } from "./useScrollProgress";
import { useReducedMotion } from "./useReducedMotion";
import { FloatingPetals } from "./FloatingPetals";
import { optimizedImage } from "@/app/lib/image-src";

/* ── Types ────────────────────────────────────────────────────────────────── */

export interface HeroScene {
  eyebrow?: string;
  heading: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  start: number;
  end: number;
}

interface Props {
  videoSrc: string;
  posterSrc?: string;
  scenes: HeroScene[];
}

/* ── Breakpoint hook ──────────────────────────────────────────────────────── */

const DESKTOP_MQ = "(min-width: 768px)";
function subDesktop(cb: () => void) {
  const mq = window.matchMedia(DESKTOP_MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const snapDesktop = () => window.matchMedia(DESKTOP_MQ).matches;
/* False on the server so the page HTML never carries the <video>: phones
   (which never play it) don't download it, and desktops fetch it after the
   page is up, behind the poster. */
const serverDesktop = () => false;

/* ── Lerp ─────────────────────────────────────────────────────────────────── */

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/* ── Component ────────────────────────────────────────────────────────────── */

export function ScrollVideoHero({ videoSrc, posterSrc, scenes }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const reducedMotion = useReducedMotion();
  const isDesktop = useSyncExternalStore(subDesktop, snapDesktop, serverDesktop);

  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);

  /* Whether the <video>/<canvas> pair is mounted at all */
  const showVideo = isDesktop && !reducedMotion && !videoError;

  /* ── Video scrub state ─────────────────────────────────────────────────── */
  const videoTargetRef = useRef(0);
  const videoCurrentRef = useRef(0);
  const seekingRef = useRef(false);
  const lerpRafRef = useRef<number | null>(null);

  /* ── Canvas-based video rendering ──────────────────────────────────────── *
   * Instead of displaying the <video> element directly (which blanks        *
   * between seeks), we draw each decoded frame to a <canvas>. The canvas    *
   * holds the last good frame until a new one is ready — zero flicker.      */
  useEffect(() => {
    if (!videoReady || !isDesktop || reducedMotion || videoError) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;

    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;

    /* Draw current video frame to canvas, cover-style (canvas has no
       object-fit — the backing store must match the stage or the frame
       stretches). */
    const paint = () => {
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / vw, ch / vh);
      const dw = vw * scale;
      const dh = vh * scale;
      ctx.drawImage(video, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    /* Size the backing store to the displayed box */
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      paint();
    };
    resize();
    window.addEventListener("resize", resize);

    /* A seek is in flight until "seeked" lands. The flag lives in a ref
       shared across effect runs, so it must be cleared on entry and on
       cleanup — a "seeked" that fires while the listener is detached
       would otherwise wedge it true and block every later seek. */
    seekingRef.current = false;
    videoCurrentRef.current = video.currentTime;
    let seekIssuedAt = 0;

    const onSeeked = () => {
      paint();
      seekingRef.current = false;
    };
    video.addEventListener("seeked", onSeeked);

    /* Force paint of the first frame — seek to a tiny offset to trigger
       the seeked event, which will drawImage the decoded frame. */
    seekingRef.current = true;
    seekIssuedAt = performance.now();
    video.currentTime = 0.001;

    /* Lerp loop — sets video.currentTime, canvas paints on "seeked" */
    const tick = () => {
      if (!running) return;

      const target = videoTargetRef.current;
      const current = videoCurrentRef.current;
      const delta = Math.abs(target - current);

      /* Adaptive lerp */
      const factor = delta > 2 ? 0.2 : delta > 0.8 ? 0.15 : delta > 0.2 ? 0.12 : 0.1;
      const next = delta < 0.002 ? target : lerp(current, target, factor);
      videoCurrentRef.current = next;

      /* Watchdog — a "seeked" can be lost (coalesced seek, detached
         listener, backgrounded tab). Never stay gated forever. */
      if (seekingRef.current && performance.now() - seekIssuedAt > 250) {
        seekingRef.current = false;
      }

      /* Only issue a new seek when the previous one completed */
      if (!seekingRef.current && Math.abs(video.currentTime - next) > 0.01) {
        seekingRef.current = true;
        seekIssuedAt = performance.now();
        video.currentTime = next;
      }

      lerpRafRef.current = requestAnimationFrame(tick);
    };

    lerpRafRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      seekingRef.current = false;
      video.removeEventListener("seeked", onSeeked);
      window.removeEventListener("resize", resize);
      if (lerpRafRef.current !== null) cancelAnimationFrame(lerpRafRef.current);
    };
  }, [videoReady, isDesktop, reducedMotion, videoError]);

  /* ── Scroll-progress callback ─────────────────────────────────────────── */
  const applyProgress = useCallback(
    (p: number) => {
      progressRef.current = p;

      /* Set video target time — the lerp loop chases it */
      const video = videoRef.current;
      if (video && videoReady && isDesktop && !reducedMotion) {
        const vp = Math.min(p / 0.82, 1);
        videoTargetRef.current = vp * video.duration;
      }

      /* (stage stays fully visible — no exit fade) */

      /* Text scenes — each fades in/out within its range.
         Scene 0 starts fully visible (no fade-in at p=0).
         Last scene stays visible after its range (no fade-out). */
      const sceneEls = containerRef.current?.querySelectorAll<HTMLElement>("[data-scene]");
      if (!sceneEls) return;
      const lastIdx = sceneEls.length - 1;

      sceneEls.forEach((el, i) => {
        const start = Number(el.dataset.start);
        const end = Number(el.dataset.end);
        const fade = 0.06;

        let opacity: number;
        let ty: number;

        if (reducedMotion && i === 0) {
          opacity = 1;
          ty = 0;
        } else if (p >= start && p <= end) {
          /* Scene 0: skip fade-in (already visible at top) */
          if (i !== 0 && p < start + fade) {
            const t = (p - start) / fade;
            opacity = t;
            ty = 24 * (1 - t);
          /* Last scene: skip fade-out (stays visible at bottom) */
          } else if (i !== lastIdx && p > end - fade) {
            const t = (end - p) / fade;
            opacity = t;
            ty = -16 * (1 - t);
          } else {
            opacity = 1;
            ty = 0;
          }
        } else if (i === lastIdx && p > end) {
          /* Last scene: remain visible after its range */
          opacity = 1;
          ty = 0;
        } else {
          opacity = 0;
          ty = 24;
        }

        el.style.opacity = String(opacity);
        el.style.transform = `translate3d(0,${ty}px,0)`;
        el.setAttribute("aria-hidden", opacity < 0.01 ? "true" : "false");
      });

      /* Scroll indicator */
      const indicator = containerRef.current?.querySelector<HTMLElement>("[data-scroll-hint]");
      if (indicator) {
        indicator.style.opacity = String(Math.max(0, 1 - p * 12));
      }

      /* Progress bar */
      const bar = containerRef.current?.querySelector<HTMLElement>("[data-progress-bar]");
      if (bar) {
        bar.style.width = `${p * 100}%`;
      }
    },
    [videoReady, isDesktop, reducedMotion],
  );

  useScrollProgress(containerRef, applyProgress);

  /* ── Video init — wait for frame data to be available ─────────────────── */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onReady = () => {
      video.pause();
      setVideoReady(true);
    };
    const onError = () => setVideoError(true);

    /* Already buffered — on a cached load the readiness event fires before
       this effect can attach, so check state rather than only waiting. */
    if (video.readyState >= 2) onReady();

    /* readyState 2 (HAVE_CURRENT_DATA) is enough to decode frames for the
       canvas; canplaythrough is a stricter condition that some browsers
       never reach for a video that is scrubbed but never played. */
    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplaythrough", onReady);
    video.addEventListener("error", onError);
    return () => {
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplaythrough", onReady);
      video.removeEventListener("error", onError);
    };
  }, [showVideo]);

  /* ── Show first scene on mount ──────────────────────────────────────────── */
  useEffect(() => {
    applyProgress(0);
  }, [applyProgress]);

  return (
    <section
      ref={containerRef}
      aria-label="Hero"
      className="relative bg-white"
      style={{ minHeight: reducedMotion ? "100vh" : "420vh" }}
    >
      {/* Sticky viewport stage */}
      <div
        ref={stageRef}
        className="sticky top-0 h-screen overflow-hidden flex items-center justify-center"
        style={{ willChange: reducedMotion ? "auto" : "opacity, transform" }}
      >
        {/* ── Hidden video element (source for canvas) ─────────────────── */}
        {showVideo && (
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            playsInline
            preload="auto"
            className="absolute w-0 h-0 opacity-0 pointer-events-none"
            aria-hidden="true"
          />
        )}

        {/* ── Canvas layer (renders video frames — no flicker) ─────────── */}
        {showVideo && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ filter: "saturate(1.2)" }}
          />
        )}

        {/* ── Poster / mobile fallback ───────────────────────────────────── */}
        {(!showVideo || !videoReady) && (
          <div
            className="absolute inset-0 bg-zinc-950 transition-opacity duration-700"
            style={{ opacity: showVideo && videoReady ? 0 : 1 }}
          >
            {posterSrc ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                {...optimizedImage(posterSrc)}
                fetchPriority="high"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: "saturate(1.2)" }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
            )}
          </div>
        )}

        {/* ── Floating petals ──────────────────────────────────────────── */}
        <FloatingPetals />

        {/* ── Text scenes ────────────────────────────────────────────────── */}
        {/* The scenes are absolutely placed, which ignores padding, so each one carries the side padding itself. */}
        <div className="relative z-10 max-w-(--site-max) mx-auto w-full h-full">
          {scenes.map((scene, i) => (
            <div
              key={i}
              data-scene=""
              data-start={scene.start}
              data-end={scene.end}
              className="absolute inset-0 flex items-center px-6 md:px-10"
              style={{
                opacity: i === 0 ? 1 : 0,
                willChange: reducedMotion ? "auto" : "opacity, transform",
                pointerEvents: "none",
                /* Base scene sits behind overlay scenes */
                zIndex: i === 0 ? 0 : 1,
              }}
            >
              <div className="max-w-2xl" style={{ pointerEvents: "auto" }}>
                {scene.eyebrow && (
                  <p
                    className="text-[12px] md:text-[13px] font-semibold tracking-[0.2em] uppercase text-white/70 mb-5"
                    style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6), 0 0px 4px rgba(0,0,0,0.4)" }}
                  >
                    {scene.eyebrow}
                  </p>
                )}
                <h2
                  className="font-extrabold text-white leading-[0.92] mb-6"
                  style={{
                    fontSize: "clamp(2.75rem, 9vw, 5rem)",
                    letterSpacing: "-0.04em",
                    textShadow: "0 4px 30px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)",
                  }}
                >
                  {scene.heading}
                </h2>
                {scene.description && (
                  <p
                    className="text-white/80 leading-relaxed max-w-lg mb-8"
                    style={{
                      fontSize: "clamp(1rem, 0.9rem + 0.35vw, 1.1875rem)",
                      textShadow: "0 2px 16px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.4)",
                    }}
                  >
                    {scene.description}
                  </p>
                )}
                {scene.ctaLabel && scene.ctaHref && (
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={scene.ctaHref}
                      onClick={(e) => {
                        /* Same-page anchor — scroll without stamping #hash into the URL */
                        if (scene.ctaHref?.startsWith("#")) {
                          const el = document.getElementById(scene.ctaHref.slice(1));
                          if (el) {
                            e.preventDefault();
                            el.scrollIntoView({ behavior: "smooth" });
                          }
                        }
                      }}
                      className="inline-flex items-center px-6 py-3 rounded-full bg-white text-zinc-900 text-[14.5px] font-semibold hover:bg-[#8B5CF6] hover:text-white transition-colors duration-200"
                      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.25)" }}
                    >
                      {scene.ctaLabel}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Scroll hint ────────────────────────────────────────────────── */}
        {!reducedMotion && (
          <div
            data-scroll-hint=""
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
          >
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/30">
              Scroll
            </span>
            <div className="w-[1px] h-7 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent animate-[scrollPulse_2s_ease-in-out_infinite]" />
            </div>
          </div>
        )}

        {/* ── Progress bar ───────────────────────────────────────────────── */}
        {!reducedMotion && (
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/[0.08] z-10">
            <div
              data-progress-bar=""
              className="h-full bg-white/25"
              style={{ width: 0, transition: "none" }}
            />
          </div>
        )}
      </div>

      {/* ── Bottom fade to white ──────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none z-10"
        style={{
          background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 40%, rgba(255,255,255,0.85) 75%, #ffffff 100%)",
        }}
      />
    </section>
  );
}
