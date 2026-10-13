"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Download, ExternalLink, Eye, Pencil, Trash2 } from "lucide-react";
import { deleteDocument, renameDocument, setDocumentJob, shareDocument, unshareDocument } from "@/app/actions/documents";
import { documentKind } from "@/app/lib/document-kind";
import { Modal } from "@/app/(admin)/_components/Modal";
import { Select } from "@/app/(admin)/_components/Select";
import { StatusPill } from "@/app/(admin)/_components/ui/StatusPill";

/** The parts of a document needed to preview and share it. */
export interface ViewableDocument {
  id: string;
  name: string;
  fileUrl: string;
  /** Set while the document is shared. */
  shareToken: string | null;
  /** ISO date the share link stops working, or null for no expiry. */
  shareExpiresAt: string | null;
  /** How many times the share link has been opened since it was switched on. */
  shareOpenCount?: number;
  /** ISO time the share link was last opened, or null if it hasn't been. */
  shareLastOpenedAt?: string | null;
}

type Sharing = Pick<ViewableDocument, "shareToken" | "shareExpiresAt">;
export type ShareState = "private" | "shared" | "expired";

export function shareState(doc: Sharing): ShareState {
  if (!doc.shareToken) return "private";
  return doc.shareExpiresAt && new Date(doc.shareExpiresAt) < new Date()
    ? "expired"
    : "shared";
}

/** Small "Shared / Private / Link expired" label for a list row. */
export function ShareBadge({ doc }: { doc: Sharing }) {
  const state = shareState(doc);
  return (
    <StatusPill tone={state === "shared" ? "positive" : state === "expired" ? "negative" : "neutral"}>
      {state === "shared" ? "Shared" : state === "expired" ? "Link expired" : "Private"}
    </StatusPill>
  );
}

/** "Opened 3 times, last on 13 Oct at 16:40", for the Sharing panel. */
function openedLine(doc: ViewableDocument): string {
  const count = doc.shareOpenCount ?? 0;
  if (count === 0 || !doc.shareLastOpenedAt) return "Not opened yet";
  const last = new Date(doc.shareLastOpenedAt);
  const day = last.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const time = last.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `Opened ${count === 1 ? "once" : `${count} times`}, last on ${day} at ${time}`;
}

/** Stands for "leave the expiry as it is" when a shared document is reopened. */
const KEEP_EXPIRY = "keep";

const EXPIRY_OPTIONS = [
  { value: "0", label: "No expiry" },
  { value: "7", label: "Expires in 7 days" },
  { value: "30", label: "Expires in 30 days" },
  { value: "90", label: "Expires in 90 days" },
];

const NO_JOB = "";

const PANEL = "rounded-xl border border-border bg-card p-4";
const PANEL_TITLE = "text-[13.5px] font-semibold text-foreground";
const FIELD_LABEL = "block text-[12px] font-medium text-foreground/80 mb-1.5";

const SECONDARY_BUTTON =
  "inline-flex items-center gap-1.5 rounded-lg border border-border text-foreground/80 text-[12.5px] font-medium px-3 py-1.5 hover:bg-background transition-colors disabled:opacity-50";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Preview of one document inside the admin, with its sharing controls
 * underneath: private by default, or shared through a link that can expire.
 */
