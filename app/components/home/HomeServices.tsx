import { SectionHead } from "./SectionHead";

const SERVICES = [
  {
    title: "Graphic design",
    body: "Campaigns, print, editorial and every asset a brand needs to show up consistently.",
  },
  {
    title: "Brand identity",
    body: "Logos, type systems and visual rules with enough range to stay useful after launch.",
  },
  {
    title: "2D illustration & mockups",
    body: "Custom illustration and product visuals that sell the idea before it exists.",
  },
  {
    title: "Web design & WordPress",
    body: "Responsive sites designed and built end to end — HTML, CSS, JavaScript, PHP.",
  },
  {
    title: "Social media & campaigns",
    body: "Content systems, paid creatives and community management that grow an audience.",
  },
  {
    title: "SEO & digital marketing",
    body: "Search, analytics and the content that compounds — measured, refined, repeated.",
  },
];

/** What I Do — numbered, editorial service list. */
export function HomeServices() {
  return (
    <section id="services" className="site-container pb-24 md:pb-32">
      <SectionHead index="(05)" label="What I do" className="site-reveal" />

      <div className="mt-10 grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
        <div className="site-reveal">
          <h2 className="site-display text-[clamp(2.1rem,4vw,3.9rem)] text-ink">
            Full-stack design — from <em>first sketch</em> to live site.
          </h2>
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-ink-soft">
            One person across the whole surface of a brand: the illustration, the mockup, the post,
            the page — designed, built, and improved with what the numbers say.
          </p>
        </div>

        <ul className="flex flex-col">
          {SERVICES.map((service, i) => (
            <li
              key={service.title}
              className="site-reveal group grid grid-cols-[auto_1fr_auto] items-baseline gap-5 border-t border-line py-5 last:border-b"
            >
              <span className="site-mono text-ink-soft">{String(i + 1).padStart(3, "0")}</span>
              <div>
                <h3 className="text-base font-semibold tracking-tight text-ink md:text-lg">
                  {service.title}
                </h3>
                <p className="mt-1 max-w-md text-sm leading-relaxed text-ink-soft">
                  {service.body}
                </p>
              </div>
              <span className="site-mono text-ink-soft transition-transform duration-300 group-hover:translate-x-1">
                ↗
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
