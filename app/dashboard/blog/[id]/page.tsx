import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { BlogForm } from "../BlogForm";
import { BackLink } from "@/app/dashboard/components/BackLink";
import { routes } from "@/app/dashboard/routes";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
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
