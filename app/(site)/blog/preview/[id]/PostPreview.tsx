"use client";

import { useSyncExternalStore } from "react";
import { ArticleView } from "@/app/components/insights/ArticleView";
import { POST_PREVIEW_STORAGE_KEY, readTimeFor, type PostPreviewDraft } from "@/app/lib/post-meta";

type PreviewContent = Omit<PostPreviewDraft, "id">;

interface Props {
  id: string;
  /** The article as last saved, or null if it has never been saved. */
  saved: PreviewContent | null;
  isLive: boolean;
  others: { slug: string; title: string }[];
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function readDraft() {
  try {
    return localStorage.getItem(POST_PREVIEW_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Shows what the writing screen currently holds — it leaves its text in
 * localStorage, and this tab follows along as it changes — falling back to
 * the saved article when opened on its own.
 */
export function PostPreview({ id, saved, isLive, others }: Props) {
  const stored = useSyncExternalStore(subscribe, readDraft, () => null);

  let draft: PostPreviewDraft | null = null;
  try {
    const parsed = stored ? (JSON.parse(stored) as PostPreviewDraft) : null;
    if (parsed?.id === id) draft = parsed;
  } catch {
    // Unreadable entry — show the saved article instead.
  }

  const content = draft ?? saved;
  if (!content) {
    return (
      <div className="min-h-screen bg-white pt-40 text-center text-[15px] text-zinc-500">
        Nothing to preview yet. Open this from the article you&rsquo;re writing.
      </div>
    );
  }

  return (
    <>
      <ArticleView
        post={{
          title: content.title || "Untitled",
          excerpt: content.excerpt,
          category: content.category,
          readTime: readTimeFor(content.contentHtml),
          contentHtml: content.contentHtml,
        }}
        siblings={others.slice(0, 3)}
        prevPost={null}
        nextPost={others[0] ?? null}
      />
      <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-zinc-900 px-4 py-2 text-[12.5px] font-medium text-white shadow-lg">
        Preview · {isLive ? "your edits are not live until you save" : "not published"}
      </div>
    </>
  );
}
