/*
 * Project shape — types only.
 *
 * These types describe the object the case study page and the card grids
 * render, assembled from a Project row plus its richContentJson payload
 * by app/lib/projects-db.ts.
 */

export interface PerformanceRow {
  metric: string;
  before: string;
  after: string;
  status: string;
}

export interface RichSection {
  title: string;
  /** A picture of the work from this phase (phases of "What I did" only). */
  image?: string;
  imageCaption?: string;
  bullets: { heading: string; body: string }[];
}

/** A labelled cluster of stats, e.g. "User & Conversion" → 15K, +67.9%, 3.1K */
export interface MetricGroup {
  label: string;
  metrics: { value: string; label: string }[];
}

/**
 * One discipline in the Execution grid.
 * `visual` captions the image; `image` pins a specific one to this slot.
 */
export interface ExecutionDiscipline {
  name: string;
  items: string[];
  visual?: string;
  image?: string;
}

/** Before/after image comparison block. */
export interface CompareBlock {
  beforeLabel: string;
  afterLabel: string;
  caption?: string;
  beforeImage?: string;
  afterImage?: string;
}

/** A "What was built" / "Platform delivered" list. */
export interface DeliverableGroup {
  label: string;
  items: string[];
}

/** User Research & App Store Review Quotes block */
export interface ReviewQuote {
  author?: string;
  date?: string;
  rating?: number; // e.g. 1 to 5
  text: string;
  source?: string; // e.g. "Google Play", "App Store", "User Interview"
}

export interface UserResearchBlock {
  headline?: string;
  intro?: string;
  ratingMetrics?: { label: string; value: string }[];
  painPoints?: string[];
  reviews?: ReviewQuote[];
}

/** Competitive Analysis benchmarking block */
export interface CompetitiveAnalysisBlock {
  headline?: string;
  intro?: string;
  competitors: { name: string; category?: string; note?: string }[];
  takeaway?: string;
}

/** Wireframes & Sketches block */
export interface WireframesBlock {
  headline?: string;
  intro?: string;
  sketches?: { title: string; image?: string; note?: string }[];
}

/** User Flow & Architecture diagram block */
export interface UserStep {
  step: string;
  description?: string;
}

export interface UserFlowBlock {
  title: string;
  description?: string;
  steps: UserStep[];
}

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  shortDescription: string;
  role: string;
  category: string;
  year: string;
  workType?: string;  // "Freelance" | "Full-time" | "Personal Project"
  technologies: string[];
  challenge: string;
  approach: string;
  outcome: string;
  highlights: string[];
  accessibility?: string;
  performance?: string;
  seo?: string;
  imageAlt: string;
  liveUrl?: string;
  /* Rich case-study fields — optional, rendered when present */
  images?: string[];                           // uploaded screenshots, in order
  imageLabels?: string[];                      // slide captions, paired with images by index
  theme?: { bg: string; dark?: boolean };      // placeholder / card tint for this project
  /**
   * Client logo shown on project cards and the track-record tiles.
   * `src` is an uploaded image; `initials` + `bg` are the fallback tile when
   * no logo file exists yet.
   */
  logo?: { src?: string; initials?: string; bg?: string; light?: boolean };
  heroMetrics?: { label: string; value: string }[];
  metricGroups?: MetricGroup[];                // additional labelled stat clusters
  disciplines?: string[];                      // e.g. ["UX/UI Design", "Frontend Development"]
  typography?: string;                         // e.g. "Aboreto (Display) · Inter (Body)"
  client?: string;
  engineeringStack?: string;
  problemIntro?: string;                       // paragraph under the problem headline
  problemSections?: RichSection[];
  userResearch?: UserResearchBlock;            // App Store reviews, pain points, star ratings
  competitiveAnalysis?: CompetitiveAnalysisBlock; // Market app benchmarking
  wireframes?: WireframesBlock;                // Sketches, iterations, figma canvas
  userFlow?: UserFlowBlock;                    // Step-by-step user journey flow
  compare?: CompareBlock;
  transformationHeadline?: string;             // e.g. "What I changed."
  transformationSections?: RichSection[];
  executionHeadline?: string;                  // e.g. "Three disciplines. One system."
  executionDisciplines?: ExecutionDiscipline[];
  resultsHeadline?: string;                    // e.g. "The site isn't just being found. It's converting."
  resultGroups?: MetricGroup[];
  /** "Before → after" for each part of the problem: what it was, what it became. */
  outcomes?: { area: string; before: string; after: string }[];
  resultsNote?: string;                        // caveat / closing note under the results
  resultsImage?: string;                       // analytics / outcome visual
  resultsImageCaption?: string;
  deliverablesHeadline?: string;               // e.g. "A complete football tipping platform."
  deliverables?: DeliverableGroup[];
  performanceAudit?: PerformanceRow[];
  whyItWorked?: string[];                      // one entry per paragraph
  takeaway?: string;
}
