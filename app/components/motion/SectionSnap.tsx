"use client";

import { useEffect } from "react";
import { useReducedMotion } from "./useReducedMotion";

/** How long one glide from stop to stop takes. */
const GLIDE_MS = 900;
/**
 * After a glide, wheel events in the same direction are taken as the trackpad's
 * leftover momentum until the wheel rests this long, or a clearly new swipe
 * starts. Scrolling the other way always goes through at once.
 */
const QUIET_MS = 220;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Hero paging: inside the homepage hero, one scroll down (wheel, trackpad
 * swipe, arrow / Page / space key) glides smoothly to the next scene of the
 * video (see ScrollVideoHero), one scroll up to the previous one. The last
 * step leaves the hero for the section below. Everywhere else the page
 * scrolls normally. Touch screens scroll normally; off for reduced motion.
 */
export function SectionSnap() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    let gliding = false;
    let resting = false;
    let glideDir: 1 | -1 = 1;
    let glideId = 0;
    let lastWheel = 0;
    let lastDelta = 0;

    /** Each scene of the hero, then the hero's end (where the next section starts). */
    function stops(): number[] {
      const hero = document.querySelector<HTMLElement>('section[aria-label="Hero"]');
      if (!hero) return [];
      const top = hero.getBoundingClientRect().top + window.scrollY;
      const out: number[] = [];
      const scrollable = hero.offsetHeight - window.innerHeight;
      hero.querySelectorAll<HTMLElement>("[data-scene]").forEach((scene, i) => {
        // The first scene shows at the very top; the others are fully in view mid-range.
        const p = i === 0 ? 0 : (Number(scene.dataset.start) + Number(scene.dataset.end)) / 2;
        out.push(Math.round(top + p * scrollable));
      });
      out.push(Math.round(top + hero.offsetHeight));
      return out.sort((a, b) => a - b);
    }

    /** The stop one step away in `direction`, or null when scrolling should stay free. */
    function target(direction: 1 | -1): number | null {
      const y = window.scrollY;
      const all = stops();
      // Below the hero the page scrolls freely, even scrolling back up to it.
      if (!all.length || y > all[all.length - 1] + 2) return null;
      const next = direction > 0 ? all.find((s) => s > y + 2) : [...all].reverse().find((s) => s < y - 2);
      if (next === undefined || Math.abs(next - y) > window.innerHeight * 1.05) return null;
      return next;
    }

    function glide(to: number) {
      const id = ++glideId;
      gliding = true;
      resting = false;
      const from = window.scrollY;
      glideDir = to > from ? 1 : -1;
      const start = performance.now();
      const step = (now: number) => {
        if (id !== glideId) return; // replaced by a glide the other way
        const t = Math.min((now - start) / GLIDE_MS, 1);
        window.scrollTo({ top: from + (to - from) * easeInOutCubic(t), behavior: "instant" });
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          gliding = false;
          resting = true;
        }
      };
      requestAnimationFrame(step);
    }

    function onWheel(e: WheelEvent) {
      if (e.ctrlKey) return; // pinch zoom
      const now = performance.now();
      const sinceLast = now - lastWheel;
      const size = Math.abs(e.deltaY);
      const growing = size > lastDelta + 15; // momentum only ever fades; a jump means a new swipe
      lastWheel = now;
      lastDelta = size;
      if (size < 4) return;
      const direction: 1 | -1 = e.deltaY > 0 ? 1 : -1;
      if ((gliding || resting) && direction === glideDir) {
        if (gliding || (sinceLast < QUIET_MS && !growing)) return e.preventDefault();
      }
      resting = false;
      const to = target(direction);
      if (to === null) {
        // Free scrolling here: stop any glide so it doesn't fight the wheel.
        glideId++;
        gliding = false;
        return;
      }
      e.preventDefault();
      glide(to);
    }

    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      if (el?.closest("input, textarea, select, [contenteditable]") || e.altKey || e.ctrlKey || e.metaKey) return;
      const down = e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey);
      const up = e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey);
      if (!down && !up) return;
      if (gliding && (down ? 1 : -1) === glideDir) return e.preventDefault();
      const to = target(down ? 1 : -1);
      if (to === null) return;
      e.preventDefault();
      glide(to);
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [reducedMotion]);

  return null;
}
