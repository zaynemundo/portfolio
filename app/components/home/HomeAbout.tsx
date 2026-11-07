import type { Chapter } from "@/app/data/aboutChapters";
import { optimizedImage } from "@/app/lib/image-src";
import { SectionHead } from "./SectionHead";

interface Props {
  portraitUrl: string;
  chapters: Chapter[];
  cvPath: string;
}

const FACTS = [
  { label: "Based in", value: "Dubai, UAE" },
  { label: "Experience", value: "3+ years" },
  { label: "Education", value: "BSc Creative Computing" },
  { label: "Focus", value: "Brand & web" },
];

/** About — portrait, a short statement, and the resume facts. */
export function HomeAbout({ portraitUrl, chapters, cvPath }: Props) {
  const profile = chapters.find((chapter) => chapter.type === "text");
  const paragraphs = profile?.paragraphs?.slice(0, 2) ?? [];

  return (
    <section id="about" className="site-container pb-24 md:pb-32">
      <SectionHead index="(04)" label="About" className="site-reveal" />

      <div className="mt-10 grid items-start gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
        <div className="site-reveal relative overflow-hidden rounded-[2rem] border border-line bg-surface">
          {portraitUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              {...optimizedImage(portraitUrl, "(min-width: 768px) 40vw, 100vw", 75)}
              alt="Portrait of Zayne Mundo"
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center bg-paper-deep">
              <span className="site-display text-6xl text-ink-soft">ZM</span>
            </div>
          )}
          <div className="site-mono absolute bottom-4 left-4 rounded-full bg-paper/85 px-3 py-1.5 text-ink backdrop-blur">
            Zayne Mundo — Dubai
          </div>
        </div>

        <div className="site-reveal">
          <h2 className="site-display text-[clamp(2.1rem,4vw,3.9rem)] text-ink">
            Designer, illustrator &amp; builder — <em>based in Dubai</em>.
          </h2>

          {paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)} className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-soft">
              {paragraph}
            </p>
          ))}

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-7">
            {FACTS.map((fact) => (
              <div key={fact.label}>
                <dt className="site-mono text-ink-soft">{fact.label}</dt>
                <dd className="mt-1.5 text-sm font-medium text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a href={cvPath} download className="site-pill site-pill--primary">
              Download CV <span className="site-arrow">↘</span>
            </a>
            <a href="#contact" className="site-mono-link text-ink">
              Work with me ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