export function DocumentDialog({
  doc,
  onClose,
  jobs = [],
  projectId = null,
}: {
  doc: ViewableDocument;
  onClose: () => void;
  /** The jobs this document could be put on (its client's jobs). When given, Edit offers the choice. */
  jobs?: { id: string; name: string }[];
  /** The job it is on now, if any. */
  projectId?: string | null;
}) {
  const [token, setToken] = useState(doc.shareToken);
  const [expiresAt, setExpiresAt] = useState(doc.shareExpiresAt);
  // What the expiry dropdown shows: the choice just made, or the saved expiry when a shared document is reopened.
  const [expiry, setExpiry] = useState(
    doc.shareToken ? (doc.shareExpiresAt ? KEEP_EXPIRY : "0") : "30",
  );
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState(doc.name);
  /** The name being typed while renaming; null when not renaming. */
  const [draftName, setDraftName] = useState<string | null>(null);
  const [jobId, setJobId] = useState(projectId ?? NO_JOB);
  const [draftJobId, setDraftJobId] = useState(jobId);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const kind = documentKind(doc.fileUrl);
  const state = shareState({ shareToken: token, shareExpiresAt: expiresAt });
  // The dialog only opens after a click, so the browser's own address is available.
  const url = token ? `${window.location.origin}/document/${token}` : "";

  function share(days: string) {
    if (days === KEEP_EXPIRY) return;
    setExpiry(days);
    setError(null);
    startTransition(async () => {
      const result = await shareDocument(doc.id, Number(days) || null);
      if (!result.ok || !result.token) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setToken(result.token);
      setExpiresAt(result.expiresAt ?? null);
    });
  }

  function stopSharing() {
    if (
      !window.confirm(
        "Stop sharing this document? The link you sent will stop working.",
      )
    )
      return;
    startTransition(async () => {
      await unshareDocument(doc.id);
      setToken(null);
      setExpiresAt(null);
      setExpiry("30");
      setCopied(false);
    });
  }

  function startEditing() {
    setDraftName(name);
    setDraftJobId(jobId);
  }

  function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    const nextName = (draftName ?? "").trim();
    if (!nextName) return;
    setError(null);
    startTransition(async () => {
      if (nextName !== name) {
        const renamed = await renameDocument(doc.id, nextName);
        if (!renamed.ok) {
          setError(renamed.error ?? "Something went wrong.");
          return;
        }
        setName(nextName);
      }
      if (draftJobId !== jobId) {
        const moved = await setDocumentJob(doc.id, draftJobId === NO_JOB ? null : draftJobId);
        if (!moved.ok) {
          setError(moved.error ?? "Something went wrong.");
          return;
        }
        setJobId(draftJobId);
      }
      setDraftName(null);
    });
  }

  function remove() {
    if (!window.confirm(`Delete "${name}"? The file is removed for good, and any link you shared stops working.`)) return;
    startTransition(async () => {
      await deleteDocument(doc.id);
      onClose();
    });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — the link is still selectable in the field.
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={name}
      maxWidthClassName="max-w-6xl"
    >
      {/* Two columns: the document on the left at full height (a long PDF or tall image scrolls inside its own frame), sharing on the right. */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="h-[55vh] lg:h-[72vh] rounded-lg border border-border bg-background overflow-auto">
          {kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element -- a preview of an uploaded file of unknown size
            <img
              src={doc.fileUrl}
              alt={name}
              className="block mx-auto max-w-full h-auto"
            />
          ) : kind === "pdf" ? (
            <iframe
              src={doc.fileUrl}
              title={name}
              className="block w-full h-full"
            />
          ) : (
            <p className="px-5 py-10 text-center text-[13px] text-muted-foreground">
              This type of file can&rsquo;t be previewed here.
            </p>
          )}
        </div>

        {/* Side panel, top to bottom: what the document is, who can see it, then what can be done with the file. */}
        <div className="min-w-0 flex flex-col gap-4 lg:h-[72vh]">
          <section className={PANEL}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className={PANEL_TITLE}>Details</h3>
              {draftName === null && (
                <button type="button" onClick={startEditing} disabled={isPending} className={`${SECONDARY_BUTTON} -my-1`}>
                  <Pencil size={12} />
                  Edit
                </button>
              )}
            </div>

            {draftName !== null ? (
              <form onSubmit={saveEdit}>
                <label htmlFor="documentRename" className={FIELD_LABEL}>
                  Name
                </label>
                <input
                  id="documentRename"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  autoFocus
                  className="w-full rounded-lg bg-background border border-border px-3 py-2 text-[13.5px] text-foreground focus:outline-none focus:border-ring transition-colors"
                />
                {jobs.length > 0 && (
                  <div className="mt-3">
                    <span className={FIELD_LABEL}>Job (optional)</span>
                    <Select
                      value={draftJobId}
                      onChange={setDraftJobId}
                      options={[{ value: NO_JOB, label: "Not on a job" }, ...jobs.map((j) => ({ value: j.id, label: j.name }))]}
                    />
                    <p className="text-[11.5px] text-muted-foreground mt-1.5">Pick a job to show this document on that job&rsquo;s page too.</p>
                  </div>
                )}
                <div className="flex items-center justify-end gap-2 mt-4">
                  <button type="button" onClick={() => setDraftName(null)} className={`${SECONDARY_BUTTON} py-2`}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || !draftName.trim()}
                    className="rounded-lg bg-primary text-primary-foreground text-[12.5px] font-semibold px-4 py-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isPending ? "Saving…" : "Save"}
                  </button>
                </div>
              </form>
            ) : (
              <dl className="space-y-2.5 text-[13px]">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="shrink-0 text-muted-foreground">Name</dt>
                  <dd className="min-w-0 text-right font-medium text-foreground break-words">{name}</dd>
                </div>
                {jobs.length > 0 && (
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="shrink-0 text-muted-foreground">Job</dt>
                    <dd className="min-w-0 text-right text-foreground/90 truncate">
                      {jobs.find((j) => j.id === jobId)?.name ?? <span className="text-muted-foreground">Not on a job</span>}
                    </dd>
                  </div>
                )}
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="shrink-0 text-muted-foreground">Type</dt>
                  <dd className="text-right text-foreground/90">{kind === "image" ? "Image" : kind === "pdf" ? "PDF" : "File"}</dd>
                </div>
              </dl>
            )}
          </section>

          <section className={PANEL}>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <h3 className={PANEL_TITLE}>Sharing</h3>
              <ShareBadge doc={{ shareToken: token, shareExpiresAt: expiresAt }} />
            </div>

            {state === "private" ? (
              <>
                <p className="text-[12.5px] leading-relaxed text-muted-foreground mb-4">
                  Only you can see this document. Make it shareable to get a private link a client can open without logging in.
                </p>
                <span className={FIELD_LABEL}>Link expiry</span>
                <Select value={expiry} onChange={setExpiry} options={EXPIRY_OPTIONS} />
                <button
                  type="button"
                  onClick={() => share(expiry)}
                  disabled={isPending}
                  className="mt-3 w-full rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold px-4 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isPending ? "Creating…" : "Make shareable"}
                </button>
              </>
            ) : (
              <>
                <p className="text-[12.5px] leading-relaxed text-muted-foreground mb-4">
                  {state === "expired" && expiresAt
                    ? `This link expired on ${formatDate(expiresAt)}. Choose a new expiry to switch it back on.`
                    : expiresAt
                      ? `Anyone with this link can view the document until ${formatDate(expiresAt)}.`
                      : "Anyone with this link can view the document. It has no expiry."}
                </p>

                <p className="flex items-center gap-1.5 text-[12.5px] text-foreground/80 mb-4">
                  <Eye size={13} aria-hidden className="text-muted-foreground" />
                  {openedLine(doc)}
                </p>

                <span className={FIELD_LABEL}>Share link</span>
                {/* The link and its two buttons as one field. */}
                <div className="flex items-stretch rounded-lg border border-border bg-background overflow-hidden focus-within:border-ring transition-colors">
                  <input
                    readOnly
                    value={url}
                    aria-label="Share link"
                    onFocus={(e) => e.currentTarget.select()}
                    className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[12.5px] font-mono text-foreground/80 focus:outline-none"
                  />
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open the link in a new tab"
                    title="Open the link in a new tab"
                    className="inline-flex w-9 items-center justify-center border-l border-border text-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    type="button"
                    onClick={copy}
                    className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[12.5px] font-semibold px-3 hover:bg-primary/90 transition-colors"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                <div className="mt-4">
                  <span className={FIELD_LABEL}>Link expiry</span>
                  <Select
                    value={expiry}
                    onChange={share}
                    options={
                      expiry === KEEP_EXPIRY && expiresAt
                        ? [{ value: KEEP_EXPIRY, label: `Expires ${formatDate(expiresAt)}` }, ...EXPIRY_OPTIONS]
                        : EXPIRY_OPTIONS
                    }
                  />
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-3">
                  <p className="text-[12px] text-muted-foreground">The link stops working straight away.</p>
                  <button
                    type="button"
                    onClick={stopSharing}
                    disabled={isPending}
                    className="shrink-0 rounded-lg border border-destructive/30 text-destructive text-[12.5px] font-medium px-3 py-1.5 hover:bg-destructive/10 transition-colors disabled:opacity-50"
                  >
                    Stop sharing
                  </button>
                </div>
              </>
            )}
          </section>

          {error && (
            <p className="text-[12.5px] text-destructive" role="alert">
              {error}
            </p>
          )}

          {/* Pinned to the bottom of the panel, away from the settings above. */}
          <div className="mt-auto flex items-center gap-2 pt-4 border-t border-border">
            {/* Vercel Blob sends the file as a download when asked with ?download=1. */}
            <a
              href={`${doc.fileUrl}${doc.fileUrl.includes("?") ? "&" : "?"}download=1`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card text-foreground text-[13px] font-medium px-3 py-2.5 hover:bg-muted transition-colors"
            >
              <Download size={14} />
              Download
            </a>
            <button
              type="button"
              onClick={remove}
              disabled={isPending}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-destructive/30 text-destructive text-[13px] font-medium px-4 py-2.5 hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
