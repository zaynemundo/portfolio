import Link from "next/link";
import { Reveal } from "@/app/components/Reveal";
import { ReadingProgress } from "@/app/components/ReadingProgress";

export interface ArticleViewPost {
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  contentHtml: string;
}

interface ArticleLink {
  slug: string;
  title: string;
}

interface Props {
  post: ArticleViewPost;
  /** Other articles, for the "Further Reading" box. */
  siblings: ArticleLink[];
  prevPost: ArticleLink | null;
  nextPost: ArticleLink | null;
}

/**
 * The public article page, minus the data fetching — shared by the live
 * /blog/[slug] page and the admin's preview so the two can't drift apart.
 */
export function ArticleView({ post, siblings, prevPost, nextPost }: Props) {
  return (
    <div className="min-h-screen bg-white">
      <ReadingProgress />

      {/* ── Header ── */}
      <div className="bg-zinc-950">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 pt-28 pb-12">
          <Reveal>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[12.5px] text-zinc-500 mb-8">
              <Link href="/insights" className="hover:text-zinc-300 transition-colors duration-150">Insights</Link>
              <span aria-hidden="true">/</span>
              <span className="text-zinc-400 truncate max-w-xs">{post.title}</span>
            </nav>
            <div className="flex items-center gap-2.5 mb-5">
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-zinc-300">{post.category}</span>
              <span className="text-[12px] text-zinc-500">{post.readTime}</span>
            </div>
            <h1
              className="font-extrabold text-white tracking-tight mb-5 max-w-3xl leading-tight"
              style={{ fontSize: "clamp(2rem, 5vw, 2.75rem)", letterSpacing: "-0.035em" }}
            >
              {post.title}
            </h1>
            <p className="text-[16px] text-zinc-400 max-w-2xl leading-relaxed">{post.excerpt}</p>
          </Reveal>
        </div>
      </div>

      {/* ── Article content ── */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 pt-10 pb-16">
        <div className="grid lg:grid-cols-[1fr_260px] gap-16">

          <Reveal>
            <article
              className="prose prose-zinc max-w-none [&_p]:leading-[1.8] [&_p]:mb-6 [&_h2]:mt-12 [&_h2]:mb-4 [&_h3]:mt-8 [&_h3]:mb-3 [&_li]:leading-[1.75]"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          </Reveal>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            {/* Article metadata — useful mid-scroll reference */}
            <Reveal delay={100}>
              <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-200">
                <h3 className="text-[11px] font-semibold tracking-[0.12em] uppercase text-zinc-400 mb-4">About this article</h3>
                <dl className="space-y-3">
                  {post.category && (
                    <div>
                      <dt className="text-[10.5px] font-medium uppercase tracking-wider text-zinc-400 mb-0.5">Topic</dt>
                      <dd className="text-[13px] font-medium text-zinc-700">{post.category}</dd>
                    </div>
                  )}
                  {post.readTime && (
                    <div>
                      <dt className="text-[10.5px] font-medium uppercase tracking-wider text-zinc-400 mb-0.5">Read time</dt>
                      <dd className="text-[13px] font-medium text-zinc-700">{post.readTime}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </Reveal>

            {siblings.length > 0 && (
              <Reveal delay={150}>
                <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-200">
                  <h3 className="text-[11px] font-semibold tracking-[0.12em] uppercase text-zinc-400 mb-4">Further Reading</h3>
                  <ul className="space-y-4">
                    {siblings.map((p) => (
                      <li key={p.slug}>
                        <Link href={`/insights/${p.slug}`} className="text-[13px] font-medium text-zinc-700 hover:text-[#8B5CF6] transition-colors duration-150 leading-snug block mb-0.5">
                          {p.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}
          </aside>
        </div>
      </div>

      {/* ── Post navigation ── */}
      {(prevPost || nextPost) && (
        <nav aria-label="Article navigation" className="border-t border-zinc-200 bg-zinc-50">
          <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-10 flex items-center justify-between gap-4">
            <div>
              {prevPost && (
                <Link href={`/insights/${prevPost.slug}`} className="group flex items-center gap-3">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="text-zinc-400 group-hover:text-[#8B5CF6] transition-colors duration-150">
                    <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <p className="text-[11px] font-medium tracking-[0.1em] uppercase text-zinc-400 mb-0.5">Previous</p>
                    <p className="text-[14px] font-semibold text-zinc-900 group-hover:text-[#8B5CF6] transition-colors duration-150 max-w-xs">{prevPost.title}</p>
                  </div>
                </Link>
              )}
            </div>
            <div className="text-right">
              {nextPost && (
                <Link href={`/insights/${nextPost.slug}`} className="group flex items-center gap-3 justify-end">
                  <div>
                    <p className="text-[11px] font-medium tracking-[0.1em] uppercase text-zinc-400 mb-0.5">Next</p>
                    <p className="text-[14px] font-semibold text-zinc-900 group-hover:text-[#8B5CF6] transition-colors duration-150 max-w-xs">{nextPost.title}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="text-zinc-400 group-hover:text-[#8B5CF6] transition-colors duration-150">
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
