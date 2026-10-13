import { BlogForm } from "../BlogForm";
import { getBlogCategories } from "../categories";

export default async function NewBlogPostPage() {
  return <BlogForm categories={await getBlogCategories()} />;
}
