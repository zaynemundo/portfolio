import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import { updatePost } from "../../../actions/admin-blog";
import { PostForm } from "../PostForm";

export const metadata: Metadata = { title: "Edit Post" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  const action = updatePost.bind(null, id);

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <h1 className="text-[22px] font-bold text-zinc-900 mb-1">Edit post</h1>
      <p className="text-zinc-500 text-[13px] mb-8">{post.title}</p>
      <PostForm post={post} action={action} />
    </div>
  );
}
