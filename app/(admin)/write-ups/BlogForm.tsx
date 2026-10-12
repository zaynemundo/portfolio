"use client";

import { useState, useTransition } from "react";
import { ExternalLink, Star } from "lucide-react";
import { RichEditor } from "@/app/(admin)/_components/RichEditor";
import { createPost, updatePost, type PostFormData } from "@/app/actions/posts";
import { SaveBar, useSaveState, useUnsavedWarning } from "@/app/(admin)/_components/SaveBar";

interface Props {
  mode: "new" | "edit";
  postId?: string;
  initial?: Partial<PostFormData>;
}

const READ_TIME_OPTIONS = ["3 min read", "4 min read", "5 min read", "6 min read", "7 min read", "8 min read", "10 min read"];

export function BlogForm({ mode, postId, initial }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [readTime, setReadTime] = useState(initial?.readTime ?? READ_TIME_OPTIONS[2]);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [published, setPublished] = useState(initial?.published ?? false);
  const [contentHtml, setContentHtml] = useState(initial?.contentHtml ?? "<p></p>");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const data: PostFormData = { title, slug, excerpt, category, readTime, featured, published, contentHtml };
  const saveState = useSaveState(data);
  useUnsavedWarning(saveState.dirty && !isPending);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) {
      setSlug(value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = mode === "new" ? await createPost(data) : await updatePost(postId!, data);
      if (result && !result.ok) {
        setError(result.error ?? "Something went wrong.");
      } else if (result?.ok) {
        saveState.markSaved(data);
      }
    });
  }

  const borderlessInput = "w-full bg-transparent border-0 border-b border-transparent focus:border-border px-0 py-1.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-colors";
  const microLabel = "block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label htmlFor="title" className={microLabel}>Title</label>
        <div className="flex items-center gap-2">
          <input
            id="title"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Title"
            className={`${borderlessInput} text-[26px] font-bold`}
          />
          <button
            type="button"
            onClick={() => setFeatured(!featured)}
            aria-label={featured ? "Remove from Featured" : "Mark as Featured"}
            aria-pressed={featured}
            title={featured ? "Featured" : "Mark as Featured"}
            className={`shrink-0 h-8 w-8 flex items-center justify-center rounded-full transition-colors ${
              featured ? "text-amber-500 hover:text-amber-600" : "text-muted-foreground/40 hover:text-muted-foreground"
            }`}
          >
            <Star size={20} fill={featured ? "currentColor" : "none"} />
          </button>
        </div>
        <label htmlFor="slug" className={`${microLabel} mt-4`}>Slug</label>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[12.5px] text-muted-foreground/70 shrink-0">/blog/</span>
          <input
            id="slug"
            required
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
            className={`${borderlessInput} flex-1 font-mono text-[12.5px] text-muted-foreground py-0.5`}
          />
          {slug && (
            <a
              href={`/blog/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open live post in a new tab"
              title="Open live post"
              className="text-muted-foreground/70 hover:text-primary transition-colors shrink-0"
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="excerpt" className={microLabel}>Excerpt</label>
        <textarea
          id="excerpt"
          required
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="A short summary shown on the Blog list"
          className={`${borderlessInput} text-[14.5px] resize-none`}
        />
      </div>

      <div className="flex items-center gap-6">
        <div>
          <label htmlFor="category" className={microLabel}>Category</label>
          <input
            id="category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
            className={`${borderlessInput} text-[13.5px] w-40`}
          />
        </div>
        <div>
          <label htmlFor="readTime" className={microLabel}>Read time</label>
          <select
            id="readTime"
            value={readTime}
            onChange={(e) => setReadTime(e.target.value)}
            className={`${borderlessInput} text-[13.5px] w-40`}
          >
            {READ_TIME_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="status" className={microLabel}>Status</label>
          <select
            id="status"
            value={published ? "published" : "draft"}
            onChange={(e) => setPublished(e.target.value === "published")}
            className={`${borderlessInput} text-[13.5px] w-40 ${published ? "text-success" : "text-muted-foreground"}`}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div>
        <label className={microLabel}>Content</label>
        <RichEditor content={contentHtml} onChange={setContentHtml} bordered={false} />
      </div>

      <SaveBar
        dirty={saveState.dirty}
        pending={isPending}
        savedAt={saveState.savedAt}
        error={error}
        saveLabel={mode === "new" ? "Create article" : "Save changes"}
        viewHref={mode === "edit" && published && slug ? `/blog/${slug}` : undefined}
      />
    </form>
  );
}
