/**
 * Static skills data — used as a fallback (or permanent source) when
 * the DB Skill table is empty or the page doesn't query it.
 *
 * Update these to match what you want displayed on the frontend.
 */

export interface StaticSkill {
  name: string;
  category: string;
  sortOrder: number;
}

export const staticSkills: StaticSkill[] = [
  /* ── Frontend Development ─────────────────────────────────────────────── */
  { name: "HTML5",            category: "Frontend",  sortOrder: 0 },
  { name: "CSS3",             category: "Frontend",  sortOrder: 1 },
  { name: "JavaScript",       category: "Frontend",  sortOrder: 2 },
  { name: "TypeScript",       category: "Frontend",  sortOrder: 3 },
  { name: "React",            category: "Frontend",  sortOrder: 4 },
  { name: "Next.js",          category: "Frontend",  sortOrder: 5 },
  { name: "Vue.js",           category: "Frontend",  sortOrder: 6 },
  { name: "Tailwind CSS",     category: "Frontend",  sortOrder: 7 },

  /* ── CMS & Platforms ──────────────────────────────────────────────────── */
  { name: "WordPress",        category: "Platforms", sortOrder: 0 },
  { name: "Shopify",          category: "Platforms", sortOrder: 1 },
  { name: "Elementor",        category: "Platforms", sortOrder: 2 },
  { name: "Laravel",          category: "Platforms", sortOrder: 3 },
  { name: "PHP",              category: "Platforms", sortOrder: 4 },

  /* ── Design ───────────────────────────────────────────────────────────── */
  { name: "Figma",            category: "Design",    sortOrder: 0 },
  { name: "Adobe XD",         category: "Design",    sortOrder: 1 },
  { name: "Adobe Photoshop",  category: "Design",    sortOrder: 2 },
  { name: "Adobe Illustrator",category: "Design",    sortOrder: 3 },
  { name: "Adobe InDesign",   category: "Design",    sortOrder: 4 },

  /* ── Quality & Performance ────────────────────────────────────────────── */
  { name: "WCAG Accessibility",    category: "Quality", sortOrder: 0 },
  { name: "Core Web Vitals",       category: "Quality", sortOrder: 1 },
  { name: "Technical SEO",         category: "Quality", sortOrder: 2 },
  { name: "GA4 / Analytics",       category: "Quality", sortOrder: 3 },
  { name: "Git / Version Control", category: "Quality", sortOrder: 4 },
];

/** Skills grouped by category — convenient for rendering a grouped list */
export function groupedSkills(): Record<string, StaticSkill[]> {
  return staticSkills.reduce<Record<string, StaticSkill[]>>((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});
}
