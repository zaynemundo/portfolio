import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import type { Prisma } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

/*
 * Project content lives in the database and is edited through /admin/projects.
 *
 * projects.seed.json is a snapshot of those rows — a restore point for a fresh
 * or wiped database, not a second source of truth. Nothing in the app reads it,
 * so it cannot drift into contradicting what the admin shows. Refresh it from
 * the live database whenever you want the checked-in baseline to move.
 */
const projects: Prisma.ProjectCreateInput[] = JSON.parse(
  readFileSync(join(__dirname, "projects.seed.json"), "utf8"),
);

const posts = [
  {
    slug: "building-for-accessibility",
    title: "Building for Accessibility: A Practical Approach",
    excerpt: "Accessibility isn't a compliance checkbox. Here's how I approach WCAG implementation in real front-end projects — from focus management to semantic HTML structure.",
    date: "2025-06-15",
    dateFormatted: "15 June 2025",
    readTime: "6 min read",
    category: "Development",
    featured: true,
    content: `## Why accessibility matters beyond compliance

Accessibility is a quality standard, not a legal checkbox. Every person who can't use your product because of a barrier is a person you've failed — regardless of whether there's a law requiring you to do better.

## The techniques I rely on

After building accessible interfaces across healthcare, e-commerce, and corporate websites, these are the approaches that consistently make the difference:

- Semantic HTML first — use the right element for the job
- Logical heading hierarchy — one H1, structured H2/H3 beneath it
- Focus management — especially critical in SPAs and modal interactions
- Colour contrast — minimum 4.5:1 for normal text, 3:1 for large text
- Labels on all form inputs — never rely on placeholder text alone

## Testing in the real world

Automated tools like Lighthouse catch maybe 30% of accessibility issues. The rest require manual testing: keyboard navigation, screen reader testing (VoiceOver on macOS, NVDA on Windows), and zoom testing at 200%.

Build accessibility checks into your workflow from the start. Retrofitting is always more expensive than doing it right.`,
    published: true,
  },
  {
    slug: "technical-seo-for-developers",
    title: "Technical SEO for Developers: What Actually Moves the Needle",
    excerpt: "After implementing SEO improvements across multiple client sites, I've identified the changes that consistently drive results — and the ones that are largely theoretical.",
    date: "2025-04-20",
    dateFormatted: "20 April 2025",
    readTime: "7 min read",
    category: "SEO & Performance",
    featured: true,
    content: `## The changes that consistently work

After rebuilding and optimising multiple client sites — from a healthcare clinic to a real estate platform — these are the technical SEO improvements that reliably improved organic traffic:

- Clean URL structure — descriptive, no query strings, proper hierarchy
- Semantic heading structure — one H1, logical H2/H3 breakdown per page
- Core Web Vitals — especially LCP (Largest Contentful Paint) and CLS
- Schema markup — LocalBusiness, Article, BreadcrumbList where relevant
- XML sitemap + robots.txt — properly configured, submitted to Search Console

## Core Web Vitals: where the biggest wins are

On a healthcare site I rebuilt, LCP dropped from 11.1s to 0.6s. The main changes: converted images to WebP, added proper lazy loading, removed render-blocking resources, and eliminated third-party scripts that weren't essential.

CLS was fixed by adding explicit width/height to all images and avoiding dynamically injected content above the fold.

## What rarely matters

- Meta keywords — ignored by all major search engines
- Keyword density — write for humans first
- Exact-match anchor text — relevance matters, over-optimisation hurts`,
    published: true,
  },
  {
    slug: "from-figma-to-production",
    title: "From Figma to Production: How I Translate Design Into Code",
    excerpt: "The handoff between design and development is where projects succeed or fail. This is my workflow for turning approved UI designs into production-ready, maintainable front-end code.",
    date: "2025-02-10",
    dateFormatted: "10 February 2025",
    readTime: "5 min read",
    category: "Workflow",
    featured: false,
    content: `## Reading a design before writing a line of code

Before opening a code editor, I spend time understanding the design system: what's the spacing scale, what are the type styles, what components repeat across screens, what are the interactive states.

This upfront analysis prevents the most common mistake: building components in isolation that don't scale to the full design.

## Component structure and maintainability

I structure components around their function, not their visual appearance. A button is a button — not a "blue-pill-with-icon". This keeps components reusable as the design evolves.

For complex UIs, I build from the smallest components up: atoms (buttons, inputs, labels), molecules (form fields, cards), organisms (navigation, page sections).

## The handoff checklist I use

- Confirm all interactive states are designed (hover, focus, active, disabled, loading)
- Check responsive breakpoints are defined for every major component
- Clarify any animation or transition requirements
- Agree on what's pixel-perfect vs what can flex to content

## What makes the difference

The developers who consistently produce the best output from a design are the ones who ask questions early and often. A 10-minute call before starting a complex component saves hours of rework.`,
    published: true,
  },
];

async function main() {
  console.log("Seeding database…");

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: project,
      create: project,
    });
    console.log(`  ✓ Project: ${project.name}`);
  }

  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
    console.log(`  ✓ Post: ${post.title}`);
  }

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", cvPath: "/docs/zaira-mundo-cv.pdf" },
  });
  console.log("  ✓ SiteSettings: default");

  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
