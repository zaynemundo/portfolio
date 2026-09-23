import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { BlogForm } from "../BlogForm";
import { BackLink } from "@/app/(admin)/_components/BackLink";
import { routes } from "@/app/(admin)/_routes";

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
  const post = await getBlogPost(id);
  if (!post) notFound();

  return (
    <div>
      <BackLink href={routes.blog.list} label="Blog" />
      <h1 className="text-[22px] font-semibold text-zinc-100 mt-1 mb-8">Edit article</h1>
      <BlogForm
        mode="edit"
        postId={post.id}
        initial={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          category: post.category,
          readTime: post.readTime,
          featured: post.featured,
          published: post.published,
          contentHtml: post.contentHtml,
        }}
      />
    </div>
  );
}
