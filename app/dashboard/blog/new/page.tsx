import { BlogForm } from "../BlogForm";

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="text-[22px] font-semibold text-zinc-100 mb-8">New article</h1>
      <BlogForm mode="new" />
    </div>
  );
}
