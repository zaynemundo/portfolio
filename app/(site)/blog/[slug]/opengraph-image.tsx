import { getPublishedPost } from "@/app/lib/posts-db";
import { OG_SIZE, renderOgImage } from "@/app/lib/og-image";

export const alt = "Article by Zaira Mundo";
export const size = OG_SIZE;
export const contentType = "image/png";

/** Each article's own share card, carrying its title. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  return renderOgImage({
    eyebrow: post?.category || "Article",
    title: post?.title ?? "Zaira Mundo",
    footer: post?.readTime ?? "zairamundo.com",
  });
}
