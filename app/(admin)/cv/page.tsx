import { getSiteSettings } from "@/app/lib/settings-db";
import { aboutChapters as DEFAULT_CHAPTERS } from "@/app/data/aboutChapters";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { CvTabs } from "./CvTabs";

function findChapter(chapters: typeof DEFAULT_CHAPTERS, id: string) {
  return chapters.find((c) => c.id === id) ?? DEFAULT_CHAPTERS.find((c) => c.id === id)!;
}

export default async function CvPage() {
  const { aboutChapters } = await getSiteSettings();

  return (
    <div className="max-w-4xl">
      <PageHeader title="CV" subtitle="What you do, your experience, and your education & skills — this feeds the About section on the homepage." />

      <CvTabs
        services={findChapter(aboutChapters, "what-i-do")}
        experience={findChapter(aboutChapters, "experience")}
        education={findChapter(aboutChapters, "education-skills")}
      />
    </div>
  );
}
