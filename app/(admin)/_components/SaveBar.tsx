"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

/**
 * Tracks whether a form differs from what was last saved. `value` is
 * everything the form would submit; it's compared by its JSON, so pass a
 * plain object of the form's fields.
 */
export function useSaveState(value: unknown) {
  const serialized = JSON.stringify(value);
  const [savedSnapshot, setSavedSnapshot] = useState(serialized);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  return {
    dirty: serialized !== savedSnapshot,
    savedAt,
    /** Call after a successful save, with the same value that was sent. */
    markSaved(saved: unknown) {
      setSavedSnapshot(JSON.stringify(saved));
      setSavedAt(new Date());
    },
  };
}

/**
 * Asks before throwing away unsaved changes — on reload/close (the browser's
 * own prompt) and on clicking any in-app link (the App Router has no
 * navigation-blocking hook, so links are caught at the document level).
 */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    function handleClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      if (link.origin !== window.location.origin) return;
      if (link.pathname === window.location.pathname) return;
      if (!window.confirm("You have unsaved changes. Leave this page without saving?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
    };
  }, [dirty]);
}

interface Props {
  dirty: boolean;
  pending: boolean;
  savedAt: Date | null;
  error?: string | null;
  /** Label for the submit button, e.g. "Save changes" or "Create case study". */
  saveLabel?: string;
  /** Public URL of what's being edited — shown as "View on site" when set. */
  viewHref?: string;
  /** Wording for the saved state, e.g. "Draft saved" on a page that saves itself. Defaults to "Saved". */
  savedLabel?: string;
  /** Wording while there are unsaved changes. Defaults to "Unsaved changes". */
  dirtyLabel?: string;
  /** Set on pages that save in the background: the button only locks while this is true, not on every autosave. Defaults to `pending`. */
  submitting?: boolean;
  /** Extra buttons, shown before "View on site" and the submit button. */
  actions?: React.ReactNode;
}

/**
 * The one save bar every long edit page shares. It sticks to the bottom of
 * the window while the form is on screen, so Save is always within reach,
 * and it always says where things stand: unsaved, saving, saved, or failed.
 * Place it as the last child of the <form>; its button submits that form.
 */
export function SaveBar({
  dirty, pending, savedAt, error, saveLabel = "Save changes", viewHref,
  savedLabel = "Saved", dirtyLabel = "Unsaved changes", submitting = pending, actions,
}: Props) {
  let status: React.ReactNode;
  if (error) {
    status = <span className="text-destructive font-medium" role="alert">{error}</span>;
  } else if (pending) {
    status = <span className="text-muted-foreground">Saving…</span>;
  } else if (dirty) {
    status = (
      <span className="flex items-center gap-2 text-foreground font-medium">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
        {dirtyLabel}
      </span>
    );
  } else if (savedAt) {
    status = (
      <span className="text-success font-medium">
        {savedLabel} at {savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </span>
    );
  } else {
    status = <span className="text-muted-foreground">No unsaved changes</span>;
  }

  return (
    <div className="sticky bottom-0 z-20 -mx-8 px-8 py-3 border-t border-border bg-background/95 backdrop-blur print:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1 text-[13px]" aria-live="polite">{status}</div>
        {actions}
        {viewHref && (
          <a
            href={viewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-border text-foreground/80 text-[13px] font-medium px-3.5 py-2 hover:bg-card transition-colors"
          >
            View on site
            <ExternalLink size={13} />
          </a>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold px-5 py-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {submitting ? "Saving…" : saveLabel}
        </button>
      </div>
    </div>
  );
}
