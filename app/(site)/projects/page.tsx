import type { Metadata } from "next";
import { getPublishedProjectCards } from "@/app/lib/projects-db";
import { staticProjects } from "@/app/lib/projects-static";
import { getSiteSettings } from "@/app/lib/settings-db";
import { getClientLogos } from "@/app/lib/client-logos-db";
import { ProjectFilterGrid } from "@/app/components/ProjectFilterGrid";
import { ClientLogos } from "@/app/components/ClientLogos";
import { Reveal } from "@/app/components/Reveal";
import { preload } from "react-dom";
import { optimizedImage } from "@/app/lib/image-src";
import { WORK_GRID_SIZES } from "@/app/components/ProjectFilterGrid";

export const metadata: Metadata = {
  title: "Work & Case Studies",
  // The same page also answers at /work — this is the address search engines should keep.
  alternates: { canonical: "/work" },
  description:
    "Curated interface library and case studies of front-end development, responsive web design, e-commerce, and accessibility implementations.",
};

export default async function WorkPage() {
  const dbProjects = await getPublishedProjectCards();
  const projects = dbProjects.length > 0 ? dbProjects : staticProjects;
  const { workPageHeading, workPageIntro } = await getSiteSettings();
  const clientLogos = await getClientLogos();

  // The first project's picture is the page's main image: fetch it alongside the page itself.
  const firstImage = projects[0]?.images?.[0];
  if (firstImage) {
    const img = optimizedImage(firstImage, WORK_GRID_SIZES);
    preload(img.src, { as: "image", imageSrcSet: img.srcSet, imageSizes: img.sizes, fetchPriority: "high" });
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-zinc-950">
        <div className="max-w-(--site-max) mx-auto px-6 md:px-10 pt-36 md:pt-44 pb-24 md:pb-28">
          <Reveal>
            <h1
              className="font-extrabold text-white tracking-tight mb-6 md:mb-8"
              style={{ fontSize: "clamp(2.25rem, 5.5vw, 3.75rem)", letterSpacing: "-0.04em" }}
            >
              {workPageHeading}
            </h1>
            <p className="text-[15.5px] text-zinc-400 max-w-xl leading-relaxed">
              {workPageIntro}
            </p>
          </Reveal>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="max-w-(--site-max) mx-auto px-6 md:px-10 py-20 md:py-28">
        <ProjectFilterGrid projects={projects} />
      </div>

      {/* Moving Brand Logos Ticker */}
      <ClientLogos brands={clientLogos} />
    </div>
  );
}
