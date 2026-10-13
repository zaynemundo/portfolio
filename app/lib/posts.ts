/* Blog post types only — the database is the source of truth. */

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO format: YYYY-MM-DD
  dateFormatted: string;
  /** ISO timestamp of the last save — what search engines are told as "last modified". */
  updatedAt: string;
  readTime: string;
  category: string;
  featured: boolean;
  published: boolean;
  contentHtml: string;
}

export type PostSummary = Omit<Post, "contentHtml">;
