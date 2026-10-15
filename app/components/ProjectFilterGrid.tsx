import Link from "next/link";
import { Reveal } from "@/app/components/Reveal";
import type { Project } from "@/app/lib/projects";
import { optimizedImage } from "@/app/lib/image-src";

/** How wide a card's picture shows: 1, 2 or 3 columns. Shared with the Work page's preload. */
export const WORK_GRID_SIZES = "(min-width: 1024px) min(30vw, 520px), (min-width: 768px) 45vw, calc(100vw - 48px)";

type ProjectCard = Pick<Project, "slug" | "name" | "tagline" | "category" | "year" | "technologies" | "role" | "workType">
  & { images?: string[]; imageAlt?: string; liveUrl?: string | null; theme?: Project["theme"]; logo?: Project["logo"] };

interface Props {
  projects: ProjectCard[];
}

const DEFAULT_THEME = { bg: "#f4f4f5", dark: false };

export function ProjectFilterGrid({ projects }: Props) {

  return (
    <div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 md:gap-x-10 gap-y-14 md:gap-y-20">
        {projects.map((project, i) => {
          const theme = { ...DEFAULT_THEME, ...(project.theme ?? {}) };

          return (
            <Reveal key={project.slug} delay={i * 50}>
              <Link
                href={`/work/${project.slug}`}
                className="group block"
              >
                {/* Image Preview Frame */}
                <div className="aspect-[16/10] relative overflow-hidden bg-zinc-100 rounded-xl">
                  <div
                    className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    style={{
                      backgroundColor: theme.bg,
                      backgroundImage: theme.dark
                        ? "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)"
                        : "radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  >
                    {project.images?.[0] && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        // Sizes match the grid (1, 2 or 3 columns), so phones get a 640px image, not 828px.
                        {...optimizedImage(project.images[0], WORK_GRID_SIZES)}
                        alt={project.imageAlt || project.name}
                        className="w-full h-full object-cover object-top"
                        // The first row is on screen straight away: load it now, the very first card first.
                        loading={i < 3 ? "eager" : "lazy"}
                        fetchPriority={i === 0 ? "high" : undefined}
                      />
                    )}
                  </div>
                  {/* The client's logo on a white tile in the picture's corner (it doesn't zoom with the picture). */}
                  {project.logo?.src && (
                    <span className="absolute bottom-3 left-3 flex h-11 items-center rounded-lg bg-white px-3 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.logo.src}
                        alt={`${project.name} logo`}
                        className="h-7 w-auto max-w-[120px] object-contain"
                        // Logos come after the pictures: never let one compete with the page's main image.
                        loading="lazy"
                        fetchPriority="low"
                      />
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="pt-5">
                  <h2 className="text-[20px] font-bold text-zinc-900 group-hover:opacity-60 transition-opacity duration-200 tracking-tight mb-2.5">
                    {project.name}
                  </h2>
                  <p className="text-[14px] text-zinc-500 leading-relaxed line-clamp-2">
                    {project.tagline}
                  </p>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
