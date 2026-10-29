"use client";

import { useEffect, useRef, useState } from "react";
import { DateField } from "@/app/(admin)/_components/ui/DateField";
import { Eye, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Switch } from "@/app/(admin)/_components/ui/Switch";
import { RichEditor } from "@/app/(admin)/_components/RichEditor";
import { BackLink } from "@/app/(admin)/_components/BackLink";
import { Select } from "@/app/(admin)/_components/Select";
import { SaveBar, useSaveState, useUnsavedWarning } from "@/app/(admin)/_components/SaveBar";
import { routes } from "@/app/(admin)/_routes";
import type { PostSaveResult } from "@/app/lib/post-save";
import {
  POST_PREVIEW_STORAGE_KEY,
  formatPostDate,
  localToday,
  readTimeFor,
  slugify,
  wordCount,
  type PostFormData,
  type PostPreviewDraft,
} from "@/app/lib/post-meta";
import { RequiredMark } from "@/app/(admin)/_components/Section";

interface Props {
  /** Omitted for an article that hasn't been saved yet. */
  postId?: string;
  initial?: Omit<PostFormData, "date"> & { date: string };
  /** Categories already in use, offered as suggestions. */
  categories: string[];
}

const AUTOSAVE_DELAY_MS = 1500;
const PANEL_STORAGE_KEY = "zm-blog-details-panel";

const inputClass =
  "w-full rounded-lg bg-background border border-border px-3 py-2 text-[13.5px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors";
const labelClass = "block text-[12px] font-medium text-foreground/80 mb-1.5";
const hintClass = "text-[12px] text-muted-foreground mt-1.5";
const quietButton =
  "flex items-center gap-1.5 rounded-lg border border-border text-foreground/80 text-[13px] font-medium px-3.5 py-2 hover:bg-card transition-colors";

