import type { Metadata } from "next";
import type { ProjectCard } from "@/app/lib/projects";
import { getPublishedProjectCards, getFeaturedProjectSlugs } from "@/app/lib/projects-db";
import { getSiteSettings } from "@/app/lib/settings-db";
import { staticProjects } from "@/app/lib/projects-static";
import { SITE_URL } from "@/app/lib/site-url";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/app/lib/seo";

import { RevealMotion } from "@/app/components/home/RevealMotion";
import { HomeHero } from "@/app/components/home/HomeHero";
import { HomeTicker } from "@/app/components/home/HomeTicker";
import { HomeApproach } from "@/app/components/home/HomeApproach";
import { HomeWorkIndex } from "@/app/components/home/HomeWorkIndex";
import { HomeNumbers } from "@/app/components/home/HomeNumbers";
import { HomeAbout } from "@/app/components/home/HomeAbout";
import { HomeServices } from "@/app/components/home/HomeServices";
import { HomeContact } from "@/app/components/home/HomeContact";

export function generateMetadata(): Metadata {
  return {
    // Absolute: the layout's "%s | Zayne Mundo" template would add the name a second time.
    title: { absolute: SITE_TITLE },
    alternates: { canonical: "/" },
    description: SITE_DESCRIPTION,
  };
}

export default async function Home() {
  const settings = await getSiteSettings();
  const dbProjects = await getPublishedProjectCards();

  const allProjects: ProjectCard[] = (
    dbProjects.length > 0 ? dbProjects : staticProjects
  ) as ProjectCard[];

  /* Featured picks the rows on the homepage; fill up to three with the rest
     while fewer than three projects are flagged as featured. */
  const featuredSlugs =
    dbProjects.length > 0 ? new Set(await getFeaturedProjectSlugs()) : new Set<string>();
  const featured = allProjects.filter((project) => featuredSlugs.has(project.slug));
  const ordered = [...featured, ...allProjects.filter((project) => !featured.includes(project))];
  const projects = ordered.slice(0, 3);

  return (
    <>
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: settings.name,
            jobTitle: ["Graphic Designer", "Web Developer", "Visual Designer"],
            description: SITE_DESCRIPTION,
            ...(settings.portraitUrl && { image: new URL(settings.portraitUrl, SITE_URL).href }),
            email: settings.email,
            url: SITE_URL,
            sameAs: [settings.linkedinUrl, settings.githubUrl].filter(Boolean),
            knowsAbout: [
              "Graphic Design", "2D Illustration", "Mockup Design", "Brand Identity",
              "Social Media Management", "Web Design", "Web Development", "WordPress",
              "HTML5", "CSS3", "JavaScript", "PHP", "Responsive Web Design",
              "SEO", "Digital Marketing", "Design Research", "Figma",
              "Adobe Photoshop", "Adobe Illustrator", "Adobe Premiere Pro",
            ],
            worksFor: { "@type": "Organization", name: "Office Inspirations" },
            alumniOf: { "@type": "CollegeOrUniversity", name: "Bath Spa University" },
            address: {
              "@type": "PostalAddress",
              addressLocality: "Dubai",
              addressCountry: "AE",
            },
          }),
        }}
      />

      <RevealMotion />
      <HomeHero cvPath={settings.resumeUrl} />
      <HomeTicker />
      <HomeApproach />
      <HomeWorkIndex projects={projects} />
      <HomeNumbers />
      <HomeAbout
        portraitUrl={settings.portraitUrl}
        chapters={settings.aboutChapters}
        cvPath={settings.resumeUrl}
      />
      <HomeServices />
      <HomeContact
        email={settings.email}
        phone={settings.phone}
        cvPath={settings.resumeUrl}
      />
    </>
  );
}
