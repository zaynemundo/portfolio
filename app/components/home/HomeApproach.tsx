import { SectionHead } from "./SectionHead";

const PRINCIPLES = [
  {
    title: "Design with a job to do",
    body: "Every layout, colour and word is there to move something — a click, a lead, a sale. If it's only decoration, it gets cut.",
  },
  {
    title: "Built, not handed over",
    body: "I design and ship in the same pass. The live site matches the mockup down to the spacing, because I'm the one building it.",
  },
  {
    title: "Measured, then improved",
    body: "Search, social and behaviour data tell me what worked. The next version of a page is always sharper than the last.",
  },
];

/** Approach — the three beliefs behind the work. */
export function HomeApproach() {
  return (
    <section id="approach" className="site-container py-24 md:py-32">
      <SectionHead index="(01)" label="Approach" className="site-reveal" />

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
        <h2 className="site-display site-reveal max-w-[52rem] text-[clamp(2.3rem,4.8vw,4.6rem)] text-ink">
          I don&apos;t just make things look good. I make them <em>work</em>.
        </h2>
        <p className="site-mono site-reveal max-w-[16rem] text-right text-ink-soft md:text-right">
          (A designer who ships — strategy, visuals, code.)
        </p>
      </div>

      <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
        {PRINCIPLES.map((principle, i) => (
          <div key={principle.title} className="site-reveal border-t border-line pt-5">
            <span className="site-mono text-ink-soft">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-4 text-lg font-semibold tracking-tight text-ink md:text-xl">
              {principle.title}
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
              {principle.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
