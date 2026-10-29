import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { aboutChapters as DEFAULT_ABOUT_CHAPTERS, type Chapter } from "@/app/data/aboutChapters";
import { CACHE_TAGS } from "@/app/lib/cache-tags";

export interface HeroSceneData {
  heading: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  start: number;
  end: number;
}

export interface SiteSettingsData {
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  githubUrl: string;
  resumeUrl: string;
  /** Empty until a portfolio PDF is uploaded; the download only shows once set. */
  portfolioPdfUrl: string;
  portraitUrl: string;
  heroVideoUrl: string;
  heroPosterUrl: string;
  heroScenes: HeroSceneData[];
  selectedWorkHeading: string;
  selectedWorkIntro: string;
  aboutChapters: Chapter[];
  insightsHeading: string;
  insightsIntro: string;
  workPageHeading: string;
  workPageIntro: string;
  blogPageHeading: string;
  blogPageIntro: string;
}

const DEFAULT_HERO_SCENES: HeroSceneData[] = [
  {
    heading: "Zaira Mundo",
    description:
      "Creative Designer and Front-End Developer designing and shipping websites, e-commerce platforms, and digital campaigns for UAE brands — from Figma to production in React/TypeScript, headless WordPress, and Laravel/Vue.",
    start: 0,
    end: 0.28,
  },
  {
    heading: "Websites that work as hard as they look",
    description:
      "Institutional platforms, healthcare portals, and commercial digital services — designed and engineered to international accessibility standards, optimised for performance, and built for long-term organizational use.",
    start: 0.26,
    end: 0.52,
  },
  {
    heading: "Let’s build something that lasts.",
    ctaLabel: "Get in touch",
    ctaHref: "#contact",
    start: 0.72,
    end: 0.9,
  },
];

/** Falls back to the original hardcoded values if the DB row is missing/unset. */
const DEFAULTS: SiteSettingsData = {
  name: "Zaira Mundo",
  jobTitle: "Creative Designer & Front-End Developer",
  email: "mzaira.mundo@gmail.com",
  phone: "+971 50 562 8417",
  linkedinUrl: "https://linkedin.com/in/zaira-mundo/",
  githubUrl: "https://github.com/mzaira",
  resumeUrl: "/docs/zaira-mundo-cv.pdf",
  portfolioPdfUrl: "",
  portraitUrl: "/portrait.jpg",
  heroVideoUrl: "/hero-banner-scroll.mp4",
  heroPosterUrl: "/hero-poster.jpg",
  heroScenes: DEFAULT_HERO_SCENES,
  selectedWorkHeading: "Selected Work",
  selectedWorkIntro:
    "A selection of digital platforms delivered across institutional, healthcare, and commercial sectors — where accessibility standards, information clarity, and long-term technical sustainability were central to every engagement.",
  aboutChapters: DEFAULT_ABOUT_CHAPTERS,
  insightsHeading: "Perspectives on accessible, standards-compliant digital platforms.",
  insightsIntro:
    "Perspectives on web accessibility, technical performance, information architecture, front-end implementation, and the standards-based systems behind reliable, inclusive digital services.",
  workPageHeading: "Selected Work",
  workPageIntro:
    "A collection of front-end engineering, custom e-commerce storefronts, corporate web builds, and technical performance optimizations.",
  blogPageHeading: "Insights",
  blogPageIntro: "Thoughts on front-end development, technical SEO, accessibility, and building for the web.",
};

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettingsData> => fetchSiteSettings(),
  ["site-settings"],
  { tags: [CACHE_TAGS.settings], revalidate: 60 }
);

async function fetchSiteSettings(): Promise<SiteSettingsData> {
  const row = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (!row) return DEFAULTS;

  const heroScenes = Array.isArray(row.heroScenes) && row.heroScenes.length > 0
    ? (row.heroScenes as unknown as HeroSceneData[])
    : DEFAULTS.heroScenes;

  const chapters = Array.isArray(row.aboutChapters) && row.aboutChapters.length > 0
    ? (row.aboutChapters as unknown as Chapter[])
    : DEFAULTS.aboutChapters;

  return {
    name: row.name || DEFAULTS.name,
    jobTitle: row.jobTitle || DEFAULTS.jobTitle,
    email: row.email || DEFAULTS.email,
    phone: row.phone || DEFAULTS.phone,
    linkedinUrl: row.linkedinUrl || DEFAULTS.linkedinUrl,
    githubUrl: row.githubUrl || DEFAULTS.githubUrl,
    resumeUrl: row.resumeUrl || DEFAULTS.resumeUrl,
    portfolioPdfUrl: row.portfolioPdfUrl || DEFAULTS.portfolioPdfUrl,
    portraitUrl: row.portraitUrl || DEFAULTS.portraitUrl,
    heroVideoUrl: row.heroVideoUrl || DEFAULTS.heroVideoUrl,
    heroPosterUrl: row.heroPosterUrl || DEFAULTS.heroPosterUrl,
    heroScenes,
    selectedWorkHeading: row.selectedWorkHeading || DEFAULTS.selectedWorkHeading,
    selectedWorkIntro: row.selectedWorkIntro || DEFAULTS.selectedWorkIntro,
    aboutChapters: chapters,
    insightsHeading: row.insightsHeading || DEFAULTS.insightsHeading,
    insightsIntro: row.insightsIntro || DEFAULTS.insightsIntro,
    workPageHeading: row.workPageHeading || DEFAULTS.workPageHeading,
    workPageIntro: row.workPageIntro || DEFAULTS.workPageIntro,
    blogPageHeading: row.blogPageHeading || DEFAULTS.blogPageHeading,
    blogPageIntro: row.blogPageIntro || DEFAULTS.blogPageIntro,
  };
}
