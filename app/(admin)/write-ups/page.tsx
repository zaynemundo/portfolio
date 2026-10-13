import Link from "next/link";
import { Pencil } from "lucide-react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { DeleteButton } from "./DeleteButton";
import { PublishToggle } from "./PublishToggle";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { FeaturedBadge } from "@/app/(admin)/_components/FeaturedBadge";
import { cardClass } from "@/app/(admin)/_components/ui/Card";
import { DataTable } from "@/app/(admin)/_components/ui/DataTable";
import { RowMenu, RowMenuItem } from "@/app/(admin)/_components/ui/RowMenu";
import { InsightsPageButton } from "@/app/(admin)/insights-settings/InsightsPageButton";
import { getSiteSettings } from "@/app/lib/settings-db";
import { routes } from "@/app/(admin)/_routes";

const getBlogPosts = unstable_cache(
  () => prisma.blogPost.findMany({ orderBy: { date: "desc" } }),
  ["blog-list"],
  { tags: [CACHE_TAGS.blog], revalidate: 60 }
);

export default async function DashboardBlogPage() {
  const [posts, settings] = await Promise.all([getBlogPosts(), getSiteSettings()]);

  return (
    <div>
      <PageHeader
        title="Blog"
        subtitle={`${posts.length} article${posts.length === 1 ? "" : "s"}`}
        actionHref={routes.blog.new}
        actionLabel="+ New article"
        secondary={<InsightsPageButton heading={settings.blogPageHeading} intro={settings.blogPageIntro} />}
      />

      {posts.length === 0 ? (
        <EmptyState message="No articles yet. Create your first one." />
      ) : (
        <div className={`${cardClass} p-5`}>
          <DataTable
            inset={false}
            toolbar="always"
            searchPlaceholder="Search by title or category…"
            filters={[{ key: "status", label: "Status", options: [{ value: "published", label: "Published" }, { value: "draft", label: "Draft" }] }]}
            columns={[{ label: "Title" }, { label: "Category" }, { label: "Date" }, { label: "Published" }, { className: "w-12" }]}
            rows={posts.map((post) => ({
              id: post.id,
              href: routes.blog.item(post.id),
              search: `${post.title} ${post.category}`,
              sort: [post.title || "Untitled", post.category || null, new Date(post.date).getTime(), post.published ? "Published" : "Draft", undefined],
              filters: { status: post.published ? "published" : "draft" },
              cells: (
                <>
                <td className="px-4 py-3">
                  <Link
                    href={routes.blog.item(post.id)}
                    className="text-[13.5px] font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {post.title || "Untitled"}
                  </Link>
                  {post.featured && <FeaturedBadge />}
                </td>
                <td className="px-4 py-3 text-[13px] text-muted-foreground">{post.category}</td>
                <td className="px-4 py-3 text-[13px] text-muted-foreground">{post.published ? post.dateFormatted : "Not published"}</td>
                <td className="px-4 py-3">
                  <PublishToggle id={post.id} published={post.published} />
                </td>
                <td className="px-4 py-3 text-right">
                  <RowMenu>
                    <RowMenuItem href={routes.blog.item(post.id)} icon={<Pencil size={14} />}>
                      Edit
                    </RowMenuItem>
                    <DeleteButton id={post.id} title={post.title} menu />
                  </RowMenu>
                </td>
                </>
              ),
            }))}
          />
        </div>
      )}
    </div>
  );
}
