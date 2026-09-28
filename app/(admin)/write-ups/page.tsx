import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { DeleteButton } from "./DeleteButton";
import { PublishToggle } from "./PublishToggle";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { FeaturedBadge } from "@/app/(admin)/_components/FeaturedBadge";
import { routes } from "@/app/(admin)/_routes";

const getBlogPosts = unstable_cache(
  () => prisma.blogPost.findMany({ orderBy: { date: "desc" } }),
  ["blog-list"],
  { tags: [CACHE_TAGS.blog], revalidate: 60 }
);

export default async function DashboardBlogPage() {
  const posts = await getBlogPosts();

  return (
    <div>
      <PageHeader
        title="Blog"
        subtitle={`${posts.length} article${posts.length === 1 ? "" : "s"}`}
        actionHref={routes.blog.new}
        actionLabel="+ New article"
        secondaryHref={routes.blogPage}
        secondaryLabel="Edit Insights page"
      />

      {posts.length === 0 ? (
        <EmptyState message="No articles yet. Create your first one." />
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-card/50">
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-border/70 last:border-b-0 hover:bg-card/40">
                  <td className="px-4 py-3">
                    <Link
                      href={routes.blog.item(post.id)}
                      className="text-[13.5px] font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {post.title}
                    </Link>
                    {post.featured && <FeaturedBadge />}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-muted-foreground">{post.category}</td>
                  <td className="px-4 py-3 text-[13px] text-muted-foreground">{post.dateFormatted}</td>
                  <td className="px-4 py-3">
                    <PublishToggle id={post.id} published={post.published} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={routes.blog.item(post.id)}
                        className="text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Edit
                      </Link>
                      <DeleteButton id={post.id} title={post.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
