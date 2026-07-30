/* ── Blog post data — single source of truth ─────────────────────────────
   PLACEHOLDER: Replace content with your own writing before publishing.
   ──────────────────────────────────────────────────────────────────────── */

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  date: string;         // ISO format: YYYY-MM-DD
  dateFormatted: string;
  readTime: string;
  category: string;
  featured?: boolean;
  content: ContentBlock[];
}

export interface ContentBlock {
  type: "paragraph" | "heading" | "list";
  text?: string;
  items?: string[];
}

export const posts: Post[] = [
  {
    slug: "building-for-accessibility",
    title: "Building for Accessibility: A Practical Approach",
    excerpt:
      "Accessibility is a core technical requirement for digital platforms serving diverse, global audiences. Here is how I implement WCAG standards in production — from semantic HTML architecture to focus management and assistive technology support.",
    date: "2025-06-15",
    dateFormatted: "15 June 2025",
    readTime: "6 min read",
    category: "Development",
    featured: true,
    content: [
      {
        type: "paragraph",
        text: "PLACEHOLDER — Replace this with your own writing. This post covers your practical approach to building accessible websites, including the techniques you use in real client projects.",
      },
      {
        type: "heading",
        text: "Why accessibility matters beyond compliance",
      },
      {
        type: "paragraph",
        text: "PLACEHOLDER — Discuss your perspective on accessibility as a quality standard, not just a legal requirement.",
      },
      {
        type: "heading",
        text: "Practical implementation: the techniques I rely on",
      },
      {
        type: "list",
        items: [
          "PLACEHOLDER — Technique 1",
          "PLACEHOLDER — Technique 2",
          "PLACEHOLDER — Technique 3",
        ],
      },
      {
        type: "paragraph",
        text: "PLACEHOLDER — Closing thoughts.",
      },
    ],
  },
  {
    slug: "technical-seo-for-developers",
    title: "Technical SEO for Developers: What Actually Moves the Needle",
    excerpt:
      "After implementing technical SEO improvements across institutional and commercial web platforms, I have identified the structural and architectural changes that consistently improve discoverability and digital reach.",
    date: "2025-04-20",
    dateFormatted: "20 April 2025",
    readTime: "7 min read",
    category: "SEO & Performance",
    featured: true,
    content: [
      {
        type: "paragraph",
        text: "PLACEHOLDER — Replace this with your own writing. This post shares your hands-on experience with technical SEO from a front-end developer's perspective.",
      },
      {
        type: "heading",
        text: "The changes that consistently work",
      },
      {
        type: "paragraph",
        text: "PLACEHOLDER — Based on your work at Creativo FZCO, describe the SEO improvements that made measurable differences.",
      },
      {
        type: "heading",
        text: "Common SEO advice that rarely matters",
      },
      {
        type: "paragraph",
        text: "PLACEHOLDER — Share your perspective on overrated SEO tactics.",
      },
    ],
  },
  {
    slug: "from-figma-to-production",
    title: "From Figma to Production: How I Translate Design Into Code",
    excerpt:
      "Translating design specifications into production-ready, accessible, and maintainable front-end code requires a disciplined, standards-aware process. This is how I approach that transition across every platform I build.",
    date: "2025-02-10",
    dateFormatted: "10 February 2025",
    readTime: "5 min read",
    category: "Workflow",
    featured: false,
    content: [
      {
        type: "paragraph",
        text: "PLACEHOLDER — Replace this with your own writing. This post describes your personal workflow for converting Figma designs into production code.",
      },
      {
        type: "heading",
        text: "Reading a design before writing a line of code",
      },
      {
        type: "paragraph",
        text: "PLACEHOLDER — Describe how you analyse a Figma file before starting development.",
      },
      {
        type: "heading",
        text: "Component structure and maintainability",
      },
      {
        type: "paragraph",
        text: "PLACEHOLDER — Discuss your approach to component architecture.",
      },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
