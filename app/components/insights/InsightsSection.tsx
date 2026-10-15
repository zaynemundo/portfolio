"use client";

import Link from "next/link";
import { Reveal } from "@/app/components/Reveal";
import "./insights.css";

/* ── Types ──────────────────────────────────────────────────────────────────── */

export type PostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  dateFormatted: string;
  readTime: string;
  category: string;
};

interface Props {
  posts: PostSummary[];
  heading?: string;
  intro?: string;
}

export function InsightsSection({
  posts,
  heading = "Perspectives on accessible, standards-compliant digital platforms.",
  intro = "Perspectives on web accessibility, technical performance, information architecture, front-end implementation, and the standards-based systems behind reliable, inclusive digital services.",
}: Props) {
  if (posts.length === 0) return null;

  return (
    <section
      id="insights"
      aria-labelledby="insights-heading"
      className="in bg-white rounded-b-[32px] md:rounded-b-[48px] overflow-hidden relative z-10 py-24 md:py-32"
    >
      <div className="max-w-(--site-max) mx-auto px-6 md:px-10">

        {/* ── Section header ──────────────────────────────────────────────── */}
        <header className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <Reveal className="max-w-2xl">
            <h2
              id="insights-heading"
              className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight mb-4"
            >
              {heading}
            </h2>

            <p className="text-[15.5px] text-zinc-500 leading-relaxed">
              {intro}
            </p>
          </Reveal>

          <Reveal delay={120} className="shrink-0 pb-1">
            <Link
              href="/insights"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-zinc-700 border border-zinc-200 rounded-full px-4 py-2 hover:text-[#8B5CF6] hover:border-[#8B5CF6] hover:bg-[#f5f3ff] transition-all duration-200"
            >
              <span>View all insights</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 6h8M6.5 2.5L10 6l-3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </Reveal>
        </header>

        {/* ── Article list — uniform editorial rows ───────────────────────── */}
        <div className="divide-y divide-zinc-200/80" role="list">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 60}>
              <InsightRow post={post} />
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}

function InsightRow({ post }: { post: PostSummary }) {
  return (
    <article className="in-row" role="listitem">
      <Link
        href={`/insights/${post.slug}`}
        className="group block py-7 md:py-8 transition-colors duration-200"
        aria-label={`Read "${post.title}"`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8">
          <div className="flex-1 min-w-0 pr-4">
            {/* Category & Meta */}
            <div className="text-[11px] font-mono font-medium text-[#8B5CF6] uppercase tracking-wider mb-2">
              <span>{post.category}</span>
              {post.readTime && (
                <>
                  <span aria-hidden="true" className="mx-2 text-zinc-300">·</span>
                  <span>{post.readTime}</span>
                </>
              )}
            </div>

            {/* Title — Primary Hero */}
            <h3 className="text-[18px] md:text-[20px] font-bold text-zinc-900 group-hover:opacity-60 transition-opacity duration-200 tracking-tight mb-2">
              {post.title}
            </h3>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-[14px] text-zinc-500 leading-relaxed line-clamp-2 max-w-3xl">
                {post.excerpt}
              </p>
            )}
          </div>

          {/* Prominent Arrow Destination */}
          <div className="shrink-0 flex items-center justify-end pt-2 md:pt-0">
            <span className="w-10 h-10 rounded-full border border-zinc-200/80 bg-zinc-50 group-hover:bg-[#8B5CF6] group-hover:border-[#8B5CF6] group-hover:text-white text-zinc-500 flex items-center justify-center transition-all duration-300 shadow-2xs">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                className="transform group-hover:translate-x-0.5 transition-transform duration-200"
              >
                <path
                  d="M3.5 8h9M9 4.5L12.5 8 9 11.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
