"use client";

import { useState, useTransition } from "react";
import { updateBlogPageCopy } from "@/app/actions/settings";
import { Modal } from "@/app/(admin)/_components/Modal";
import { DialogActions } from "@/app/(admin)/_components/DialogActions";

const labelClass = "block text-[12px] font-medium text-foreground/80 mb-1.5";
const fieldClass =
  "w-full rounded-lg bg-background border border-border px-3 py-2 text-[13.5px] text-foreground focus:outline-none focus:border-ring transition-colors";

/** The Blog list's "Edit Insights page" button: the public page's heading and intro, edited in a dialog without leaving the list. */
export function InsightsPageButton({ heading: savedHeading, intro: savedIntro }: { heading: string; intro: string }) {
  const [open, setOpen] = useState(false);
  const [heading, setHeading] = useState(savedHeading);
  const [intro, setIntro] = useState(savedIntro);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function show() {
    // Start from what's saved, not from an edit that was cancelled earlier.
    setHeading(savedHeading);
    setIntro(savedIntro);
    setError(null);
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateBlogPageCopy({ heading, intro });
      if (result.ok) setOpen(false);
      else setError(result.error ?? "Couldn't save. Try again.");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={show}
        className="rounded-full border border-border bg-card text-foreground text-[13px] font-semibold px-4 py-2 hover:bg-muted transition-colors"
      >
        Edit Insights page
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Insights page">
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-[12.5px] text-muted-foreground">The dark banner heading and intro at the top of /insights.</p>
          <div>
            <label htmlFor="insightsHeading" className={labelClass}>Heading</label>
            <input id="insightsHeading" autoFocus value={heading} onChange={(e) => setHeading(e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="insightsIntro" className={labelClass}>Intro text</label>
            <textarea id="insightsIntro" rows={3} value={intro} onChange={(e) => setIntro(e.target.value)} className={`${fieldClass} resize-y`} />
          </div>
          {error && <p className="text-[12.5px] text-destructive" role="alert">{error}</p>}
          <DialogActions onCancel={() => setOpen(false)} pending={isPending} submitLabel="Save" />
        </form>
      </Modal>
    </>
  );
}
