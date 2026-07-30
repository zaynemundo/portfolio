/**
 * Full static project data — used as a fallback when the DB is unreachable
 * or empty. Mirrors the shape produced by rowToProject() in projects-db.ts.
 *
 * Add entries here to make case study pages available without a DB.
 * Once a project is seeded to the DB via /admin/projects, the DB row wins
 * automatically and this entry becomes an unused fallback.
 */

import type { Project } from "@/app/lib/projects";

export const staticFullProjects: Project[] = [
  {
    slug: "monili-jewellers",
    name: "Monili Jewellers",
    tagline:
      "1,228 products. Two major phases. A luxury platform migrated, rebuilt, and redesigned in production code.",
    shortDescription:
      "Took a luxury jewellery platform off a restrictive third-party system, rebuilt every interactive frontend from scratch on a custom Laravel/Vue stack, then redesigned the entire interface in production code — delivering a faster, more premium experience across 1,228 products.",
    role: "Front-End Developer & UI/UX Designer",
    category: "E-commerce",
    year: "2024–2026",
    workType: "Freelance",
    technologies: ["Vue.js", "Laravel", "HTML5/CSS3", "GA4"],
    challenge:
      "Monili Jewellers was locked into a third-party e-commerce platform that couldn't support the frontend complexity or performance standards a luxury catalogue of 1,228 products demanded. Core Web Vitals were poor, mobile responsiveness was unreliable, and the visual direction no longer matched the quality of the jewellery.",
    approach:
      "Delivered in two phases. Phase 1 migrated the platform to a custom Laravel/Vue decoupled architecture, rebuilding every stateful frontend system from scratch — mega navigation, live search, cart, checkout, and customer accounts. Phase 2 redesigned the entire frontend directly in production code, introducing refined spacing, stronger typography, and a more premium visual direction without disrupting the backend.",
    outcome:
      "+25% sessions after frontend restructuring. +21% user growth. ~52% sustained engagement rate. Repair inquiry interactions increased after the dedicated flow launched.",
    highlights: [
      "Migrated from third-party platform to custom Laravel/Vue decoupled architecture",
      "Built full stateful frontend: mega nav, live search, cart, checkout, customer accounts",
      "Phase 2 in-code redesign introduced refined spacing, typography, and visual alignment",
      "Reduced layout instability to near-zero CLS across product-heavy pages",
      "Designed social media assets across Instagram, LinkedIn, and Facebook",
    ],
    performance:
      "Reduced CLS to near-zero across product pages. Configured lazy loading and optimised image delivery to improve LCP. Removed render-blocking assets across the catalogue.",
    seo: "Clean, semantic frontend architecture across 1,228 products supporting improved search indexability.",
    imageAlt: "Monili Jewellers — luxury jewellery e-commerce platform",
    liveUrl: undefined,
    images: [],
    imageLabels: ["Homepage", "Product Listing", "Product Detail", "Cart & Checkout"],
    theme: { bg: "#ede8e2" },
    logo: { initials: "MJ", bg: "#d9d4cd" },
    disciplines: [
      "Frontend Engineering",
      "UI/UX Design",
      "Performance Optimisation",
      "Social Media Design",
    ],
    engineeringStack: "Laravel · Vue.js (Stateful Frontend) · Custom Backend API",
    heroMetrics: [
      { value: "+25%", label: "Sessions after frontend restructuring" },
      { value: "+21%", label: "Users acquired" },
      { value: "~52%", label: "Sustained engagement rate" },
    ],
    metricGroups: [
      {
        label: "Platform Scale",
        metrics: [
          { value: "1,228", label: "Products supported across the frontend" },
          { value: "2", label: "Major phases: migration → redesign" },
          { value: "Every", label: "Page built with stateful frontend systems" },
        ],
      },
      {
        label: "Brand & Social",
        metrics: [
          { value: "3,784", label: "Instagram followers" },
          { value: "481", label: "Social media assets designed across platforms" },
        ],
      },
    ],
    problemIntro:
      "Monili Jewellers was operating on a third-party e-commerce platform that limited frontend flexibility, interaction design, and performance across a growing catalogue of 1,228 products.",
    problemSections: [
      {
        title: "A luxury jewellery brand. A platform that couldn't keep up.",
        bullets: [
          {
            heading: "Platform Limitations",
            body: "The previous platform restricted customisation, frontend flexibility, and advanced interaction design.",
          },
          {
            heading: "Complex Frontend Requirements",
            body: "Mega navigation, live search, cart interactions, account systems, and FAQ filtering all required custom systems built from scratch.",
          },
          {
            heading: "Performance Issues",
            body: "Core Web Vitals and mobile responsiveness required optimisation across a product-heavy catalogue.",
          },
          {
            heading: "Outdated Visual Direction",
            body: "The legacy frontend no longer reflected the premium quality and tactile luxury of the jewellery collections.",
          },
        ],
      },
    ],
    compare: {
      beforeLabel: "2024 — migration",
      afterLabel: "2026 — redesign",
      caption: "Drag to compare the 2024 migration against the 2026 redesign.",
    },
    transformationHeadline: "What I built.",
    transformationSections: [
      {
        title: "Phase 1 — 2024: Platform Migration & Stateful Frontend Build",
        bullets: [
          {
            heading: "Decoupled stack",
            body: "Migrated from a third-party e-commerce system to a custom Laravel/Vue decoupled stack.",
          },
          {
            heading: "Full rebuild",
            body: "Rebuilt the entire customer-facing frontend from scratch.",
          },
          {
            heading: "Backend pairing",
            body: "Worked alongside a backend developer responsible for the API infrastructure and data layer.",
          },
          {
            heading: "Scalable architecture",
            body: "Established a frontend architecture capable of supporting large product volumes and complex UI interactions.",
          },
        ],
      },
      {
        title: "Phase 2 — 2026: In-Code Frontend Redesign",
        bullets: [
          {
            heading: "Redesign in production",
            body: "Redesigned the entire frontend directly in production code without relying on static Figma layouts.",
          },
          {
            heading: "Premium direction",
            body: "Introduced refined spacing, typography hierarchy, and cleaner visual alignment.",
          },
          {
            heading: "Performance built in",
            body: "Integrated performance optimisation directly into the redesign process.",
          },
          {
            heading: "Non-disruptive",
            body: "Improved frontend consistency without disrupting the underlying backend architecture.",
          },
        ],
      },
      {
        title: "Discovery & Navigation",
        bullets: [
          {
            heading: "Mega navigation",
            body: "Built a multi-tier mega nav featuring highlighted collections and subcategories.",
          },
          {
            heading: "Live search",
            body: "Developed a live search dropdown with real-time product results.",
          },
          {
            heading: "Listing pages",
            body: "Created dynamic product listing pages with filtering and sorting systems.",
          },
        ],
      },
      {
        title: "Commerce & Checkout",
        bullets: [
          {
            heading: "Cart",
            body: "Real-time cart interactions and quantity updates.",
          },
          {
            heading: "Checkout",
            body: "Multi-step checkout with client-side validation and payment handling.",
          },
          {
            heading: "States",
            body: "Confirmation, failed-payment, and recovery states across the purchase flow.",
          },
        ],
      },
      {
        title: "Customer Experience Systems",
        bullets: [
          {
            heading: "Dashboard",
            body: "Self-service customer dashboard with order history and account management.",
          },
          {
            heading: "Repair flow",
            body: "Dedicated jewellery repair intake flow supporting repair and custom enquiries.",
          },
          {
            heading: "Search",
            body: "Filtering and instant search across FAQ and blog systems.",
          },
        ],
      },
      {
        title: "Performance Engineering & Core Web Vitals",
        bullets: [
          {
            heading: "CLS",
            body: "Reduced layout instability across product-heavy pages to stabilise CLS near zero.",
          },
          {
            heading: "LCP",
            body: "Configured lazy loading and optimised image delivery to improve LCP.",
          },
          {
            heading: "Overhead",
            body: "Removed render-blocking assets and unnecessary frontend overhead.",
          },
          {
            heading: "Mobile",
            body: "Improved mobile loading performance and interaction stability across the catalogue.",
          },
        ],
      },
    ],
    executionHeadline: "Engineering, performance, and presence.",
    executionDisciplines: [
      {
        name: "Frontend Engineering",
        items: [
          "Mega Navigation",
          "Live Search",
          "Category Pages",
          "Cart",
          "Checkout",
          "Account",
          "FAQ & Blog",
          "Repair Flow",
        ],
        visual: "Homepage or product page, mega nav, search dropdown, cart interactions",
      },
      {
        name: "Performance Engineering",
        items: ["LCP", "CLS", "Mobile Speed", "Asset Optimisation", "Responsive Stability"],
        visual: "Lighthouse scores, Core Web Vitals, before/after performance comparison",
      },
      {
        name: "Digital & Campaign Design",
        items: ["Campaign Banners", "Reels", "Stories", "Promotional Content"],
        visual: "Social media grid, campaign banners, Instagram reels, promotional graphics",
      },
    ],
    resultsHeadline: "Rebuilt, redesigned, and performing.",
    resultGroups: [
      {
        label: "User & Engagement Impact",
        metrics: [
          { value: "+25%", label: "Sessions after frontend restructuring" },
          { value: "+21%", label: "User growth across the platform" },
          { value: "~52%", label: "Sustained engagement rate across the product catalogue" },
          { value: "↑", label: "Repair inquiry interactions after the dedicated repair flow launched" },
        ],
      },
    ],
    performanceAudit: [
      {
        metric: "Frontend Foundation",
        before: "Legacy third-party platform",
        after: "Stateful Vue.js frontend",
        status: "Fast",
      },
      {
        metric: "Visual Architecture",
        before: "Fixed template system",
        after: "Custom premium UI",
        status: "Excellent",
      },
      {
        metric: "Asset Delivery",
        before: "Unoptimised media loading",
        after: "Lazy-loaded optimised assets",
        status: "Stable",
      },
      {
        metric: "User Interaction",
        before: "Limited engagement",
        after: "Interactive frontend systems",
        status: "Excellent",
      },
    ],
    whyItWorked: [
      "The frontend wasn't just migrated — it was systematically rebuilt with commercial intent. Every interaction, from the mega navigation to the jewellery repair flow, was designed to reduce friction between product discovery and purchase.",
      "Phase 1 established the engineering foundation: a modern decoupled architecture providing full control over frontend behaviour, interaction design, and performance optimisation. Phase 2 elevated the visual quality through refined layouts, stronger typography hierarchy, and a more premium browsing experience.",
      "The sustained ~52% engagement rate reflects how users actively interacted with the catalogue through browsing, filtering, searching, and product exploration — rather than simply landing and leaving.",
    ],
    takeaway:
      "Rebuilt and redesigned a luxury jewellery platform around performance, interaction, and premium product discovery — engineering every stateful frontend system across a catalogue of 1,228 products.",
  },
];
