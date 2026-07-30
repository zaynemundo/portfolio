"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function postFromForm(data: FormData) {
  const date = (data.get("date") as string).trim(); // YYYY-MM-DD
  const dateObj = new Date(date);
  const dateFormatted = dateObj.toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
  const wordCount = ((data.get("content") as string) || "").split(/\s+/).length;
  const readTime = `${Math.max(1, Math.round(wordCount / 200))} min read`;

  return {
    slug: (data.get("slug") as string).trim(),
    title: (data.get("title") as string).trim(),
    excerpt: (data.get("excerpt") as string).trim(),
    date,
    dateFormatted,
    readTime,
    category: (data.get("category") as string).trim(),
    featured: false,
    content: (data.get("content") as string).trim(),
    published: data.get("published") === "true",
  };
}

export async function createPost(data: FormData) {
  await prisma.blogPost.create({ data: postFromForm(data) });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function updatePost(id: string, data: FormData) {
  await prisma.blogPost.update({ where: { id }, data: postFromForm(data) });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function deletePost(id: string) {
  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function togglePostPublished(id: string, published: boolean) {
  await prisma.blogPost.update({ where: { id }, data: { published } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
