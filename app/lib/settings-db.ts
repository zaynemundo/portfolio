import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { aboutChapters as DEFAULT_ABOUT_CHAPTERS, type Chapter } from "@/app/data/aboutChapters";
import { heroScenes as DEFAULT_HERO_SCENES, type HeroSceneData } from "@/app/data/heroScenes";
import { CACHE_TAGS } from "@/app/lib/cache-tags";

export type { HeroSceneData };

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

/** Falls back to the original hardcoded values if the DB row is missing/unset. */
const DEFAULTS: SiteSettingsData = {
  name: "Zayne Mundo",
  jobTitle: "Graphic Designer & Web Developer",
  email: "zayne.mayo@gmail.com",
  phone: "+971 50 805 9968",
  linkedinUrl: "",
  githubUrl: "",
  resumeUrl: "/docs/zayne-mundo-cv.pdf",
  portfolioPdfUrl: "",
  portraitUrl: "/portrait.jpg",
  heroVideoUrl: "/hero-banner-scroll.mp4",
  heroPosterUrl: "/hero-poster.jpg",
  heroScenes: DEFAULT_HERO_SCENES,
  selectedWorkHeading: "Selected Work",
  selectedWorkIntro:
    "A selection of brand systems, campaign visuals, and digital platforms across luxury e-commerce, healthcare, marine, real estate, and sports — where visual craft meets measured growth.",
  aboutChapters: DEFAULT_ABOUT_CHAPTERS,
  insightsHeading: "Notes on design, growth, and building for the web.",
  insightsIntro:
    "Notes on visual design, illustration, social growth, SEO, and the craft of building websites that hold their own.",
  workPageHeading: "Selected Work",
  workPageIntro:
    "A collection of graphic design, 2D illustration, campaign visuals, and website builds — each one taken from brief to measurable result.",
  blogPageHeading: "Insights",
  blogPageIntro:
    "Notes on design, social growth, illustration, and the web.",
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
