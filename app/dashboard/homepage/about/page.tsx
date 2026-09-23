import { getSiteSettings } from "@/app/lib/settings-db";
import { aboutChapters as DEFAULT_CHAPTERS } from "@/app/data/aboutChapters";
import { HomepageSubNav } from "../HomepageSubNav";
import { ProfileForm } from "./ProfileForm";
import { ServicesForm } from "./ServicesForm";
import { ExperienceForm } from "./ExperienceForm";
import { EducationForm } from "./EducationForm";

function findChapter(chapters: typeof DEFAULT_CHAPTERS, id: string) {
  return chapters.find((c) => c.id === id) ?? DEFAULT_CHAPTERS.find((c) => c.id === id)!;
}

export default async function AboutPage() {
  const { aboutChapters } = await getSiteSettings();

  const profile = findChapter(aboutChapters, "profile");
  const services = findChapter(aboutChapters, "what-i-do");
  const experience = findChapter(aboutChapters, "experience");
  const education = findChapter(aboutChapters, "education-skills");

  return (
    <div className="max-w-2xl">
      <h1 className="text-[22px] font-semibold text-zinc-100 mb-1">Homepage</h1>
      <p className="text-[13px] text-zinc-500 mb-6">The four chapters of the scroll-driven About section.</p>
      <HomepageSubNav />

      <div className="space-y-8">
        <ProfileForm chapter={profile} />
        <ServicesForm chapter={services} />
        <ExperienceForm chapter={experience} />
        <EducationForm chapter={education} />
      </div>
    </div>
  );
}
