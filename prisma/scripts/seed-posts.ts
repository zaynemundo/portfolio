import { prisma } from "./seed-client";

const posts = [
  {
    slug: "building-for-accessibility",
    title: "Building for Accessibility: A Practical Approach",
    excerpt:
      "Accessibility is a core technical requirement for digital platforms serving diverse, global audiences. Here is how I implement WCAG standards in production — from semantic HTML architecture to focus management and assistive technology support.",
    date: new Date("2025-06-15"),
    dateFormatted: "15 June 2025",
    readTime: "6 min read",
    category: "Development",
    featured: true,
    contentHtml: `<p>PLACEHOLDER — Replace this with your own writing. This post covers your practical approach to building accessible websites, including the techniques you use in real client projects.</p>
<h2>Why accessibility matters beyond compliance</h2>
<p>PLACEHOLDER — Discuss your perspective on accessibility as a quality standard, not just a legal requirement.</p>
<h2>Practical implementation: the techniques I rely on</h2>
<ul><li>PLACEHOLDER — Technique 1</li><li>PLACEHOLDER — Technique 2</li><li>PLACEHOLDER — Technique 3</li></ul>
<p>PLACEHOLDER — Closing thoughts.</p>`,
  },
  {
    slug: "technical-seo-for-developers",
    title: "Technical SEO for Developers: What Actually Moves the Needle",
    excerpt:
      "After implementing technical SEO improvements across institutional and commercial web platforms, I have identified the structural and architectural changes that consistently improve discoverability and digital reach.",
    date: new Date("2025-04-20"),
    dateFormatted: "20 April 2025",
    readTime: "7 min read",
    category: "SEO & Performance",
    featured: true,
    contentHtml: `<p>PLACEHOLDER — Replace this with your own writing. This post shares your hands-on experience with technical SEO from a front-end developer's perspective.</p>
<h2>The changes that consistently work</h2>
<p>PLACEHOLDER — Based on your work at Creativo FZCO, describe the SEO improvements that made measurable differences.</p>
<h2>Common SEO advice that rarely matters</h2>
<p>PLACEHOLDER — Share your perspective on overrated SEO tactics.</p>`,
  },
  {
    slug: "from-figma-to-production",
    title: "From Figma to Production: How I Translate Design Into Code",
    excerpt:
      "Translating design specifications into production-ready, accessible, and maintainable front-end code requires a disciplined, standards-aware process. This is how I approach that transition across every platform I build.",
    date: new Date("2025-02-10"),
    dateFormatted: "10 February 2025",
    readTime: "5 min read",
    category: "Workflow",
    featured: false,
    contentHtml: `<p>PLACEHOLDER — Replace this with your own writing. This post describes your personal workflow for converting Figma designs into production code.</p>
<h2>Reading a design before writing a line of code</h2>
<p>PLACEHOLDER — Describe how you analyse a Figma file before starting development.</p>
<h2>Component structure and maintainability</h2>
<p>PLACEHOLDER — Discuss your approach to component architecture.</p>`,
  },
];

async function main() {
  for (const post of posts) {
    const row = await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: { ...post, published: true },
    });
    console.log(`Seeded: ${row.slug}`);
  }
  await prisma.$disconnect();
}

main();
