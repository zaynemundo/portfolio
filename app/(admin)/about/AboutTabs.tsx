"use client";

import { useState } from "react";
import Link from "next/link";
import type { Chapter } from "@/app/data/aboutChapters";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { routes } from "@/app/(admin)/_routes";
import { ProfileForm } from "./ProfileForm";
import { ServicesForm } from "./ServicesForm";
import { ExperienceForm } from "./ExperienceForm";
import { EducationForm } from "./EducationForm";

type Tab = "profile" | "services" | "experience" | "education";

const TABS: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "services", label: "What I Do" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education & Skills" },
];

interface Props {
  profile: Chapter;
  services: Chapter;
  experience: Chapter;
  education: Chapter;
}

/**
 * Profile bio + Experience + Education & Skills + What I Do, all in one
 * page — this used to be split across Homepage's "About" tab (Profile)
 * and a separate CV page (the other three), even though all four feed the
 * same "About" section on the public site. Merged 2026-09-30 since editing
 * one narrative across two disconnected admin pages felt wrong.
 */
export function AboutTabs({ profile, services, experience, education }: Props) {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div>
      <PageHeader title="About" subtitle="Your bio, experience, education & skills, and what you do — all feed the About section on the homepage." />

      <div className="flex items-center gap-1 mb-8 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="space-y-8">
          <ProfileForm chapter={profile} />
          <p className="text-[12.5px] text-muted-foreground rounded-lg border border-dashed border-border px-4 py-3">
            Your portrait photo and resume PDF are uploaded on{" "}
            <Link href={routes.settings} className="text-primary hover:text-primary">Site Settings</Link>, not here.
          </p>
        </div>
      )}
      {tab === "services" && <ServicesForm chapter={services} />}
      {tab === "experience" && <ExperienceForm chapter={experience} />}
      {tab === "education" && <EducationForm chapter={education} />}
    </div>
  );
}
