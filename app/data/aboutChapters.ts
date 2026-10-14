/* ── About chapter data ────────────────────────────────────────────────────
 * Edit copy here. To add / remove a chapter, add / remove an entry and
 * adjust the chapter numbers (01–05). The section auto-counts from this array.
 * ────────────────────────────────────────────────────────────────────────── */

export type ChapterType =
  | "text"
  | "services"
  | "principles"
  | "education-skills";

export interface Principle {
  title: string;
  body: string;
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  honours?: string;
  award?: string;
  period: string;
}

export interface Certificate {
  name: string;
  issuer: string;
  year?: string;
  /** Where the certificate can be checked (optional). */
  url?: string;
}

export interface Chapter {
  id: string;
  number: string;
  label: string;
  title: string;
  type: ChapterType;
  portraitState: "profile" | "capabilities" | "experience" | "tools" | "documents";
  /** Body paragraphs */
  paragraphs?: string[];
  /** Short intro before a list */
  introduction?: string;
  /** List items (services) */
  items?: string[];
  /** Experience principles / roles */
  principles?: Principle[];
  /** The first degree; kept for chapters saved before educationList existed. */
  education?: EducationItem;
  /** Every degree for Chapter 04, most recent first */
  educationList?: EducationItem[];
  /** Certificates for Chapter 04 */
  certificates?: Certificate[];
  /** Skill groups for Chapter 04 */
  skillGroups?: SkillGroup[];
  /** Download URL for Chapter 05 CV */
  cvPath?: string;
}

export const aboutChapters: Chapter[] = [
  {
    id: "profile",
    number: "01",
    label: "Profile",
    title: "Design-informed. Standards-compliant. Delivery-focused.",
    type: "text",
    portraitState: "profile",
    paragraphs: [
      "I am a web designer and front-end developer with five years of experience designing and shipping websites, e-commerce platforms, and digital campaigns for UAE brands, including P&O Marinas, DP World, and Abu Dhabi Investment Office.",
      "I work from Figma to production in React/TypeScript, headless WordPress, and Laravel/Vue, and lead most client projects day to day — scoping with clients, coordinating backend work, and owning delivery.",
    ],
  },
  {
    id: "what-i-do",
    number: "02",
    label: "What I Do",
    title: "From Figma to production — design, development, and delivery.",
    type: "services",
    portraitState: "capabilities",
    introduction:
      "I design and build websites and e-commerce platforms end to end, improve their performance and search visibility, and produce the campaign content around them — landing pages, coded HTML newsletters, social graphics, and reels.",
    items: [
      "UI/UX Design",
      "Branding & Logo Design",
      "Photo Editing & Retouching",
      "Front-end Development",
      "Headless WordPress",
      "E-commerce Platforms",
      "Project Leadership",
      "Technical SEO & Performance",
      "Accessibility (WCAG)",
      "Email & Newsletter Design",
      "Social Media Visuals & Reels",
    ],
  },
  {
    id: "experience",
    number: "03",
    label: "Experience",
    title: "Experience",
    type: "principles",
    portraitState: "experience",
    principles: [
      {
        title: "Creativo FZCO — Web Designer (2021 – Present)",
        body: "UI design, front-end development, and project leadership across the agency's client accounts. Shipped 10+ websites from Figma to production — including e-commerce platforms — for clients in maritime, logistics, government, real estate, retail, and healthcare, building headless WordPress sites with React/TypeScript front ends and custom features such as the interactive berth-management map for P&O Marinas and the filterable cruise schedule for DP World Cruise Terminal.",
      },
      {
        title: "Ami Digital Marketing FZ-LLC — Web Developer, Part-Time (2024)",
        body: "Built and updated WordPress/Elementor sites to the company's brand guidelines, wrote custom CSS for consistent, responsive layouts across mobile and desktop, and debugged performance issues on tight timelines.",
      },
    ],
  },
  {
    id: "education-skills",
    number: "04",
    label: "Education & Skills",
    title: "Education & Skills",
    type: "education-skills",
    portraitState: "tools",
    education: {
      degree: "BSc (Hons) Creative Computing",
      institution: "Bath Spa University",
      honours: "First Class Honours",
      award: "Academic Excellence Award",
      period: "2019 – 2021",
    },
    skillGroups: [
      {
        category: "Front-End",
        skills: ["React", "TypeScript", "JavaScript", "HTML5", "CSS3", "Vue.js", "Headless WordPress", "Laravel", "PHP", "MySQL", "Git"],
      },
      {
        category: "Design & UX",
        skills: ["UI/UX Design", "Wireframing", "Prototyping", "Responsive Layouts", "Interactive Interfaces", "Brand Identity"],
      },
      {
        category: "Optimisation",
        skills: ["Technical SEO", "Core Web Vitals", "Accessibility (WCAG)", "Performance Debugging", "Google Analytics"],
      },
      {
        category: "Content",
        skills: ["Graphic Design", "Social Media Visuals", "Video Editing", "Email & Newsletter Design"],
      },
      {
        category: "Tools",
        skills: ["Figma", "Adobe XD", "Photoshop", "Illustrator", "Premiere Pro", "Canva", "AWeber", "VS Code"],
      },
    ],
  },
];

/** A chapter's degrees, whether it was saved with one or with a list. */
export function educationOf(chapter: Chapter): EducationItem[] {
  return chapter.educationList ?? (chapter.education ? [chapter.education] : []);
}
