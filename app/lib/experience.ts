/* ── Experience data — single source of truth ───────────────────────────── */

export interface Employment {
  company: string;
  role: string;
  location: string;
  period: string;
  current: boolean;
  responsibilities: string[];
}

export interface Education {
  institution: string;
  qualification: string;
  period: string;
  notes?: string[];
}

export interface Certification {
  title: string;
  issuer: string;
  issued: string;
  credentialId?: string;
}

export const employment: Employment[] = [
  {
    company: "Creativo FZCO",
    role: "Front-End Developer & Web Designer",
    location: "United Arab Emirates",
    period: "Oct 2021 – Present",
    current: true,
    responsibilities: [
      "Delivered 10+ responsive corporate and e-commerce websites from concept through deployment across React/TypeScript, WordPress, and Laravel/PHP, serving clients across real estate, retail, government, and hospitality sectors.",
      "Implemented technical SEO improvements — including site structure, Core Web Vitals, and accessibility enhancements — contributing to measurable gains in page speed and organic discoverability.",
      "Integrated Google Analytics and performance monitoring to track user behaviour and deliver data-informed reporting to clients and stakeholders.",
      "Converted approved UI/UX designs into cross-browser-compatible, production-ready HTML5, CSS3, and JavaScript, consistently meeting project deadlines.",
      "Architected and maintained custom WordPress templates, enforcing brand and accessibility standards and ensuring long-term maintainability through Git version control.",
      "Managed concurrent digital projects for 5+ client accounts simultaneously, coordinating with clients, designers, and developers.",
    ],
  },
  {
    company: "Ami Digital Marketing FZ. LLC.",
    role: "Web Developer (Part-Time)",
    location: "United Arab Emirates",
    period: "Sep 2024 – Oct 2024",
    current: false,
    responsibilities: [
      "Built and updated WordPress/Elementor websites in alignment with company branding guidelines.",
      "Authored custom CSS to enhance design consistency and responsiveness across mobile and desktop.",
      "Debugged performance issues and executed content updates to maintain smooth website operation.",
      "Coordinated with the internal team to implement design changes efficiently within tight timelines.",
    ],
  },
];

export const education: Education[] = [
  {
    institution: "Bath Spa University",
    qualification: "BSc (Hons) Creative Computing — First Class Honours",
    period: "2019 – 2021",
    notes: ["Academic Excellence Awardee"],
  },
  {
    institution: "EduQual UK",
    qualification: "International Foundation Studies, Computing — EduQual Level 3",
    period: "2018 – 2019",
  },
];

export const certifications: Certification[] = [
  {
    title: "UK On Demand: Technology",
    issuer: "Bright Network",
    issued: "Aug 2021",
    credentialId: "3CTA7BAEPYIRAT",
  },
];
