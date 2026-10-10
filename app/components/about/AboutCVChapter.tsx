"use client";

import { forwardRef } from "react";
import type { CVChapter } from "@/app/data/aboutCVChapters";
import { CapabilityList } from "./CapabilityList";
import { ExperienceTimeline } from "./ExperienceTimeline";
import type { ExpEntry } from "./ExperienceTimeline";
import { ToolsGroups } from "./ToolsGroups";
import type { SkillItem } from "./ToolsGroups";
import { ProfessionalDocuments } from "./ProfessionalDocuments";

const PROFILE_PARAGRAPHS = [
  "I\u2019m a Creative Designer and Front-End Developer focused on building accessible, high-performing websites that balance design quality with business objectives.",
  "With a First Class Honours degree in Creative Computing and over four years of agency experience in the UAE, I translate approved designs into production-ready interfaces \u2014 working across corporate, e-commerce, real estate, and digital agency projects.",
];

const INDUSTRY_SECTORS = [
  "Corporate and professional services",
  "E-commerce and luxury retail",
  "Real estate and hospitality",
  "Business centres and public-facing services",
  "Creative and digital agencies",
];

interface Props {
  chapter: CVChapter;
  index: number;
  isActive: boolean;
  dbExperience: ExpEntry[];
  dbSkills: SkillItem[];
  cvPath: string;
}

/**
 * A single About CV chapter article.
 * Ref is forwarded to the <article> element for IntersectionObserver tracking.
 */
export const AboutCVChapter = forwardRef<HTMLElement, Props>(
  function AboutCVChapter(
    { chapter, index, isActive, dbExperience, dbSkills, cvPath },
    ref,
  ) {
    return (
      <article
        ref={ref}
        id={`about-chapter-${chapter.id}`}
        className={`about-cv__chapter${isActive ? " is-active" : ""}`}
        data-chapter-index={index}
        aria-label={`Chapter ${chapter.number}: ${chapter.label}`}
      >
        <h3 className="about-cv__chapter-title">{chapter.title}</h3>

        {chapter.type === "profile" && (
          <div className="about-cv__chapter-body">
            {PROFILE_PARAGRAPHS.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}

        {chapter.type === "what-i-do" && <CapabilityList />}

        {chapter.type === "experience" && (
          <ExperienceTimeline entries={dbExperience} />
        )}

        {chapter.type === "education-skills" && <ToolsGroups skills={dbSkills} />}

        {chapter.type === "cv" && (
          <>
            <p className="about-cv__chapter-body-text">
              For a more detailed overview of my professional experience, education, and technical skills, download my CV.
            </p>
            <ProfessionalDocuments cvPath={cvPath} />
          </>
        )}
      </article>
    );
  },
);
