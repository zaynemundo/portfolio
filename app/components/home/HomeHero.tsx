import { OrbStage } from "./OrbStage";

interface Props {
  /** Resume/CV download path from site settings. */
  cvPath: string;
}

/**
 * Homepage hero: lavender dreamscape, violet particle orb, editorial serif
 * statement. The orb is decorative and sits behind the copy on small screens.
 */
export function HomeHero({ cvPath }: Props) {
  return (
    <section className="site-hero-canvas relative isolate min-h-[100svh] overflow-hidden">
      {/* Design-canvas dot grid */}
      <div className="site-grid-overlay pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />

      {/* Orb — large on desktop, a soft glow behind the text on mobile */}
      <div
        className="pointer-events-none absolute -right-[26%] top-[-2%] z-0 hidden h-[104vh] w-[80vw] md:block lg:-right-[20%]"
        aria-hidden="true"
      >
        <OrbStage className="h-full w-full" />
      </div>
      <div
        className="pointer-events-none absolute -right-[38%] top-[46%] z-0 h-[52vh] w-[115vw] opacity-90 md:hidden"
        aria-hidden="true"
      >
        <OrbStage className="h-full w-full" />
      </div>

      <div className="site-container relative z-10 flex min-h-[100svh] flex-col justify-between pb-6 pt-24 md:pb-8" style={{ paddingTop: "clamp(6.25rem, 13vh, 8.75rem)" }}>
        <div className="max-w-[46rem] pt-2 md:pt-4">
          <p className="site-mono site-reveal flex flex-wrap items-center gap-x-3 gap-y-2 text-ink-soft">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
              Portfolio — 2026
            </span>
            <span className="text-line" aria-hidden="true">/</span>
            <span>Graphic designer &amp; web developer</span>
          </p>

          <h1 className="site-display site-reveal mt-5 text-ink" style={{ fontSize: "clamp(2.6rem, min(7.2vw, 10.5vh), 6.8rem)" }}>
            Design that makes people <em>stop, look,</em> and remember.
          </h1>

          <p className="site-reveal mt-5 max-w-xl text-[15px] leading-relaxed text-ink-soft md:text-base">
            I&apos;m Zayne — a graphic designer and web developer in Dubai. I build brand systems,
            2D illustration, mockups and websites for brands that want to be seen, remembered,
            and measured.
          </p>

          <div className="site-reveal mt-7 flex flex-wrap items-center gap-3">
            <a href="/projects" className="site-pill site-pill--primary">
              Selected work <span className="site-arrow">↘</span>
            </a>
            <a href="#contact" className="site-pill site-pill--ghost">
              Let&apos;s talk <span className="site-arrow">↗</span>
            </a>
            <span className="hidden sm:inline-flex">
              <a
                href={cvPath}
                download
                className="site-mono site-link ml-2 text-ink-soft hover:text-ink"
              >
                Download CV
              </a>
            </span>
          </div>
        </div>

        <div className="site-hairline mt-10 flex flex-wrap items-end justify-between gap-4 pt-4 md:mt-14">
          <a
            href="#approach"
            className="site-mono inline-flex items-center gap-2 text-ink-soft transition-colors hover:text-ink"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-line">
              ↓
            </span>
            Scroll to explore
          </a>
          <div className="site-mono flex flex-wrap gap-x-6 gap-y-2 text-ink-soft">
            <span>01 — Graphic design</span>
            <span>02 — Web development</span>
            <span>03 — Social &amp; SEO</span>
            <span className="hidden lg:inline">· Move to scatter · hold to burst</span>
          </div>
        </div>
      </div>
    </section>
  );
}
