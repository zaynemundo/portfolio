"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useActiveProject } from "@/app/hooks/useActiveProject";

const navLinks = [
  { label: "Work", href: "/work", hint: "Case studies" },
  { label: "Insights", href: "/insights", hint: "Articles and notes" },
];

/* Flag read by the homepage-mount effect below — lets "Let's Connect"
   work from any page (navigate home, then scroll) without ever putting
   #contact in the URL. */
const SCROLL_TO_CONTACT_KEY = "scrollToContact";

function scrollToContactEl() {
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
}

interface Props {
  cvPath?: string;
}

export function Nav({ cvPath = "/docs/zaira-mundo-cv.pdf" }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";
  const { overProjects, formatted, totalFormatted, total } = useActiveProject(); // read-only

  /* "Let's Connect" — scroll directly if already home, otherwise navigate
     home (plain "/", no hash) and let this effect finish the scroll once
     the contact section has mounted. */
  const goToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isHome) {
      scrollToContactEl();
    } else {
      sessionStorage.setItem(SCROLL_TO_CONTACT_KEY, "1");
      router.push("/");
    }
  };

  useEffect(() => {
    if (!isHome) return;
    if (sessionStorage.getItem(SCROLL_TO_CONTACT_KEY)) {
      sessionStorage.removeItem(SCROLL_TO_CONTACT_KEY);
      scrollToContactEl();
    }
  }, [isHome]);

  /* Track whether scrolled past hero for style switch. */
  useEffect(() => {
    let ticking = false;
    const handler = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 60);
        ticking = false;
      });
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* Lock body scroll when mobile menu is open. */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  /* On the homepage, nav is transparent until scrolled past hero. */
  const isTransparent = isHome && !scrolled;

  return (
    <>
      {/* Mobile backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/30 backdrop-blur-xs"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Floating pill nav */}
      <header
        className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 sm:px-6 transition-all duration-300"
        style={{
          paddingTop: scrolled ? 8 : 12,
          transform: "translateY(0)",
        }}
      >
        <div className="relative w-full max-w-[760px] min-[1600px]:max-w-[900px] min-[1880px]:max-w-[1040px]">
          {/* Pill */}
          <div
            className={`h-[52px] rounded-full flex items-center justify-between px-3.5 sm:px-5 transition-all duration-300 ${
              isTransparent
                ? "bg-white/[0.06] border border-white/[0.08] backdrop-blur-xl"
                : scrolled
                  ? "bg-white/92 border border-zinc-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl"
                  : "bg-white/90 border border-zinc-200/70 backdrop-blur-md shadow-[0_1px_6px_rgba(0,0,0,0.03)]"
            }`}
          >
            {/* Logo */}
            <Link
              href="/"
              aria-label="ZM Zaira Mundo, home"
              className="flex items-center gap-2.5 shrink-0 group focus-visible:outline-none"
            >
              <span
                className={`text-[14px] font-extrabold tracking-tight transition-colors duration-200 ${
                  isTransparent
                    ? "text-white group-hover:text-white/80"
                    : "text-zinc-900 group-hover:text-zinc-700"
                }`}
              >
                ZM
              </span>
              <span
                className={`h-4 w-px hidden sm:block ${isTransparent ? "bg-white/15" : "bg-zinc-200"}`}
                aria-hidden="true"
              />
              <span
                className={`text-[13.5px] font-semibold tracking-tight hidden sm:block transition-colors duration-200 ${
                  isTransparent
                    ? "text-white/90 group-hover:text-white"
                    : "text-zinc-900 group-hover:text-zinc-700"
                }`}
              >
                Zaira Mundo
              </span>
            </Link>

            <div className="flex-1" />

            {/* Desktop nav links */}
            <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-1 mr-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-[14px] font-medium transition-colors duration-150 ${
                    isActive(link.href)
                      ? isTransparent
                        ? "text-white bg-white/15 font-semibold"
                        : "text-[#7c3aed] bg-[#8B5CF6]/10 font-semibold"
                      : isTransparent
                        ? "text-white/85 hover:text-white hover:bg-white/10"
                        : "text-zinc-700 hover:text-[#7c3aed] hover:bg-[#8B5CF6]/8"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop right CTAs */}
            <div className="hidden md:flex items-center gap-2">
              <a
                href={cvPath}
                download
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13.5px] font-medium transition-colors duration-150 ${
                  isTransparent
                    ? "text-white/85 hover:text-white hover:bg-white/10"
                    : "text-zinc-700 hover:text-[#7c3aed] hover:bg-[#8B5CF6]/8"
                }`}
              >
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M6 1.5v6.5M3 5.5L6 8.5 9 5.5M2.5 10.5h7"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Resume
              </a>
              <button
                type="button"
                onClick={goToContact}
                className={`inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full text-[13.5px] font-semibold transition-all duration-200 cursor-pointer ${
                  isTransparent
                    ? "bg-white/15 text-white hover:bg-[#8B5CF6]/60 backdrop-blur-md"
                    : "bg-zinc-900 text-white hover:bg-[#8B5CF6] shadow-xs"
                }`}
              >
                Let&apos;s Connect
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M2.5 6h7M6 2.5L9.5 6 6 9.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Project counter — only mounted when the showcase is in view */}
              {overProjects && total > 0 && (
                <div
                  className={`flex items-center gap-1 pl-2 border-l ${
                    isTransparent ? "border-white/15" : "border-zinc-200"
                  }`}
                  aria-live="polite"
                  aria-atomic="true"
                  aria-label={`Project ${formatted} of ${totalFormatted}`}
                >
                  <span
                    className={`font-mono text-[12px] font-semibold tabular-nums ${
                      isTransparent ? "text-white/80" : "text-zinc-700"
                    }`}
                  >
                    {formatted}
                  </span>
                  <span
                    className={isTransparent ? "text-white/25 text-[11px]" : "text-zinc-300 text-[11px]"}
                    aria-hidden="true"
                  >
                    /
                  </span>
                  <span
                    className={`font-mono text-[12px] font-medium tabular-nums ${
                      isTransparent ? "text-white/35" : "text-zinc-400"
                    }`}
                    aria-hidden="true"
                  >
                    {totalFormatted}
                  </span>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-[5px] focus-visible:outline-none"
            >
              <span
                className={`block w-[16px] h-[1.5px] transition-all duration-200 origin-center ${
                  isTransparent ? "bg-white" : "bg-zinc-800"
                } ${menuOpen ? "translate-y-[5.5px] rotate-45" : ""}`}
              />
              <span
                className={`block w-[16px] h-[1.5px] transition-all duration-200 ${
                  isTransparent ? "bg-white" : "bg-zinc-800"
                } ${menuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block w-[16px] h-[1.5px] transition-all duration-200 origin-center ${
                  isTransparent ? "bg-white" : "bg-zinc-800"
                } ${menuOpen ? "-translate-y-[5.5px] -rotate-45" : ""}`}
              />
            </button>
          </div>

          {/* Mobile dropdown */}
          <div
            id="mobile-nav"
            // Closed, the menu is fully out of reach: hidden from screen readers and skipped by Tab.
            inert={!menuOpen}
            className={`absolute top-full mt-2 left-0 right-0 md:hidden bg-white/95 backdrop-blur-lg rounded-3xl border border-zinc-200 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.25)] overflow-hidden transition-all duration-200 origin-top ${
              menuOpen
                ? "opacity-100 scale-y-100 pointer-events-auto"
                : "opacity-0 scale-y-95 pointer-events-none"
            }`}
          >
            <nav aria-label="Mobile navigation" className="p-2">
              {/* Big, easy targets: each page with a line on what's there. */}
              <ul>
                {navLinks.map((link, i) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`group flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-colors duration-150 ${
                        isActive(link.href) ? "bg-[#8B5CF6]/8" : "hover:bg-zinc-50"
                      }`}
                    >
                      <span className="w-6 font-mono text-[11px] font-semibold tabular-nums text-zinc-400">0{i + 1}</span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-[20px] font-bold leading-tight tracking-tight ${isActive(link.href) ? "text-[#8B5CF6]" : "text-zinc-900"}`}>
                          {link.label}
                        </span>
                        <span className="block text-[13px] text-zinc-500">{link.hint}</span>
                      </span>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 text-zinc-300 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-zinc-900">
                        <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* The two actions side by side: talk, or take the CV. */}
              <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] gap-2 border-t border-zinc-100 px-2 pb-2 pt-3">
                <button
                  type="button"
                  onClick={(e) => { setMenuOpen(false); goToContact(e); }}
                  className="flex h-12 items-center justify-center gap-2 rounded-full bg-zinc-900 text-[14.5px] font-semibold text-white transition-colors duration-200 hover:bg-[#8B5CF6] cursor-pointer"
                >
                  Let&apos;s Connect
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <a
                  href={cvPath}
                  download
                  className="flex h-12 items-center justify-center gap-2 rounded-full border border-zinc-200 px-5 text-[14px] font-semibold text-zinc-800 transition-colors duration-200 hover:border-[#8B5CF6] hover:text-[#8B5CF6]"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M3 13.5h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Resume
                </a>
              </div>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
