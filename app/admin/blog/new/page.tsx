import type { Metadata } from "next";
import { createPost } from "../../../actions/admin-blog";
import { PostForm } from "../PostForm";

export const metadata: Metadata = { title: "New Post" };

export default function NewPostPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <h1 className="text-[22px] font-bold text-zinc-900 mb-1">New post</h1>
      <p className="text-zinc-500 text-[13px] mb-8">Write and publish a blog post.</p>
      <PostForm action={createPost} />
    </div>
  );
}
