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
import { Section, SectionStack } from "@/app/(admin)/_components/Section";
import { tabBarClass, tabClass } from "@/app/(admin)/_components/ui/Card";

type Tab = "profile" | "services" | "experience" | "education";

const TABS: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "services", label: "Services" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
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
      <PageHeader title="About" subtitle="Who you are: everything that feeds the About section of the homepage." secondaryHref="/#about" secondaryLabel="View on site" secondaryNewTab />

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
        <SectionStack>
          <SettingsForm initial={settings} />
          <Section title="CV and portfolio" description="Uploads go live straight away." card={false}>
            <div className="grid sm:grid-cols-2 gap-4 items-start">
              <FileUploadCard title="Resume / CV" description="PDF" currentUrl={settings.resumeUrl} accept="application/pdf" kind="resume" />
              <FileUploadCard title="Portfolio" description="PDF" currentUrl={settings.portfolioPdfUrl} accept="application/pdf" kind="portfolio" />
            </div>
          </Section>
          <ProfileForm chapter={profile} />
        </SectionStack>
      )}
      {tab === "services" && <ServicesForm chapter={services} />}
      {tab === "experience" && <ExperienceForm chapter={experience} />}
      {tab === "education" && (
        <SectionStack>
          <EducationForm chapter={education} />
        </SectionStack>
      )}
    </div>
  );
}
