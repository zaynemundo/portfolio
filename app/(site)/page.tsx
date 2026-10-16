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

export async function generateMetadata(): Promise<Metadata> {
  const { name, jobTitle } = await getSiteSettings();
  return {
    title: `${name} | ${jobTitle}`,
    alternates: { canonical: "/" },
    description:
      "Creative Designer and Front-End Developer building accessible, responsive, and high-performing websites — from interface design through to production code — across React, Next.js, WordPress, and modern web technologies.",
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
    portraitUrl, email, phone, linkedinUrl, githubUrl, name, jobTitle, aboutChapters,
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
            jobTitle,
            email,
            url: SITE_URL,
            sameAs: [linkedinUrl, githubUrl],
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
