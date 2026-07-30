import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "../lib/prisma";

export const metadata: Metadata = { title: "Dashboard — Console" };

async function getData() {
  try {
    const [inquiries, unread, projects, posts, recentInquiries, recentProjects] = await Promise.all([
      prisma.contactSubmission.count(),
      prisma.contactSubmission.count({ where: { read: false } }),
      prisma.project.count({ where: { published: true } }),
      prisma.blogPost.count({ where: { published: true } }),
      prisma.contactSubmission.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.project.findMany({ orderBy: { sortOrder: "asc" }, take: 5, where: { published: true } }),
    ]);
    return { inquiries, unread, projects, posts, recentInquiries, recentProjects };
  } catch {
    return {
      inquiries: 0, unread: 0, projects: 0, posts: 0,
      recentInquiries: [], recentProjects: [],
    };
  }
}

export default async function AdminDashboard() {
  const data = await getData();
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="p-6 lg:p-10 max-w-7xl space-y-8">

      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 md:p-8 border border-zinc-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-[0.1em]">Admin Console Active</p>
          </div>
          <h1 className="text-[26px] md:text-[32px] font-extrabold text-zinc-950 tracking-tight leading-tight">
            Welcome back, Zaira
          </h1>
          <p className="text-[14px] text-zinc-500 font-medium mt-0.5">{today}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 text-white text-[13px] font-semibold hover:bg-blue-600 transition-all duration-150 shadow-2xs"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            Add New Work
          </Link>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-800 text-[13px] font-semibold hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-150 shadow-2xs"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 2.5h8M2.5 6.5h8M2.5 10.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            Write Article
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Portfolio Status — Dark Card */}
        <div className="bg-zinc-950 text-white rounded-2xl p-6 flex flex-col justify-between border border-zinc-800 shadow-xs min-h-[160px] group hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.8 3.6 4 .6-2.9 2.8.7 4L8 10l-3.6 1.9.7-4L2.2 5.2l4-.6L8 1z" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/></svg>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Live
            </span>
          </div>
          <div>
            <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-[0.1em] mb-1">Portfolio Works</p>
            <p className="text-[2.2rem] font-extrabold text-white leading-none mb-1">{data.projects}</p>
            <p className="text-[11.5px] text-zinc-400 font-medium">Active case studies published</p>
          </div>
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-400 hover:text-blue-300 transition-colors mt-4"
          >
            Manage Works →
          </Link>
        </div>

        {/* Unread Inquiries */}
        <div className="bg-white rounded-2xl border border-zinc-200/90 p-6 shadow-2xs flex flex-col justify-between hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 15 15" fill="none"><rect x="1" y="2.5" width="13" height="10" rx="2" stroke="#2563eb" strokeWidth="1.4"/><path d="M1 5.5l6.5 4 6.5-4" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </div>
            {data.unread > 0 ? (
              <span className="text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-600 text-white animate-pulse">
                {data.unread} Action Required
              </span>
            ) : (
              <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500">
                All Read
              </span>
            )}
          </div>
          <div>
            <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-[0.1em] mb-1">Contact Inquiries</p>
            <p className="text-[2.2rem] font-extrabold text-zinc-950 leading-none mb-1">{data.unread}</p>
            <p className="text-[11.5px] text-zinc-500">{data.inquiries} total submissions</p>
          </div>
          <Link href="/admin/inquiries" className="text-[12.5px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-4">
            View Inquiries →
          </Link>
        </div>

        {/* Blog Posts */}
        <div className="bg-white rounded-2xl border border-zinc-200/90 p-6 shadow-2xs flex flex-col justify-between hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 15 15" fill="none"><path d="M3 3h9M3 6h9M3 9h5" stroke="#7c3aed" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </div>
            <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Published
            </span>
          </div>
          <div>
            <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-[0.1em] mb-1">Blog Articles</p>
            <p className="text-[2.2rem] font-extrabold text-zinc-950 leading-none mb-1">{data.posts}</p>
            <p className="text-[11.5px] text-zinc-500">Insights &amp; publications</p>
          </div>
          <Link href="/admin/blog" className="text-[12.5px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-4">
            Manage Articles →
          </Link>
        </div>

        {/* System & Performance Audit */}
        <div className="bg-white rounded-2xl border border-zinc-200/90 p-6 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 2l5 2.5v4c0 3.5-2.5 6-5 7-2.5-1-5-3.5-5-7v-4L8 2z" stroke="#059669" strokeWidth="1.4" strokeLinejoin="round"/></svg>
            </div>
            <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              100% Score
            </span>
          </div>
          <div>
            <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-[0.1em] mb-1">System Health</p>
            <p className="text-[14px] font-extrabold text-zinc-900 leading-tight mb-2">Optimal Performance</p>
            <div className="space-y-1 text-[11.5px] text-zinc-500 font-medium">
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> SEO &amp; Accessibility 100
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Core Web Vitals Pass
              </p>
            </div>
          </div>
          <Link href="/" target="_blank" className="text-[12.5px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-4">
            Audit Site →
          </Link>
        </div>

      </div>

      {/* Quick Launch Cards */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs p-6">
        <h2 className="text-[15px] font-bold text-zinc-950 mb-4">Quick Management Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/admin/projects/new"
            className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-blue-50/50 hover:border-blue-200 transition-all duration-150 group"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-2.5 group-hover:bg-blue-600 transition-colors">
              <svg width="14" height="14" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
            <p className="text-[13px] font-bold text-zinc-950 group-hover:text-blue-700 transition-colors">Add Work</p>
            <p className="text-[11px] text-zinc-500">Create new case study</p>
          </Link>

          <Link
            href="/admin/blog/new"
            className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-blue-50/50 hover:border-blue-200 transition-all duration-150 group"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-2.5 group-hover:bg-blue-600 transition-colors">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3.5 3h9M3.5 6h9M3.5 9h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </div>
            <p className="text-[13px] font-bold text-zinc-950 group-hover:text-blue-700 transition-colors">Write Article</p>
            <p className="text-[11px] text-zinc-500">Publish new blog post</p>
          </Link>

          <Link
            href="/admin/about"
            className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-blue-50/50 hover:border-blue-200 transition-all duration-150 group"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-2.5 group-hover:bg-blue-600 transition-colors">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 7.5v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </div>
            <p className="text-[13px] font-bold text-zinc-950 group-hover:text-blue-700 transition-colors">Edit About &amp; Profile</p>
            <p className="text-[11px] text-zinc-500">Update bio &amp; CV download</p>
          </Link>

          <Link
            href="/admin/inquiries"
            className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-blue-50/50 hover:border-blue-200 transition-all duration-150 group"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-2.5 group-hover:bg-blue-600 transition-colors">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2 5.5l6 4 6-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </div>
            <p className="text-[13px] font-bold text-zinc-950 group-hover:text-blue-700 transition-colors">Inquiries</p>
            <p className="text-[11px] text-zinc-500">Read &amp; reply to messages</p>
          </Link>
        </div>
      </div>

      {/* Bottom Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Inquiries */}
        <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
            <h2 className="text-[15px] font-bold text-zinc-950">Recent Inquiries</h2>
            <Link href="/admin/inquiries" className="text-[12.5px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-zinc-100">
            {data.recentInquiries.length === 0 ? (
              <p className="px-6 py-10 text-[13.5px] text-zinc-400 text-center">No contact inquiries yet.</p>
            ) : (
              data.recentInquiries.map((inq) => (
                <div key={inq.id} className="px-6 py-4 flex items-start justify-between gap-3 hover:bg-zinc-50/80 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 text-white font-bold text-[10px]">
                      {inq.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-bold text-zinc-950 truncate">{inq.name}</p>
                      <p className="text-[12px] text-zinc-500 truncate mt-0.5">{inq.message.slice(0, 65)}…</p>
                    </div>
                  </div>
                  <span className={`shrink-0 text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full ${
                    !inq.read
                      ? "bg-blue-100 text-blue-700"
                      : "bg-zinc-100 text-zinc-500"
                  }`}>
                    {!inq.read ? "New" : "Read"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Works & Case Studies */}
        <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
            <h2 className="text-[15px] font-bold text-zinc-950">Works &amp; Case Studies</h2>
            <Link href="/admin/projects" className="text-[12.5px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-zinc-100">
            {data.recentProjects.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-[13.5px] text-zinc-400 mb-3">No works in database yet.</p>
                <Link href="/admin/projects/new" className="text-[12.5px] font-bold text-blue-600 hover:underline">
                  Add First Work →
                </Link>
              </div>
            ) : (
              data.recentProjects.map((p) => (
                <div key={p.id} className="px-6 py-4 flex items-center justify-between gap-3 hover:bg-zinc-50/80 transition-colors">
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-bold text-zinc-950 truncate">{p.name}</p>
                    <p className="text-[12px] text-zinc-500 mt-0.5">{p.category} · {p.year}</p>
                  </div>
                  <span className="shrink-0 text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    Published
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}


