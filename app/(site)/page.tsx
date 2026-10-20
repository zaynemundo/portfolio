import type { Metadata } from "next";
import type { Project } from "@/app/lib/projects";
import { getPublishedPosts } from "@/app/lib/posts-db";
import { getPublishedProjectCards, getFeaturedProjectSlugs } from "@/app/lib/projects-db";
import { getSiteSettings } from "@/app/lib/settings-db";
import { ContactSection } from "@/app/components/ContactSection";
import { staticProjects } from "@/app/lib/projects-static";
import { ScrollVideoHero } from "@/app/components/motion/ScrollVideoHero";
import { SectionSnap } from "@/app/components/motion/SectionSnap";
import type { HeroScene } from "@/app/components/motion/ScrollVideoHero";
import { FeaturedWork } from "@/app/components/work/FeaturedWork";
import { AboutStorySection } from "@/app/components/about/AboutStorySection";
import { InsightsSection } from "@/app/components/insights/InsightsSection";
import { SITE_URL } from "@/app/lib/site-url";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/app/lib/seo";

export function generateMetadata(): Metadata {
  return {
    // Absolute: the layout's "%s | Zaira Mundo" template would add the name a second time.
    title: { absolute: SITE_TITLE },
    alternates: { canonical: "/" },
    description: SITE_DESCRIPTION,
  };
}


type ProjectCard = Pick<
  Project,
  "slug" | "name" | "tagline" | "category" | "year" | "technologies" | "role" | "workType"
> & {
  images?: string[];
  imageAlt?: string;
  liveUrl?: string | null;
  theme?: Project["theme"];
  logo?: Project["logo"];
  client?: string;
};

export default async function Home() {
  const allPosts = await getPublishedPosts();
  const insightPosts = allPosts.slice(0, 3);

  const dbProjects = await getPublishedProjectCards();
  const allProjects: ProjectCard[] = (dbProjects.length > 0 ? dbProjects : staticProjects) as ProjectCard[];
  /* Which projects show here is the "Featured" checkbox on each case study
     in the dashboard — falls back to the original 3 while DB is empty. */
  const featuredSlugs = dbProjects.length > 0
    ? new Set(await getFeaturedProjectSlugs())
    : new Set(["monili-jewellers", "scandinavian-physiotherapy-center", "pno-marinas"]);
  const featuredProjects: ProjectCard[] = allProjects.filter((p) => featuredSlugs.has(p.slug));

  const settings = await getSiteSettings();
  const {
    portraitUrl, email, phone, linkedinUrl, githubUrl, name, aboutChapters,
    heroVideoUrl, heroPosterUrl, selectedWorkHeading, selectedWorkIntro,
    insightsHeading, insightsIntro,
  } = settings;
  const cvPath = settings.resumeUrl;
  const heroScenes: HeroScene[] = settings.heroScenes;

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name,
            // The roles people search for, rather than the display title in Settings.
            jobTitle: ["Web Designer", "Web Developer", "UI/UX Designer"],
            description: SITE_DESCRIPTION,
            ...(portraitUrl && { image: new URL(portraitUrl, SITE_URL).href }),
            email,
            url: SITE_URL,
            sameAs: [linkedinUrl, githubUrl].filter(Boolean),
            knowsAbout: [
              "Web Design", "Web Development", "UI/UX Design", "Front-End Development", "E-commerce",
              "React", "TypeScript", "WordPress", "Headless WordPress", "Figma",
              "Web Accessibility (WCAG)", "Technical SEO", "Core Web Vitals",
            ],
            worksFor: { "@type": "Organization", name: "Creativo FZCO" },
            alumniOf: { "@type": "CollegeOrUniversity", name: "Bath Spa University" },
            address: {
              "@type": "PostalAddress",
              addressLocality: "Dubai",
              addressCountry: "AE",
            },
          }),
        }}
      />

      {/* One scroll glides to the next hero scene */}
      <SectionSnap />

      {/* ── 01 · HERO — Scroll-scrubbed video ──────────────────────────────── */}
      <ScrollVideoHero
        videoSrc={heroVideoUrl}
        posterSrc={heroPosterUrl}
        scenes={heroScenes}
      />

      {/* ── 02 · SELECTED WORK ─────────────────────────────────────────────── */}
      <FeaturedWork projects={featuredProjects} heading={selectedWorkHeading} intro={selectedWorkIntro} />

      {/* ── 03 · ABOUT ─────────────────────────────────────────────────────── */}
      <AboutStorySection portraitUrl={portraitUrl} chapters={aboutChapters} />

      {/* ── INSIGHTS ──────────────────────────────────────────────────── */}
      <InsightsSection posts={insightPosts} heading={insightsHeading} intro={insightsIntro} />

      {/* ── CONTACT ───────────────────────────────────────────────────── */}
      <ContactSection
        email={email}
        phone={phone}
        linkedinUrl={linkedinUrl}
        githubUrl={githubUrl}
        cvPath={cvPath}
        portfolioPath={settings.portfolioPdfUrl}
      />
    </>
  );
}
