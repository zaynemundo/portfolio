"use client";

import { useEffect } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * How long a glide takes per screen of distance, and its limits: a long step
 * through the video takes longer, so every step moves at the same easy pace.
 */
const GLIDE_MS_PER_SCREEN = 720;
const GLIDE_MIN_MS = 700;
const GLIDE_MAX_MS = 1500;
/**
 * After a glide, wheel events in the same direction are taken as the trackpad's
 * leftover momentum until the wheel rests this long, or a clearly new swipe
 * starts. Scrolling the other way always goes through at once.
 */
const QUIET_MS = 260;
/**
 * Past the last scene there's nothing to skip, so after arriving there the
 * wheel is held only this long (just enough to absorb the flick that got you
 * there), then scrolls the page normally.
 */
const EXIT_HOLD_MS = 350;
/** After a glide lands, how long before a mere rise in scroll strength counts as a new swipe. */
const SETTLE_MS = 300;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Hero paging: inside the homepage hero, one scroll down (wheel, trackpad
 * swipe, arrow / Page / space key) glides smoothly to the next scene of the
 * video (see ScrollVideoHero), one scroll up to the previous one. From the
 * last scene, which sits at the very end of the video, the page scrolls
 * normally: the hero slides away and the next section comes up under your own
 * scrolling, never snapped to.
 *
 * The About story (desktop, where its portrait stays put) pages the same way:
 * only between its first and last chapters, each scroll glides to the next
 * chapter. Reaching the first chapter, and leaving after the last, is your own
 * scrolling, never snapped to.
 *
 * Touch screens scroll normally; off for reduced motion.
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
    let glideEndedAt = 0;

    /** Where the hero's video ends: from here the hero simply scrolls away, revealing the next section. */
    function heroEnd(): number | null {
      const hero = document.querySelector<HTMLElement>('section[aria-label="Hero"]');
      return hero ? Math.round(hero.getBoundingClientRect().top + window.scrollY + hero.offsetHeight - window.innerHeight) : null;
    }

    /** Each scene of the hero. */
    function stops(): number[] {
      const hero = document.querySelector<HTMLElement>('section[aria-label="Hero"]');
      if (!hero) return [];
      const top = hero.getBoundingClientRect().top + window.scrollY;
      const out: number[] = [];
      const scrollable = hero.offsetHeight - window.innerHeight;
      const scenes = hero.querySelectorAll<HTMLElement>("[data-scene]");
      scenes.forEach((scene, i) => {
        // The first scene shows at the very top, the last at the very end of the video
        // (with the fade into the next section already showing); the others mid-range.
        const p = i === 0 ? 0 : i === scenes.length - 1 ? 1 : (Number(scene.dataset.start) + Number(scene.dataset.end)) / 2;
        out.push(Math.round(top + p * scrollable));
      });
      return out.sort((a, b) => a - b);
    }

    /**
     * Each About chapter, its text centred on the portrait beside it. Only on
     * desktop, where the portrait stays put. Measured from the text itself, not
     * the chapter's box, which has extra room (most of all the last one).
     */
    function aboutStops(): number[] {
      if (!window.matchMedia("(min-width: 1024px)").matches) return [];
      const portrait = document.querySelector<HTMLElement>("#about .about-story__visual");
      if (!portrait) return [];
      const portraitCentre = parseFloat(getComputedStyle(portrait).top) + portrait.offsetHeight / 2;
      const chapters = document.querySelectorAll<HTMLElement>("#about [data-chapter-index]");
      return [...chapters].map((el) => {
        const parts = [...el.children].map((child) => child.getBoundingClientRect()).filter((r) => r.height > 0);
        if (!parts.length) return Math.round(el.getBoundingClientRect().top + window.scrollY);
        const top = Math.min(...parts.map((r) => r.top));
        const bottom = Math.max(...parts.map((r) => r.bottom));
        return Math.round((top + bottom) / 2 + window.scrollY - portraitCentre);
      });
    }

    /** The About chapter one step away, or null outside the story (before its first chapter, past its last). */
    function aboutTarget(direction: 1 | -1): number | null {
      const all = aboutStops();
      if (!all.length) return null;
      const y = window.scrollY;
      const first = all[0];
      const last = all[all.length - 1];
      if (direction > 0) {
        if (y < first - 2 || y >= last - 2) return null;
        return all.find((s) => s > y + 2) ?? null;
      }
      if (y <= first + 2 || y > last + 2) return null;
      return [...all].reverse().find((s) => s < y - 2) ?? null;
    }

    /** The stop one step away in `direction`, or null when scrolling should stay free. */
    function target(direction: 1 | -1): number | null {
      return heroTarget(direction) ?? aboutTarget(direction);
    }

    /** The hero scene one step away, or null outside the hero. */
    function heroTarget(direction: 1 | -1): number | null {
      const y = window.scrollY;
      const all = stops();
      const end = heroEnd();
      // Once the video has ended the page scrolls normally: the hero slides away and the next section comes up by itself.
      if (!all.length || end === null || y >= end - 2) return null;
      // Inside the video, even past the last scene: down goes to the next scene or the video's end, up to the scene before.
      const next = direction > 0 ? (all.find((s) => s > y + 2) ?? end) : [...all].reverse().find((s) => s < y - 2);
      // Scenes can be more than a screen apart; the glide covers the whole step either way.
      return next ?? null;
    }

    function glide(to: number) {
      const id = ++glideId;
      gliding = true;
      resting = false;
      const from = window.scrollY;
      glideDir = to > from ? 1 : -1;
      const duration = Math.min(GLIDE_MAX_MS, Math.max(GLIDE_MIN_MS, (Math.abs(to - from) / window.innerHeight) * GLIDE_MS_PER_SCREEN));
      const start = performance.now();
      const step = (now: number) => {
        if (id !== glideId) return; // replaced by a glide the other way
        const t = Math.min((now - start) / duration, 1);
        window.scrollTo({ top: from + (to - from) * easeInOutCubic(t), behavior: "instant" });
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          gliding = false;
          resting = true;
          glideEndedAt = performance.now();
        }
      };
      requestAnimationFrame(step);
    }

    function onWheel(e: WheelEvent) {
      if (e.ctrlKey) return; // pinch zoom
      const now = performance.now();
      const sinceLast = now - lastWheel;
      const size = Math.abs(e.deltaY);
      // Momentum only fades. A clear jump in strength is a new swipe straight away; once the
      // glide has settled, any rise at all is one (momentum never picks up again).
      const growing = (size > 25 && size > lastDelta * 1.8) || (now - glideEndedAt > SETTLE_MS && size > lastDelta + 2);
      lastWheel = now;
      lastDelta = size;
      if (size < 4) return;
      const direction: 1 | -1 = e.deltaY > 0 ? 1 : -1;
      const to = target(direction);
      if ((gliding || resting) && direction === glideDir) {
        if (gliding) return e.preventDefault();
        // Nowhere further to glide (past the last scene): only a brief hold, then the page scrolls.
        if (to === null) {
          if (now - glideEndedAt < EXIT_HOLD_MS) return e.preventDefault();
        } else if (sinceLast < QUIET_MS && !growing) {
          return e.preventDefault();
        }
      }
      resting = false;
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
