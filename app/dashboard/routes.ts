/**
 * Single source of truth for every /dashboard URL. Pages and nav import
 * from here instead of hardcoding "/dashboard/..." strings, so the base
 * path only needs to change in one place.
 */
export const routes = {
  home: "/dashboard",
  settings: "/dashboard/settings",
  workPage: "/dashboard/work-page",
  homepage: {
    index: "/dashboard/homepage",
    hero: "/dashboard/homepage/hero",
    selectedWork: "/dashboard/homepage/selected-work",
    about: "/dashboard/homepage/about",
    insights: "/dashboard/homepage/insights",
  },
  blog: {
    list: "/dashboard/blog",
    new: "/dashboard/blog/new",
    item: (id: string) => `/dashboard/blog/${id}`,
  },
  caseStudies: {
    list: "/dashboard/case-studies",
    new: "/dashboard/case-studies/new",
    item: (id: string) => `/dashboard/case-studies/${id}`,
  },
  notes: {
    list: "/dashboard/notes",
    new: "/dashboard/notes/new",
    item: (id: string) => `/dashboard/notes/${id}`,
  },
  projects: {
    list: "/dashboard/projects",
    new: "/dashboard/projects/new",
    item: (id: string) => `/dashboard/projects/${id}`,
  },
} as const;
