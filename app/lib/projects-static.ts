/**
 * Static project data — sourced from prisma/projects.seed.json.
 *
 * Used as a fallback in page.tsx when the DB is empty or unreachable,
 * so the Selected Work section always renders during frontend development.
 *
 * HOW PRECEDENCE WORKS
 * ────────────────────
 * page.tsx tries the DB first. If the DB returns rows, those win.
 * These static entries only show when DB projects === 0.
 * Once you populate the DB via /admin/projects, remove the fallback
 * line from page.tsx (look for the "STATIC FALLBACK" comment).
 *
 * IMAGES
 * ──────
 * Paths reference /public/case-studies/*.jpg — add those files to
 * make thumbnails appear. The section renders without images in the
 * meantime (placeholder state).
 */

import type { ProjectCard } from "@/app/components/work/ProjectChapter";

export const staticProjects: ProjectCard[] = [
  {
    slug: "monili-jewellers",
    name: "Monili Jewellers",
    tagline:
      "1,228 products. Two major phases. A luxury platform migrated, rebuilt, and redesigned in production code.",
    category: "E-commerce",
    year: "2024–2026",
    role: "Front-End Developer & UI/UX Designer",
    workType: "Freelance",
    technologies: ["Vue.js", "Laravel", "HTML5/CSS3", "GA4"],
    imageAlt: "Monili Jewellers — luxury jewellery e-commerce platform",
    liveUrl: null,
    images: ["/case-studies/monili.jpg"],
    theme: { bg: "#ede8e2" },
    logo: { initials: "MJ", bg: "#d9d4cd" },
  },
  {
    slug: "po-marinas",
    name: "P&O Marinas",
    tagline:
      "A DP World marina that buried its core service. Rebuilt around berth rental with a custom interactive map.",
    category: "Marine & Leisure",
    year: "2023–2024",
    role: "Web Designer & Front-End Developer",
    workType: "Freelance",
    technologies: ["WordPress", "Custom SVG", "Figma", "Adobe CC"],
    imageAlt: "P&O Marinas — website and interactive berth map",
    liveUrl: null,
    images: ["/case-studies/pno.jpg"],
    theme: { bg: "#dde8f5" },
    logo: { initials: "P&O", bg: "#c0d4ec" },
  },
  {
    slug: "vijit-pillai-art",
    name: "Vijit Pillai Art",
    tagline:
      "35+ screens, zero starting point. A gallery-grade art platform designed and built from scratch.",
    category: "Art & E-commerce",
    year: "2024",
    role: "UI/UX Designer & Front-End Developer",
    workType: "Freelance",
    technologies: ["React", "TSX", "Figma", "Adobe CC"],
    imageAlt: "Vijit Pillai Art — gallery storefront and admin platform",
    liveUrl: null,
    images: ["/case-studies/vijit.jpg"],
    theme: { bg: "#f0ebe3" },
    logo: { initials: "VPA", bg: "#ddd8d0" },
  },
  {
    slug: "scandinavian-physio",
    name: "Scandinavian Physiotherapy Center",
    tagline:
      "11.1s to 0.6s. A healthcare website rebuilt from the infrastructure up.",
    category: "Healthcare",
    year: "2025",
    role: "Web Design · Frontend Development · Email Marketing",
    workType: "Freelance",
    technologies: ["WordPress", "HTML5/CSS3", "Figma", "Adobe CC", "GA4"],
    imageAlt: "Scandinavian Physiotherapy Center — website redesign",
    liveUrl: null,
    images: ["/case-studies/scanphys.jpg"],
    theme: { bg: "#dceef8" },
    logo: { initials: "SPC", bg: "#bcd9ee" },
  },
  {
    slug: "rocky-real-estate",
    name: "Rocky Real Estate",
    tagline:
      "89% organic traffic. A property platform rebuilt around how Dubai buyers actually search.",
    category: "Real Estate",
    year: "2021–2025",
    role: "Front-End Developer",
    workType: "Freelance",
    technologies: ["WordPress", "HTML5/CSS3", "GA4", "Adobe CC"],
    imageAlt: "Rocky Real Estate — property listings platform",
    liveUrl: null,
    images: ["/case-studies/rocky.jpg"],
    theme: { bg: "#edeae5" },
    logo: { initials: "RRE", bg: "#d5d2cd" },
  },
  {
    slug: "tip2gether",
    name: "Tip2Gether",
    tagline:
      "No wireframes, no specs, no prior product. A tipping platform designed from a blank brief.",
    category: "Sports Tech",
    year: "2024",
    role: "Product Designer & Front-End Developer",
    workType: "Freelance",
    technologies: ["Laravel", "HTML5/CSS3", "Adobe CC"],
    imageAlt: "Tip2Gether — football tipping platform",
    liveUrl: null,
    images: ["/case-studies/t2g.jpg"],
    theme: { bg: "#1a3a2a", dark: true },
    logo: { initials: "T2G", bg: "#1e4832", light: true },
  },
];
