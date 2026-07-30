import type { Metadata } from "next";
import type { Project } from "@/app/lib/projects";
import { posts } from "@/app/lib/posts";
import { prisma } from "@/app/lib/prisma";
import { ContactSection } from "@/app/components/ContactSection";
import { staticProjects } from "@/app/lib/projects-static";
import { ScrollVideoHero } from "@/app/components/motion/ScrollVideoHero";
import type { HeroScene } from "@/app/components/motion/ScrollVideoHero";
import { FeaturedWork } from "@/app/components/work/FeaturedWork";
import { AboutStorySection } from "@/app/components/about/AboutStorySection";
import { InsightsSection } from "@/app/components/insights/InsightsSection";
import { ClientLogos } from "@/app/components/ClientLogos";

export const metadata: Metadata = {
  title: "Zaira Mundo | Web Developer & Digital Experience Specialist",
  description:
    "Web Developer and Digital Experience Specialist building accessible, responsive, and high-performing websites across React, Next.js, WordPress, and modern web technologies.",
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
  /* ── Data fetching ─────────────────────────────────────────────────────── */

  // Latest 3 published blog posts
  let insightPosts: PostSummary[];
  try {
    const db = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { date: "desc" },
      take: 3,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        date: true,
        dateFormatted: true,
        readTime: true,
        category: true,
      },
    });
    insightPosts = db.length > 0 ? db : (posts.slice(0, 3) as PostSummary[]);
  } catch {
    insightPosts = posts.slice(0, 3) as PostSummary[];
  }

  // Featured projects — DB first, static fallback when DB is empty or unreachable.
  // STATIC FALLBACK: once /admin/projects is populated, the DB rows take over
  // automatically. Remove this comment (and the fallback lines) when you no
  // longer need it.
  let featuredProjects: ProjectCard[] = [];
  try {
    const db = await prisma.project.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      take: 4,
      select: {
        slug: true,
        name: true,
        tagline: true,
        category: true,
        year: true,
        technologies: true,
        role: true,
        workType: true,
        images: true,
        imageAlt: true,
        liveUrl: true,
        richContentJson: true,
      },
    });
    featuredProjects = db.map(({ richContentJson, ...p }) => ({
      ...p,
      ...((richContentJson ? JSON.parse(richContentJson) : {}) as Partial<ProjectCard>),
    }));
  } catch {
    /* DB unreachable — fall through to static data below */
  }

  // Curated 3 featured projects for homepage
  const HOMEPAGE_SLUGS = ["monili-jewellers", "scandinavian-physio", "po-marinas"];
  if (featuredProjects.length === 0) {
    featuredProjects = staticProjects
      .filter((p) => HOMEPAGE_SLUGS.includes(p.slug))
      .sort((a, b) => HOMEPAGE_SLUGS.indexOf(a.slug) - HOMEPAGE_SLUGS.indexOf(b.slug)) as ProjectCard[];
  } else {
    featuredProjects = featuredProjects
      .filter((p) => HOMEPAGE_SLUGS.includes(p.slug))
      .sort((a, b) => HOMEPAGE_SLUGS.indexOf(a.slug) - HOMEPAGE_SLUGS.indexOf(b.slug));
  }

  // Site settings
  let siteSettings: Awaited<ReturnType<typeof prisma.siteSettings.findUnique>> = null;
  try {
    siteSettings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  } catch {
    /* static */
  }

  const portraitUrl = siteSettings?.portraitUrl ?? null;
  const cvPath = siteSettings?.cvPath ?? "/docs/zaira-mundo-cv.pdf";
  const aboutText = siteSettings?.aboutText ?? null;
  const email = siteSettings?.email ?? "mzaira.mundo@gmail.com";
  const phone = siteSettings?.phone ?? "+971 50 562 8417";
  const linkedinUrl = siteSettings?.linkedinUrl ?? "https://linkedin.com/in/zaira-mundo/";
  const githubUrl = siteSettings?.githubUrl ?? "https://github.com/mzaira";

  /* ── Hero scenes ───────────────────────────────────────────────────────── */
  const heroScenes: HeroScene[] = [
    {
      heading: "Zaira Mundo",
      description:
        "Web Developer and Digital Communications Specialist building standards-compliant, accessible digital platforms for institutional, commercial, and global audiences \u2014 across React, WordPress, Shopify, and custom systems.",
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
            jobTitle: "Web Developer & Digital Experience Specialist",
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
