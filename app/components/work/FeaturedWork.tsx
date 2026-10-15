import Link from "next/link";
import { Reveal } from "@/app/components/Reveal";
import { ProjectShowcase } from "./ProjectShowcase";
import type { ProjectCard } from "@/app/lib/projects";

interface Props {
  projects: ProjectCard[];
  heading?: string;
  intro?: string;
}

export function FeaturedWork({ projects, heading = "Selected Work", intro }: Props) {
  if (projects.length === 0) return null;

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="featured-work bg-white pt-32 md:pt-44 pb-24 md:pb-32"
    >
      <div className="featured-work__header mb-16 md:mb-20">
        <Reveal>
          <h2 id="work-heading" className="featured-work__heading">
            {heading}
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <div className="featured-work__header-inner">
            <p className="featured-work__intro">
              {intro ?? "A selection of digital platforms delivered across institutional, healthcare, and commercial sectors — where accessibility standards, information clarity, and long-term technical sustainability were central to every engagement."}
            </p>
            <Link href="/work" className="featured-work__all-link">
              View all work
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 6h8M6.5 2.5L10 6l-3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </Reveal>
      </div>

      {/* ── Interactive 3-Project Showcase ────────────────────── */}
      <Reveal delay={120}>
        <ProjectShowcase projects={projects} />
      </Reveal>

    </section>
  );
}
