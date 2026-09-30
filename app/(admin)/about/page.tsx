import { getSiteSettings } from "@/app/lib/settings-db";
import { aboutChapters as DEFAULT_CHAPTERS } from "@/app/data/aboutChapters";
import { AboutTabs } from "./AboutTabs";

function findChapter(chapters: typeof DEFAULT_CHAPTERS, id: string) {
  return chapters.find((c) => c.id === id) ?? DEFAULT_CHAPTERS.find((c) => c.id === id)!;
}

export default async function AboutPage() {
  const { aboutChapters } = await getSiteSettings();

  return (
    <AboutTabs
      profile={findChapter(aboutChapters, "profile")}
      services={findChapter(aboutChapters, "what-i-do")}
      experience={findChapter(aboutChapters, "experience")}
      education={findChapter(aboutChapters, "education-skills")}
    />
  );
}
