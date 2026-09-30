import { getSiteSettings } from "@/app/lib/settings-db";
import { aboutChapters as DEFAULT_CHAPTERS } from "@/app/data/aboutChapters";
import { AboutTabs } from "./AboutTabs";

function findChapter(chapters: typeof DEFAULT_CHAPTERS, id: string) {
  return chapters.find((c) => c.id === id) ?? DEFAULT_CHAPTERS.find((c) => c.id === id)!;
}

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <AboutTabs
      settings={settings}
      profile={findChapter(settings.aboutChapters, "profile")}
      services={findChapter(settings.aboutChapters, "what-i-do")}
      experience={findChapter(settings.aboutChapters, "experience")}
      education={findChapter(settings.aboutChapters, "education-skills")}
    />
  );
}
