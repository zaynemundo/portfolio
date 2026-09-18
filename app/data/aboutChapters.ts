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
  /** Education item for Chapter 04 */
  education?: EducationItem;
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
      "I am a Digital Designer and Developer with over four years of professional experience delivering accessible, standards-compliant digital platforms. I design and build web interfaces that translate organizational intent into reliable, production-grade digital solutions.",
      "My work spans institutional platforms, healthcare portals, luxury e-commerce, and corporate web systems — delivering responsive, WCAG-compliant, and high-performing digital services built for long-term maintainability and diverse global audiences.",
    ],
  },
  {
    id: "what-i-do",
    number: "02",
    label: "What I Do",
    title: "From information architecture to production-ready digital platforms.",
    type: "services",
    portraitState: "capabilities",
    introduction:
      "I deliver web platforms that meet international accessibility and performance standards, serve users consistently across devices and regions, and provide organizations with a sustainable, maintainable digital presence over time.",
    items: [
      "UI/UX Design",
      "Branding & Logo Design",
      "Social Media Graphics",
      "Photo Editing & Retouching",
      "Front-end Development",
      "Responsive Interfaces",
      "WordPress & Shopify",
      "Accessibility & Performance",
      "Technical SEO",
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
        body: "Delivering responsive institutional and corporate web platforms, standards-compliant e-commerce systems, and reusable component libraries across React, WordPress, and Laravel.",
      },
      {
        title: "Ami Digital Marketing FZ. LLC. — Web Developer (2024)",
        body: "Built and maintained WordPress platforms aligned with organizational brand and communications standards, implementing custom front-end solutions and measurable performance improvements.",
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
      award: "Academic Excellence Awardee",
      period: "2019 – 2021",
    },
    skillGroups: [
      {
        category: "Development",
        skills: ["React", "TypeScript", "JavaScript", "HTML5", "CSS3", "PHP", "Next.js", "Laravel"],
      },
      {
        category: "Platforms",
        skills: ["Custom WordPress", "Shopify (Liquid)", "Elementor"],
      },
      {
        category: "Design",
        skills: ["Figma", "UI/UX Design", "Prototyping", "Adobe Creative Suite"],
      },
      {
        category: "Accessibility & Quality",
        skills: ["WCAG 2.1 AA", "Core Web Vitals", "Technical SEO", "Git", "GA4"],
      },
    ],
  },
];
