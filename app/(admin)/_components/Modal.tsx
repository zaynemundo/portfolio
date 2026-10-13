"use client";

import { useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidthClassName?: string;
}

/** Shared dialog shell. The rule across the admin: short, structured edits
 *  (a contact, a client's details, a payment, a job's settings) happen in a
 *  dialog so pages stay readable as views; long-form writing (articles, case
 *  studies, notes, documents) is edited in the page itself. */
export function Modal({ open, onClose, title, children, maxWidthClassName = "max-w-xl" }: Props) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    // Keep the page behind from scrolling while the dialog is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-[6vh]">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label={title} className={`relative flex max-h-full w-full flex-col ${maxWidthClassName} rounded-xl border border-border bg-card shadow-2xl`}>
        <div className="flex shrink-0 items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground/90 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>
        {/* Only the body scrolls, so the title and close button stay in view. */}
        <div className="min-h-0 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
