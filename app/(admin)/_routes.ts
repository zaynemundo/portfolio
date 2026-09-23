/**
 * Single source of truth for every admin URL. Pages and nav import from
 * here instead of hardcoding path strings, so a path only needs to change
 * in one place. These are top-level routes (no shared "/dashboard" prefix)
 * living in the app/(admin) route group — names are chosen to avoid
 * colliding with public routes (/, /blog, /projects, and their /insights
 * and /work rewrite aliases).
 */
export const routes = {
  home: "/overview",
  settings: "/settings",
  workPage: "/work-settings",
  blogPage: "/insights-settings",
  inquiries: {
    list: "/inquiries",
    item: (id: string) => `/inquiries/${id}`,
  },
  homepage: {
    index: "/homepage",
    hero: "/homepage/hero",
    selectedWork: "/homepage/selected-work",
    about: "/homepage/about",
    insights: "/homepage/insights",
  },
  blog: {
    list: "/write-ups",
    new: "/write-ups/new",
    item: (id: string) => `/write-ups/${id}`,
  },
  caseStudies: {
    list: "/case-studies",
    new: "/case-studies/new",
    item: (id: string) => `/case-studies/${id}`,
  },
  notes: {
    list: "/notes",
    new: "/notes/new",
    item: (id: string) => `/notes/${id}`,
  },
  projects: {
    list: "/freelance",
    new: "/freelance/new",
    item: (id: string) => `/freelance/${id}`,
  },
} as const;

/** Every top-level path segment covered above — used by proxy.ts to build its auth matcher. */
export const PROTECTED_TOP_LEVEL_PATHS = [
  routes.home,
  routes.settings,
  routes.workPage,
  routes.blogPage,
  routes.inquiries.list,
  routes.homepage.index,
  routes.blog.list,
  routes.caseStudies.list,
  routes.notes.list,
  routes.projects.list,
] as const;
