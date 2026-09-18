"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useActiveProject } from "@/app/hooks/useActiveProject";

const navLinks = [
  { label: "Work", href: "/work" },
  { label: "Insights", href: "/insights" },
];

/* Flag read by the homepage-mount effect below — lets "Let's Connect"
   work from any page (navigate home, then scroll) without ever putting
   #contact in the URL. */
const SCROLL_TO_CONTACT_KEY = "scrollToContact";

function scrollToContactEl() {
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
}

export function Nav() {
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
        <div className="relative w-full max-w-[760px]">
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
              aria-label="Zaira Mundo — home"
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
                  className={`px-3.5 py-1.5 rounded-full text-[13.5px] font-medium transition-colors duration-150 ${
                    isActive(link.href)
                      ? isTransparent
                        ? "text-white bg-white/15 font-semibold"
                        : "text-[#8B5CF6] bg-[#8B5CF6]/10 font-semibold"
                      : isTransparent
                        ? "text-white/60 hover:text-white hover:bg-white/10"
                        : "text-zinc-500 hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/8"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop right CTAs */}
            <div className="hidden md:flex items-center gap-2">
              <a
                href="/docs/zaira-mundo-cv.pdf"
                download
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition-colors duration-150 ${
                  isTransparent
                    ? "text-white/50 hover:text-white hover:bg-white/10"
                    : "text-zinc-600 hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/8"
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
                className={`inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
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
            aria-hidden={!menuOpen}
            className={`absolute top-full mt-2 left-0 right-0 md:hidden bg-white/95 backdrop-blur-lg rounded-2xl border border-zinc-200 shadow-xl overflow-hidden transition-all duration-200 origin-top ${
              menuOpen
                ? "opacity-100 scale-y-100 pointer-events-auto"
                : "opacity-0 scale-y-95 pointer-events-none"
            }`}
          >
            <nav aria-label="Mobile navigation">
              <ul className="py-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center px-5 py-3 text-[15px] font-medium transition-colors duration-150 ${
                        isActive(link.href)
                          ? "text-[#8B5CF6] bg-[#8B5CF6]/8 font-semibold"
                          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li className="px-5 py-3 border-t border-zinc-100 mt-1 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={(e) => { setMenuOpen(false); goToContact(e); }}
                    className="flex items-center justify-center w-full py-3 rounded-full bg-zinc-900 text-white text-[14px] font-semibold hover:bg-[#8B5CF6] transition-colors duration-200 cursor-pointer"
                  >
                    Let&apos;s Connect
                  </button>
                  <a
                    href="/docs/zaira-mundo-cv.pdf"
                    download
                    className="flex items-center justify-center w-full py-2.5 rounded-full border border-zinc-200 text-zinc-700 text-[13.5px] font-medium hover:border-[#8B5CF6] hover:text-[#8B5CF6] transition-colors duration-200"
                  >
                    Download Resume
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
