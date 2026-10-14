"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/** A round button fixed to the bottom right that appears once the reader has scrolled a screen down. */
export function BackToTop() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      }}
      aria-label="Back to top"
      tabIndex={shown ? 0 : -1}
      className={`fixed right-5 bottom-5 md:right-8 md:bottom-8 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-950 text-white shadow-[0_12px_30px_-8px_rgba(0,0,0,0.5)] ring-1 ring-white/10 transition-all duration-300 hover:bg-[#7c3aed] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B5CF6] ${
        shown ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-3"
      }`}
    >
      <ArrowUp size={19} aria-hidden="true" />
    </button>
  );
}
