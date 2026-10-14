import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { routes } from "@/app/(admin)/_routes";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { Panel, PanelRow } from "@/app/(admin)/_components/OverviewParts";
import { getAnalytics, type AnalyticsRange } from "@/app/lib/analytics";
import { AnalyticsSection } from "./AnalyticsSection";

/* The Website overview: who is visiting, and what is still a draft. */

const getWebsiteOverview = unstable_cache(
  () =>
    Promise.all([
      prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" }, select: { id: true, title: true, published: true, dateFormatted: true } }),
      prisma.project.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, slug: true, name: true, published: true, featured: true } }),
    ]),
  ["website-overview-v2"],
  { tags: [CACHE_TAGS.blog, CACHE_TAGS.caseStudies], revalidate: 60 }
);

export default async function WebsiteOverviewPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const days: AnalyticsRange = (await searchParams).days === "30" ? 30 : 7;
  const [[posts, caseStudies], analytics] = await Promise.all([
    getWebsiteOverview(),
    // A missing table (before the database is updated) shouldn't take the whole Overview down.
    getAnalytics(days).catch((err) => {
      console.error("[overview] Analytics unavailable:", err);
      return null;
    }),
  ]);

  const draftPosts = posts.filter((p) => !p.published);
  const draftCaseStudies = caseStudies.filter((c) => !c.published);
  const drafts = draftPosts.length + draftCaseStudies.length;

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle="Who is visiting, and what is still in draft."
        actionHref={routes.blog.new}
        actionLabel="+ New article"
        secondaryHref={routes.caseStudies.new}
        secondaryLabel="New case study"
      />

      {analytics ? (
        <AnalyticsSection data={analytics} days={days} caseStudies={new Map(caseStudies.map((c) => [c.slug, c.name]))} />
      ) : (
        <p className="rounded-2xl border border-dashed border-border px-5 py-4 text-[13px] text-muted-foreground">
          Visitor numbers aren&rsquo;t available right now. If the database hasn&rsquo;t been updated yet, run <code className="font-mono">npx prisma db push</code>.
        </p>
      )}

      {drafts > 0 && (
        <div className="mt-8">
          <Panel title="Drafts to finish" empty="" isEmpty={false}>
            <div>
              {draftPosts.map((post) => (
                <PanelRow key={post.id} href={routes.blog.item(post.id)} tag="Article" tagTone="brand" primary={post.title} right="Continue" />
              ))}
              {draftCaseStudies.map((cs) => (
                <PanelRow key={cs.id} href={routes.caseStudies.item(cs.slug)} tag="Case study" tagTone="neutral" primary={cs.name} right="Continue" />
              ))}
            </div>
          </Panel>
        </div>
      )}

    </div>
  );
}
