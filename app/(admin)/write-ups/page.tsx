import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { DeleteButton } from "./DeleteButton";
import { PublishToggle } from "./PublishToggle";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { FeaturedBadge } from "@/app/(admin)/_components/FeaturedBadge";
import { routes } from "@/app/(admin)/_routes";

export default async function DashboardBlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { date: "desc" } });

  return (
    <div>
      <PageHeader
        title="Blog"
        subtitle={`${posts.length} article${posts.length === 1 ? "" : "s"}`}
        actionHref={routes.blog.new}
        actionLabel="+ New article"
      />

      {posts.length === 0 ? (
        <EmptyState message="No articles yet. Create your first one." />
      ) : (
        <div className="border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Title</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Category</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Date</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Status</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-zinc-800/70 last:border-b-0 hover:bg-zinc-900/40">
                  <td className="px-4 py-3">
                    <Link
                      href={routes.blog.item(post.id)}
                      className="text-[13.5px] font-medium text-zinc-100 hover:text-purple-400 transition-colors"
                    >
                      {post.title}
                    </Link>
                    {post.featured && <FeaturedBadge />}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-zinc-400">{post.category}</td>
                  <td className="px-4 py-3 text-[13px] text-zinc-400">{post.dateFormatted}</td>
                  <td className="px-4 py-3">
                    <PublishToggle id={post.id} published={post.published} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={routes.blog.item(post.id)}
                        className="text-[12.5px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
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
