"use client";

import { useState } from "react";
import type { Chapter } from "@/app/data/aboutChapters";
import { ServicesForm } from "./ServicesForm";
import { ExperienceForm } from "./ExperienceForm";
import { EducationForm } from "./EducationForm";

type Tab = "services" | "experience" | "education";

const TABS: { id: Tab; label: string }[] = [
  { id: "services", label: "What I Do" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education & Skills" },
];

interface Props {
  services: Chapter;
  experience: Chapter;
  education: Chapter;
}

/** CV content shown in three tabs instead of one long scrolling page. */
export function CvTabs({ services, experience, education }: Props) {
  const [tab, setTab] = useState<Tab>("services");

  return (
    <div>
      <div className="flex items-center gap-1 mb-6 border-b border-border">
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

      {tab === "services" && <ServicesForm chapter={services} />}
      {tab === "experience" && <ExperienceForm chapter={experience} />}
      {tab === "education" && <EducationForm chapter={education} />}
    </div>
  );
}
