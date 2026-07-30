/* ── About CV chapter metadata ──────────────────────────────────────────────
 * Six chapters that drive the scroll-driven About & Experience section.
 * Content that varies per chapter (experience list, tools, etc.) is passed
 * as props from the parent server component — not stored here.
 * ─────────────────────────────────────────────────────────────────────────── */

export type CVChapterType =
  | "profile"
  | "what-i-do"
  | "experience"
  | "education-skills"
  | "cv";

export interface CVChapter {
  id: string;
  number: string;
  label: string;
  title: string;
  type: CVChapterType;
  portraitState: string;
}

export const aboutCVChapters: CVChapter[] = [
  {
    id: "profile",
    number: "01",
    label: "Profile",
    title: "Design-trained. Code-fluent. Production-focused.",
    type: "profile",
    portraitState: "profile",
  },
  {
    id: "what-i-do",
    number: "02",
    label: "What I Do",
    title: "From approved design to production-ready websites.",
    type: "what-i-do",
    portraitState: "capabilities",
  },
  {
    id: "experience",
    number: "03",
    label: "Experience",
    title: "Experience",
    type: "experience",
    portraitState: "experience",
  },
  {
    id: "education-skills",
    number: "04",
    label: "Education & Skills",
    title: "Education & Skills",
    type: "education-skills",
    portraitState: "tools",
  },
  {
    id: "cv",
    number: "05",
    label: "Curriculum Vitae",
    title: "Curriculum Vitae",
    type: "cv",
    portraitState: "documents",
  },
];
