"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Download, ExternalLink } from "lucide-react";
import { shareDocument, unshareDocument } from "@/app/actions/documents";
import { documentKind } from "@/app/lib/document-kind";
import { Modal } from "@/app/(admin)/_components/Modal";
import { Select } from "@/app/(admin)/_components/Select";

/** The parts of a document needed to preview and share it. */
export interface ViewableDocument {
  id: string;
  name: string;
  fileUrl: string;
  /** Set while the document is shared. */
  shareToken: string | null;
  /** ISO date the share link stops working, or null for no expiry. */
  shareExpiresAt: string | null;
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
  const style =
    state === "shared"
      ? "bg-success/15 text-success"
      : state === "expired"
        ? "bg-destructive/10 text-destructive"
        : "bg-secondary text-muted-foreground";
  return (
    <span
      className={`shrink-0 rounded-full text-[10.5px] font-semibold px-2 py-0.5 ${style}`}
    >
      {state === "shared"
        ? "Shared"
        : state === "expired"
          ? "Link expired"
          : "Private"}
    </span>
  );
}

/** Stands for "leave the expiry as it is" when a shared document is reopened. */
const KEEP_EXPIRY = "keep";

const EXPIRY_OPTIONS = [
  { value: "0", label: "No expiry" },
  { value: "7", label: "Expires in 7 days" },
  { value: "30", label: "Expires in 30 days" },
  { value: "90", label: "Expires in 90 days" },
];

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
}: {
  doc: ViewableDocument;
  onClose: () => void;
}) {
  const [token, setToken] = useState(doc.shareToken);
  const [expiresAt, setExpiresAt] = useState(doc.shareExpiresAt);
  // What the expiry dropdown shows: the choice just made, or the saved expiry when a shared document is reopened.
  const [expiry, setExpiry] = useState(
    doc.shareToken ? (doc.shareExpiresAt ? KEEP_EXPIRY : "0") : "30",
  );
  const [copied, setCopied] = useState(false);
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
      title={doc.name}
      maxWidthClassName="max-w-6xl"
    >
      {/* Two columns: the document on the left at full height (a long PDF or tall image scrolls inside its own frame), sharing on the right. */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="h-[55vh] lg:h-[72vh] rounded-lg border border-border bg-background overflow-auto">
          {kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element -- a preview of an uploaded file of unknown size
            <img
              src={doc.fileUrl}
              alt={doc.name}
              className="block mx-auto max-w-full h-auto"
            />
          ) : kind === "pdf" ? (
            <iframe
              src={doc.fileUrl}
              title={doc.name}
              className="block w-full h-full"
            />
          ) : (
            <p className="px-5 py-10 text-center text-[13px] text-muted-foreground">
              This type of file can&rsquo;t be previewed here.
            </p>
          )}
        </div>

        <div className="min-w-0">
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[13.5px] font-semibold text-foreground">
                Sharing
              </h3>
              <ShareBadge
                doc={{ shareToken: token, shareExpiresAt: expiresAt }}
              />
            </div>

            {state === "private" ? (
              <>
                <p className="text-[12.5px] text-muted-foreground mb-3">
                  Only you can see this document. Make it shareable to get a
                  private link a client can open without logging in.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="w-48">
                    <Select
                      value={expiry}
                      onChange={setExpiry}
                      options={EXPIRY_OPTIONS}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => share(expiry)}
                    disabled={isPending}
                    className="rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold px-4 py-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isPending ? "Creating…" : "Make shareable"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-[12.5px] text-muted-foreground mb-3">
                  {state === "expired" && expiresAt
                    ? `This link expired on ${formatDate(expiresAt)}. Choose a new expiry to switch it back on.`
                    : expiresAt
                      ? `Anyone with this link can view the document until ${formatDate(expiresAt)}.`
                      : "Anyone with this link can view the document. It has no expiry."}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    readOnly
                    value={url}
                    aria-label="Share link"
                    onFocus={(e) => e.currentTarget.select()}
                    className="w-full rounded-lg bg-background border border-border px-3 py-2 text-[12.5px] font-mono text-foreground/80 focus:outline-none focus:border-ring"
                  />
                  <button
                    type="button"
                    onClick={copy}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold px-4 py-2 hover:bg-primary/90 transition-colors"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy link"}
                  </button>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open the link in a new tab"
                    title="Open the link in a new tab"
                    className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-border text-foreground/70 hover:bg-background hover:text-foreground transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>

                <div className="flex flex-wrap items-end justify-between gap-3 mt-4 pt-4 border-t border-border">
                  <div className="w-56">
                    <span className="block text-[12px] font-medium text-foreground/80 mb-1.5">
                      Link expiry
                    </span>
                    <Select
                      value={expiry}
                      onChange={share}
                      options={
                        expiry === KEEP_EXPIRY && expiresAt
                          ? [
                              {
                                value: KEEP_EXPIRY,
                                label: `Expires ${formatDate(expiresAt)}`,
                              },
                              ...EXPIRY_OPTIONS,
                            ]
                          : EXPIRY_OPTIONS
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={stopSharing}
                    disabled={isPending}
                    className="rounded-lg text-destructive text-[13px] font-medium px-3 py-2 hover:bg-destructive/10 transition-colors disabled:opacity-50"
                  >
                    Stop sharing
                  </button>
                </div>
              </>
            )}

            {error && (
              <p className="text-[12.5px] text-destructive mt-3" role="alert">
                {error}
              </p>
            )}
          </div>

          {/* Vercel Blob sends the file as a download when asked with ?download=1. */}
          <a
            href={`${doc.fileUrl}${doc.fileUrl.includes("?") ? "&" : "?"}download=1`}
            className={`${SECONDARY_BUTTON} mt-4`}
          >
            <Download size={13} />
            Download
          </a>
        </div>
      </div>
    </Modal>
  );
}
