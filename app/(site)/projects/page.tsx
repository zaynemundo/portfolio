import type { Metadata } from "next";
import { staticProjects } from "@/app/lib/projects-static";
import { ProjectFilterGrid } from "@/app/components/ProjectFilterGrid";
import { ClientLogos } from "@/app/components/ClientLogos";
import { Reveal } from "@/app/components/Reveal";

export const metadata: Metadata = {
  title: "Work & Case Studies",
  description:
    "Curated interface library and case studies of front-end development, responsive web design, e-commerce, and accessibility implementations.",
};

export default async function WorkPage() {
  const projects = staticProjects;

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-zinc-950">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 pt-36 md:pt-44 pb-24 md:pb-28">
          <Reveal>
            <h1
              className="font-extrabold text-white tracking-tight mb-6 md:mb-8"
              style={{ fontSize: "clamp(2.25rem, 5.5vw, 3.75rem)", letterSpacing: "-0.04em" }}
            >
              Selected Work
            </h1>
            <p className="text-[15.5px] text-zinc-400 max-w-xl leading-relaxed">
              A collection of front-end engineering, custom e-commerce storefronts,
              corporate web builds, and technical performance optimizations.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-20 md:py-28">
        <ProjectFilterGrid projects={projects} />
      </div>

      {/* Moving Brand Logos Ticker */}
      <ClientLogos />
    </div>
  );
}
