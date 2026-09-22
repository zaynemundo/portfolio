import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { DeleteButton } from "./DeleteButton";
import { PublishToggle } from "./PublishToggle";

export default async function DashboardBlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { date: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-semibold text-zinc-100">Blog</h1>
          <p className="text-[13px] text-zinc-500 mt-1">{posts.length} article{posts.length === 1 ? "" : "s"}</p>
        </div>
        <Link
          href="/dashboard/blog/new"
          className="rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-4 py-2 hover:bg-white transition-colors"
        >
          + New article
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-[14px] text-zinc-500 py-12 text-center border border-dashed border-zinc-800 rounded-xl">
          No articles yet. Create your first one.
        </p>
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
                      href={`/dashboard/blog/${post.id}`}
                      className="text-[13.5px] font-medium text-zinc-100 hover:text-purple-400 transition-colors"
                    >
                      {post.title}
                    </Link>
                    {post.featured && (
                      <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 align-middle">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-zinc-400">{post.category}</td>
                  <td className="px-4 py-3 text-[13px] text-zinc-400">{post.dateFormatted}</td>
                  <td className="px-4 py-3">
                    <PublishToggle id={post.id} published={post.published} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/dashboard/blog/${post.id}`}
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
