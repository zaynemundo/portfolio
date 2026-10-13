/* Everything about an article that's worked out rather than typed in.
   Plain functions with no server imports — the writing screen uses them to
   show what will be saved, and the save path uses them to save it. */

/** What the writing screen sends on every save. */
export interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  featured: boolean;
  published: boolean;
  contentHtml: string;
  /** YYYY-MM-DD. The article's date once it's live; today, while it's a draft. */
  date: string;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function plainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/g, "x")
    .trim();
}

export function wordCount(html: string): number {
  const text = plainText(html);
  return text ? text.split(/\s+/).length : 0;
}

const WORDS_PER_MINUTE = 200;

/** "4 min read" — never less than a minute. */
export function readTimeFor(html: string): string {
  return `${Math.max(1, Math.round(wordCount(html) / WORDS_PER_MINUTE))} min read`;
}

/** YYYY-MM-DD → the date line shown on the site, e.g. "13 October 2026". */
export function formatPostDate(isoDay: string): string {
  return new Date(`${isoDay}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function isIsoDay(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  // Rejects days that don't exist — "2026-02-30" parses, but as 2 March.
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

/** Today in the browser's (or server's) own timezone, as YYYY-MM-DD. */
export function localToday(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** What's still missing before an article can go live. Empty = ready. */
export function publishProblems(post: Pick<PostFormData, "title" | "excerpt" | "category" | "contentHtml">): string[] {
  const missing: string[] = [];
  if (!post.title.trim()) missing.push("a title");
  if (wordCount(post.contentHtml) === 0) missing.push("some text");
  if (!post.excerpt.trim()) missing.push("an excerpt");
  if (!post.category.trim()) missing.push("a category");
  return missing;
}

export function publishProblemsMessage(missing: string[]): string {
  const list = missing.length > 1 ? `${missing.slice(0, -1).join(", ")} and ${missing[missing.length - 1]}` : missing[0];
  return `Before publishing, add ${list}.`;
}

/** Where the writing screen leaves its current, possibly unsaved, text for the preview tab to pick up. */
export const POST_PREVIEW_STORAGE_KEY = "zm-post-preview";

export interface PostPreviewDraft {
  /** The article's id, or "new" before its first save — so a preview never shows another article's text. */
  id: string;
  title: string;
  excerpt: string;
  category: string;
  contentHtml: string;
}
