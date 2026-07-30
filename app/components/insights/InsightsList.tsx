"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Reveal } from "@/app/components/Reveal";

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
  initialLimit?: number;
}

export function InsightsList({ posts, initialLimit = 6 }: Props) {
  const [visibleCount, setVisibleCount] = useState(initialLimit);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  /* Future category filtering architecture */
  const filteredPosts = useMemo(() => {
    if (!selectedCategory) return posts;
    return posts.filter(
      (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [posts, selectedCategory]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  const categories = useMemo(() => {
    const seen = new Set<string>();
    return posts.reduce<string[]>((acc, p) => {
      if (p.category && !seen.has(p.category)) { seen.add(p.category); acc.push(p.category); }
      return acc;
    }, []);
  }, [posts]);

  return (
    <div>
      {/* Category filter pills */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            type="button"
            onClick={() => { setSelectedCategory(null); setVisibleCount(initialLimit); }}
            className={`text-[12px] font-medium px-3.5 py-1.5 rounded-full border transition-colors duration-150 cursor-pointer ${
              selectedCategory === null
                ? "bg-[#8B5CF6] border-[#8B5CF6] text-white"
                : "bg-white border-zinc-200 text-zinc-500 hover:border-[#8B5CF6] hover:text-[#8B5CF6]"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => { setSelectedCategory(cat); setVisibleCount(initialLimit); }}
              className={`text-[12px] font-medium px-3.5 py-1.5 rounded-full border transition-colors duration-150 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#8B5CF6] border-[#8B5CF6] text-white"
                  : "bg-white border-zinc-200 text-zinc-500 hover:border-[#8B5CF6] hover:text-[#8B5CF6]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Editorial Article List */}
      <div className="divide-y divide-zinc-200/80">
        {visiblePosts.map((post, i) => (
          <Reveal key={post.slug} delay={(i % initialLimit) * 50}>
            <Link
              href={`/insights/${post.slug}`}
              className="group block py-7 md:py-9 transition-colors duration-200"
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
                  <h2 className="text-[18px] md:text-[20px] font-bold text-zinc-900 group-hover:opacity-60 transition-opacity duration-200 tracking-tight mb-2">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-[14.5px] text-zinc-600 leading-[1.65] line-clamp-2 max-w-3xl">
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
          </Reveal>
        ))}
      </div>

      {/* Progressive Load More Action */}
      {hasMore && (
        <div className="pt-12 flex justify-center">
          <Reveal>
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-zinc-200 bg-white text-zinc-700 text-[14px] font-semibold hover:border-[#8B5CF6] hover:text-[#8B5CF6] hover:bg-[#f5f3ff] transition-all duration-200 shadow-xs cursor-pointer"
            >
              <span>Load more articles</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M7 3v8M3.5 7.5L7 11l3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </Reveal>
        </div>
      )}
    </div>
  );
}
