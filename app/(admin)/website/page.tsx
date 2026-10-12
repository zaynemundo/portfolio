import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { routes } from "@/app/(admin)/_routes";
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
  { href: routes.homepage, name: "Home", detail: "Hero, selected work and insights copy", live: "/" },
  { href: routes.about, name: "About", detail: "Profile, experience, skills and CV", live: "/#about" },
  { href: routes.caseStudies.list, name: "Work", detail: "Case studies and the Work page", live: "/work" },
  { href: routes.blog.list, name: "Blog", detail: "Articles and the Insights page", live: "/insights" },
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
        <h2 className="text-[13.5px] font-semibold text-foreground mb-3">Pages</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PAGES.map((page) => (
            <div key={page.name} className="rounded-xl border border-border bg-card/40 p-4">
              <p className="text-[14px] font-semibold text-foreground">{page.name}</p>
              <p className="text-[12.5px] text-muted-foreground mt-0.5 mb-3">{page.detail}</p>
              <div className="flex items-center gap-3 text-[12.5px] font-medium">
                <Link href={page.href} className="text-primary hover:text-primary/80 transition-colors">Edit</Link>
                <a href={page.live} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  View live
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
