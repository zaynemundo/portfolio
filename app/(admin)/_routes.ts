/**
 * Single source of truth for every admin URL. Pages and nav import from
 * here instead of hardcoding path strings, so a path only needs to change
 * in one place. These are top-level routes living in the app/(admin) route
 * group — /dashboard is the landing/overview page itself (not a shared
 * prefix — nothing lives at /dashboard/blog etc. anymore); every other
 * section is its own top-level path, named to avoid colliding with public
 * routes (/, /blog, /projects, and their /insights and /work rewrite aliases).
 */
export const routes = {
  home: "/dashboard",
  settings: "/settings",
  account: "/account",
  /** Profile bio + Experience + Education & Skills + What I Do — merged
   *  2026-09-30 from separate Homepage-About-tab and CV pages, since both
   *  fed the same public "About" section and living in two places felt
   *  disconnected. */
  about: "/about",
  workPage: "/work-settings",
  blogPage: "/insights-settings",
  inquiries: {
    list: "/inquiries",
    item: (id: string) => `/inquiries/${id}`,
  },
  /** Single page with client-side tabs (Hero/Selected Work/About/Insights) —
   *  not separate routes, so switching tabs doesn't re-hit the database. */
  homepage: "/homepage",
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
  projects: {
    list: "/freelance",
    new: "/freelance/new",
    item: (id: string) => `/freelance/${id}`,
  },
  clients: {
    list: "/clients",
    new: "/clients/new",
    item: (id: string) => `/clients/${id}`,
  },
  contacts: {
    list: "/contacts",
  },
  documents: {
    list: "/documents",
  },
  finance: {
    list: "/finance",
    new: "/finance/new",
    item: (id: string) => `/finance/${id}`,
  },
  invoices: {
    list: "/invoices",
    new: "/invoices/new",
    item: (id: string) => `/invoices/${id}`,
    edit: (id: string) => `/invoices/${id}/edit`,
  },
} as const;

/** Every top-level path segment covered above — used by proxy.ts to build its auth matcher. */
export const PROTECTED_TOP_LEVEL_PATHS = [
  routes.home,
  routes.settings,
  routes.account,
  routes.about,
  routes.workPage,
  routes.blogPage,
  routes.inquiries.list,
  routes.homepage,
  routes.blog.list,
  routes.caseStudies.list,
  routes.projects.list,
  routes.clients.list,
  routes.contacts.list,
  routes.documents.list,
  routes.finance.list,
  routes.invoices.list,
] as const;