function storePreview(draft: PostPreviewDraft) {
  try {
    localStorage.setItem(POST_PREVIEW_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // localStorage unavailable — the preview falls back to the saved article.
  }
}

/**
 * The writing screen. The title and text take the page; everything else
 * about the article sits in a details panel that can be hidden.
 *
 * A draft saves itself a moment after each change. A published article does
 * not — its edits would go straight onto the live site — so it keeps an
 * explicit Save.
 */
export function BlogForm({ postId: initialPostId, initial, categories }: Props) {
  const [postId, setPostId] = useState(initialPostId ?? null);
  const [published, setPublished] = useState(initial?.published ?? false);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  // Until the address is edited by hand it follows the title — but never on a live article, whose links must keep working.
  const [slugTouched, setSlugTouched] = useState(
    initial ? initial.published || initial.slug !== slugify(initial.title) : false
  );
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [contentHtml, setContentHtml] = useState(initial?.contentHtml ?? "<p></p>");
  // Only a live article has a date of its own; a draft gets one when it's published.
  const [date, setDate] = useState(initial?.published ? initial.date : "");

  const [saving, setSaving] = useState<"auto" | "manual" | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** The exact form contents that last failed to save — not retried until something changes. */
  const [failedSnapshot, setFailedSnapshot] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const fields = {
    title,
    slug: slugify(slugTouched ? slug : title),
    excerpt,
    category,
    featured,
    contentHtml,
    date: published ? date : "",
  };
  const serialized = JSON.stringify(fields);
  const saveState = useSaveState(fields);
  useUnsavedWarning(saveState.dirty);

  const words = wordCount(contentHtml);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // Saving reads the form through refs, not from the render it was started
  // in: a save can be waiting behind another one, and by the time it runs the
  // text has moved on and a new article has been given its id.
  const formRef = useRef({ fields, serialized, published });
  const postIdRef = useRef(initialPostId ?? null);
  const savingRef = useRef(false);
  const queuedRef = useRef<{ targetPublished: boolean; kind: "auto" | "manual" } | null>(null);

  async function saveOnce(targetPublished: boolean, kind: "auto" | "manual") {
    const { fields: sent, serialized: sentSnapshot } = formRef.current;

    try {
      const response = await fetch(routes.blog.save, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: postIdRef.current,
          data: { ...sent, published: targetPublished, date: sent.date || localToday() } satisfies PostFormData,
        }),
      });
      // A signed-out session answers with the login page instead of JSON.
      if (response.redirected || !response.headers.get("content-type")?.includes("application/json")) {
        throw new Error("signed out");
      }
      const result = (await response.json()) as PostSaveResult;

      if (!result.ok) {
        setError(result.error);
        setFailedSnapshot(sentSnapshot);
        if (kind === "manual") setPanelOpen(true);
        return;
      }

      setError(null);
      setFailedSnapshot(null);
      if (!postIdRef.current) {
        postIdRef.current = result.id;
        setPostId(result.id);
        // The article now has a home — reloading should reopen it, not a blank page.
        window.history.replaceState(null, "", routes.blog.item(result.id));
      }
      if (targetPublished) {
        // Going live fixes the address: later title edits must not break links to it.
        setSlug(result.slug);
        setSlugTouched(true);
      }
      setPublished(targetPublished);
      setDate(targetPublished ? result.date : "");
      saveState.markSaved({ ...sent, date: targetPublished ? result.date : "" });
    } catch {
      setError("Couldn't save. Check your connection, or sign in again in another tab, then press Save.");
      setFailedSnapshot(sentSnapshot);
    }
  }

  /** One save at a time. A save asked for while another is running waits, then runs with whatever the form holds by then. */
  async function save(targetPublished: boolean, kind: "auto" | "manual") {
    if (savingRef.current) {
      queuedRef.current = { targetPublished, kind };
      return;
    }
    savingRef.current = true;
    let next: typeof queuedRef.current = { targetPublished, kind };
    while (next) {
      queuedRef.current = null;
      setSaving(next.kind);
      await saveOnce(next.targetPublished, next.kind);
      next = queuedRef.current;
    }
    savingRef.current = false;
    setSaving(null);
  }

  // Timers and key handlers outlive the render that created them, so they reach the current form and save through refs.
  const saveRef = useRef(save);
  useEffect(() => {
    formRef.current = { fields, serialized, published };
    saveRef.current = save;
  });

  const canAutosave =
    !published && saveState.dirty && saving === null && title.trim() !== "" && serialized !== failedSnapshot;
  useEffect(() => {
    if (!canAutosave) return;
    const timer = setTimeout(() => void saveRef.current(false, "auto"), AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [canAutosave, serialized]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saveRef.current(formRef.current.published, "manual");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Once a preview tab is open, keep it in step with what's being typed.
  useEffect(() => {
    if (!previewId) return;
    const timer = setTimeout(() => storePreview({ id: previewId, title, excerpt, category, contentHtml }), 400);
    return () => clearTimeout(timer);
  }, [previewId, title, excerpt, category, contentHtml]);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from localStorage on mount; can't be derived during render without a server/client hydration mismatch.
      if (localStorage.getItem(PANEL_STORAGE_KEY) === "closed") setPanelOpen(false);
    } catch {
      // localStorage unavailable — leave the panel open.
    }
  }, []);

  // The title is a textarea so long titles wrap; grow it to fit instead of scrolling.
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [title, panelOpen]);

  function togglePanel() {
    const next = !panelOpen;
    setPanelOpen(next);
    try {
      localStorage.setItem(PANEL_STORAGE_KEY, next ? "open" : "closed");
    } catch {
      // ignore
    }
  }

  function openPreview() {
    const id = postId ?? "new";
    storePreview({ id, title, excerpt, category, contentHtml });
    setPreviewId(id);
    window.open(routes.blog.preview(id), "zm-post-preview");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void save(true, "manual");
  }

  /** Enter in a one-line field would otherwise submit the form — which, on a draft, publishes it. */
  function blockEnterSubmit(e: React.KeyboardEvent) {
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) e.preventDefault();
  }

  const searchTitle = `${title.trim() || "Untitled"} | Zayne Mundo`;

  const liveHref = published && fields.slug && !saveState.dirty ? `/insights/${fields.slug}` : undefined;

  return (
    <form onSubmit={handleSubmit} onKeyDown={blockEnterSubmit}>
      <div className="flex items-center gap-3 mb-8">
        <BackLink href={routes.blog.list} label="Blog" iconOnly />
        <span
          className={`text-[11px] font-semibold px-2 py-1 rounded-full ${
            published ? "bg-positive/12 text-positive" : "bg-warning/15 text-warning"
          }`}
        >
          {published ? "Published" : "Draft"}
        </span>
        <span className="ml-auto text-[12.5px] text-muted-foreground tabular-nums">
          {words} {words === 1 ? "word" : "words"} · {readTimeFor(contentHtml)}
        </span>
        <button
          type="button"
          onClick={togglePanel}
          aria-expanded={panelOpen}
          aria-controls="article-details"
          className={quietButton}
        >
          {panelOpen ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
          {panelOpen ? "Hide details" : "Details"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start gap-10 mb-8">
        <div className="flex-1 min-w-0">
          <div className="max-w-[760px] mx-auto">
            <textarea
              ref={titleRef}
              rows={1}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value.replace(/\n/g, " "));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}
              placeholder="Article title"
              aria-label="Title"
              autoFocus={!initialPostId}
              className="block w-full resize-none overflow-hidden bg-transparent border-0 p-0 mb-6 text-[34px] leading-[1.15] font-bold tracking-tight text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            />
            <RichEditor content={contentHtml} onChange={setContentHtml} bordered={false} />
          </div>
        </div>

        {panelOpen && (
          <aside
            id="article-details"
            aria-label="Article details"
            className="w-full lg:w-[300px] shrink-0 lg:sticky lg:top-6 rounded-xl border border-border bg-card shadow-xs p-5 space-y-5"
          >
            <div>
              <span className={labelClass}>Status</span>
              <Select
                value={published ? "published" : "draft"}
                onChange={(value) => {
                  const target = value === "published";
                  if (target !== published && saving === null) void save(target, "manual");
                }}
                options={[
                  { value: "published", label: "Published" },
                  { value: "draft", label: "Draft" },
                ]}
              />
              <p className={hintClass}>
                {published
                  ? `On the site${date ? ` since ${formatPostDate(date)}` : ""}. Choose Draft to take it off.`
                  : "Only you can see it. Saves itself as you type; nothing goes on the site until you publish."}
              </p>
            </div>

            <div>
              <span className={labelClass}>Featured</span>
              <div className="flex items-center justify-between gap-3 rounded-lg bg-background border border-border px-3 py-2 text-[13.5px] text-foreground">
                {featured ? "Featured" : "Not featured"}
                <Switch checked={featured} onCheckedChange={setFeatured} aria-label="Featured" />
              </div>
            </div>

            <div>
              <label htmlFor="category" className={labelClass}>Category<RequiredMark /></label>
              <input
                id="category"
                list="article-categories"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Development"
                className={inputClass}
              />
              <datalist id="article-categories">
                {categories.map((name) => <option key={name} value={name} />)}
              </datalist>
            </div>

            <div>
              <label htmlFor="excerpt" className={labelClass}>Excerpt<RequiredMark /></label>
              <textarea
                id="excerpt"
                rows={4}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="One or two sentences on what the article covers"
                className={`${inputClass} resize-y`}
              />
              <p className={hintClass}>Shown under the title, on the Blog list and in search results.</p>
            </div>

            <div>
              {published ? <label htmlFor="date" className={labelClass}>Date<RequiredMark /></label> : <span className={labelClass}>Date</span>}
              {published ? (
                <DateField id="date" required value={date} onChange={setDate} className={inputClass} />
              ) : (
                <p className="text-[13.5px] text-muted-foreground">Set to the day you publish. You can change it afterwards.</p>
              )}
            </div>

            <div>
              <span className={labelClass}>Reading time</span>
              <p className="text-[13.5px] text-muted-foreground">{readTimeFor(contentHtml)}, worked out from the text</p>
            </div>

            <div className="pt-5 border-t border-border">
              <label htmlFor="slug" className={labelClass}>Search</label>
              <div className="flex items-center rounded-lg bg-background border border-border focus-within:border-ring transition-colors">
                <span className="pl-3 font-mono text-[12px] text-muted-foreground/70 shrink-0">/insights/</span>
                <input
                  id="slug"
                  value={slugTouched ? slug : fields.slug}
                  spellCheck={false}
                  onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
                  onBlur={() => { if (slugTouched) setSlug(slugify(slug)); }}
                  aria-label="Web address"
                  className="w-full min-w-0 bg-transparent py-2 pr-3 font-mono text-[12px] text-foreground focus:outline-none"
                />
              </div>
              <div className="mt-3 rounded-lg bg-background border border-border px-3 py-2.5">
                <p className="text-[11px] text-muted-foreground truncate">zairamundo.com › blog › {fields.slug || "…"}</p>
                <p className="text-[14px] font-medium text-primary leading-snug mt-0.5 line-clamp-2">{searchTitle}</p>
                <p className="text-[12px] text-muted-foreground leading-snug mt-1 line-clamp-3">
                  {excerpt.trim() || "Your excerpt appears here."}
                </p>
              </div>
              <p className={hintClass}>How the article appears in search results.</p>
            </div>
          </aside>
        )}
      </div>

      <SaveBar
        dirty={saveState.dirty}
        pending={saving !== null}
        submitting={saving === "manual"}
        savedAt={saveState.savedAt}
        error={error}
        savedLabel={published ? "Saved" : "Draft saved"}
        dirtyLabel={
          published ? "Unsaved changes — not on the site yet" : title.trim() ? "Unsaved changes" : "Add a title to start saving"
        }
        saveLabel={published ? "Save changes" : "Publish"}
        viewHref={liveHref}
        // Once the live page shows exactly what's here, a preview would only repeat it.
        actions={
          !liveHref && (
            <button type="button" onClick={openPreview} className={quietButton}>
              <Eye size={14} />
              Preview
            </button>
          )
        }
      />
    </form>
  );
}
