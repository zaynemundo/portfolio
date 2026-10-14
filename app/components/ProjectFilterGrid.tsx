import Link from "next/link";
import { Reveal } from "@/app/components/Reveal";
import type { Project } from "@/app/lib/projects";

type ProjectCard = Pick<Project, "slug" | "name" | "tagline" | "category" | "year" | "technologies" | "role" | "workType">
  & { images?: string[]; imageAlt?: string; liveUrl?: string | null; theme?: Project["theme"]; logo?: Project["logo"] };

interface Props {
  projects: ProjectCard[];
}

const DEFAULT_THEME = { bg: "#f4f4f5", dark: false };

export function ProjectFilterGrid({ projects }: Props) {
  const anyLogo = projects.some((p) => p.logo?.src);

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
                        src={project.images[0]}
                        alt={project.imageAlt || project.name}
                        className="w-full h-full object-cover object-top"
                        loading="lazy"
                      />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="pt-5">
                  {/* Once any project has a logo, every card keeps the room for one, so the names stay in line. */}
                  {anyLogo && (
                    <div className="mb-3 h-8">
                      {project.logo?.src && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={project.logo.src}
                          alt={`${project.name} logo`}
                          className="h-full w-auto max-w-[140px] object-contain object-left"
                          loading="lazy"
                        />
                      )}
                    </div>
                  )}
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
