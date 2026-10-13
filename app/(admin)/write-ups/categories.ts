import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";

/** Every category already used by an article, A–Z — offered as suggestions on the writing screen. */
export const getBlogCategories = unstable_cache(
  async () => {
    const rows = await prisma.blogPost.findMany({
      where: { category: { not: "" } },
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    });
    return rows.map((row) => row.category);
  },
  ["blog-categories"],
  { tags: [CACHE_TAGS.blog], revalidate: 60 }
);
