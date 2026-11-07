import { SectionHead } from "./SectionHead";

const STATS = [
  { value: "640%", label: "Account visibility growth", detail: "Office Inspirations, 2025 — present" },
  { value: "146%", label: "Website visibility growth", detail: "Design, content, UI/UX and SEO" },
  { value: "35 → 68%", label: "Follower-driven engagement", detail: "Lifted through multi-channel design" },
];

/** A single inverted panel with the real, resume-backed numbers. */
export function HomeNumbers() {
  return (
    <section className="site-container pb-24 md:pb-32">
      <SectionHead index="(03)" label="By the numbers" className="site-reveal" />

      <div className="site-numbers site-reveal mt-8 overflow-hidden rounded-[2rem] bg-ink px-6 py-12 text-paper md:px-12 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="site-display max-w-[30rem] text-[clamp(2rem,3.6vw,3.4rem)] text-paper">
            Design that has to{" "}
            <em>prove itself</em>.
          </h2>
          <span className="site-mono text-paper/60">Real results — not vanity metrics</span>
        </div>

        <dl className="mt-12 grid gap-10 border-t border-paper/15 pt-10 md:grid-cols-3 md:gap-8">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dd className="site-display text-[clamp(3.2rem,6vw,5.6rem)] leading-none text-paper">
                {stat.value}
              </dd>
              <dt className="mt-4 text-sm font-medium text-paper">{stat.label}</dt>
              <p className="site-mono mt-2 text-paper/55">{stat.detail}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
