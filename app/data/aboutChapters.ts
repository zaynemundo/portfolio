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
    title: "Designer of brands. Builder of websites.",
    type: "text",
    portraitState: "profile",
    paragraphs: [
      "I am a graphic designer and web developer based in the UAE. I design the visual side of a brand — identities, 2D illustration, mockups, social campaigns — and I build the websites that hold it together, in HTML5, CSS3, JavaScript, PHP, and WordPress.",
      "I am currently a graphic designer at Office Inspirations, where the work has grown account visibility by 640% and website visibility by 146%, and lifted follower-driven engagement from 35% to 68%. My approach is straightforward: understand the audience, design for the platform the work will live on, then follow the analytics so the work earns attention — and turns that attention into leads.",
    ],
  },
  {
    id: "what-i-do",
    number: "02",
    label: "What I Do",
    title: "Brand visuals, websites, and campaigns — from first sketch to launch.",
    type: "services",
    portraitState: "capabilities",
    introduction:
      "I work across the whole visual surface of a brand: the illustration, the mockup, the campaign post, the page. I research the audience and the platform, design the system, build the website that carries it, and keep improving it with what the numbers say.",
    items: [
      "Graphic Design",
      "2D Illustration",
      "Mockups & Product Visuals",
      "Brand Identity",
      "Social Media Management",
      "Social Media Visuals & Campaigns",
      "Web Design",
      "WordPress Development",
      "HTML5, CSS3 & JavaScript",
      "Responsive Web Design",
      "SEO & Digital Marketing",
      "Design Research",
      "Video & Photo Editing",
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
        title: "Office Inspirations — Graphic Designer (June 2025 – Present)",
        body: "Drove a 640% increase in account visibility and a 146% increase in website visibility through design, content, UI/UX, and SEO. Grew follower-driven engagement from 35% to 68%, designed social and website funnels that turned that engagement into measurable leads, and built cohesive visual identities across social media, websites, and large-format branding — including AI-assisted visuals and illustrations.",
      },
      {
        title: "Media OnClick FZ LLC — Graphic Designer & Web Developer (September 2023 – February 2024)",
        body: "Created tailored proposals and project briefs with clients and the sales team, designed wireframes, and built responsive websites in WordPress, PHP, HTML5, CSS3, and JavaScript. Produced social posts, portfolios, and mockups, edited video and photo content, scheduled content, managed community engagement, ran paid ad campaigns, and wrote SEO-optimised blog content.",
      },
      {
        title: "Nordic Home Healthcare — Graphic Designer (February 2024 – June 2024)",
        body: "Led SEO-focused blog and keyword strategy, designed brochures, flyers, and recruitment graphics, and rebuilt and optimised the website for usability, functionality, and search. Managed digital marketing contracts in ZOHO, trained staff on the platform, and presented marketing, analytics, and ZOHO insights to the team.",
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
    educationList: [
      {
        degree: "BSc (Hons) Creative Computing",
        institution: "Bath Spa University",
        period: "2020 – 2023",
      },
      {
        degree: "IFS — Computing",
        institution: "EduQual, UK",
        period: "2018 – 2019",
      },
    ],
    skillGroups: [
      {
        category: "Design",
        skills: [
          "Graphic Design",
          "2D Illustration",
          "Mockups",
          "Brand Identity",
          "Typography & Layout",
          "Photo Editing & Retouching",
        ],
      },
      {
        category: "Web",
        skills: [
          "HTML5",
          "CSS3",
          "JavaScript",
          "PHP",
          "WordPress",
          "Responsive Design",
          "VS Code",
        ],
      },
      {
        category: "Marketing & Growth",
        skills: [
          "Social Media Management",
          "SEO",
          "Paid Campaigns",
          "Content Scheduling",
          "Analytics",
          "Digital Marketing",
          "ZOHO",
        ],
      },
      {
        category: "Research & Process",
        skills: [
          "Design Research",
          "Wireframing",
          "Brief Writing",
          "Client Presentations",
          "Multichannel Campaigns",
        ],
      },
      {
        category: "Tools",
        skills: [
          "Adobe Photoshop",
          "Adobe Illustrator",
          "Adobe Premiere Pro",
          "Figma",
          "ZOHO",
        ],
      },
    ],
  },
];

/** A chapter's degrees, whether it was saved with one or with a list. */
export function educationOf(chapter: Chapter): EducationItem[] {
  return chapter.educationList ?? (chapter.education ? [chapter.education] : []);
}
