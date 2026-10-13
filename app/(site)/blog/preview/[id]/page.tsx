import type { Metadata } from "next";
import { prisma } from "@/app/lib/prisma";
import { requireSession } from "@/app/lib/session";
import { getPublishedPosts } from "@/app/lib/posts-db";
import { PostPreview } from "./PostPreview";

export const metadata: Metadata = {
  title: "Preview",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * The admin's "Preview" — an article exactly as the live page would show it,
 * whether or not it's published. Lives with the public pages so it gets the
 * real site header and footer, but only renders for a signed-in admin.
 */
export default async function PostPreviewPage({ params }: Props) {
  await requireSession();
  const { id } = await params;

  const [saved, published] = await Promise.all([
    id === "new" ? null : prisma.blogPost.findUnique({ where: { id } }),
    getPublishedPosts(),
  ]);

  return (
    <PostPreview
      id={saved?.id ?? "new"}
      saved={
        saved && {
          title: saved.title,
          excerpt: saved.excerpt,
          category: saved.category,
          contentHtml: saved.contentHtml,
        }
      }
      isLive={saved?.published ?? false}
      others={published.filter((p) => p.id !== saved?.id).map((p) => ({ slug: p.slug, title: p.title }))}
    />
  );
}
