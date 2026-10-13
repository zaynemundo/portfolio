import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { BlogForm } from "../BlogForm";
import { getBlogCategories } from "../categories";

interface Props {
  params: Promise<{ id: string }>;
}

const getBlogPost = unstable_cache(
  (id: string) => prisma.blogPost.findUnique({ where: { id } }),
  ["blog-post-detail"],
  { tags: [CACHE_TAGS.blog], revalidate: 60 }
);

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params;
  const [post, categories] = await Promise.all([getBlogPost(id), getBlogCategories()]);
  if (!post) notFound();

  return (
    <BlogForm
      postId={post.id}
      categories={categories}
      initial={{
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        category: post.category,
        featured: post.featured,
        published: post.published,
        contentHtml: post.contentHtml,
        // unstable_cache hands dates back as strings.
        date: new Date(post.date).toISOString().slice(0, 10),
      }}
    />
  );
}
