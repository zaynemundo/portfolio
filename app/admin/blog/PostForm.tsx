"use client";

import { useState } from "react";
import type { BlogPost } from "../../generated/prisma/client";
import { RichEditor } from "./RichEditor";

interface Props {
  post?: BlogPost | null;
  action: (data: FormData) => Promise<void>;
}

const CATEGORY_PRESETS = [
  "Development", "Design", "SEO & Performance", "Accessibility",
  "Workflow", "Frontend", "WordPress", "Shopify", "Career",
];

const inp = "w-full px-3.5 py-2.5 rounded-lg bg-white border border-zinc-200 text-zinc-900 text-[13px] placeholder:text-zinc-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-colors";
const lbl = "block text-[12px] font-semibold text-zinc-600 mb-1.5";
const card = "bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-5";
const hnt = "text-[11px] text-zinc-400 mt-1";

function toSlug(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}


export function PostForm({ post, action }: Props) {
  const isNew = !post;
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [category, setCategory] = useState(post?.category ?? "");

  return (
    <form action={action} className="space-y-6">

      {/* ── Post details ────────────────────────────────────────────── */}
      <div className={card}>
        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.08em]">Post details</p>

        <div>
          <label className={lbl}>Title <span className="text-red-500">*</span></label>
          <input name="title" type="text" required
            defaultValue={post?.title}
            onChange={(e) => isNew && setSlug(toSlug(e.target.value))}
            className={inp}
            placeholder="How I Improved LCP by 10× on a WordPress Site" />
        </div>

        <div>
          <label className={lbl}>Slug (auto-generated, editable)</label>
          <input name="slug" type="text" required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={`${inp} font-mono text-[12px]`}
            placeholder="how-i-improved-lcp" />
          <p className={hnt}>URL: /blog/<strong>{slug || "post-slug"}</strong></p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Date <span className="text-red-500">*</span></label>
            <input name="date" type="date" required
              defaultValue={post?.date ?? new Date().toISOString().slice(0, 10)}
              className={inp} />
          </div>
          <div>
            <label className={lbl}>Status</label>
            <select name="published" defaultValue={post?.published === false ? "false" : "true"} className={inp}>
              <option value="true">Published — visible on site</option>
              <option value="false">Draft — hidden from public</option>
            </select>
          </div>
        </div>

        <div>
          <label className={lbl}>Category <span className="text-red-500">*</span></label>
          <input name="category" type="text" required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inp}
            placeholder="Development" />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {CATEGORY_PRESETS.filter((c) => c !== category).map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c)}
                className="px-2.5 py-1 rounded-full border border-zinc-200 text-zinc-500 text-[11px] font-medium hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50/60 transition-colors">
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={lbl}>Excerpt <span className="text-red-500">*</span></label>
          <textarea name="excerpt" required rows={3}
            defaultValue={post?.excerpt}
            className={`${inp} resize-y`}
            placeholder="1–2 sentences shown in listings and on the homepage." />
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className={card}>
        <div>
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.08em]">Content</p>
          <p className={hnt} style={{ marginTop: 4 }}>Use the toolbar to format your post. Content is saved as rich HTML.</p>
        </div>
        <RichEditor name="content" defaultContent={post?.content ?? ""} />
      </div>

      {/* ── Submit ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pb-10">
        <button type="submit"
          className="px-5 py-2.5 rounded-lg bg-violet-600 text-white text-[13px] font-semibold hover:bg-violet-700 transition-colors shadow-sm">
          {post ? "Save changes" : "Publish post"}
        </button>
        <a href="/admin/blog" className="text-[13px] text-zinc-500 hover:text-zinc-900 transition-colors">
          Cancel
        </a>
      </div>
    </form>
  );
}
