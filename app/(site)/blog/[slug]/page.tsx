import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPost, getPublishedPostSlugs, getPublishedPosts } from "@/app/lib/posts-db";
import { ArticleView } from "@/app/components/insights/ArticleView";
import { SITE_URL } from "@/app/lib/site-url";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getPublishedPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt,
    // The article also answers at /insights/<slug> — this is the address search engines should keep.
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: `${post.title} | Zaira Mundo`,
      description: post.excerpt,
      type: "article",
      url: `/blog/${slug}`,
      publishedTime: post.date,
      modifiedTime: post.updatedAt,
      authors: ["Zaira Mundo"],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  const allPosts = await getPublishedPosts();

  // Sidebar: other posts
  const siblings = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  // Prev/next
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  const url = `${SITE_URL}/blog/${slug}`;
  const author = { "@type": "Person", name: "Zaira Mundo", url: SITE_URL };
  /* Tells search engines this is an article, who wrote it and when — what they use for rich results. */
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      articleSection: post.category,
      datePublished: post.date,
      dateModified: post.updatedAt,
      author,
      publisher: author,
      image: `${SITE_URL}/opengraph-image`,
      url,
      mainEntityOfPage: url,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <ArticleView post={post} siblings={siblings} prevPost={prevPost} nextPost={nextPost} />
    </>
  );
}
