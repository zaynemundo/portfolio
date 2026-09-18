import type { Metadata } from "next";
import type { Project } from "@/app/lib/projects";
import { posts } from "@/app/lib/posts";
import { ContactSection } from "@/app/components/ContactSection";
import { staticProjects } from "@/app/lib/projects-static";
import { ScrollVideoHero } from "@/app/components/motion/ScrollVideoHero";
import type { HeroScene } from "@/app/components/motion/ScrollVideoHero";
import { FeaturedWork } from "@/app/components/work/FeaturedWork";
import { AboutStorySection } from "@/app/components/about/AboutStorySection";
import { InsightsSection } from "@/app/components/insights/InsightsSection";
import { ClientLogos } from "@/app/components/ClientLogos";

export const metadata: Metadata = {
  title: "Zaira Mundo | Digital Designer & Developer",
  description:
    "Digital Designer and Developer building accessible, responsive, and high-performing websites — from interface design through to production code — across React, Next.js, WordPress, and modern web technologies.",
};


type PostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  dateFormatted: string;
  readTime: string;
  category: string;
};
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
  const insightPosts: PostSummary[] = posts.slice(0, 3) as PostSummary[];

  const HOMEPAGE_SLUGS = ["monili-jewellers", "scandinavian-physio", "po-marinas"];
  const featuredProjects: ProjectCard[] = staticProjects
    .filter((p) => HOMEPAGE_SLUGS.includes(p.slug))
    .sort((a, b) => HOMEPAGE_SLUGS.indexOf(a.slug) - HOMEPAGE_SLUGS.indexOf(b.slug)) as ProjectCard[];

  const portraitUrl = null;
  const cvPath = "/docs/zaira-mundo-cv.pdf";
  const email = "mzaira.mundo@gmail.com";
  const phone = "+971 50 562 8417";
  const linkedinUrl = "https://linkedin.com/in/zaira-mundo/";
  const githubUrl = "https://github.com/mzaira";

  /* ── Hero scenes ───────────────────────────────────────────────────────── */
  const heroScenes: HeroScene[] = [
    {
      heading: "Zaira Mundo",
      description:
        "Digital Designer and Developer building standards-compliant, accessible digital platforms for institutional, commercial, and global audiences \u2014 across React, WordPress, Shopify, and custom systems.",
      start: 0,
      end: 0.28,
    },
    {
      heading: "Websites that work as hard as they look",
      description:
        "Institutional platforms, healthcare portals, and commercial digital services \u2014 engineered to international accessibility standards, optimised for performance, and built for long-term organizational use.",
      start: 0.26,
      end: 0.52,
    },
    {
      heading: "Every detail is a decision",
      description:
        "WCAG 2.1 AA compliance. Sub-second load times. Semantic information architecture. The technical rigour that makes digital platforms trustworthy, inclusive, and fit for diverse, global audiences.",
      start: 0.50,
      end: 0.74,
    },
    {
      heading: "Let\u2019s build something that lasts.",
      ctaLabel: "Get in touch",
      ctaHref: "#contact",
      start: 0.72,
      end: 0.90,
    },
  ];

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: "Zaira Mundo",
            jobTitle: "Digital Designer & Developer",
            email: "mzaira.mundo@gmail.com",
            url: "https://zairamundo.com",
            sameAs: [
              "https://linkedin.com/in/zaira-mundo/",
              "https://github.com/mzaira",
            ],
            address: {
              "@type": "PostalAddress",
              addressLocality: "Dubai",
              addressCountry: "AE",
            },
          }),
        }}
      />

      {/* ── 01 · HERO — Scroll-scrubbed video ──────────────────────────────── */}
      <ScrollVideoHero
        videoSrc="/hero-banner-scroll.mp4"
        posterSrc="/hero-poster.jpg"
        scenes={heroScenes}
      />

      {/* ── 02 · SELECTED WORK ─────────────────────────────────────────────── */}
      <FeaturedWork projects={featuredProjects} />

      {/* ── 03 · ABOUT ─────────────────────────────────────────────────────── */}
      <AboutStorySection portraitUrl={portraitUrl} />

      {/* ── INSIGHTS ──────────────────────────────────────────────────── */}
      <InsightsSection posts={insightPosts} />

      {/* ── CONTACT ───────────────────────────────────────────────────── */}
      <ContactSection
        email={email}
        phone={phone}
        linkedinUrl={linkedinUrl}
        githubUrl={githubUrl}
        cvPath={cvPath}
      />
    </>
  );
}
