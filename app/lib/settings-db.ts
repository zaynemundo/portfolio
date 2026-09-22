import { prisma } from "@/app/lib/prisma";

export interface SiteSettingsData {
  email: string;
  phone: string;
  linkedinUrl: string;
  githubUrl: string;
  resumeUrl: string;
  portraitUrl: string;
}

/** Falls back to the original hardcoded values if the DB row is missing/unset. */
const DEFAULTS: SiteSettingsData = {
  email: "mzaira.mundo@gmail.com",
  phone: "+971 50 562 8417",
  linkedinUrl: "https://linkedin.com/in/zaira-mundo/",
  githubUrl: "https://github.com/mzaira",
  resumeUrl: "/docs/zaira-mundo-cv.pdf",
  portraitUrl: "/portrait.jpg",
};

export async function getSiteSettings(): Promise<SiteSettingsData> {
  const row = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (!row) return DEFAULTS;
  return {
    email: row.email || DEFAULTS.email,
    phone: row.phone || DEFAULTS.phone,
    linkedinUrl: row.linkedinUrl || DEFAULTS.linkedinUrl,
    githubUrl: row.githubUrl || DEFAULTS.githubUrl,
    resumeUrl: row.resumeUrl || DEFAULTS.resumeUrl,
    portraitUrl: row.portraitUrl || DEFAULTS.portraitUrl,
  };
}
