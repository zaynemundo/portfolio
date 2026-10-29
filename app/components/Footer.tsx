"use client";

import Link from "next/link";

const year = new Date().getFullYear();

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#09090b] text-zinc-400 border-t border-zinc-800/60" aria-label="Site footer">
      <div className="max-w-(--site-max) mx-auto px-6 md:px-10 pt-12 md:pt-14 pb-10 md:pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
          
          {/* ZM Mark + Brand + Signature */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 group focus-visible:outline-none shrink-0"
              aria-label="ZM Zayne Mundo, home"
            >
              <span className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center text-[12px] font-bold tracking-tight group-hover:bg-white/15 transition-colors duration-200">
                ZM
              </span>
              <span className="text-[1.125rem] font-bold text-white tracking-tight group-hover:text-zinc-200 transition-colors duration-200">
                Zayne Mundo
              </span>
            </Link>
            <span className="hidden sm:inline text-zinc-800">|</span>
            <p className="text-[13.5px] text-zinc-400 leading-relaxed max-w-md">
              Building digital experiences where thoughtful design meets dependable engineering.
            </p>
          </div>

          {/* Back to Top Button */}
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 text-[13px] font-medium text-zinc-400 hover:text-white transition-colors duration-150 focus-visible:outline-none shrink-0"
            aria-label="Back to top of page"
          >
            <span>Back to Top</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 11V3M3.5 6.5L7 3l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Copyright & Location */}
        <div className="mt-8 md:mt-10 pt-6 border-t border-zinc-800/40 flex flex-wrap items-center justify-between gap-4 text-[12.5px] text-zinc-400">
          <span>&copy; {year} Zayne Mundo. All rights reserved.</span>
          <span>Dubai, United Arab Emirates</span>
        </div>
      </div>
    </footer>
  );
}
