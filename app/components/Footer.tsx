"use client";

import Link from "next/link";

const year = new Date().getFullYear();

const pages = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/projects" },
  { label: "Insights", href: "/blog" },
];

const contact = [
  { label: "Email", href: "mailto:zayne.mayo@gmail.com" },
  { label: "Call", href: "tel:+971508059968" },
];

export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="border-t border-line bg-paper" aria-label="Site footer">
      <div className="site-container pb-10 pt-14 md:pb-12 md:pt-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr] md:gap-8">
          {/* Signature */}
          <div className="flex flex-col justify-between gap-8">
            <div>
              <Link href="/" className="site-display text-3xl text-ink">
                zayne<span className="text-brand">.</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
                Graphic designer &amp; web developer in Dubai. Brand visuals, 2D illustration,
                mockups, and websites that move numbers.
              </p>
            </div>
            <span className="site-mono text-ink-soft">Dubai, United Arab Emirates</span>
          </div>

          {/* Pages */}
          <nav aria-label="Footer pages" className="flex flex-col gap-3">
            <span className="site-mono mb-2 text-ink-soft">Pages</span>
            {pages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="w-fit text-sm text-ink transition-colors hover:text-brand"
              >
                {page.label}
              </Link>
            ))}
          </nav>

          {/* Elsewhere */}
          <div className="flex flex-col gap-3">
            <span className="site-mono mb-2 text-ink-soft">Elsewhere</span>
            {contact.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="w-fit text-sm text-ink transition-colors hover:text-brand"
              >
                {item.label}
              </a>
            ))}
            <a
              href="/docs/zayne-mundo-cv.pdf"
              download
              className="w-fit text-sm text-ink transition-colors hover:text-brand"
            >
              Download CV
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="site-mono text-ink-soft">
            © {year} Zayne Mundo. All rights reserved.
          </span>
          <button
            type="button"
            onClick={scrollToTop}
            className="site-mono w-fit text-ink-soft transition-colors hover:text-brand"
          >
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
