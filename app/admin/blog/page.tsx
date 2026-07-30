import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { togglePostPublished } from "../../actions/admin-blog";
import { DeletePostButton } from "./DeletePostButton";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogAdminPage() {
  let posts: Awaited<ReturnType<typeof prisma.blogPost.findMany>> = [];
  try {
    posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    /* DB not yet migrated */
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-bold text-zinc-900 mb-1">Blog</h1>
          <p className="text-[14px] text-zinc-500">{posts.length} posts</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 text-white text-[13px] font-semibold hover:bg-violet-700 transition-colors shadow-sm"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-16 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4h12M4 8h12M4 12h7" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <p className="text-[14px] font-medium text-zinc-500 mb-1">No posts yet</p>
          <p className="text-[12px] text-zinc-400 mb-4">Write your first blog post to get started.</p>
          <Link href="/admin/blog/new" className="text-[13px] font-semibold text-violet-600 hover:text-violet-700">
            Write first post →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] px-6 py-3.5">Title</th>
                <th className="text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] px-6 py-3.5 hidden md:table-cell">Category</th>
                <th className="text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] px-6 py-3.5 hidden md:table-cell">Date</th>
                <th className="text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-[13.5px] font-semibold text-zinc-900">{post.title}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{post.slug} · {post.readTime}</p>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-zinc-500 hidden md:table-cell">{post.category}</td>
                  <td className="px-6 py-4 text-[13px] text-zinc-500 hidden md:table-cell">{post.dateFormatted}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <form action={togglePostPublished.bind(null, post.id, !post.published)}>
                        <button type="submit" className={`text-[11px] px-2.5 py-1 rounded-full font-semibold transition-colors ${
                          post.published
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                        }`}>
                          {post.published ? "Published" : "Draft"}
                        </button>
                      </form>
                      {post.featured && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-semibold">Featured</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 justify-end">
                      <Link href={`/admin/blog/${post.id}`} className="text-[12px] font-medium text-violet-600 hover:text-violet-700 transition-colors">
                        Edit
                      </Link>
                      <DeletePostButton id={post.id} title={post.title} />
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
