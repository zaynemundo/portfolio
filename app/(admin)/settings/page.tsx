import Link from "next/link";
import { getSiteSettings } from "@/app/lib/settings-db";
import { aboutChapters as DEFAULT_CHAPTERS } from "@/app/data/aboutChapters";
import { SettingsForm } from "./SettingsForm";
import { FileUploadCard } from "./FileUploadCard";
import { ServicesForm } from "./ServicesForm";
import { ExperienceForm } from "./ExperienceForm";
import { EducationForm } from "./EducationForm";
import { routes } from "@/app/(admin)/_routes";

function findChapter(chapters: typeof DEFAULT_CHAPTERS, id: string) {
  return chapters.find((c) => c.id === id) ?? DEFAULT_CHAPTERS.find((c) => c.id === id)!;
}

export default async function SettingsPage() {
  const settings = await getSiteSettings();
  const services = findChapter(settings.aboutChapters, "what-i-do");
  const experience = findChapter(settings.aboutChapters, "experience");
  const education = findChapter(settings.aboutChapters, "education-skills");

  return (
    <div className="max-w-2xl">
      <h1 className="text-[22px] font-semibold text-zinc-100 mb-1">CV &amp; Site Settings</h1>
      <p className="text-[13px] text-zinc-500 mb-8">
        Your name, contact info, resume, and CV content (what you do, experience, education &amp; skills) — all
        shown across the public site. Homepage hero/selected-work/about-intro/insights copy lives under{" "}
        <Link href={routes.homepage} className="text-purple-400 hover:text-purple-300">Homepage</Link> instead.
      </p>

      <div className="space-y-8">
        <SettingsForm initial={settings} />

        <div className="grid grid-cols-2 gap-4">
          <FileUploadCard
            title="Resume / CV"
            description="PDF, shown on the Resume download link"
            currentUrl={settings.resumeUrl}
            accept="application/pdf"
            kind="resume"
          />
          <FileUploadCard
            title="Portrait photo"
            description="JPG, PNG, or WebP, used in the About section"
            currentUrl={settings.portraitUrl}
            accept="image/jpeg,image/png,image/webp"
            kind="portrait"
          />
        </div>

        <ServicesForm chapter={services} />
        <ExperienceForm chapter={experience} />
        <EducationForm chapter={education} />
      </div>
    </div>
  );
}
