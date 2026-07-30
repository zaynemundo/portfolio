import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { posts, getPost } from "@/app/lib/posts";
import { prisma } from "@/app/lib/prisma";
import { Reveal } from "@/app/components/Reveal";
import { ReadingProgress } from "@/app/components/ReadingProgress";

interface Props {
  params: Promise<{ slug: string }>;
}

/* Minimal markdown → React renderer for DB posts (string content) */
function renderMarkdown(md: string) {
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  function flushList() {
    if (listItems.length) {
      blocks.push(
        <ul key={key++}>
          {listItems.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      );
      listItems = [];
    }
  }

  const lines = md.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      flushList();
      blocks.push(<h2 key={key++}>{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      flushList();
      blocks.push(<h3 key={key++}>{line.slice(4)}</h3>);
    } else if (line.startsWith("- ")) {
      listItems.push(line.slice(2));
    } else if (/^\d+\.\s/.test(line)) {
      listItems.push(line.replace(/^\d+\.\s/, ""));
    } else if (line.trim() === "" || line.trim() === "---") {
      flushList();
    } else if (line.trim()) {
      flushList();
      const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) return <strong key={j}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.endsWith("*")) return <em key={j}>{part.slice(1, -1)}</em>;
        return part;
      });
      blocks.push(<p key={key++}>{parts}</p>);
    }
  }
  flushList();
  return blocks;
}

export async function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const staticPost = getPost(slug);
  if (staticPost) {
    return {
      title: staticPost.title,
      description: staticPost.excerpt,
      openGraph: { title: `${staticPost.title} | Zaira Mundo`, description: staticPost.excerpt, type: "article", publishedTime: staticPost.date },
    };
  }
  try {
    const dbPost = await prisma.blogPost.findUnique({ where: { slug }, select: { title: true, excerpt: true, date: true } });
    if (dbPost) return { title: dbPost.title, description: dbPost.excerpt, openGraph: { type: "article", publishedTime: dbPost.date } };
  } catch { /* DB unavailable */ }
  return { title: "Post not found" };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  // Try static first
  const staticPost = getPost(slug);

  // Try DB if not in static
  type DbPost = { id: string; slug: string; title: string; excerpt: string; date: string; dateFormatted: string; readTime: string; category: string; content: string };
  let dbPost: DbPost | null = null;
  if (!staticPost) {
    try {
      dbPost = await prisma.blogPost.findUnique({ where: { slug, published: true } }) as DbPost | null;
    } catch { /* DB unavailable */ }
  }

  if (!staticPost && !dbPost) notFound();

  // Unified display fields
  const meta = staticPost ?? dbPost!;
  const isDb = !staticPost;

  // Sidebar: other posts
  type Sibling = { slug: string; title: string; dateFormatted: string };
  let siblings: Sibling[] = posts.filter((p) => p.slug !== slug).slice(0, 3);
  if (isDb) {
    try {
      const others = await prisma.blogPost.findMany({
        where: { published: true, NOT: { slug } },
        orderBy: { date: "desc" },
        take: 3,
        select: { slug: true, title: true, dateFormatted: true },
      });
      if (others.length) siblings = others;
    } catch { /* use static */ }
  }

  // Prev/next for static posts
  const currentIndex = posts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

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
              <span className="text-zinc-400 truncate max-w-xs">{meta.title}</span>
            </nav>
            <div className="flex items-center gap-2.5 mb-5">
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-zinc-300">{meta.category}</span>
              <span className="text-[12px] text-zinc-500">{meta.readTime}</span>
            </div>
            <h1
              className="font-extrabold text-white tracking-tight mb-5 max-w-3xl leading-tight"
              style={{ fontSize: "clamp(2rem, 5vw, 2.75rem)", letterSpacing: "-0.035em" }}
            >
              {meta.title}
            </h1>
            <p className="text-[16px] text-zinc-400 max-w-2xl leading-relaxed">{meta.excerpt}</p>
          </Reveal>
        </div>
      </div>

      {/* ── Article content ── */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 pt-10 pb-16">
        <div className="grid lg:grid-cols-[1fr_260px] gap-16">

          <Reveal>
            <article className="prose prose-zinc max-w-none [&_p]:leading-[1.8] [&_p]:mb-6 [&_h2]:mt-12 [&_h2]:mb-4 [&_h3]:mt-8 [&_h3]:mb-3 [&_li]:leading-[1.75]">
              {isDb && dbPost
                ? dbPost.content.trimStart().startsWith("<")
                  /* WYSIWYG HTML content */
                  ? <div dangerouslySetInnerHTML={{ __html: dbPost.content }} />
                  /* Legacy markdown content */
                  : renderMarkdown(dbPost.content)
                : staticPost!.content.map((block, i) => {
                    if (block.type === "paragraph") return <p key={i}>{block.text}</p>;
                    if (block.type === "heading") return <h2 key={i}>{block.text}</h2>;
                    if (block.type === "list" && block.items) return <ul key={i}>{block.items.map((item, j) => <li key={j}>{item}</li>)}</ul>;
                    return null;
                  })
              }
            </article>
          </Reveal>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            {/* Article metadata — useful mid-scroll reference */}
            <Reveal delay={100}>
              <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-200">
                <h3 className="text-[11px] font-semibold tracking-[0.12em] uppercase text-zinc-400 mb-4">About this article</h3>
                <dl className="space-y-3">
                  {meta.category && (
                    <div>
                      <dt className="text-[10.5px] font-medium uppercase tracking-wider text-zinc-400 mb-0.5">Topic</dt>
                      <dd className="text-[13px] font-medium text-zinc-700">{meta.category}</dd>
                    </div>
                  )}
                  {meta.readTime && (
                    <div>
                      <dt className="text-[10.5px] font-medium uppercase tracking-wider text-zinc-400 mb-0.5">Read time</dt>
                      <dd className="text-[13px] font-medium text-zinc-700">{meta.readTime}</dd>
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

      {/* ── Post navigation (static only) ── */}
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
