"use client";

import { useState } from "react";
import type { Chapter } from "@/app/data/aboutChapters";
import type { SiteSettingsData } from "@/app/lib/settings-db";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { SettingsForm } from "./SettingsForm";
import { FileUploadCard } from "./FileUploadCard";
import { ProfileForm } from "./ProfileForm";
import { ServicesForm } from "./ServicesForm";
import { ExperienceForm } from "./ExperienceForm";
import { EducationForm } from "./EducationForm";
import { tabBarClass, tabClass } from "@/app/(admin)/_components/ui/Card";

type Tab = "profile" | "services" | "experience" | "education";

const TABS: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "services", label: "What I Do" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education & Skills" },
];

interface Props {
  settings: SiteSettingsData;
  profile: Chapter;
  services: Chapter;
  experience: Chapter;
  education: Chapter;
}

/**
 * Everything about "who you are" in one page: identity/contact info and
 * downloadable assets (formerly the standalone Site Settings page), plus
 * bio, Experience, Education & Skills, and What I Do (formerly Homepage's
 * "About" tab + a separate CV page). All of it feeds the same "About"
 * section on the public site, so editing it across three disconnected
 * admin pages felt wrong — merged 2026-09-30.
 */
export function AboutTabs({ settings, profile, services, experience, education }: Props) {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div>
      <PageHeader title="About" subtitle="Your identity, contact info, bio, experience, education & skills, and what you do — all feed the About section on the homepage." />

      <div className={tabBarClass} role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            role="tab"
            aria-selected={tab === t.id}
            className={tabClass(tab === t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
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
          <ProfileForm chapter={profile} />
        </div>
      )}
      {tab === "services" && <ServicesForm chapter={services} />}
      {tab === "experience" && <ExperienceForm chapter={experience} />}
      {tab === "education" && <EducationForm chapter={education} />}
    </div>
  );
}
