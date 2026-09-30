"use client";

import { useState, useTransition } from "react";
import { RichEditor } from "@/app/(admin)/_components/RichEditor";
import { createPost, updatePost, type PostFormData } from "@/app/actions/posts";

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

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) {
      setSlug(value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const data: PostFormData = { title, slug, excerpt, category, readTime, featured, published, contentHtml };

    startTransition(async () => {
      const result = mode === "new" ? await createPost(data) : await updatePost(postId!, data);
      if (result && !result.ok) {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  const borderlessInput = "w-full bg-transparent border-0 border-b border-transparent focus:border-border px-0 py-1.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      <div>
        <input
          id="title"
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Title"
          className={`${borderlessInput} text-[26px] font-bold`}
        />
        <div className="flex items-center gap-1.5 mt-1">
          <input
            id="slug"
            required
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
            className={`${borderlessInput} flex-1 font-mono text-[12.5px] text-muted-foreground py-0.5`}
          />
        </div>
        <p className="mt-1 text-[11.5px] text-muted-foreground/70">/blog/{slug || "…"}</p>
      </div>

      <textarea
        id="excerpt"
        required
        rows={2}
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        placeholder="Excerpt — a short summary shown on the Blog list"
        className={`${borderlessInput} text-[14.5px] resize-none`}
      />

      <div className="flex items-center gap-6">
        <input
          id="category"
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          className={`${borderlessInput} text-[13.5px] w-40`}
        />
        <select
          id="readTime"
          value={readTime}
          onChange={(e) => setReadTime(e.target.value)}
          className={`${borderlessInput} text-[13.5px] w-40`}
        >
          {READ_TIME_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>

      <RichEditor content={contentHtml} onChange={setContentHtml} bordered={false} />

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-[13.5px] text-foreground/70 cursor-pointer">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="rounded border-border bg-card"
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-[13.5px] text-foreground/70 cursor-pointer">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="rounded border-border bg-card"
          />
          Published
        </label>
      </div>

      {error && <p className="text-[13px] text-destructive" role="alert">{error}</p>}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving…" : mode === "new" ? "Create article" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
