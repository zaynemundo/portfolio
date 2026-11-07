"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { label: "Work", href: "/projects" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

interface Props {
  cvPath?: string;
}

/** Dubai time, mono, ticking every half minute. */
function LocalTime() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Dubai",
      }).format(new Date());

    setTime(format());
    const id = window.setInterval(() => setTime(format()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="site-mono hidden text-ink-soft lg:inline" suppressHydrationWarning>
      Dubai&nbsp;{time || "—"}
    </span>
  );
}

export function Nav({ cvPath = "/docs/zayne-mundo-cv.pdf" }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href.includes("#")) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="site-container pt-4 md:pt-5">
          <div
            className={`flex h-14 items-center justify-between gap-4 rounded-full px-3 pl-5 transition-all duration-500 md:h-[58px] md:pl-6 ${
              scrolled || pathname !== "/"
                ? "site-glass shadow-[0_10px_40px_-18px_rgba(42,22,71,0.35)]"
                : "border border-transparent"
            }`}
          >
            {/* Brand */}
            <Link
              href="/"
              aria-label="Zayne Mundo — home"
              className="group flex shrink-0 items-baseline gap-2"
            >
              <span className="site-display text-[1.55rem] leading-none tracking-tight text-ink">
                zayne<span className="text-brand">.</span>
              </span>
              <span className="site-mono hidden text-ink-soft sm:inline">Designer</span>
            </Link>

            {/* Desktop links */}
            <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`site-mono rounded-full px-4 py-2 transition-colors duration-200 ${
                    isActive(link.href)
                      ? "bg-ink/[0.06] text-ink"
                      : "text-ink-soft hover:bg-ink/[0.05] hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right cluster */}
            <div className="flex items-center gap-2 md:gap-3">
              <LocalTime />
              <ThemeToggle />
              <div className="hidden md:block">
                <a href="mailto:zayne.mayo@gmail.com" className="site-pill site-pill--primary">
                  Let&apos;s talk <span className="site-arrow">↗</span>
                </a>
              </div>

              {/* Mobile trigger */}
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink md:hidden"
              >
                <span className="relative block h-3 w-4">
                  <span
                    className={`absolute left-0 top-0 h-[1.5px] w-full bg-current transition-transform duration-300 ${
                      menuOpen ? "translate-y-[5px] rotate-45" : ""
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-[5px] h-[1.5px] w-full bg-current transition-opacity duration-200 ${
                      menuOpen ? "opacity-0" : ""
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-[10px] h-[1.5px] w-full bg-current transition-transform duration-300 ${
                      menuOpen ? "-translate-y-[5px] -rotate-45" : ""
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 bg-paper transition-opacity duration-300 md:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="site-container flex h-full flex-col justify-between pb-10 pt-28">
          <nav aria-label="Mobile primary" className="flex flex-col">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="site-display group flex items-baseline justify-between border-b border-line py-5 text-5xl text-ink"
              >
                {link.label}
                <span className="site-mono text-ink-soft">0{i + 1}</span>
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-4">
            <a href="mailto:zayne.mayo@gmail.com" className="site-display text-3xl text-brand">
              zayne.mayo@gmail.com
            </a>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <a href={cvPath} download className="site-pill site-pill--ghost">
                Download CV <span className="site-arrow">↘</span>
              </a>
              <span className="site-mono text-ink-soft">Dubai, UAE</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
