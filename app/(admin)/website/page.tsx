import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { ExternalLink, Home, IdCard, Layers, Newspaper } from "lucide-react";
import { routes } from "@/app/(admin)/_routes";
import { cardClass } from "@/app/(admin)/_components/ui/Card";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { Panel, PanelRow, StatStrip } from "@/app/(admin)/_components/OverviewParts";

/* The Website overview: what is live, what is still a draft, and the
 * quickest way to each page of the public site. */

const getWebsiteOverview = unstable_cache(
  () =>
    Promise.all([
      prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" }, select: { id: true, title: true, published: true, dateFormatted: true } }),
      prisma.project.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true, published: true, featured: true } }),
    ]),
  ["website-overview"],
  { tags: [CACHE_TAGS.blog, CACHE_TAGS.caseStudies], revalidate: 60 }
);

const PAGES = [
  { href: routes.homepage, name: "Home", detail: "Hero banner, selected work and insights", live: "/", icon: <Home size={16} /> },
  { href: routes.about, name: "About", detail: "Identity, bio, experience and skills", live: "/#about", icon: <IdCard size={16} /> },
  { href: routes.caseStudies.list, name: "Work", detail: "Case studies and the Work page", live: "/work", icon: <Layers size={16} /> },
  { href: routes.blog.list, name: "Blog", detail: "Articles and the Insights page", live: "/insights", icon: <Newspaper size={16} /> },
];

export default async function WebsiteOverviewPage() {
  const [posts, caseStudies] = await getWebsiteOverview();

  const draftPosts = posts.filter((p) => !p.published);
  const draftCaseStudies = caseStudies.filter((c) => !c.published);
  const drafts = draftPosts.length + draftCaseStudies.length;
  const publishedPosts = posts.length - draftPosts.length;
  const publishedCaseStudies = caseStudies.length - draftCaseStudies.length;

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle="What is live on your site and what is still in draft."
        actionHref={routes.blog.new}
        actionLabel="+ New article"
        secondaryHref={routes.caseStudies.new}
        secondaryLabel="New case study"
      />

      <StatStrip
        cells={[
          { label: "Published articles", value: String(publishedPosts), href: routes.blog.list },
          { label: "Published case studies", value: String(publishedCaseStudies), href: routes.caseStudies.list },
          {
            label: "Featured on the homepage",
            value: String(caseStudies.filter((c) => c.published && c.featured).length),
            note: "Case studies in Selected Work",
            href: routes.homepage,
          },
          { label: "Drafts", value: String(drafts), note: drafts ? "Not visible on the site yet" : "Everything is published" },
        ]}
      />

      <div className="grid lg:grid-cols-2 gap-5 mt-8">
        <Panel title="Drafts to finish" empty="No drafts. Everything you have written is published." isEmpty={drafts === 0}>
          <div>
            {draftPosts.map((post) => (
              <PanelRow key={post.id} href={routes.blog.item(post.id)} tag="Article" tagTone="brand" primary={post.title} right="Continue" />
            ))}
            {draftCaseStudies.map((cs) => (
              <PanelRow key={cs.id} href={routes.caseStudies.item(cs.id)} tag="Case study" tagTone="neutral" primary={cs.name} right="Continue" />
            ))}
          </div>
        </Panel>

        <Panel title="Recent articles" actionHref={routes.blog.list} actionLabel="All articles" empty="No articles yet." isEmpty={posts.length === 0}>
          <div>
            {posts.slice(0, 5).map((post) => (
              <PanelRow
                key={post.id}
                href={routes.blog.item(post.id)}
                tag={post.published ? "Live" : "Draft"}
                tagTone={post.published ? "good" : "neutral"}
                primary={post.title}
                right={post.dateFormatted}
              />
            ))}
          </div>
        </Panel>
      </div>

      <section className="mt-8">
        <h2 className="text-[14.5px] font-semibold tracking-tight text-foreground mb-3">Pages</h2>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {PAGES.map((page) => (
            <div key={page.name} className={`${cardClass} group relative p-4 hover:border-primary/40 transition-colors`}>
              <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground">{page.icon}</span>
              {/* Covers the card, so a click anywhere on it opens the editor. */}
              <Link href={page.href} className="text-[14px] font-semibold text-foreground group-hover:text-primary transition-colors after:absolute after:inset-0">
                {page.name}
              </Link>
              <p className="text-[12.5px] text-muted-foreground mt-0.5">{page.detail}</p>
              <a
                href={page.live}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                View live
                <ExternalLink size={12} />
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
