import type { ProjectCard } from "@/app/lib/projects";
import { optimizedImage } from "@/app/lib/image-src";
import { SectionHead } from "./SectionHead";

interface Props {
  projects: ProjectCard[];
}

const IMAGE_SIZES = "(min-width: 768px) 46vw, 100vw";

/** Selected Work — big numbered editorial rows. */
export function HomeWorkIndex({ projects }: Props) {
  return (
    <section id="work" className="site-container pb-24 pt-4 md:pb-32">
      <SectionHead index="(02)" label="Selected work" className="site-reveal" />

      <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
        <h2 className="site-display site-reveal max-w-[40rem] text-[clamp(2.3rem,4.8vw,4.6rem)] text-ink">
          Work that <em>moves</em> numbers.
        </h2>
        <a href="/projects" className="site-mono-link site-reveal text-ink">
          All projects ↗
        </a>
      </div>

      <div className="mt-12 flex flex-col">
        {projects.map((project, i) => {
          const image = project.images?.[0] ?? project.poster;
          return (
            <a
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="site-work-row site-reveal group grid gap-6 border-t border-line py-8 md:grid-cols-[auto_1fr] md:items-start md:gap-10 md:py-10 lg:grid-cols-[auto_1.05fr_1fr]"
            >
              <span className="site-mono pt-2 text-ink-soft">
                PRJCT/{String(i + 1).padStart(2, "0")}
              </span>

              <div className="order-1 md:order-none">
                <h3 className="site-work-title site-display text-[clamp(2rem,3.4vw,3.2rem)] leading-[0.98] text-ink transition-colors duration-300">
                  {project.name}
                </h3>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
                  {project.tagline}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {(project.technologies ?? []).slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="site-mono rounded-full border border-line px-3 py-1 text-ink-soft"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="site-mono mt-6 flex flex-wrap gap-x-6 gap-y-2 text-ink-soft">
                  <span>{project.category}</span>
                  <span>{project.year}</span>
                  <span>{project.role}</span>
                </div>
              </div>

              <div className="order-2 overflow-hidden rounded-[1.5rem] border border-line bg-surface md:order-none md:col-span-2 lg:col-span-1">
                {image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    {...optimizedImage(image, IMAGE_SIZES, 75)}
                    alt={project.imageAlt ?? project.name}
                    loading="lazy"
                    className="site-work-media aspect-[4/3] w-full object-cover"
                  />
                ) : (
                  <div className="site-work-media flex aspect-[4/3] w-full items-center justify-center bg-paper-deep">
                    <span className="site-display text-5xl text-ink-soft">{project.name}</span>
                  </div>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
