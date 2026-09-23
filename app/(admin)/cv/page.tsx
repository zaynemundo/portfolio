import { getSiteSettings } from "@/app/lib/settings-db";
import { aboutChapters as DEFAULT_CHAPTERS } from "@/app/data/aboutChapters";
import { CvTabs } from "./CvTabs";

function findChapter(chapters: typeof DEFAULT_CHAPTERS, id: string) {
  return chapters.find((c) => c.id === id) ?? DEFAULT_CHAPTERS.find((c) => c.id === id)!;
}

export default async function CvPage() {
  const { aboutChapters } = await getSiteSettings();

  return (
    <div className="max-w-2xl">
      <h1 className="text-[22px] font-semibold text-zinc-100 mb-1">CV</h1>
      <p className="text-[13px] text-zinc-500 mb-6">
        What you do, your experience, and your education &amp; skills — this feeds the About section on the homepage.
      </p>

      <CvTabs
        services={findChapter(aboutChapters, "what-i-do")}
        experience={findChapter(aboutChapters, "experience")}
        education={findChapter(aboutChapters, "education-skills")}
      />
    </div>
  );
}
